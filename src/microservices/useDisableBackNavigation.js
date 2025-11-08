// src/hooks/useDisableBackNavigation.js
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const useDisableBackNavigation = (isProtected) => {
  const location = useLocation();

  useEffect(() => {
    if (!isProtected) return; // Only run for protected pages

    const handlePopState = () => {
      // Prevent going back
      window.history.pushState(null, "", window.location.href);
    };

    // Push initial state and lock
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    console.log("🔒 Back navigation disabled for:", location.pathname);

    return () => {
      // Cleanup: allow back again when leaving protected page
      window.removeEventListener("popstate", handlePopState);
      console.log("🔓 Back navigation re-enabled");
    };
  }, [isProtected, location]);
};

export default useDisableBackNavigation;
