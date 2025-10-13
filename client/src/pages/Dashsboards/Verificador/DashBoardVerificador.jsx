import React from "react";
import useSecciones from "./hooks/seciones";
import CardOption1 from "@/components/customs/CardOption1";
import { useAuthStore } from "@/hooks/useAuthStorge";
import CardOption2 from "@/components/customs/cards/CardOption2";

export default function DashBoardVerificador() {
  const { user } = useAuthStore();
  const secciones = useSecciones({ user });
  return (
    <div className="min-h-screen text-white">
      <h1>Departamento Legal Dashboard</h1>
      {/* Secciones */}
      <div className="justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10">
          {secciones.map((item, i) => (
            <CardOption2 key={i} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}
