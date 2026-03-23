import { NextResponse, type NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  // Auth is handled via JWT cookies in the API routes and layout
  return NextResponse.next();
}

export const config = {
  // Keep matcher empty or minimal – admin auth is JWT-based now
  matcher: [],
};
