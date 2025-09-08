import React from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "@/pages/Verificador/verficador.routes";

export default function useSecciones({ user = {} }) {
  const navigate = useNavigate();
  const secciones = [
    {
      icon: "/icons/2179332.png",
      title: "Solictudes de Cuenta",
      desc: "Revisar Solicitudes de Cuenta",
      onClick: () => navigate(`${routes.solicitudes}`),
      disponible: true,
    }
  ];
  return secciones.filter((item) => item.disponible);
}
