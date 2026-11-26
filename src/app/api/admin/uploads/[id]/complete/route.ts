import { randomUUID } from "node:crypto";
import fs from "node:fs";
import { api, HttpError } from "@/lib/http";
import { getDb } from "@/lib/db";
import { deliveryDir, removeDir, safeJoin, uniqueName, uploadDir } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = api(async (_req, { params }) => {
  const db = getDb();
  const s = db.prepare("SELECT * FROM upload_sessions WHERE id = ?").get(params.id) as
    { id: string; delivery_id: string; filename: string; size: number; mime: string; total_chunks: number; status: string } | undefined;
  if (!s || s.status !== "active") throw new HttpError(404, "Upload session not found");

  const got = (db.prepare("SELECT COUNT(*) AS c, COALESCE(SUM(size),0) AS bytes FROM upload_chunks WHERE session_id = ?").get(s.id)) as { c: number; bytes: number };
  if (got.c !== s.total_chunks || got.bytes !== s.size) throw new HttpError(409, `Upload incomplete (${got.c}/${s.total_chunks} chunks)`);

  const tmp = safeJoin(uploadDir(s.id), "data");
  if (fs.statSync(tmp).size !== s.size) throw new HttpError(409, "Stored file size does not match");

  const destDir = deliveryDir(s.delivery_id);
  fs.mkdirSync(destDir, { recursive: true });
  const name = uniqueName(destDir, s.filename);
  fs.renameSync(tmp, safeJoin(destDir, name)); // same volume: instant, no re-copy of a huge file

  const fileId = randomUUID();
  db.transaction(() => {
    db.prepare("INSERT INTO files (id, delivery_id, name, size, mime) VALUES (?,?,?,?,?)").run(fileId, s.delivery_id, name, s.size, s.mime);
    db.prepare("UPDATE upload_sessions SET status='complete', updated_at=? WHERE id=?").run(new Date().toISOString(), s.id);
    db.prepare("DELETE FROM upload_chunks WHERE session_id = ?").run(s.id);
  })();
  removeDir(uploadDir(s.id));
  return { ok: true, fileId, name };
});
