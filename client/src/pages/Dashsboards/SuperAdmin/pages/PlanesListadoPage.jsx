import React, { useState, useEffect } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { getPlanes } from "@/apis/planes.api";
import ListadoPlanes from "../../../Planes/components/ListadoPlanes";
import { useNavigate } from "react-router-dom";
import { routes } from "../config/routes";

const PlanesListadoPage = () => {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Configuración de columnas habilitadas
  const columnasHabilitadas = {
    nombre: true,
    descripcion: true,
    precio: true,
    precio_sin_iva: true,
    descripcion_tipo_iva: true,
    renovacion_plan: true,
    activo: true,
    fecha_creacion: true
  };

  // Configuración de opciones habilitadas
  const opcionesHabilitadas = {
    editar: true,
    eliminar: true
  };

  // Cargar planes
  const cargarPlanes = async () => {
    try {
      setLoading(true);
      const response = await getPlanes();
      if (response.data) {
        setPlanes(response.data);
      }
    } catch (error) {
      console.error("Error al cargar planes:", error);
      toast.error("No se pudieron cargar los planes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPlanes();
  }, []);

  // Manejar edición de plan
  const handleEdit = (plan) => {
    console.log("Editar plan:", plan);
    // Aquí puedes agregar la lógica para editar
    navigate(`${routes.editarPlan(plan.id)}`);
  };

  // Manejar eliminación de plan
  const handleDelete = (plan) => {
    console.log("Eliminar plan:", plan);
    // Recargar la lista de planes después de la eliminación
    cargarPlanes();
  };

  // Manejar creación de nuevo plan
  const handleNuevoPlan = () => {
    console.log("Crear nuevo plan");
    // Aquí puedes agregar la lógica para crear
    navigate(`${routes.crearPlan}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Cargando planes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planes</h1>
          <p className="text-muted-foreground">
            Gestiona los planes de verificación disponibles
          </p>
        </div>
        
        {/* Botón Agregar - Debajo del título en mobile, a la derecha en desktop */}
        <div className="order-3 md:order-2">
          <Button onClick={handleNuevoPlan} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Plan
          </Button>
        </div>
      </div>

      {/* Tabla de Planes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Planes</CardTitle>
        </CardHeader>
        <CardContent className={'grid grid-cols-1'}>
          <ListadoPlanes
            data={planes}
            columnasHabilitadas={columnasHabilitadas}
            opcionesHabilitadas={opcionesHabilitadas}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanesListadoPage;
