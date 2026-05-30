import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const client_id = process.env.GOOGLE_CLIENT_ID;
  const origin = req.nextUrl.origin;
  const redirect_uri = `${origin}/api/auth/google/callback`;

  if (!client_id || client_id.includes("YOUR_GOOGLE_CLIENT_ID")) {
    return NextResponse.json(
      { success: false, message: "Google Client ID not configured in .env yet." },
      { status: 500 }
    );
  }

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
    client_id
  )}&redirect_uri=${encodeURIComponent(
    redirect_uri
  )}&response_type=code&scope=${encodeURIComponent(
    "openid email profile"
  )}&access_type=offline&prompt=consent`;

  return NextResponse.redirect(googleAuthUrl);
}
