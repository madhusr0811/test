import { api, HttpError, readJson } from "@/lib/http";
import { getDb } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { newToken } from "@/lib/deliveries";
import { deliveryDir, removeDir, uploadDir } from "@/lib/storage";
import { resolveExpiry } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function exists(id: string) {
  const r = getDb().prepare("SELECT id FROM deliveries WHERE id = ?").get(id);
  if (!r) throw new HttpError(404, "Delivery not found");
}

export const PATCH = api(async (req, { params }) => {
  const id = params.id;
  exists(id);
  const b = await readJson(req);
  const db = getDb();
  if (typeof b.enabled === "boolean") db.prepare("UPDATE deliveries SET enabled=? WHERE id=?").run(b.enabled ? 1 : 0, id);
  if (typeof b.allowPreviews === "boolean") db.prepare("UPDATE deliveries SET allow_previews=? WHERE id=?").run(b.allowPreviews ? 1 : 0, id);
  if (typeof b.allowDownloads === "boolean") db.prepare("UPDATE deliveries SET allow_downloads=? WHERE id=?").run(b.allowDownloads ? 1 : 0, id);
  if (b.regenerateToken === true) db.prepare("UPDATE deliveries SET token=? WHERE id=?").run(newToken(), id);
  if (b.expiryDays !== undefined || b.customDate !== undefined) {
    db.prepare("UPDATE deliveries SET expires_at=? WHERE id=?").run(resolveExpiry(b), id);
  }
  if (b.password === null) db.prepare("UPDATE deliveries SET password_hash=NULL WHERE id=?").run(id);
  else if (typeof b.password === "string" && b.password) {
    if (b.password.length < 6 || b.password.length > 200) throw new HttpError(400, "Password must be 6–200 characters");
    db.prepare("UPDATE deliveries SET password_hash=? WHERE id=?").run(hashPassword(b.password), id);
  }
  return { ok: true };
});

export const DELETE = api(async (_req, { params }) => {
  const id = params.id;
  exists(id);
  const db = getDb();
  const sessions = db.prepare("SELECT id FROM upload_sessions WHERE delivery_id = ?").all(id) as { id: string }[];
  for (const s of sessions) removeDir(uploadDir(s.id));
  removeDir(deliveryDir(id)); // only ever <storage>/deliveries/<uuid>
  db.prepare("DELETE FROM deliveries WHERE id = ?").run(id); // cascades to files, sessions, chunks, events
  return { ok: true };
});
