"use client";

import { useEffect } from "react";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

export default function DisableDevTools() {
  useEffect(() => {
    // 1. Prevent Right-Click Context Menu (inspect karne se rokta hai)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Prevent Common DevTools Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        // F12
        e.key === "F12" ||
        // Ctrl+Shift+I (Inspect Element)
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i")) ||
        // Ctrl+Shift+J (Console)
        (e.ctrlKey && e.shiftKey && (e.key === "J" || e.key === "j")) ||
        // Ctrl+Shift+C (Inspect Element selector)
        (e.ctrlKey && e.shiftKey && (e.key === "C" || e.key === "c")) ||
        // Ctrl+U (View Source)
        (e.ctrlKey && (e.key === "U" || e.key === "u"))
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return null;
}
