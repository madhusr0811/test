import { api } from "@/lib/http";
import { destroySession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = api(async () => {
  destroySession();
  return { ok: true };
}, { admin: false });
