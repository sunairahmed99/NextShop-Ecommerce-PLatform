import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../jwt";

export const Authrequire = (request: NextRequest) => {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return {
      success: false,
      response: NextResponse.json({ success: false, message: "Unauthorized: No token provided" }, { status: 401 }),
    };
  }

  const decoded: any = verifyToken(token);

  if (!decoded) {
    return {
      success: false,
      response: NextResponse.json({ success: false, message: "Unauthorized: Invalid token" }, { status: 401 }),
    };
  }

  return {
    success: true,
    user: decoded,
  };
};
