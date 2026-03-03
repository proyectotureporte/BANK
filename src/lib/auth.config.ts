import type { NextAuthConfig } from "next-auth";
import "@/lib/auth-types";

export const authConfig: NextAuthConfig = {
  providers: [], // Credentials provider goes in auth.ts (needs bcrypt, Node.js only)
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as any).role;
        token.mustChangePassword = (user as any).mustChangePassword ?? false;
      }
      if (trigger === "update" && session?.mustChangePassword !== undefined) {
        token.mustChangePassword = session.mustChangePassword;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.mustChangePassword = token.mustChangePassword ?? false;
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const isAuthPage =
        pathname === "/" ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/reset-password");
      const isChangePasswordPage = pathname === "/change-password";
      const isAdminRoute = pathname.startsWith("/admin");
      const isDashboardRoute = pathname.startsWith("/dashboard");
      const userRole = auth?.user?.role;
      const mustChangePassword = auth?.user?.mustChangePassword;

      // Auth pages: let through if not logged in, redirect if logged in
      if (isAuthPage) {
        if (isLoggedIn) {
          const target = userRole === "admin" ? "/admin" : "/dashboard";
          return Response.redirect(new URL(target, nextUrl));
        }
        return true;
      }

      // Not logged in: redirect to login
      if (!isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      // Force password change
      if (mustChangePassword && !isChangePasswordPage) {
        return Response.redirect(new URL("/change-password", nextUrl));
      }

      // On change-password but doesn't need to: redirect away
      if (isChangePasswordPage && !mustChangePassword) {
        const target = userRole === "admin" ? "/admin" : "/dashboard";
        return Response.redirect(new URL(target, nextUrl));
      }

      // Role-based routing
      if (isAdminRoute && userRole !== "admin") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      if (isDashboardRoute && userRole === "admin") {
        return Response.redirect(new URL("/admin", nextUrl));
      }

      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
};
