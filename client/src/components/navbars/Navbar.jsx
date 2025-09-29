import { Menu, User, LogOut, Settings, Store, RefreshCw } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useNavigate } from "react-router-dom";

import LogoCuentaVerificada from "../customs/LogoCuentaVerifaca";
import { PROTECTED_ROUTES, PUBLIC_ROUTES } from "@/utils/routes.routes";
import { useAuthStore } from "@/hooks/useAuthStorge";
import { useGruposEmpresaStore } from "@/store/useGrupoEmpresaStore";

export default function Navbar() {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const setOpenDialogGruposEmpresa = useGruposEmpresaStore(
    (state) => state.setOpenDialogGruposEmpresa
  );

  const handleLogout = () => {
    logout();
    navigate(PUBLIC_ROUTES.login);
  };

  // ===== Menú superior (nav) =====
  const NAV_ITEMS = [
    { key: "market", label: "MarketPlace", to: "/", icon: Store },
    // agrega más opciones aquí...
  ];

  // ===== Menú de usuario (dropdown) =====
  const USER_MENU_ITEMS = [
    { key: "perfil", label: "Perfil", to: PROTECTED_ROUTES.perfil, icon: User },
    {
      key: "role",
      label: "Cambiar Rol",
      icon: RefreshCw,
      onClick: () => {
        console.log("como asi", user);
        setOpenDialogGruposEmpresa(true)
      },
    },
    { key: "sep1", type: "separator" },
    {
      key: "logout",
      label: "Cerrar sesión",
      icon: LogOut,
      onClick: handleLogout,
      className: "text-red-600",
    },
  ];

  const renderUserItem = (item) => {
    if (item.type === "separator") {
      return <DropdownMenuSeparator key={item.key} />;
    }

    const Icon = item.icon;
    // Item con navegación (Link)
    if (item.to) {
      return (
        <DropdownMenuItem key={item.key} asChild>
          <Link to={item.to} className="flex items-center" onClick={item.onClick}>
            {Icon && <Icon className="mr-2 h-4 w-4" />}
            <span>{item.label}</span>
          </Link>
        </DropdownMenuItem>
      );
    }

    // Item de acción (onClick)
    return (
      <DropdownMenuItem
        key={item.key}
        onClick={item.onClick}
        className={`flex items-center ${item.className || ""}`}
      >
        {Icon && <Icon className="mr-2 h-4 w-4" />}
        <span>{item.label}</span>
      </DropdownMenuItem>
    );
  };

  const renderMobileItem = (item) => {
    // En mobile, si tiene `to` usamos Link; si no, botón con onClick
    if (item.to) {
      return (
        <Link
          key={item.key}
          to={item.to}
          className="flex items-center py-2 px-4 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {item.icon && <item.icon className="mr-2 h-4 w-4" />}
          {item.label}
        </Link>
      );
    }
    return (
      <button
        key={item.key}
        type="button"
        onClick={item.onClick}
        className="flex items-center text-left py-2 px-4 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        {item.icon && <item.icon className="mr-2 h-4 w-4" />}
        {item.label}
      </button>
    );
  };

  return (
    <div className="container  flex h-16 items-center justify-between px-4 ">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <Link to={PROTECTED_ROUTES.dashboard} className="flex items-center space-x-2">
          <LogoCuentaVerificada className="h-8 w-auto" />
        </Link>
      </div>
    </div>
  );
}
