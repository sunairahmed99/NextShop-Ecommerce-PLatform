"use client";

import { useEffect } from "react";

export default function DisableDevTools() {
  useEffect(() => {
    // 1. Prevent Right-Click Context Menu
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
        // Ctrl+Shift+C (Inspect Element element selector)
        (e.ctrlKey && e.shiftKey && (e.key === "C" || e.key === "c")) ||
        // Ctrl+U (View Source)
        (e.ctrlKey && (e.key === "U" || e.key === "u"))
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    // 3. Continuous Debugger Loop
    // Halts execution automatically when Developer Tools are opened, locking the inspector.
    const interval = setInterval(() => {
      (function() {
        const t1 = performance.now();
        debugger;
        const t2 = performance.now();
        if (t2 - t1 > 100) {
          // Detects pause at debugger
        }
      })();
    }, 200);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      clearInterval(interval);
    };
  }, []);

  return null;
}
