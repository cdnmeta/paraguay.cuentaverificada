import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React, { useEffect } from "react";
import ListadoSolicitudes from "./ListadoSolicitudes";
import { getResumenSolicitudesCuenta, getSolicitudesCuenta, getSolicitudesCuentaAll } from "@/apis/verificacionCuenta.api";
import { toast } from "sonner";
import { EVENTS, on } from "@/utils/events";
import { useAuthStore } from "@/hooks/useAuthStorge";
import { Clock, CheckCircle, XCircle, AlertCircle, UserCheck } from "lucide-react";

export default function ListadoSolicitudesCuentasPage({
 opcionesPage = {}
}) {
  const [solicitudes, setSolicitudes] = React.useState([]);
  const [resumenSolicitudes, setResumenSolicitudes] = React.useState(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = React.useState(null);
  const [filtrando, setFiltrando] = React.useState(false);
  const {user} = useAuthStore()
  const loadSeo = () => {
    document.title = "Solicitudes de Cuentas";
  };
  const { opcionesHabilitar, columnasHabilitar,tipoLista } = opcionesPage;
  // Mover loadSolicitudes fuera del useEffect para usar useCallback
  const loadSolicitudes = React.useCallback(async () => {
    try {
      let response = null;
      let responseResumen = null
      
      switch (tipoLista) {
        case 'todas':
          response = await getSolicitudesCuentaAll();
          responseResumen = await getResumenSolicitudesCuenta();
          setSolicitudes(response.data);
          setResumenSolicitudes(responseResumen.data);
          break;
        default:
          response = await getSolicitudesCuenta();
          responseResumen = await getResumenSolicitudesCuenta({id_verificador:user.id});
          setSolicitudes(response.data);
          setResumenSolicitudes(responseResumen.data);
          break;
      }
    } catch (error) {
      toast.error("Error al cargar las solicitudes: " + error.message);
    }
  }, [tipoLista, user.id]); // Dependencia de tipoLista y user.id


  const loadSolicitudesCuentaFiltradas = async (params) => {
    // eslint-disable-next-line no-useless-catch
    try {
      let response = null;
      setFiltrando(true);

     switch (tipoLista) {
      case 'todas':
        response = await getSolicitudesCuentaAll(params);
        setSolicitudes(response.data);
        break;
      default:
        response = await getSolicitudesCuenta(params);
        setSolicitudes(response.data);
        break;
     }
    } catch (error) {
      toast.error("Error al cargar las solicitudes: " + error.message);
      throw error;
    }finally{
      setFiltrando(false);
    }
  }

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

  // Componente para mostrar tarjetas de resumen
  const ResumenCard = ({ icon: Icon, titulo, valor, color = "text-gray-600", id_estado = 1 }) => (
    <Card className={`h-full ${id_estado === estadoSeleccionado ? "ring-2 ring-blue-500" : ""}`} onClick={() => {
      setEstadoSeleccionado(id_estado === estadoSeleccionado ? null : id_estado);
      setTimeout(() => {
        loadSolicitudesCuentaFiltradas({id_estado: id_estado === estadoSeleccionado ? null : id_estado});
      }, 100);
    }}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full bg-gray-100 ${color}`}>
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
              {titulo}
            </p>
            <div className="w-full text-right">
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
              {valor || 0}
            </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );


  return (
    <div>
      <div className="w-full px-4">
        <Card className="w-full">
          <CardHeader className="pb-2 sm:pb-3">
            <h1 className="text-base sm:text-lg md:text-xl font-semibold tracking-tight">
              Solicitudes para Cuentas Verificadas {filtrando && "(Filtrando...)"}
            </h1>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6">
            {/* Resumen de solicitudes en tarjetas responsivas */}
            {resumenSolicitudes && (
              <div className="mb-6">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                  <ResumenCard
                    icon={Clock}
                    titulo="Pendientes Verificación"
                    valor={resumenSolicitudes.cant_pend_verificacion}
                    color="text-yellow-600"
                    id_estado={1}
                  />
                  <ResumenCard
                    icon={AlertCircle}
                    titulo="Pendientes Aprobación"
                    valor={resumenSolicitudes.cant_pend_aprobacion}
                    color="text-orange-600"
                    id_estado={2}
                  />
                  <ResumenCard
                    icon={CheckCircle}
                    titulo="Aprobadas"
                    valor={resumenSolicitudes.cant_aprobado}
                    color="text-green-600"
                    id_estado={3}
                  />
                  <ResumenCard
                    icon={XCircle}
                    titulo="Rechazadas"
                    valor={resumenSolicitudes.cant_rechazados}
                    color="text-red-600"
                    id_estado={4}
                  />
                  <ResumenCard
                    icon={UserCheck}
                    titulo="Pendiente Verificar Código"
                    valor={resumenSolicitudes.cant_pend_verificar_codigo}
                    color="text-blue-600"
                    id_estado={5}
                  />
                </div>
              </div>
            )}
            
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
