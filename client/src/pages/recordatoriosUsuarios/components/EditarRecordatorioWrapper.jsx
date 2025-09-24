import React from "react";
import { useParams } from "react-router-dom";
import FormRecordatorio from "./FormRecordatorio";

const EditarRecordatorioWrapper = () => {
  const { id } = useParams();
  const id_recordatorio = parseInt(id, 10);

  if (!id_recordatorio || isNaN(id_recordatorio)) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">ID de recordatorio inválido</p>
        </div>
      </div>
    );
  }

  return <FormRecordatorio id_recordatorio={id_recordatorio} />;
};

export default EditarRecordatorioWrapper;