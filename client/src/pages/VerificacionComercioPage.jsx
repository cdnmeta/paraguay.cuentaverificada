// src/pages/VerificacionComercio/VerificacionComercioPage.jsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuthStore } from "@/hooks/useAuthStorge";
import { getComerciosForUser } from "@/apis/comercios.api";
import ListSolicitudesComercios from "@/pages/VerificacionComercio/ListSolicitudesComercios";
import FormSolicitudVerificacion from "./VerificacionComercio/FormSolicitudVerificacion";

// 🟢 Event bus
import { on, EVENTS } from "@/utils/events";

export default function VerificacionComercioPage() {
  const { user } = useAuthStore(); // ⬅️ mover arriba para usarlo en loadComercios
  const [comercios, setComercios] = useState([]);
  const [idComercioSeleccionado, setIdComercioSeleccionado] = useState(null);

  // Si tu form necesita forzar “re-mount”/reset, conservamos el counter
  const [refreshCounter, setRefreshCounter] = useState(0);
  const recargarFormulario = () => setRefreshCounter((n) => n + 1);

  const loadComercios = async () => {
    if (!user?.id) return;
    try {
      const response = await getComerciosForUser(user.id, { estado: "1,2,3,5,6" });
      setComercios(response?.data?.data ?? []);
    } catch (error) {
      console.error("Error al obtener comercios:", error);
      setComercios([]);
    }
  };

  // Carga inicial (y si cambia el usuario)
  useEffect(() => {
    loadComercios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  {/*🔔 Escuchar eventos del navegador para refrescar el listado*/}
  useEffect(() => {
    // Cuando se actualiza/crea una solicitud desde el form
    const offA = on(EVENTS.SOLICITUD_COMERCIO_ACTUALIZADA, ({ idComercio } = {}) => {
      loadComercios();
      // si vino un id desde el form, seleccionamos o forzamos refresh del form
      if (idComercio) {
        setIdComercioSeleccionado((prev) => (prev === idComercio ? (recargarFormulario(), prev) : idComercio));
      }
    });

    // Cuando se actualiza/crea la verificación desde el form
    const offB = on(EVENTS.VERIFICACION_COMERCIO_ACTUALIZADA, ({ idComercio } = {}) => {
      loadComercios();
      if (idComercio) {
        setIdComercioSeleccionado((prev) => (prev === idComercio ? (recargarFormulario(), prev) : idComercio));
      }
    });

    return () => {
      offA();
      offB();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // si cambia de usuario, reatach listeners (raro, pero seguro)

  const handleSeleccionarComercio = (id) => {
    if (id === idComercioSeleccionado) {
      // mismo ID: forzar recarga del form (reset visuals/RHF if needed)
      recargarFormulario();
    } else {
      setIdComercioSeleccionado(id);
    }
  };

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
              id_usuario={user?.id}
              onSeleccionarComercio={handleSeleccionarComercio}
              // Si tu listado hace fetch interno, también podés pasar un refreshTrigger aquí
              // refreshTrigger={refreshCounter}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
