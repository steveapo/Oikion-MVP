import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import createIntlMiddleware from 'next-intl/middleware';
import { locales } from './i18n/config';

/**
 * Edge Runtime middleware uses the minimal auth.config.ts
 * (without Resend email provider or database adapter)
 * to avoid Edge Runtime compatibility issues.
 * 
 * Full Auth.js config with all providers is in auth.ts
 */

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
export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Skip i18n for public files and API routes (except auth API)
  const isPublicFile = pathname.startsWith("/_next") || 
                       pathname.startsWith("/favicon") ||
                       pathname.startsWith("/opengraph-image") ||
                       pathname.includes("."); // Allow any file with extension
  
  // Skip i18n for API routes except auth
  const isApiRoute = pathname.startsWith("/api");
  
  // Check if APP_PASSWORD is configured in the environment
  const appPassword = process.env.APP_PASSWORD;
  
  if (appPassword) {
    // Treat only protected app routes as gated; marketing routes remain public
    const isProtectedRoute = pathname.startsWith("/dashboard") ||
                             pathname.startsWith("/admin") ||
                             pathname.startsWith("/el/dashboard") ||
                             pathname.startsWith("/el/admin");

    // Skip password check for the password gate page and verification API
    const isPasswordGatePage = pathname === "/password-gate" || pathname.startsWith("/el/password-gate");
    const isPasswordVerifyApi = pathname === "/api/verify-password";
    
    if (isProtectedRoute && !isPasswordGatePage && !isPasswordVerifyApi && !isPublicFile) {
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
    const url = req.nextUrl.clone();
    const match = url.pathname.match(/^\/(en|el)(\/.*)?$/);

    if (match) {
      const locale = match[1];
      const rest = match[2] || "/";
      const redirectUrl = new URL(rest, req.url);
      const res = NextResponse.redirect(redirectUrl);
      res.cookies.set("NEXT_LOCALE", locale, { path: "/", sameSite: "lax" });
      return res;
    }

    return NextResponse.next();
  }
  
  // Continue with normal NextAuth middleware behavior
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/"],
};