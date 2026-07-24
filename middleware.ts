// Leichtgewichtige Zugangs-Weiche: ohne Session-Cookie geht es zur
// Login-Seite. Die verbindliche Prüfung übernimmt serverseitig auth()
// im Layout der geschützten Routen (app/(app)/layout.tsx).
import { NextResponse, type NextRequest } from "next/server";

const OEFFENTLICHE_PFADE = ["/login", "/api/auth"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (OEFFENTLICHE_PFADE.some((pfad) => pathname.startsWith(pfad))) {
    return NextResponse.next();
  }
  // Tokenisierte Kundenfreigabe (M5): /freigabe/<token> ist ohne Account
  // erreichbar; die interne Übersicht /freigabe bleibt geschützt.
  if (/^\/freigabe\/[^/]+/.test(pathname)) {
    return NextResponse.next();
  }
  const hatSession =
    request.cookies.has("authjs.session-token") || request.cookies.has("__Secure-authjs.session-token");
  if (!hatSession) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logos|.*\\.png$).*)"],
};
