import { useAuthStore } from '@/hooks/useAuthStorge';
import { useGruposEmpresaStore } from '@/store/useGrupoEmpresaStore';
import { PROTECTED_ROUTES, PUBLIC_ROUTES } from '@/utils/routes.routes';
import { LogOut, Menu, RefreshCw, Store, User } from 'lucide-react';
import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
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
import LogoCuentaVerificada from './LogoCuentaVerifaca';

export default function AvatarUserComponent({ user }) {
    const navigate = useNavigate();
  const { logout } = useAuthStore();
  const setOpenDialogGruposEmpresa = useGruposEmpresaStore(
    (state) => state.setOpenDialogGruposEmpresa
  );

  const handleLogout = () => {
    logout();
    navigate(PUBLIC_ROUTES.login, { replace: true, state: { fromLogout: true } });
    
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
      onClick: () => setOpenDialogGruposEmpresa(true),
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
    <>
    {/* Dropdown del usuario */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src="/placeholder.svg?height=32&width=32"
                  alt="Usuario"
                />
                <AvatarFallback>
                  {(user?.nombre?.[0] || "U").toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56" align="end" forceMount>
            {USER_MENU_ITEMS.map(renderUserItem)}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Menú móvil (Sheet) */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col space-y-4 mt-4">
              <div className="flex items-center space-x-2 pb-4 border-b">
                <LogoCuentaVerificada />
              </div>

              <nav className="flex flex-col space-y-2">
                {/* Navegación principal */}
                {NAV_ITEMS.map((item) => renderMobileItem(item))}

                {/* Opciones de usuario (reutilizamos la misma config) */}
                <div className="mt-4 border-t pt-4">
                  {USER_MENU_ITEMS.filter((i) => i.type !== "separator").map((item) =>
                    renderMobileItem(item)
                  )}
                </div>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
    </>
  )
}
