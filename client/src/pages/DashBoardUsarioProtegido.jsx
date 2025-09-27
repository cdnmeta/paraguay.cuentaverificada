// Dashboard.jsx
import CardOption1 from "@/components/customs/CardOption1";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/hooks/useAuthStorge";
import { PROTECTED_ROUTES } from "@/utils/routes.routes";
import { CheckCircle2Icon } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import {routes as RecordatoriosUsuariosRoutes} from '@/pages/recordatoriosUsuarios/config/routes';
const emociones = [
  { emoji: "😄", label: "Entusiasmado" },
  { emoji: "😊", label: "Contento" },
  { emoji: "😐", label: "Pensativo" },
  { emoji: "😟", label: "Decepcionado" },
  { emoji: "😢", label: "Triste" },
  { emoji: "😇", label: "Sorpréndeme" },
];



export default function DashBoardUsarioProtegido() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const secciones = [
  {
    icon: "/icons/2179332.png",
    title: "Cuenta",
    onClick: () => navigate(`${PROTECTED_ROUTES.misDatos}`),
    desc: "Datos - Seguridad - Más",
  },
  {
    icon: "/icons/1331244-f39d5970.png",
    title: "Favoritos",
    desc: "Comercios - Productos - Links",
  },
  {
    icon: "/icons/1176025.png",
    title: "Publicar",
    desc: "Expresa lo que deseas comprar",
  },
  {
    icon: "/icons/443115.png",
    title: "Semáforo Financiero",
    onClick: () => navigate(`/semaforo-financiero`),
    desc: "No permitas que tus finanzas lleguen al rojo",
  },
  {
    icon: "/icons/80957-74a5697e.png",
    title: "¿Dónde lo guardé?",
    onClick: () => navigate(`/${RecordatoriosUsuariosRoutes.index}`),
    desc: "Que no se te olvide nada",
  },
  {
    icon: "/icons/709049.png",
    title: "Wallet",
    desc: "Depósitos - Pagos - Ganancias",
  },
  {
    icon: "/icons/709049.png",
    title: "Suscripciones",
    desc: "Planes - Facturas - Historial",
  },
  {
    icon: "/icons/709049.png",
    title: "Soporte y Ayuda",
    desc: "Autoayuda + asistencia personalizada",
  },
];
  return (
    <div className="min-h-screen text-white">
      <div className="w-full flex justify-center mb-6 px-2">
        <Alert className="max-w-3xl w-full">
          <CheckCircle2Icon />
          <AlertTitle>Hola, {`${user?.nombre} ${user?.apellido}`}</AlertTitle>
          <AlertDescription>
            <div className="flex gap-2 ">
              <p>
                Te gustaría <b>Verificar un comercio</b>
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(PROTECTED_ROUTES.verificacionComercio)}
            >
              Verificar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
      <div className="max-w-7xl mx-auto text-center space-y-4">
        <p className="text-xl italic">
          Hola, {`${user?.nombre} ${user?.apellido}`}
        </p>
        <h1 className="text-3xl font-bold">¿Cómo te sientes hoy?</h1>

        {/* Emociones */}
        <div className="bg-black bg-opacity-50 rounded-xl p-6 shadow-lg mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {emociones.map((item, i) => (
              <div key={i} className="flex flex-col items-center space-y-1">
                <p className="text-3xl">{item.emoji}</p>
                <p className="text-sm">{item.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm italic mt-4">
            ✨ Seleccioná tu ánimo y dejá que Dios te hable hoy
          </p>
        </div>

        {/* Secciones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10">
          {secciones.map((item, i) => (
            <CardOption1 key={i} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}
