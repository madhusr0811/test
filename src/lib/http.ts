import { getAdmin, type Admin } from "./auth";

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

// CSRF defence in depth: SameSite=Strict cookie + Origin must match Host on every write.
function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) throw new HttpError(403, "Missing origin");
  let o: string;
  try { o = new URL(origin).host; } catch { throw new HttpError(403, "Bad origin"); }
  if (o !== host) throw new HttpError(403, "Cross-origin request blocked");
}

type Ctx = { params: Record<string, string> };

export function api(
  fn: (req: Request, ctx: Ctx, admin: Admin | null) => Promise<Response | object>,
  opts: { admin?: boolean } = {},
) {
  return async (req: Request, ctx: Ctx): Promise<Response> => {
    try {
      if (req.method !== "GET" && req.method !== "HEAD") assertSameOrigin(req);
      let admin: Admin | null = null;
      if (opts.admin !== false) {
        admin = getAdmin();
        if (!admin) throw new HttpError(401, "Not signed in");
      }
      const r = await fn(req, ctx, admin);
      return r instanceof Response ? r : Response.json(r);
    } catch (e) {
      if (e instanceof HttpError) return Response.json({ error: e.message }, { status: e.status });
      console.error(e);
      return Response.json({ error: "Server error" }, { status: 500 });
    }
  };
}

export async function readJson<T = Record<string, unknown>>(req: Request): Promise<T> {
  try { return (await req.json()) as T; } catch { throw new HttpError(400, "Invalid JSON"); }
}
