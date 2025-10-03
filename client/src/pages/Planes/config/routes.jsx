import { Route } from "react-router-dom";
import PlanesPage  from "@/pages/Planes/pages/PlanesPage.jsx";

const URL_BASE = 'planes';

// URLs completas para navegación
export const routes = {
  index: `${URL_BASE}/`,
}


export const PlanesRoutes = () => {
    return (
        <Route>
            <Route path={routes.index} element={<PlanesPage />} />
        </Route>
    )
}

