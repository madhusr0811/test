import { api, HttpError, readJson } from "@/lib/http";
import { getDb } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { DUMMY_HASH, verifyPassword } from "@/lib/password";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export const POST = api(async (req) => {
  const { email, password } = await readJson<{ email?: string; password?: string }>(req);
  if (typeof email !== "string" || typeof password !== "string" || !email || !password || password.length > 500) {
    throw new HttpError(400, "Enter your email and password");
  }
  const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const key = `${ip}|${email.toLowerCase()}`;
  const db = getDb();
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  db.prepare("DELETE FROM login_attempts WHERE at < ?").run(since);
  const fails = (db.prepare("SELECT COUNT(*) AS c FROM login_attempts WHERE key = ?").get(key) as { c: number }).c;
  if (fails >= MAX_FAILS) throw new HttpError(429, "Too many attempts. Try again in 15 minutes.");

  const admin = db.prepare("SELECT id, password_hash FROM admins WHERE email = ?").get(email.trim().toLowerCase()) as
    { id: number; password_hash: string } | undefined;
  const ok = verifyPassword(password, admin?.password_hash ?? DUMMY_HASH) && !!admin;
  if (!ok) {
    db.prepare("INSERT INTO login_attempts (key, at) VALUES (?, ?)").run(key, new Date().toISOString());
    throw new HttpError(401, "Incorrect email or password");
  }
  db.prepare("DELETE FROM login_attempts WHERE key = ?").run(key);
  createSession(admin!.id);
  return { ok: true };
}, { admin: false });
