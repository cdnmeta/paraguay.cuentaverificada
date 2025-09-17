import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React, { useEffect } from "react";
import ListadoParticipantes from "./ListadoParticipantes";
import { getParticipantesMany } from "@/apis/participantes.api";
import { toast } from "sonner";
import { EVENTS, on } from "@/utils/events";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { routes } from "../Verificador/verficador.routes";
import { routes as AdminRoutes } from "@/pages/Dashsboards/SuperAdmin/config/routes";
export default function ListadoParticipantesPage({
 opcionesPage = {}
}) {
  const [participantes, setParticipantes] = React.useState([]);
  const loadSeo = () => {
    document.title = "Participantes";
  };
  const { opcionesHabilitar, columnasHabilitar, tipoLista } = opcionesPage;
  const navigate = useNavigate();
  // Función para cargar participantes
  const loadParticipantes = React.useCallback(async () => {
    try {
      let response = null;
      switch (tipoLista) {
        case 'todos':
          // Cargar todos los participantes sin filtros
          response = await getParticipantesMany({});
          setParticipantes(response.data);
          break;
        case 'activos':
          // Cargar solo participantes activos
          response = await getParticipantesMany({ activo: true });
          setParticipantes(response.data);
          break;
        case 'inactivos':
          // Cargar solo participantes inactivos
          response = await getParticipantesMany({ activo: false });
          setParticipantes(response.data);
          break;
        default:
          // Cargar participantes por defecto (activos)
          response = await getParticipantesMany({ activo: true });
          setParticipantes(response.data);
          break;
      }
    } catch (error) {
      toast.error("Error al cargar los participantes: " + error.message);
    }
  }, [tipoLista]); // Dependencia de tipoLista

  useEffect(() => {
    loadSeo();
    loadParticipantes();
    
    // Escuchar eventos de actualización de participantes
    const participantesEventsOff = on(EVENTS.PARTICIPANTES_ACTUALIZADA, () => {
        loadParticipantes();
    });
    
    return () => {
      participantesEventsOff();
    };
  }, [loadParticipantes]); // Incluir la dependencia

  return (
    <div>
      <div className="w-full px-4">
        <Card className="w-full">
          <CardHeader className="pb-2 sm:pb-3">
            <h1 className="text-base sm:text-lg md:text-xl font-semibold tracking-tight">
              Gestión de Participantes
            </h1>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="w-full flex justify-end mb-4">
                <Button className={"bg-blue-600"} onClick={() => navigate(AdminRoutes.find(route => route.key === "registrarParticipante").path)}>
                    <Plus  />
                    Agregar Participante
                </Button>
            </div>
            <div className="grid grid-cols-1">
              <ListadoParticipantes
                data={participantes}
                opcionesLista={opcionesHabilitar}
                columnasHabilitadas={columnasHabilitar}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
