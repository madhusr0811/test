import { randomUUID } from "node:crypto";
import fs from "node:fs";
import { api, HttpError, readJson } from "@/lib/http";
import { getDb } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { newToken } from "@/lib/deliveries";
import { deliveryDir, storageStatus } from "@/lib/storage";
import { resolveExpiry } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const str = (v: unknown, max: number, required = false, name = "Field") => {
  const s = typeof v === "string" ? v.trim() : "";
  if (required && !s) throw new HttpError(400, `${name} is required`);
  if (s.length > max) throw new HttpError(400, `${name} is too long`);
  return s;
};

export const POST = api(async (req) => {
  const b = await readJson(req);
  const client = str(b.client, 120, true, "Client name");
  const event = str(b.event, 120);
  const title = str(b.title, 160, true, "Delivery title");
  const message = str(b.message, 2000);
  const deliveryDate = typeof b.deliveryDate === "string" && DATE.test(b.deliveryDate) ? b.deliveryDate : new Date().toISOString().slice(0, 10);
  const expiresAt = resolveExpiry(b);
  let passwordHash: string | null = null;
  if (typeof b.password === "string" && b.password) {
    if (b.password.length < 6 || b.password.length > 200) throw new HttpError(400, "Password must be 6–200 characters");
    passwordHash = hashPassword(b.password);
  }
  const st = storageStatus();
  if (!st.ok) throw new HttpError(503, st.reason);

  const id = randomUUID();
  fs.mkdirSync(deliveryDir(id), { recursive: true });
  getDb().prepare(
    `INSERT INTO deliveries (id, token, client, event, title, message, delivery_date, expires_at, password_hash, allow_previews, allow_downloads)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
  ).run(id, newToken(), client, event, title, message, deliveryDate, expiresAt, passwordHash, b.allowPreviews === false ? 0 : 1, b.allowDownloads === false ? 0 : 1);
  return { id };
});
