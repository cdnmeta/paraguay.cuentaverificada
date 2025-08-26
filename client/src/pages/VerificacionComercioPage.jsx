import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

import { useState, useEffect } from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import {
  getComerciosForUser,
} from "@/apis/comercios.api";
import { useAuthStore } from "@/hooks/useAuthStorge";
import ListSolicitudesComercios from "@/pages/VerificacionComercio/ListSolicitudesComercios";
import FormSolicitudVerificacion from "./VerificacionComercio/FormSolicitudVerificacion";


export default function VerificacionComercioPage() {
  const [comercios, setComercios] = useState([]);
  useEffect(() => {
    // Aquí puedes agregar la lógica que necesites para manejar los cambios en los comercios
    const loadComercios = async () => {
      try {
        const response = await getComerciosForUser(user.id, { estado: "1,2,3,5,6" });
        setComercios(response.data.data);
      } catch (error) {
        console.error("Error al obtener comercios:", error);
        setComercios([]);
      }
    };
    loadComercios();
  }, []);

  const [idComercioSeleccionado, setIdComercioSeleccionado] = useState(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const recargarFormulario = () => setRefreshCounter((n) => n + 1);
  const handleSeleccionarComercio = (id) => {
    if (id === idComercioSeleccionado) {
      // mismo ID: forzar recarga del form
      recargarFormulario();
    } else {
      setIdComercioSeleccionado(id);
    }
  };
  const { user } = useAuthStore();
  return (
    <div className="min-h-screen w-full px-4 py-8 flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center lg:gap-10">
      {/* Formulario fijo */}
      <div className="w-full max-w-2xl">
        <FormSolicitudVerificacion
          idComercio={idComercioSeleccionado}
          refreshTrigger={refreshCounter}
        />
      </div>

      {/* Listado scrollable */}
      <div className="w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-center">
              Estado de mis Solicitudes
            </CardTitle>
            <CardDescription className="text-center">
              Verifica el estado de los registros realizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ListSolicitudesComercios
              comercios={comercios}
              id_usuario={user.id}
              onSeleccionarComercio={handleSeleccionarComercio}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
