import React from "react";
import { Routes, Route } from "react-router-dom";
import RecordatoriosPage from "./pages/RecordatoriosPage";
import FormRecordatorio from "./components/FormRecordatorio";
import EditarRecordatorioWrapper from "./components/EditarRecordatorioWrapper";
import { URL_BASE,routes } from "@/pages/recordatoriosUsuarios/config/routes";

const RecordatoriosUsuariosRoutes = () => {
  return (
    <Route path={URL_BASE}>
      {/* Ruta principal - Listado de recordatorios */}
      <Route index element={<RecordatoriosPage />} />

      {/* Ruta para crear nuevo recordatorio */}
      <Route path={routes.crear} element={<FormRecordatorio />} />

      {/* Ruta para editar recordatorio existente */}
      <Route path={routes.editar()} element={<EditarRecordatorioWrapper />} />
    </Route>
  );
};

export default RecordatoriosUsuariosRoutes;
