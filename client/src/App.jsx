import { Routes, Route } from "react-router-dom";
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
import { PROTECTED_ROUTES } from "./utils/routes.routes";
import DashboardApp from "./components/layouts/DashboardLayoutApp";
import LoadingSpinner from "./components/customs/loaders/LoadingSpinner";
import DptoLegalRoutes, { dtoLegalRoutes } from "./pages/departamento-legal/dpto-legal.routes";
import FacturaPlanesPage from "./pages/FacturaPlanes/FacturaPlanesPage";
import CobroSuscripcionesPage from "./pages/CobroSuscripcionesPlanes/CobroSuscripcionesPage";
import { verificarSesionYgrupoAdmitido } from "./utils/auth";
import MisDatosPage from "./pages/MisDatos/MisDatosPage";
import LoginToken from "./pages/Login/LoginToken";
import InicializarContrasenaPin from "./pages/recovery/InicializarContrasenaPin";

import VerificadorRoutes from "./pages/Verificador/verficador.routes";
import LayoutDepartamentoLegal from "./components/layouts/LayoutDepartamentoLegal";
import LayoutVerificador from "./components/layouts/LayoutVerificador";
import { routes as verificadorRoutes } from "./pages/Verificador/verficador.routes";
import { SuperAdminRoutes } from "./pages/Dashsboards/SuperAdmin/admin.routes";
import { ParticipantesRoutes } from "./pages/Dashsboards/Participante/participantes.routes";
import { UsuariosRoutes } from "./pages/Usuarios/usuarios.routes";

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
        <Route path="/login" element={<Login />} />
        <Route path="/login/:token" element={<LoginToken />} />
        <Route path="/recuperar" element={<RecuperarContrasena />} />
        <Route path="/verificado" element={<Verificado />} />
        <Route path="/solicitar-cuenta-verificada" element={<SolicitarCuentaVerificada />} />
        <Route path="/verificacion-cuenta" element={<InicializarContrasenaPin />} />
        <Route path="/pacto" element={<Pacto />} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
        <Route path="mi-cuenta" element={<MisDatosPage />} />
      </Route>
      <Route element={<DashboardApp />}>
        <Route element={<ProtectedRoute isAuthorized={!!user} />}>
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

          
        </Route>
      </Route>
      <Route path={dtoLegalRoutes.index} element={<LayoutDepartamentoLegal />}>
        <Route element={<ProtectedRoute isAuthorized={verificarSesionYgrupoAdmitido(user, [1])} redirectPath={PROTECTED_ROUTES.dashboard} />}>
          {DptoLegalRoutes()}
        </Route>
      </Route>
      <Route path={verificadorRoutes.index} element={<LayoutVerificador />}>
        <Route element={<ProtectedRoute isAuthorized={verificarSesionYgrupoAdmitido(user, [2])} redirectPath={PROTECTED_ROUTES.dashboard} />}>
          {VerificadorRoutes()}
        </Route>
      </Route>
      {/*Admin*/}

      {SuperAdminRoutes({ user })}
      {/*Participante*/}
      {ParticipantesRoutes({ user })}
    </Routes>
  );
}
