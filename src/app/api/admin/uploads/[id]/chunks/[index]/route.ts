import { createHash } from "node:crypto";
import fs from "node:fs";
import { api, HttpError } from "@/lib/http";
import { getDb } from "@/lib/db";
import { safeJoin, uploadDir } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const PUT = api(async (req, { params }) => {
  const db = getDb();
  const s = db.prepare("SELECT id, size, chunk_size, total_chunks, status FROM upload_sessions WHERE id = ?").get(params.id) as
    { id: string; size: number; chunk_size: number; total_chunks: number; status: string } | undefined;
  if (!s || s.status !== "active") throw new HttpError(404, "Upload session not found");
  const idx = Number(params.index);
  if (!Number.isInteger(idx) || idx < 0 || idx >= s.total_chunks) throw new HttpError(400, "Invalid chunk index");

  const expected = idx < s.total_chunks - 1 ? s.chunk_size : s.size - s.chunk_size * (s.total_chunks - 1);
  const buf = Buffer.from(await req.arrayBuffer());
  if (buf.length !== expected) throw new HttpError(400, `Chunk size mismatch (expected ${expected}, got ${buf.length})`);

  const sha = createHash("sha256").update(buf).digest("hex");
  const claimed = req.headers.get("x-chunk-sha256");
  if (claimed && claimed.toLowerCase() !== sha) throw new HttpError(422, "Chunk checksum mismatch");

  const fh = fs.openSync(safeJoin(uploadDir(s.id), "data"), "r+");
  try {
    let written = 0;
    while (written < buf.length) written += fs.writeSync(fh, buf, written, buf.length - written, idx * s.chunk_size + written);
  } finally { fs.closeSync(fh); }

  db.prepare("INSERT OR REPLACE INTO upload_chunks (session_id, idx, size, sha256) VALUES (?,?,?,?)").run(s.id, idx, buf.length, sha);
  db.prepare("UPDATE upload_sessions SET updated_at = ? WHERE id = ?").run(new Date().toISOString(), s.id);
  return { ok: true };
});
