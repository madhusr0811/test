import fs from "node:fs";
import { api, HttpError } from "@/lib/http";
import { getDb } from "@/lib/db";
import { deliveryDir, safeJoin } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const DELETE = api(async (_req, { params }) => {
  const db = getDb();
  const f = db.prepare("SELECT id, delivery_id, name FROM files WHERE id = ?").get(params.id) as
    { id: string; delivery_id: string; name: string } | undefined;
  if (!f) throw new HttpError(404, "File not found");
  fs.rmSync(safeJoin(deliveryDir(f.delivery_id), f.name), { force: true });
  db.prepare("DELETE FROM files WHERE id = ?").run(f.id);
  return { ok: true };
});
