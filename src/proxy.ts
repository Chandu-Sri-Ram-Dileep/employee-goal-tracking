import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "employee_goal_tracking_jwt_secret_key_2026";
const secret = new TextEncoder().encode(JWT_SECRET);

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const pathname = request.nextUrl.pathname;

  // Public routes — no auth needed
  if (
    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/terms" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // No token → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    // Role-based access control
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (pathname.startsWith("/manager") && role !== "MANAGER") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (pathname.startsWith("/employee") && role !== "EMPLOYEE") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Add no-cache headers to ALL protected pages so browsers don't serve
    // stale authenticated pages after logout (back-button bug fix)
    const response = NextResponse.next();
    response.headers.set(
      "Cache-Control",
      "private, no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  } catch {
    // Invalid / expired token → clear cookie and redirect
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }
}

export const config = {
  matcher: ["/admin/:path*", "/manager/:path*", "/employee/:path*"],
};
