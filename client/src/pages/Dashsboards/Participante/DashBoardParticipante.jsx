import { obtenerParticipaciones } from "@/apis/participantes.api";
import ElegantMetricCard from "@/components/customs/ElegantMetricCard";
import { useAuthStore } from "@/hooks/useAuthStorge";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const getIconoByKey = (key) => {
  const carpeta_iconos = "/icons";
  switch (key) {
    case "precioActual":
      return `${carpeta_iconos}/5427105-df6b81ba.png`;
    case "porcentajeParticipacion":
      return `${carpeta_iconos}/70001-7e30b1e0.png`;
    case "totalInvertido":
      return `${carpeta_iconos}/9437669-89b4da97.png`;
    case "historial":
      return `${carpeta_iconos}/3368517-714c817c.png`;
    case "auditoria":
      return `${carpeta_iconos}/9437669-89b4da97.png`;
    case "ganancias":
      return `${carpeta_iconos}/1140418-f17a9582.png`;
    case "cobrar":
      return `${carpeta_iconos}/834141-d01cabd3.png`;
    case "totalMeta":
      return `${carpeta_iconos}/1140418-f17a9582.png`;
  }
};
export default function DashBoardParticipante() {
  const [dataParticipaciones, setDataParticipaciones] = useState([]);
  const [dataInfoNegocio, setDataInfoNegocio] = useState(null);
  const user = useAuthStore((state) => state.user);
  const fetchData = async () => {
    try {
      const response = await obtenerParticipaciones();
      const {
        porcentaje_participacion,
        precio_actual,
        total_meta,
        cantidad_suscripciones_pendientes,
        cantidad_suscripciones_activas,
        cantidad_suscripciones_suspendidas,
        ganancias_totales,
        ganancias_por_cobrar,

      } = response.data;
      setDataInfoNegocio({
        cantidad_suscripciones_activas,
        cantidad_suscripciones_pendientes,
        cantidad_suscripciones_suspendidas,
      })
      setDataParticipaciones([
        {
          key: "precioActual",
          value: precio_actual,
          digitosNum: 6,
          titulo: "Precio META",
          subtitle: "Precio actual",
          unit: "USD",
          variant: "sapphire",
          trend: precio_actual > 0 ? "up" : "neutral",
          badge: "Live"
        },
        {
          key: "porcentajeParticipacion",
          value: total_meta,
          titulo: "Participación",
          subtitle: `${porcentaje_participacion}% del total`,
          unit: "Meta",
          variant: "violet",
          trend: "up",
          badge: `${porcentaje_participacion}%`
        },
        { 
          key: "ganancias", 
          value: ganancias_totales, 
          titulo: "Ganancias Totales",
          subtitle: "Acumuladas", 
          unit: "USD",
          variant: "emerald",
          trend: ganancias_totales > 0 ? "up" : "neutral",
          badge: "Total"
        },
        { 
          key: "cobrar", 
          value: ganancias_por_cobrar, 
          titulo: "Por Cobrar",
          subtitle: "Disponible", 
          unit: "USD",
          variant: "amber",
          trend: ganancias_por_cobrar > 0 ? "up" : "neutral",
          badge: "Pendiente"
        },
      ]);
    } catch (error) {
      toast.error("Error al cargar las participaciones: " + error.message);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div>
      <h1 className="text-2xl text-white font-bold mb-4">
        Panel del Participante, {user?.nombre} {user?.apellido}
      </h1>

      <div className="mx-auto max-w-6xl p-4">
        {/* auto-fit + minmax para columnas fluidas; controla el espacio con gap */}
        <div className="grid gap-6 sm:gap-7 lg:gap-8 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
          {dataParticipaciones.map((data) => (
            <ElegantMetricCard
              key={data.key}
              title={data.titulo}
              subtitle={data.subtitle}
              value={data.value}
              unit={data.unit}
              iconSrc={getIconoByKey(data.key)}
              variant={data.variant}
              trend={data.trend}
              badge={data.badge}
              digitosNum={data.digitosNum}
              showGlow={true}
              showAccent={true}
              size="default"
              className="hover:scale-105 transition-transform duration-300"
            />
          ))}

          <ElegantMetricCard
            title="Historial"
            subtitle="Transacciones realizadas"
            value={0}
            unit="Transacciones"
            iconSrc={getIconoByKey("historial")}
            variant="slate"
            trend="neutral"
            badge="Histórico"
            showGlow={true}
            className="min-h-[180px] hover:scale-105 transition-transform duration-300"
          />
          <ElegantMetricCard
            title="Auditoría"
            subtitle="Total de suscriptores"
            value={(dataInfoNegocio?.cantidad_suscripciones_activas ?? 0)}
            unit="Suscriptores"
            iconSrc={getIconoByKey("auditoria")}
            variant="rose"
            trend={dataInfoNegocio?.cantidad_suscripciones_activas > 0 ? "up" : "neutral"}
            badge="Total"
            showGlow={true}
            className="min-h-[180px] hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
    </div>
  );
}
