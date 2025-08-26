import React from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "@components/ui/sonner";
import Navbar1 from "../navbars/Navbar1";
import { Book, Menu, Sunset, Trees, Zap } from "lucide-react";
import { PROTECTED_ROUTES } from "@/utils/routes.routes";
import Navbar from "../navbars/Navbar";
import { useAuthStore } from "@/hooks/useAuthStorge";
import AlertCambioDeRolEmpresa from "../customs/AlertCambioDeRolEmpresa";
const navbar = {
  logo: {
    url: PROTECTED_ROUTES.dashboard,
    alt: "logo-cuenta-verificada",
  },
  menu: [
    {
      title: "Products",
      url: "#",
      items: [
        {
          title: "Blog",
          description: "The latest industry news, updates, and info",
          icon: <Book className="size-5 shrink-0" />,
          url: "#",
        },
        {
          title: "Company",
          description: "Our mission is to innovate and empower the world",
          icon: <Trees className="size-5 shrink-0" />,
          url: "#",
        },
        {
          title: "Careers",
          description: "Browse job listing and discover our workspace",
          icon: <Sunset className="size-5 shrink-0" />,
          url: "#",
        },
        {
          title: "Support",
          description:
            "Get in touch with our support team or visit our community forums",
          icon: <Zap className="size-5 shrink-0" />,
          url: "#",
        },
      ],
    },
    {
      title: "MarketPlace",
      url: "#",
    },
  ],
  auth: {
    login: { title: "Login", url: "#" },
    signup: { title: "Sign up", url: "#" },
  },
};

export default function DashboardApp({ children }) {
  const user = useAuthStore((state) => state.user);
  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr_auto] relative">
      {/* Fondo galáctico (fondo absoluto detrás del layout) */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/img/fondo-planeta.jpg')" }}
        aria-hidden="true"
      />

      {/* Header sticky */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Navbar  />
      </header>

      {/* Contenido principal */}
      <main className="relative w-full px-4 py-6">
        {children ? children : <Outlet />}
      </main>

      {/* Footer */}
      <footer className="w-full border-t bg-background/80 text-sm text-center py-4">
        <p className="text-muted-foreground">
          © {new Date().getFullYear()} Cuenta Verificada
        </p>
      </footer>

      <Toaster position="top-right" />
      <AlertCambioDeRolEmpresa user={user} />
    </div>
  );
}
