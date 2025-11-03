// src/disableDevTools.js

import { useEffect } from "react";

const useDisableDevTools = () => {
  useEffect(() => {
    // --- Block F12, Ctrl+Shift+I/J, Ctrl+U ---
    const handleKeyDown = (e) => {
      if (e.key === "F12") e.preventDefault();
      if (e.ctrlKey && e.shiftKey && e.key === "I") e.preventDefault();
      if (e.ctrlKey && e.shiftKey && e.key === "J") e.preventDefault();
      if (e.ctrlKey && e.key === "U") e.preventDefault();
    };

    // --- Block right-click context menu ---
    const handleContextMenu = (e) => e.preventDefault();

    // --- Detect DevTools (optional) ---
    const detectDevTools = () => {
      const start = new Date();
      debugger; // triggers when DevTools open
      const end = new Date();
      if (end - start > 100) {
        console.warn("DevTools detected!");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("contextmenu", handleContextMenu);
    const interval = setInterval(detectDevTools, 1000);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("contextmenu", handleContextMenu);
      clearInterval(interval);
    };
  }, []);
};

export default useDisableDevTools;
