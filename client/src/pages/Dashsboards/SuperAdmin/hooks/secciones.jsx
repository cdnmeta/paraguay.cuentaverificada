// src/pages/SuperAdmin/hooks/useSecciones.js
import { useNavigate } from "react-router-dom";
import { seccionesFeatures } from "../config/features";

export default function useSecciones({ user }) {
  const navigate = useNavigate();


  return seccionesFeatures
    .map((f) => ({
      icon: f.icon,
      title: f.title,
      desc: f.desc,
      onClick: () => navigate(f.path),
      disponible: true,
    }));
}
