import { Route } from "react-router-dom";
import MisNotificacionesPage from "./pages/MisNotificacionesPage";
import { routes } from "./config/routes";

export const CentroMensajesRoutes = () => {
    return (
        <>
            <Route path={routes.index} element={<MisNotificacionesPage />} />
            <Route path={routes.misNotificaciones} element={<MisNotificacionesPage />} />
        </>
    );
};

export default CentroMensajesRoutes;