import { NextResponse, type NextRequest } from "next/server";

function unauthorized() {
  return new NextResponse("Auth required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Personal Agora Admin"',
    },
  });
}

function isProtectedPath(pathname: string) {
  return pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isProtectedPath(pathname)) return NextResponse.next();

  const adminUser = process.env.ADMIN_USER ?? "admin";
  const adminPassword = process.env.ADMIN_PASSWORD;

  // If password isn't configured, never allow access.
  if (!adminPassword) return unauthorized();

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.toLowerCase().startsWith("basic ")) return unauthorized();

  const base64 = authHeader.slice(6).trim();
  let decoded = "";
  try {
    decoded = atob(base64);
  } catch {
    return unauthorized();
  }

  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex < 0) return unauthorized();

  const user = decoded.slice(0, separatorIndex);
  const pass = decoded.slice(separatorIndex + 1);

  if (user !== adminUser || pass !== adminPassword) return unauthorized();

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
