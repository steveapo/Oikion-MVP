import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { env } from "@/env.mjs";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    // Check if APP_PASSWORD is configured
    if (!env.APP_PASSWORD) {
      return NextResponse.json(
        { success: false, error: "Password protection is not configured" },
        { status: 500 }
      );
    }

    // Simple password comparison (not hashed for simplicity as per requirements)
    if (password === env.APP_PASSWORD) {
      // Set a cookie that expires in 7 days
      const cookieStore = await cookies();
      cookieStore.set("app-password-verified", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "Incorrect password" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
