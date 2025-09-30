import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"

import { Menu, User, Settings, Store, RefreshCw } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/hooks/useAuthStorge";
import { useGruposEmpresaStore } from "@/store/useGrupoEmpresaStore";
import { PROTECTED_ROUTES, PUBLIC_ROUTES } from "@/utils/routes.routes";

export function NavUser({
  user
}) {
  const { isMobile } = useSidebar()

  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const setOpenDialogGruposEmpresa = useGruposEmpresaStore(
    (state) => state.setOpenDialogGruposEmpresa
  );

  const handleLogout = () => {
      logout();
      navigate(PUBLIC_ROUTES.login);
    };

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

  // ===== Menú de usuario (dropdown) =====
    const USER_MENU_ITEMS = [
      { key: "perfil", label: "Perfil", to: PROTECTED_ROUTES.misDatos, icon: User },
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

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.avatar} alt={user?.nombre} />
                <AvatarFallback className="rounded-lg">{user?.nombre?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.nombre || user?.apellido}</span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}>
            {USER_MENU_ITEMS.map(renderUserItem)}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
