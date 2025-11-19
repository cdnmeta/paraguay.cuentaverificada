import { useEffect, useState } from "react";
import {
  Menu,
  User,
  LogOut,
  Settings,
  Store,
  RefreshCw,
  Home,
  Users,
  CreditCard,
  DollarSign,
  Phone,
} from "lucide-react";
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
import { Link, useNavigate, useLocation } from "react-router-dom";

import LogoCuentaVerificada from "../customs/LogoCuentaVerifaca";
import { PROTECTED_ROUTES, PUBLIC_ROUTES } from "@/utils/routes.routes";
import { useAuthStore } from "@/hooks/useAuthStorge";
import { useGruposEmpresaStore } from "@/store/useGrupoEmpresaStore";
import {URL_BASE as UrlBaseCentroMensajes} from '@/pages/CentroMensajes/config/routes'
import { cn } from "@/lib/utils";
import { cargarURL } from "@/utils/funciones";


const IconoCampana = (props) => {
  return <img src="/icons/iconoBell.png" alt="Campana" className={cn("w-auto h-8",props?.className)} {...props} />
}

export default function Navbar({ urlBase = "/panel" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [avatar,setAvatar] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    { key: "market", label: "MarketPlace", to: "/marketplace", icon: Store },
    {
      key: "role",
      label: "Cambiar Rol",
      icon: RefreshCw,
      onClick: () => {
        setOpenDialogGruposEmpresa(true);
      },
    },
    {
      key:"cm",
      label: "Centro de Mensajes",
      to: UrlBaseCentroMensajes,
      icon: IconoCampana ,
    }
  ];
  useEffect(() => {
    const loadAvatar = async () => {
      const url = await cargarURL(user?.avatar);
      setAvatar(url);
    }
    loadAvatar();
  },[user?.avatar])

  // ===== Menú de usuario (dropdown) =====
  const USER_MENU_ITEMS = [
    { key: "perfil", label: "Perfil", to: PROTECTED_ROUTES.perfil, icon: User },
    {
      key: "role",
      label: "Cambiar Rol",
      icon: RefreshCw,
      onClick: () => {
        setOpenDialogGruposEmpresa(true);
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

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="w-full flex flex-wrap items-center justify-between px-2">
      {/* Logo */}
      <Link to={`${urlBase}`} className="flex items-center space-x-3">
        <LogoCuentaVerificada className={cn(
          'w-auto transition-all duration-300',
          // Responsive heights
          'h-auto xs:h-7 sm:h-9 md:h-10 lg:h-11',
          // Max width to prevent overflow
          'max-w-auto xs:max-w-[140px] sm:max-w-[160px] md:max-w-[180px] lg:max-w-[200px]'
        )} />
      </Link>

      {/* Menú de usuario y hamburguesa */}
      <div className="flex items-center md:order-2 space-x-3 md:space-x-0">
        {/* Avatar del usuario */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={avatar }
                  alt={user?.nombre || "Usuario"}
                />
                <AvatarFallback>
                  {user?.nombre?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <div className="flex flex-col space-y-1 p-2">
              <p className="text-sm font-medium leading-none">{user?.nombre}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
            <DropdownMenuSeparator />
            {USER_MENU_ITEMS.map((item) => {
              if (item.type === "separator") {
                return <DropdownMenuSeparator key={item.key} />;
              }

              const Icon = item.icon;

              if (item.to) {
                return (
                  <DropdownMenuItem key={item.key} asChild>
                    <Link
                      to={item.to}
                      className={`flex items-center w-full ${
                        item.className || ""
                      }`}
                    >
                      {Icon && <Icon className="mr-2 h-4 w-4" />}
                      <span>{item.label}</span>
                    </Link>
                  </DropdownMenuItem>
                );
              }

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
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Botón hamburguesa (móvil) */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-accent/50 transition-all duration-200"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[320px] sm:w-[400px] p-0 border-l-2"
          >
            {/* Header del Sheet */}
            <div className="border-b bg-muted/20 p-6">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                  <AvatarImage
                    src={user?.avatar}
                    alt={user?.nombre || "Usuario"}
                  />
                  <AvatarFallback className="text-lg font-semibold">
                    {user?.nombre?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground text-lg">
                    {user?.nombre || "Usuario"}
                  </p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Navegación */}
            <nav className="p-6">
              <div className="space-y-3">
                {NAV_ITEMS.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = isActiveRoute(item.to);

                  // Si el elemento tiene onClick, renderizar como botón de shadcn
                  if (item?.onClick) {
                    return (
                      <Button
                        key={item.key}
                        variant="ghost"
                        size="lg"
                        onClick={() => {
                          item.onClick?.();
                          setIsMenuOpen(false);
                        }}
                        className="w-full justify-start h-auto p-4 hover:bg-accent/80 transition-all duration-300"
                        style={{
                          animationDelay: `${index * 50}ms`,
                        }}
                      >
                        <div className="flex items-center space-x-4 w-full">
                          <div className="p-2 rounded-lg bg-muted transition-colors">
                            {Icon && (
                              <Icon className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <span className="font-medium text-base text-left flex-1">
                            {item.label}
                          </span>
                        </div>
                      </Button>
                    );
                  }

                  // Si el elemento tiene to, renderizar como botón de shadcn con Link
                  return (
                    <Button
                      key={item.key}
                      variant={isActive ? "default" : "ghost"}
                      size="lg"
                      asChild
                      className={`w-full justify-start h-auto p-4 transition-all duration-300 ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "hover:bg-accent/80"
                      }`}
                      style={{
                        animationDelay: `${index * 50}ms`,
                      }}
                    >
                      <Link to={item.to} onClick={() => setIsMenuOpen(false)}>
                        <div className="flex items-center space-x-4 w-full">
                          <div
                            className={`p-2 rounded-lg transition-colors ${
                              isActive ? "bg-primary-foreground/20" : "bg-muted"
                            }`}
                          >
                            {Icon && (
                              <Icon
                                className={`h-5 w-5 ${
                                  isActive
                                    ? "text-primary-foreground"
                                    : "text-muted-foreground"
                                }`}
                              />
                            )}
                          </div>
                          <span className="font-medium text-base text-left flex-1">
                            {item.label}
                          </span>
                          {isActive && (
                            <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                          )}
                        </div>
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Menú de navegación (escritorio) */}
      <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1">
        <ul className="font-medium flex flex-row space-x-8">
          {NAV_ITEMS.map((item) => {
            const isActive = isActiveRoute(item.to);

            return (
              <li key={item.key} title={item.label}>
                {item?.onClick ? (
                  // Renderizar como botón si tiene onClick
                  <button
                    onClick={item.onClick}
                    className="block py-2 px-3 rounded transition-colors text-foreground hover:text-primary"
                  >
                    <item.icon className="inline-block mr-1 h-10 w-10" />
                  </button>
                ) : (
                  // Renderizar como Link si tiene to
                  <Link
                    to={item.to}
                    className={`block py-2 px-3 rounded transition-colors ${
                      isActive
                        ? "text-primary font-semibold"
                        : "text-foreground hover:text-primary"
                    }`}
                  >
                    <item.icon className="inline-block mr-1 h-10 w-10" />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
