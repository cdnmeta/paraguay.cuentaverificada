import { Routes, Route, Navigate, useLocation, Outlet, useNavigate } from "react-router-dom";
import Pacto from "./components/Pacto";
import CrearCuenta from "./pages/CrearCuenta";
import Login from "./pages/Login";
import RecuperarContrasena from "./pages/RecuperarContrasena";
import Verificado from "./pages/Verificado";
import SolicitarCuentaVerificada from "./pages/SolicitarCuentaVerificada";
import DefaultLayout from "./components/layouts/DefaultLayout";
import DashBoardUsarioProtegido from "./pages/DashBoardUsarioProtegido";
import { useAuthStore } from "./hooks/useAuthStorge";
import { useEffect } from "react";
import ProtectedRoute from "./utils/ProtectedRoute";
import { checkAuthOnStart } from "./utils/funciones";
import VerificacionComercioPage from "./pages/VerificacionComercioPage";
import { PROTECTED_ROUTES, PUBLIC_ROUTES } from "./utils/routes.routes";
import DashboardApp from "./components/layouts/DashboardLayoutApp/DashboardLayoutApp";
import LoadingSpinner from "./components/customs/loaders/LoadingSpinner";
import DptoLegalRoutes from "./pages/departamento-legal/dpto-legal.routes";
import FacturaPlanesPage from "./pages/FacturaPlanes/pages/FacturaPlanesPage";
import CobroSuscripcionesPage from "./pages/CobroSuscripcionesPlanes/CobroSuscripcionesPage";
import { verificarSesionYgrupoAdmitido } from "./utils/auth";
import MisDatosPage from "./pages/MisDatos/MisDatosPage";
import LoginToken from "./pages/Login/LoginToken";
import InicializarContrasenaPin from "./pages/recovery/InicializarContrasenaPin";

import VerificadorRoutes from "./pages/Dashsboards/Verificador/verficador.routes";
import LayoutDepartamentoLegal from "./pages/departamento-legal/LayoutDepartamentoLegal";
import LayoutVerificador from "./pages/Dashsboards/Verificador/LayoutVerificador";
import { routes as verificadorRoutes } from "./pages/Verificador/verficador.routes";
import { SuperAdminRoutes } from "./pages/Dashsboards/SuperAdmin/admin.routes";
import { ParticipantesRoutes } from "./pages/Dashsboards/Participante/participantes.routes";
import RecordatoriosUsuariosRoutes from "./pages/recordatoriosUsuarios";
import {
  RecoveryPinPage,
  ResetPinPage,
  ResetPasswordPage,
} from "./pages/recovery";
import SemaforoFinancieroPage from "./pages/SemaforoFinanciero/pages/SemaforoFinancieroPage";
import SemaforoFinancieroRoutes from "./pages/SemaforoFinanciero";
import { PlanesPage } from "./pages/Planes";
import { PlanesRoutes } from "./pages/Planes/config/routes";
import { ComercioRoutes } from "./pages/Comercio/comercio.routes";
import FavoritosRoutes from "./pages/Favoritos/favoritos.routes";
import SoporteAyudaRoute from "./pages/SoporteAyuda/soporteAyuda.route";
import SoporteRoutes from "./pages/Dashsboards/Soporte/soporte.routes";

