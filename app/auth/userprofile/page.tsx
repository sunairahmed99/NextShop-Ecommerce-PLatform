import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/jwt";
import { getProfileRaw } from "@/lib/Services/Userservice";
import ProfileClient from "./ProfileClient";

export default async function UserProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  const decoded: any = verifyToken(token);
  if (!decoded) {
    redirect("/auth/login");
  }

  const user = await getProfileRaw(decoded.id);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-xl">Profile data not found. Please register a user first.</p>
      </div>
    );
  }

  return <ProfileClient initialUser={user} />;
}
