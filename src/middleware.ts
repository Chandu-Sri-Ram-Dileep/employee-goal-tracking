import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET
);

export async function middleware(
  request: NextRequest
) {
  const token =
    request.cookies.get("token")?.value;

  const pathname =
    request.nextUrl.pathname;

  // Public routes
  if (
    pathname === "/login" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  try {
    const { payload } =
      await jwtVerify(
        token,
        secret
      );

    const role =
      payload.role as string;

    if (
      pathname.startsWith("/admin") &&
      role !== "ADMIN"
    ) {
      return NextResponse.redirect(
        new URL("/login", request.url)
      );
    }

    if (
      pathname.startsWith("/manager") &&
      role !== "MANAGER"
    ) {
      return NextResponse.redirect(
        new URL("/login", request.url)
      );
    }

    if (
      pathname.startsWith("/employee") &&
      role !== "EMPLOYEE"
    ) {
      return NextResponse.redirect(
        new URL("/login", request.url)
      );
    }

    return NextResponse.next();
  } catch {
    const response =
      NextResponse.redirect(
        new URL("/login", request.url)
      );

    response.cookies.delete(
      "token"
    );

    return response;
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/manager/:path*",
    "/employee/:path*",
  ],
};