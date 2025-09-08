import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React, { useEffect } from "react";
import ListadoSolicitudes from "./ListadoSolicitudes";
import { getSolicitudesCuenta, getSolicitudesCuentaAll } from "@/apis/verificacionCuenta.api";
import { toast } from "sonner";
import { EVENTS, on } from "@/utils/events";

export default function ListadoSolicitudesCuentasPage({
 opcionesPage = {}
}) {
  const [solicitudes, setSolicitudes] = React.useState([]);
  const loadSeo = () => {
    document.title = "Solicitudes de Cuentas";
  };
  const { opcionesHabilitar, columnasHabilitar,tipoLista } = opcionesPage;

  // Mover loadSolicitudes fuera del useEffect para usar useCallback
  const loadSolicitudes = React.useCallback(async () => {
    try {
      let response = null;
      switch (tipoLista) {
        case 'todas':
          response = await getSolicitudesCuentaAll();
          setSolicitudes(response.data);
          break;
        default:
          response = await getSolicitudesCuenta();
          setSolicitudes(response.data);
          break;
      }
    } catch (error) {
      toast.error("Error al cargar las solicitudes: " + error.message);
    }
  }, [tipoLista]); // Dependencia de tipoLista

  useEffect(() => {
    loadSeo();
    loadSolicitudes();
    
    const solitudesEventsOff = on(EVENTS.SOLICITUDES_CUENTA_ACTUALIZADA, () => {
        loadSolicitudes();
    });
    
    return () => {
      solitudesEventsOff();
    };
  }, [loadSolicitudes]); // Ahora sí incluimos la dependencia


  return (
    <div>
      <div className="w-full px-4">
        <Card className="w-full">
          <CardHeader className="pb-2 sm:pb-3">
            <h1 className="text-base sm:text-lg md:text-xl font-semibold tracking-tight">
              Solicitudes para Cuentas Verificadas
            </h1>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="grid grid-cols-1">
              <ListadoSolicitudes
                data={solicitudes}
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
