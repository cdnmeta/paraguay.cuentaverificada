// src/pages/SuperAdmin/admin.routes.jsx
import React, { lazy, Suspense } from "react";
import { Route, useParams } from "react-router-dom";
import FormUsuario from "./components/FormUsuarios";
import ProtectedRoute from "@/utils/ProtectedRoute";
import { routes } from "./config/routes";
import ListadoUsuariosPages from "./pages/ListadoUsuariosPages";
import DashboardApp from "@/components/layouts/DashboardLayoutApp/DashboardLayoutApp";
import LoadingSpinner from "@/components/customs/loaders/LoadingSpinner";


// Componente wrapper para capturar el ID de la ruta
function EditarUsuarioWrapper() {
  const { id } = useParams(); // ✅ Aquí SÍ captura el :id correctamente
  console.log('ID capturado en wrapper:', id);
  
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <FormUsuario idUsuario={id} />
    </Suspense>
  );
}

export function UsuariosRoutes({ user }) {
  const isAuthorized = (u) => u !== null;

    

  return (
    <Route
      path="usuarios"
    element={
      <ProtectedRoute isAuthorized={isAuthorized(user)} redirectPath="/panel" />
}
    >
      <Route path={routes.find(route => route.key === 'editarUsuario').path} element={<EditarUsuarioWrapper />} />
      <Route path={routes.find(route => route.key === 'registrarUsuario').path} element={<FormUsuario />} />
      <Route path={routes.find(route => route.key === 'listadoUsuarios').path} element={<ListadoUsuariosPages />} />
     { /* Otras rutas específicas pueden ir aquí */ }
    </Route>
  );
}
