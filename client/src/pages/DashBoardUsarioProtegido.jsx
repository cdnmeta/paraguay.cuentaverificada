// Dashboard.jsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    title: "Saldos",
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
        <p className="text-foreground text-xl italic">
          Hola, {`${user?.nombre} ${user?.apellido}`}
        </p>
        <h1 className=" text-foreground text-3xl font-bold">¿Cómo te sientes hoy?</h1>

        {/* Emociones */}
        <div className="bg-background/90 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {emociones.map((item, i) => (
              <Card 
                key={i} 
                className="cursor-pointer hover:shadow-md transition-all duration-300 hover:scale-105 group bg-background/50 backdrop-blur-sm border border-border/30 hover:border-primary/50 hover:bg-primary/5"
              >
                <CardContent className="flex flex-col items-center p-4 space-y-2">
                  <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                    {item.emoji}
                  </div>
                  <p className="text-sm font-medium text-center group-hover:text-primary transition-colors">
                    {item.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-sm italic mt-4 text-muted-foreground">
            ✨ Seleccioná tu ánimo y dejá que Dios te hable hoy
          </p>
        </div>

        {/* Secciones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10">
          {secciones.map((item, i) => (
            <Card 
              key={i} 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 group bg-background/95 backdrop-blur-sm border border-border/50 hover:border-primary/50"
              onClick={item.onClick}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <img 
                    src={item.icon} 
                    alt={item.title}
                    className="w-8 h-8 object-contain filter group-hover:brightness-110 transition-all"
                  />
                </div>
                <CardTitle className="text-lg font-semibold text-center group-hover:text-primary transition-colors">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-center text-muted-foreground text-sm leading-relaxed">
                  {item.desc}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
