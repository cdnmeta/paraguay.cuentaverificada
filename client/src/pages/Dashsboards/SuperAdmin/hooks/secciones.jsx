// src/pages/SuperAdmin/hooks/useSecciones.js
import { useNavigate } from "react-router-dom";
import { seccionesFeatures } from "../config/features";

export default function useSecciones({ user }) {
  const navigate = useNavigate();

  const hasAccess = (feature) => {
    if (feature.allowedGroups?.length) {
      const ids = user?.grupos?.map((g) => g.id) || [];
      return feature.allowedGroups.some((id) => ids.includes(id));
    }
    // añade allowedRoles si usas roles
    return true;
  };

  return seccionesFeatures
    .filter(hasAccess)
    .map((f) => ({
      icon: f.icon,
      title: f.title,
      desc: f.desc,
      onClick: () => navigate(f.path),
      disponible: true,
    }));
}
