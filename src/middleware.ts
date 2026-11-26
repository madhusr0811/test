import { NextResponse, type NextRequest } from "next/server";

// Fast gate only: real session validation happens server-side in the admin layout and every API route.
export function middleware(req: NextRequest) {
  if (!req.cookies.get("tt_session")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
