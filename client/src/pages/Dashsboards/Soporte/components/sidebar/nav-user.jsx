import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  Circle,
  LogOut,
  RefreshCw,
  Settings,
  Headphones,
  User,
  UserCog,
  HelpCircle,
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

export function NavSoporte({
  user
}) {
  const { isMobile } = useSidebar()
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate(PUBLIC_ROUTES.login);
  };

  const renderUserItem = (item) => (
    <DropdownMenuItem key={item.label} asChild={item.as} className={item.className}>
      {item.to ? (
        <Link to={item.to} onClick={item.onClick}>
          {item.icon && <item.icon className="mr-2 h-4 w-4" />}
          {item.label}
        </Link>
      ) : (
        <button onClick={item.onClick} className="w-full text-left">
          {item.icon && <item.icon className="mr-2 h-4 w-4" />}
          {item.label}
        </button>
      )}
    </DropdownMenuItem>
  );

  const SOPORTE_MENU_ITEMS = [
    {
      icon: User,
      label: "Mi Perfil",
      to: "/soporte/perfil",
      as: true,
    },
    {
      icon: Settings,
      label: "Configuración",
      to: "/soporte/configuracion",
      as: true,
    },
    {
      icon: HelpCircle,
      label: "Ayuda",
      to: "/soporte/ayuda",
      as: true,
    },
    {
      icon: Bell,
      label: "Notificaciones",
      to: "/soporte/notificaciones",
      as: true,
    },
    {
      icon: LogOut,
      label: "Cerrar Sesión",
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
                <AvatarFallback className="rounded-lg bg-blue-500 text-white">
                  {user?.nombre?.charAt(0) || 'SP'}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user?.nombre || user?.apellido || 'Soporte'}
                </span>
                <span className="truncate text-xs text-blue-600 font-medium">
                  Agente de Soporte
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.avatar} alt={user?.nombre} />
                  <AvatarFallback className="rounded-lg bg-blue-500 text-white">
                    {user?.nombre?.charAt(0) || 'SP'}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user?.nombre || user?.apellido || 'Soporte'}
                  </span>
                  <span className="truncate text-xs text-blue-600">
                    Agente de Soporte
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {SOPORTE_MENU_ITEMS.map(renderUserItem)}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}