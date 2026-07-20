import { NextRequest, NextResponse } from "next/server";

const STAGE_ORDER = ["", "prep", "activity", "done"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const stage = req.cookies.get("rftsp_stage")?.value ?? "";

  if (pathname.startsWith("/prep") && !stage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/activity")) {
    const idx = STAGE_ORDER.indexOf(stage);
    if (idx < 1) return NextResponse.redirect(new URL("/prep", req.url));
  }

  if (pathname.startsWith("/analysis")) {
    const idx = STAGE_ORDER.indexOf(stage);
    if (idx < 2) return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/prep", "/prep/:path*", "/activity", "/activity/:path*", "/analysis", "/analysis/:path*"],
};
