import { Route } from 'react-router-dom'
import {routes} from './config/routes.js'
import ComercioVerificadoPage from './pages/ComercioVerificadoPage.jsx'
import { Layout } from 'lucide-react'
import LayoutComercioVerifcado from './layouts/LayoutComercioVerifcado.jsx'

export function ComercioRoutes(){
    console.log(routes.comercioSlug(':slug'));
    return (
        <Route element={<LayoutComercioVerifcado />}>
         <Route path={`${routes.comercioSlug(':slug')}`} element={<ComercioVerificadoPage />} />
        </Route>
    )
}