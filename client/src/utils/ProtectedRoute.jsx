import { useAuthStore } from "@/hooks/useAuthStorge";
import { Navigate, Outlet } from "react-router-dom";

/**
 * Componente para proteger rutas.
 * @param {boolean} isAuthorized - Define si el usuario puede acceder.
 * @param {string} redirectPath - Ruta a redireccionar si no tiene acceso.
 * @param {ReactNode} children - Elementos secundarios a renderizar si tiene acceso.
 * @returns {ReactNode} - Redirige o renderiza los hijos.
 */
export default function ProtectedRoute({
  isAuthorized,
  children = null,
  redirectPath = "/login",
}) {
  if (!isAuthorized) {
    return <Navigate to={redirectPath} replace />;
  }

  return children ? children : <Outlet />;
}
