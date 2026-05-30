"use client";
import { usePathname } from "next/navigation";
import Footer from "./Footer/page";

export default function FooterWrapper() {
  const pathname = usePathname();
  if (!pathname || pathname.startsWith("/admin")) return null;
  return <Footer />;
}
