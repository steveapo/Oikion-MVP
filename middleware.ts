import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import createIntlMiddleware from 'next-intl/middleware';
import { locales } from './i18n/config';

/**
 * Edge Runtime middleware uses the minimal auth.config.ts
 * (without Resend email provider or database adapter)
 * to avoid Edge Runtime compatibility issues.
 * 
 * Full Auth.js config with all providers is in auth.ts
 */
const { auth } = NextAuth(authConfig);

// Create i18n middleware with NO automatic locale detection
// This prevents redirects based on browser Accept-Language header
const intlMiddleware = createIntlMiddleware({
  locales: locales,
  defaultLocale: 'en',
  localePrefix: 'as-needed', // Don't prefix default locale (en)
  localeDetection: false // CRITICAL: Disable automatic locale detection to prevent unwanted redirects
});

/**
 * Middleware to handle:
 * 1. Internationalization (i18n) routing
 * 2. App-level password protection (if APP_PASSWORD is set)
 * 3. NextAuth authentication
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  
  // Skip i18n for public files and API routes (except auth API)
  const isPublicFile = pathname.startsWith("/_next") || 
                       pathname.startsWith("/favicon") ||
                       pathname.startsWith("/opengraph-image") ||
                       pathname.includes("."); // Allow any file with extension
  
  // Skip i18n for API routes except auth
  const isApiRoute = pathname.startsWith("/api") && !pathname.startsWith("/api/auth");
  
  // Check if APP_PASSWORD is configured in the environment
  const appPassword = process.env.APP_PASSWORD;
  
  if (appPassword) {
    // Skip password check for the password gate page and verification API
    const isPasswordGatePage = pathname === "/password-gate" || pathname.startsWith("/el/password-gate");
    const isPasswordVerifyApi = pathname === "/api/verify-password";
    
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
  
  // ALWAYS apply i18n middleware for non-public, non-API routes
  // This is critical for getLocale() to work
  if (!isPublicFile && !isApiRoute) {
    const response = intlMiddleware(req);
    return response;
  }
  
  // Continue with normal NextAuth middleware behavior
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};