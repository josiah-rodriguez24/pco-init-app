import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy stub — runs on matched routes before the handler.
 *
 * Currently a pass-through. When adding app authentication (e.g. NextAuth),
 * add session checks here to protect dashboard routes and sync endpoints.
 *
 * Example future implementation:
 *
 *   import { getToken } from "next-auth/jwt";
 *
 *   const token = await getToken({ req: request });
 *   if (!token) {
 *     return NextResponse.redirect(new URL("/login", request.url));
 *   }
 */
export function proxy(request: NextRequest) {
  void request;
  return NextResponse.next();
}

export const config = {
  // Match the actual URL paths for dashboard pages and protected API routes.
  // Note: Next.js route groups like (dashboard) do NOT appear in the URL —
  // the filesystem path `app/(dashboard)/plans/page.tsx` serves the URL `/plans`.
  // Webhooks (/api/webhooks) and health (/api/health) are intentionally excluded.
  matcher: ["/", "/plans/:path*", "/api/pco/:path*"],
};
