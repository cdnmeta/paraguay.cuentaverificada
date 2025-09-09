import { obtenerParticipaciones } from "@/apis/participacion-empresa.api";
import MetricCardTW from "@/components/customs/MetricCard";
import MetricCard from "@/components/customs/MetricCard";
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
        ganancias_cobradas,

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
          unit: "USD",
        },
        {
          key: "porcentajeParticipacion",
          value: total_meta,
          titulo: "Participación",
          unit: `Valor: ${porcentaje_participacion}%`,
        },
        { key: "ganancias", value: ganancias_totales, titulo: "Ganancias", unit: "USD" },
        { key: "cobrar", value: ganancias_por_cobrar, titulo: "Por Cobrar", unit: "USD" },
      ]);
    } catch (error) {
      toast.error("Error al cargar las participaciones: " + error.message);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="max-h-screen">
      <h1 className="text-2xl text-white font-bold mb-4">
        Bienvenido, {user?.nombre} {user?.apellido}
      </h1>

      <div className="mx-auto max-w-6xl px-4">
        {/* auto-fit + minmax para columnas fluidas; controla el espacio con gap */}
        <div className="grid gap-4 sm:gap-5 lg:gap-6 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
          {dataParticipaciones.map((data) => (
            <MetricCardTW
              key={data.key}
              title={data.titulo}
              value={data.value}
              unit={data.unit}
              iconSrc={getIconoByKey(data.key)}
              accent="emerald"
              digitosNum={data.digitosNum}
              className="!max-w-full !min-h-[200px]" // llena la celda y fija altura mínima
            />
          ))}

          <MetricCardTW
            title="Historial"
            value={0}
            unit="Transacciones"
            iconSrc={getIconoByKey("historial")}
            accent="emerald"
            className="!max-w-full !min-h-[150px]"
          />
          <MetricCardTW
            title="Auditoría"
            value={(dataInfoNegocio?.cantidad_suscripciones_activas ?? 0) + (dataInfoNegocio?.cantidad_suscripciones_pendientes ?? 0) + (dataInfoNegocio?.cantidad_suscripciones_suspendidas ?? 0)}
            unit="Suscriptores"
            iconSrc={getIconoByKey("auditoria")}
            accent="emerald"
            className="!max-w-full !min-h-[200px]"
          />
        </div>
      </div>
    </div>
  );
}
