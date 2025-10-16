import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import authConfig from "@/auth.config";

/**
 * Edge Runtime middleware uses the minimal auth.config.ts
 * (without Resend email provider or database adapter)
 * to avoid Edge Runtime compatibility issues.
 * 
 * Full Auth.js config with all providers is in auth.ts
 */
const { auth } = NextAuth(authConfig);

/**
 * Middleware to handle:
 * 1. App-level password protection (if APP_PASSWORD is set)
 * 2. NextAuth authentication
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  
  // Check if APP_PASSWORD is configured in the environment
  const appPassword = process.env.APP_PASSWORD;
  
  if (appPassword) {
    // Skip password check for the password gate page and verification API
    const isPasswordGatePage = pathname === "/password-gate";
    const isPasswordVerifyApi = pathname === "/api/verify-password";
    const isPublicFile = pathname.startsWith("/_next") || 
                         pathname.startsWith("/favicon") ||
                         pathname.startsWith("/opengraph-image") ||
                         pathname.startsWith("/api/auth") ||
                         pathname.includes("."); // Allow any file with extension
    
    if (!isPasswordGatePage && !isPasswordVerifyApi && !isPublicFile) {
      // Check if the user has verified the password via cookie
      const passwordVerified = req.cookies.get("app-password-verified")?.value === "true";
      
      if (!passwordVerified) {
        // Redirect to password gate with return URL
        const url = new URL("/password-gate", req.url);
        url.searchParams.set("returnUrl", pathname);
        return NextResponse.redirect(url);
      }
    }
  }
  
  // Continue with normal NextAuth middleware behavior
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};