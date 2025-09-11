// src/pages/SuperAdmin/DashBoardSuperAdmin.jsx
import useSecciones from "./hooks/secciones";
import CardOption1 from "@/components/customs/CardOption1";
import { useAuthStore } from "@/hooks/useAuthStorge"

export default function DashBoardSuperAdmin() {
  const { user } = useAuthStore();
  const secciones = useSecciones({ user });


  return (
    <div className="min-h-screen text-white">
      <h1 className="text-xl font-semibold">Panel Administradores</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10">
        {secciones.map((item) => (
          <CardOption1 key={item.title} {...item} />
        ))}
      </div>
    </div>
  );
}
