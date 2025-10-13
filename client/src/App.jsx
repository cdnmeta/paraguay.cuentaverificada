import { Routes, Route, Navigate } from "react-router-dom";
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
import { RecoveryPinPage, ResetPinPage, ResetPasswordPage } from "./pages/recovery";
import SemaforoFinancieroPage from "./pages/SemaforoFinanciero/pages/SemaforoFinancieroPage";
import SemaforoFinancieroRoutes from "./pages/SemaforoFinanciero";
import { PlanesPage } from "./pages/Planes";
import { PlanesRoutes } from "./pages/Planes/config/routes";
import { ComercioRoutes } from "./pages/Comercio/comercio.routes";

export default function App() {
  const { isHydrated, user } = useAuthStore();

  useEffect(() => {
    checkAuthOnStart(); // Verifica si hay sesión activa con Firebase
  }, []);

  if (!isHydrated) return <LoadingSpinner />; // O un Spinner

  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route index element={<CrearCuenta />} />
        <Route path="/login" element={user ? <Navigate to="/panel" /> : <Login />} />
        <Route path="/login/:token" element={<LoginToken />} />
        <Route path="/recuperar" element={<RecuperarContrasena />} />
        <Route path="/recovery-pin" element={<RecoveryPinPage />} />
        <Route path="/reset-pin" element={<ResetPinPage />} />
        <Route path={`${PUBLIC_ROUTES.resetPassword}`} element={<ResetPasswordPage />} />
        <Route path="/verificado" element={<Verificado />} />
        <Route path="/solicitar-cuenta-verificada" element={<SolicitarCuentaVerificada />} />
        <Route path="/verificacion-cuenta" element={<InicializarContrasenaPin />} />
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
          <Route
            path={PROTECTED_ROUTES.misDatos}
            element={<MisDatosPage />}
          />
          {RecordatoriosUsuariosRoutes()}

          
        </Route>
      </Route>
      {DptoLegalRoutes({ user })}

      {/*Verificador*/}
      {VerificadorRoutes()}
      
      {/*Admin*/}
      {SuperAdminRoutes({ user })}
      {/*Participante*/}
      {ParticipantesRoutes({ user })}

      {/*Comercio*/}
      {ComercioRoutes()}
    </Routes>
  );
}
