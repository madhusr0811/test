// Edge-safe (Web Crypto) signed session tokens: base64url(payload).base64url(hmac)
export const SESSION_COOKIE = "tt_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const enc = new TextEncoder();
const b64u = (buf: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64u = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

async function key(secret: string, usage: KeyUsage[]) {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, usage);
}

export async function createSession(email: string, secret: string): Promise<string> {
  const payload = b64u(enc.encode(JSON.stringify({ sub: email, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE })));
  const sig = await crypto.subtle.sign("HMAC", await key(secret, ["sign"]), enc.encode(payload));
  return `${payload}.${b64u(sig)}`;
}

export async function verifySession(token: string | undefined, secret: string | undefined): Promise<{ sub: string } | null> {
  if (!token || !secret) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await key(secret, ["verify"]), unb64u(sig), enc.encode(payload));
    if (!ok) return null;
    const data = JSON.parse(new TextDecoder().decode(unb64u(payload)));
    if (typeof data.exp !== "number" || data.exp < Date.now() / 1000) return null;
    return { sub: String(data.sub) };
  } catch {
    return null;
  }
}
