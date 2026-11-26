import { api, HttpError } from "@/lib/http";
import { getDb } from "@/lib/db";
import { removeDir, uploadDir } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Cancel an upload: discards temp data and the session.
export const DELETE = api(async (_req, { params }) => {
  const db = getDb();
  const s = db.prepare("SELECT id, status FROM upload_sessions WHERE id = ?").get(params.id) as { id: string; status: string } | undefined;
  if (!s) throw new HttpError(404, "Upload not found");
  if (s.status === "complete") throw new HttpError(409, "Upload already completed");
  removeDir(uploadDir(s.id));
  db.prepare("DELETE FROM upload_sessions WHERE id = ?").run(s.id);
  return { ok: true };
});
