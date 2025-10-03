// FormSolicitudVerificacion.jsx (versión refactorizada con componentes separados)
import React, { useEffect, useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getComercioById } from "@/apis/comercios.api";

// Importar los nuevos componentes
import FormSolicitudComercio from "./components/FormSolicitudComercio";
import FormVerificacionComercio from "./components/FormVerificacionComercio";
import FormPagoRechazado from "./components/FormPagoRechazado";

export default function FormSolicitudVerificacion({
  idComercio = null,
  refreshTrigger = 0,
}) {
  const [loadingComercio, startTransition] = useTransition();
  const [isEditar, setIsEditar] = useState(false);
  const [comercioData, setComercioData] = useState(null);

  // --- Carga de comercio ---
  useEffect(() => {
    const loadComercioData = async (id) => {
      if (!id) {
        // Si no hay ID, resetear todo al estado inicial
        setComercioData(null);
        setIsEditar(false);
        return;
      }
      
      try {
        setIsEditar(false);

        const response = await getComercioById(id);
        const comercio = response.data;
        if (!comercio) return;

        setComercioData(comercio);
        setIsEditar(true);
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar comercio");
      }
    };

    startTransition(() => loadComercioData(idComercio));
  }, [idComercio, refreshTrigger]);

  // Función para manejar el éxito de cualquier formulario
  const handleFormSuccess = () => {
    setComercioData(null);
    setIsEditar(false);
  };

  // Función para resetear y crear nuevo comercio
  const handleNuevoComercio = () => {
    setComercioData(null);
    setIsEditar(false);
  };

  // --- Renderizado según estado ---
  const renderFormSegunEstado = (estado) => {
    switch (estado) {
      case 2: // Pago Aprobado
      case 3: // En revisión
      case 5: // Rechazado - puede editar info verificación
        return (
          <FormVerificacionComercio
            isEditar={isEditar}
            comercioData={comercioData}
            onSuccess={handleFormSuccess}
          />
        );
      case 4: // Verificado - sólo lectura, no puede editar
        return (
          <div className="text-center space-y-4 p-6">
            <div className="text-green-600 text-lg font-semibold">
              ✅ Comercio Verificado
            </div>
            <p className="text-gray-600">
              Su comercio ha sido verificado exitosamente.
            </p>
            <Button 
              variant="outline" 
              onClick={handleNuevoComercio}
              className="w-full"
            >
              Registrar Nuevo Comercio
            </Button>
          </div>
        );
      case 6: // Pago Rechazado - puede subir nuevo comprobante
        return (
          <FormPagoRechazado
            comercioData={comercioData}
            onSuccess={handleFormSuccess}
          />
        );
      default:
        return (
          <FormSolicitudComercio
            isEditar={isEditar}
            comercioData={comercioData}
            idComercio={idComercio}
            onSuccess={handleFormSuccess}
          />
        );
    }
  };

  // --- Render principal ---
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {isEditar ? "Editar Comercio" : "Registrar Comercio"}
        </CardTitle>
        <CardDescription className="text-center">
          <p className="mb-2 text-xl text-black font-bold">
            {comercioData && comercioData.razon_social}
          </p>
          {isEditar 
            ? `Estado: ${getEstadoTexto(comercioData?.estado)}`
            : "Complete el formulario para registrar su comercio"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadingComercio ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Cargando...</div>
          </div>
        ) : (
          <>
            {/* Renderiza el formulario según el estado */}
            {isEditar && comercioData ? (
              renderFormSegunEstado(comercioData.estado)
            ) : (
              <FormSolicitudComercio
                isEditar={false}
                comercioData={null}
                idComercio={null}
                onSuccess={handleFormSuccess}
              />
            )}

            {/* Botón para nuevo comercio (solo si está editando) */}
            {isEditar && comercioData?.estado !== 6 && (
              <div className="mt-6 pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={handleNuevoComercio}
                  className="w-full"
                >
                  Registrar Nuevo Comercio
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function para mostrar el texto del estado
function getEstadoTexto(estado) {
  const estados = {
    1: "Pendiente",
    2: "Pago Aprobado",
    3: "En Revisión", 
    4: "Verificado",
    5: "Rechazado",
    6: "Pago Rechazado"
  };
  return estados[estado] || "Desconocido";
}