import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;
  const mustChangePassword = req.auth?.user?.mustChangePassword;

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");
  const isApiRoute = pathname.startsWith("/api");
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin");
  const isChangePasswordPage = pathname === "/change-password";

  if (isApiRoute) return NextResponse.next();

  if (isAuthPage) {
    if (isLoggedIn) {
      const redirectUrl =
        userRole === "admin" ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Force password change redirect
  if (mustChangePassword && !isChangePasswordPage) {
    return NextResponse.redirect(new URL("/change-password", req.url));
  }

  // If on change-password page but doesn't need to change, redirect away
  if (isChangePasswordPage && !mustChangePassword) {
    const redirectUrl = userRole === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  if (isAdminRoute && userRole !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isDashboardRoute && userRole === "admin") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.avif$|.*\\.webp$|.*\\.ico$).*)",
  ],
};