function ProtectedRoutesByRol({ permitirNavegacionExterna = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;

  // Definir dashboards válidos y sus rutas base
  const DASHBOARDS_VALIDOS = {
    '/admin': 'SuperAdmin',
    '/verificador': 'Verificador', 
    '/soporte': 'Soporte',
    '/participante': 'Participante',
    '/dpto-legal': 'DepartamentoLegal'
  };

  const segmentos = pathname.split("/").filter(Boolean);
  const dashboardActual = `/${segmentos[0] ?? ""}`;
  
  // Verificar si estamos en un dashboard válido
  const esDashboardValido = Object.keys(DASHBOARDS_VALIDOS).includes(dashboardActual);
  
  // Efecto para interceptar navegación del botón atrás del navegador
  useEffect(() => {

    console.log("evaluar permicion")

    if (!esDashboardValido || permitirNavegacionExterna) return;

    const handlePopState = (event) => {
      console.log("evludar evento de atra")
      const newPath = window.location.pathname;
      const newDashboard = `/${newPath.split("/").filter(Boolean)[0] ?? ""}`;
      
      // Si intenta salir del dashboard actual sin permisos
      if (!newPath.startsWith(dashboardActual) && newDashboard !== dashboardActual) {
        event.preventDefault();
        navigate(dashboardActual, { replace: true });
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [dashboardActual, permitirNavegacionExterna, esDashboardValido, navigate]);

  if (esDashboardValido && !permitirNavegacionExterna) {
    // Verificar si se intenta acceder a una ruta fuera del dashboard actual
    if (!pathname.startsWith(dashboardActual) || pathname === dashboardActual) {
      // Si está exactamente en el dashboard root, permitir acceso
      if (pathname === dashboardActual) {
        return <Outlet />;
      }
      // Si intenta salir del dashboard, redirigir de vuelta
      return <Navigate to={dashboardActual} replace state={{ from: location }} />;
    }
  }

  return <Outlet />;
}

export default function App() {
  const { isHydrated, user } = useAuthStore();

  useEffect(() => {
    console.log(location);
    checkAuthOnStart(); // Verifica si hay sesión activa con Firebase
  }, []);

  if (!isHydrated) return <LoadingSpinner />; // O un Spinner

  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route index element={<Navigate to="/login" />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/panel" /> : <Login />}
        />
        <Route path="/login/:token" element={<LoginToken />} />
        <Route path="/recuperar" element={<RecuperarContrasena />} />
        <Route path="/recovery-pin" element={<RecoveryPinPage />} />
        <Route path="/reset-pin" element={<ResetPinPage />} />
        <Route
          path={`${PUBLIC_ROUTES.resetPassword}`}
          element={<ResetPasswordPage />}
        />
        <Route path="/verificado" element={<Verificado />} />
        <Route
          path="/solicitar-cuenta-verificada"
          element={<SolicitarCuentaVerificada />}
        />
        <Route
          path="/verificacion-cuenta"
          element={<InicializarContrasenaPin />}
        />
        <Route path="/pacto" element={<Pacto />} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Route>
      <Route element={<DashboardApp />}>
        <Route element={<ProtectedRoute isAuthorized={!!user} />}>
          {SemaforoFinancieroRoutes()}
          <Route
            path={PROTECTED_ROUTES.dashboard}
            element={<DashBoardUsarioProtegido />}
          />
          <Route
            path={PROTECTED_ROUTES.verificacionComercio}
            element={<VerificacionComercioPage />}
          />
          <Route path={PROTECTED_ROUTES.misDatos} element={<MisDatosPage />} />
          {RecordatoriosUsuariosRoutes()}

          {FavoritosRoutes()}

          {SoporteAyudaRoute()}
        </Route>
      </Route>

      {/*Departamento Legal*/}
      {DptoLegalRoutes({ user })}

      {/* Dashboards con navegación restringida */}
      <Route element={<ProtectedRoutesByRol permitirNavegacionExterna={false} />}>
        {/*Verificador - Aislado*/}
        {VerificadorRoutes()}

        {/*Admin - Aislado*/}
        {SuperAdminRoutes({ user })}

        {/*Soporte - Aislado*/}
        {SoporteRoutes({ user })}
      </Route>

      {/* Dashboards con navegación externa permitida */}
      <Route element={<ProtectedRoutesByRol permitirNavegacionExterna={true} />}>
        {/*Participante - Puede navegar externamente*/}
        {ParticipantesRoutes({ user })}
      </Route>

      {/*Comercio*/}
      {ComercioRoutes()}
    </Routes>
  );
}
