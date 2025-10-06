import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  Circle,
  LogOut,
  RefreshCw,
  Settings,
  Shield,
  User,
  UserCog,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
import { PUBLIC_ROUTES } from "@/utils/routes.routes";
import { useGruposEmpresaStore } from "@/store/useGrupoEmpresaStore";
import { NavUser } from "@/components/customs/navs/nav-user";

export function NavUserSuperAdmin({
  user
}) {
  const { isMobile } = useSidebar()
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate(PUBLIC_ROUTES.login);
  };

  const setOpenDialogGruposEmpresa = useGruposEmpresaStore(
      (state) => state.setOpenDialogGruposEmpresa
    );
  

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

  // Menú específico para SuperAdmin
  const SUPER_ADMIN_MENU_ITEMS = [
   {
        key: "role",
        label: "Cambiar Rol",
        icon: RefreshCw,
        onClick: () => {
          console.log("como asi", user);
          setOpenDialogGruposEmpresa(true)
        },
      },
    { key: "sep2", type: "separator" },
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
        <NavUser user={user} />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}