// src/pages/SuperAdmin/DashBoardSuperAdmin.jsx
import useSecciones from "./hooks/secciones";
import CardSuperAdmin from "./components/CardSuperAdmin";
import { useAuthStore } from "@/hooks/useAuthStorge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Building2, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Activity
} from "lucide-react";

export default function DashBoardSuperAdmin() {
  const { user } = useAuthStore();
  const secciones = useSecciones();

  return (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Panel Super Administrador</h1>
        <p className="text-muted-foreground">
          Bienvenido {user?.nombre}, gestiona todo el sistema desde aquí.
        </p>
      </div>

      {/* Métricas rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2,350</div>
            <p className="text-xs text-muted-foreground">
              +180 desde el mes pasado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comercios Verificados</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">
              +19% desde el mes pasado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% desde el mes pasado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verificaciones Pendientes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              +201 nuevas esta semana
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secciones principales */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Opciones Rapidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {secciones.map((item, index) => (
            <CardSuperAdmin 
              key={index} 
              icon={item.icon}
              title={item.title}
              desc={item.desc}
              onClick={item.onClick}
              variant={item.variant}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
