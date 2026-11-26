import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { api, HttpError, readJson } from "@/lib/http";
import { getDb } from "@/lib/db";
import { config, ALLOWED_EXTENSIONS } from "@/lib/config";
import { deliveryDir, hasAllowedExtension, removeDir, safeJoin, sanitizeFilename, storageStatus, uploadDir } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STALE_MS = 48 * 60 * 60 * 1000;

/** Remove abandoned upload sessions (no activity for 48 h) and their temp data. */
function cleanupStale() {
  const db = getDb();
  const cutoff = new Date(Date.now() - STALE_MS).toISOString();
  const stale = db.prepare("SELECT id FROM upload_sessions WHERE status != 'complete' AND updated_at < ?").all(cutoff) as { id: string }[];
  for (const s of stale) {
    removeDir(uploadDir(s.id));
    db.prepare("DELETE FROM upload_sessions WHERE id = ?").run(s.id);
  }
}

export const POST = api(async (req) => {
  const b = await readJson<{ deliveryId?: string; filename?: string; size?: number; mime?: string }>(req);
  const db = getDb();
  if (!b.deliveryId || !db.prepare("SELECT 1 FROM deliveries WHERE id = ?").get(b.deliveryId)) throw new HttpError(404, "Delivery not found");
  const filename = sanitizeFilename(String(b.filename ?? ""));
  if (!filename || !hasAllowedExtension(filename)) throw new HttpError(400, `Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(" ")}`);
  const size = Number(b.size);
  if (!Number.isInteger(size) || size <= 0) throw new HttpError(400, "Invalid file size");
  if (size > config.maxUploadBytes) throw new HttpError(413, "File exceeds the maximum upload size");
  const st = storageStatus();
  if (!st.ok) throw new HttpError(503, st.reason);

  cleanupStale();

  // Prevent duplicate sessions: same delivery + name + size resumes the existing one.
  let s = db.prepare("SELECT * FROM upload_sessions WHERE delivery_id=? AND filename=? AND size=? AND status='active'")
    .get(b.deliveryId, filename, size) as { id: string; chunk_size: number; total_chunks: number } | undefined;

  if (!s) {
    const id = randomUUID();
    const chunkSize = config.chunkSize;
    const totalChunks = Math.ceil(size / chunkSize);
    const dir = uploadDir(id);
    fs.mkdirSync(dir, { recursive: true });
    const fh = fs.openSync(safeJoin(dir, "data"), "w");
    fs.ftruncateSync(fh, size); // sparse preallocation; chunks are written at their offsets
    fs.closeSync(fh);
    db.prepare("INSERT INTO upload_sessions (id, delivery_id, filename, size, mime, chunk_size, total_chunks) VALUES (?,?,?,?,?,?,?)")
      .run(id, b.deliveryId, filename, size, String(b.mime ?? "").slice(0, 100), chunkSize, totalChunks);
    s = { id, chunk_size: chunkSize, total_chunks: totalChunks };
  }
  const received = (db.prepare("SELECT idx FROM upload_chunks WHERE session_id=? ORDER BY idx").all(s.id) as { idx: number }[]).map((r) => r.idx);
  return { id: s.id, chunkSize: s.chunk_size, totalChunks: s.total_chunks, received };
});

export const GET = api(async () => {
  const rows = getDb().prepare(
    `SELECT u.id, u.filename, u.size, u.status, u.total_chunks AS totalChunks, u.updated_at AS updatedAt,
            d.client, d.title, (SELECT COUNT(*) FROM upload_chunks c WHERE c.session_id = u.id) AS receivedChunks
     FROM upload_sessions u JOIN deliveries d ON d.id = u.delivery_id ORDER BY u.updated_at DESC LIMIT 100`,
  ).all();
  return { sessions: rows };
});
