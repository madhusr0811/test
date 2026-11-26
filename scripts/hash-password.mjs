// Usage: node scripts/hash-password.mjs 'your password'   (also prints a SESSION_SECRET)
import { scrypt, randomBytes } from "node:crypto";
const pw = process.argv[2];
if (!pw || pw.length < 10) { console.error("Give a password of 10+ characters as the argument."); process.exit(1); }
const salt = randomBytes(16);
scrypt(pw, salt, 64, { N: 16384, r: 8, p: 1 }, (err, key) => {
  if (err) throw err;
  console.log(`ADMIN_PASSWORD_HASH=scrypt$16384$8$1$${salt.toString("base64")}$${key.toString("base64")}`);
  console.log(`SESSION_SECRET=${randomBytes(32).toString("hex")}`);
});
