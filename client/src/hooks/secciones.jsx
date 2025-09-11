
import { useNavigate } from "react-router-dom";
export default function useSecciones({ user,seccionesFeatures }) {
  const navigate = useNavigate();

  console.log("SeccionesFeatures:", seccionesFeatures);

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
