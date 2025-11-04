import { useEffect } from "react";
import { Outlet } from "react-router-dom";

export default function ForwardOnlyBoundary({ children }) {
  useEffect(() => {
    // Empuja el estado actual para “consumir” un back inmediato
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      // Cada vez que el usuario intenta volver, re-inyectamos el estado actual
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return children ? children : <Outlet />;
}