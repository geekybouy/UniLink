
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Redirects user to proper dashboard based on initial and/or current screen width,
 * and updates route on window resize (optional).
 */
const MOBILE_BREAKPOINT = 768;

const DashboardRedirect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const goToDashboard = () => {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      const onDashboard = ["/dashboard", "/modern-dashboard"].includes(location.pathname);
      if (!onDashboard) return;

      if (isMobile && location.pathname !== "/modern-dashboard") {
        navigate("/modern-dashboard", { replace: true });
      }
      if (!isMobile && location.pathname !== "/dashboard") {
        navigate("/dashboard", { replace: true });
      }
    };

    goToDashboard();

    // Listen for live resizes—optional, but gives a dynamic experience
    window.addEventListener("resize", goToDashboard);
    return () => window.removeEventListener("resize", goToDashboard);
    // eslint-disable-next-line
  }, [location.pathname, navigate]);

  return null; // This page just redirects, nothing to render!
};

export default DashboardRedirect;
