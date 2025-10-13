
import { Link } from "react-router-dom";

import LogoCuentaVerificada from "../customs/LogoCuentaVerifaca";
import { useAuthStore } from "@/hooks/useAuthStorge";
import AvatarUserComponent from "../customs/AvatarUserComponent";

export default function NavBarCustom1({urlPanel='/panel'}) {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="container flex h-16 items-center justify-between px-4">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <Link to={urlPanel} className="flex items-center space-x-2">
          <LogoCuentaVerificada />
        </Link>
      </div>

      {/* Lado derecho: Avatar + Menú móvil */}
      <div className="flex items-center space-x-2">
        <AvatarUserComponent user={user} />
      </div>
    </div>
  );
}
