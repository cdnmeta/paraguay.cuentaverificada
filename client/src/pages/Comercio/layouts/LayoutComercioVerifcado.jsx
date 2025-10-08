import AlertCambioDeRolEmpresa from "@/components/customs/AlertCambioDeRolEmpresa";
import LogoCuentaVerificada from "@/components/customs/LogoCuentaVerifaca";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/hooks/useAuthStorge";
import { useGruposEmpresaStore } from "@/store/useGrupoEmpresaStore";
import { NOMBRE_APP } from "@/utils/constants";
import { Bell, Heart, Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormLogin } from "@/pages/Login";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { agregarFavoritos, eliminarFavoritos } from "@/apis/usuarios.api";
import useComercioStore from "@/store/useComercioStore";
import LoadingSpinner from "@/components/customs/loaders/LoadingSpinner";
const IMAGES = {
  logo: "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/CuentaVerificadablancotransparentegrande.png",
  headerAvatar:
    "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/APLASTAALENEMIGOCDEPARAGUAYDJCHOWUY03.jpg",
  iconMensaje: "/icons/iconoBell.png",
  iconBell:
    "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/549739-97d027b6.png",
  iconMenu:
    "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/4337319-8edc9898.png",
  heroBg:
    "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/sliderdiosaesbeltacuentaverificada1.png",
  infoBg:
    "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/fondocuentaverificada1.png",
  // Íconos de las tarjetas
  razon:
    "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/1547295-e05b4e32.png",
  ruc: "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/4052615-f902524c.png",
  ubicacion:
    "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/2377937-2e0229a3.png",
  whatsapp:
    "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/88220-599796e9.png",
  telefono:
    "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/114333-2351c1eb.png",
  pago: "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/1019709-861d7af5.png",
  comoPagar:
    "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/1688568-ea314c56.png",
  verificado:
    "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/3472625-a13f7d82.png",
  nuvIcon:
    "https://assets.nicepagecdn.com/7c4a1b24/6521454/images/471715-9bf7527b.png",
};

export default function LayoutComercioVerifcado({ children }) {
    const navigate = useNavigate();
    const {slug} = useParams();
  const user = useAuthStore((state) => state.user);
  const { setOpenDialogGruposEmpresa } = useGruposEmpresaStore();
  const [comercioSeguido, setComercioSeguido] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [siguiendo, setSiguiendo] = React.useState(false);
  const handleFavorito = async (data) => {
    try {
      setSiguiendo(true);

      if (comercioSeguido) {
        await eliminarFavoritos(data.id_comercio);
        setComercioSeguido((prev) => !prev);
        return;
      }
      await agregarFavoritos(data);
      setComercioSeguido((prev) => !prev);
    } catch (err) {
      setComercioSeguido(false);
      toast.error("Error al agregar a favoritos");
      console.error("Error al manejar favorito:", err);
    } finally {
      setSiguiendo(false);
    }
  };

  const { 
      comercioActual, 
      loading, 
      error, 
      cargarComercio, 
      reintentarCarga
    } = useComercioStore();

  // Cargar comercio cuando cambie el slug
  useEffect(() => {
    if (slug) {
      cargarComercio(slug, navigate);
    }
  }, [slug, cargarComercio, navigate, user]);

  // Verificar si el comercio es seguido cuando cambie el usuario o comercio
  useEffect(() => {
    if (user && comercioActual) {
      const esSeguido = comercioActual?.es_favorito || false;
      setComercioSeguido(esSeguido);
    }
  }, [user, comercioActual]);

 
  // Mostrar preloader mientras carga
  if (loading) {
    return <LoadingSpinner message="Cargando información del comercio..." />;
  }

  // Mostrar error si algo salió mal
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => reintentarCarga(slug, navigate)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Si no hay datos del comercio, no mostrar nada (ya redirigió a 404)
  if (!comercioActual) {
    return null;
  }

  const renderComponenteSeguir = () => {
    if (siguiendo) {
      return <>
      <Loader2 className="animate-spin text-primary" />
      <p>Procesando...</p>
      </>;
    }
    return (
      <>
         <Heart className="h-4 w-4" />
        {comercioSeguido ? <p>Dejar de Seguir</p> : <p>Seguir</p>}
      </>
    );
  };


  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto]">
      <header className="sticky top-0 z-40 w-full backdrop-blur bg-[#008e6a]">
        <div className="mx-auto max-w-6xl px-4 py-2 flex items-center gap-3">
          {/* Logo */}
          <a href="/panel" className="inline-flex items-center">
            <LogoCuentaVerificada />
          </a>

          {user && (
            <div className="ml-auto flex items-center gap-3">
              {/* Notificaciones */}
              <div className="relative">
                <img src={IMAGES.iconMensaje} alt="Menú" className="h-9 w-10" />
                <Badge className="absolute text-black bg-white font-bold -top-1 -right-1 h-5 min-w-5 rounded-full px-1 font-mono tabular-nums flex items-center justify-center">
                  8
                </Badge>
              </div>
              <button
                type="button"
                onClick={() => setOpenDialogGruposEmpresa(true)}
                className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition"
                aria-label="Abrir menú"
              >
                <img src={IMAGES.iconMenu} alt="Menú" className="h-5 w-5" />
              </button>
              
                <Badge
                  title={comercioSeguido ? `Dejar de Seguir ${comercioActual?.razon_social}` : `Seguir ${comercioActual?.razon_social}`}
                  className={
                    "cursor-pointer bg-white text-black font-bold px-3 py-1 rounded-full flex items-center gap-1"
                  }
                  disabled={siguiendo}
                  onClick={() => handleFavorito({ id_comercio: comercioActual?.id })} // Aquí deberías pasar el ID real del comercio
                >
                 
                  {renderComponenteSeguir()}
                </Badge>
            </div>
          )}

          {!user && (
            <div className="ml-auto flex items-center gap-3">
              <Button onClick={() => setOpenDialog(true)}>
                Iniciar Sesión
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="bg-gray-50 overflow-y-auto">
        <div className="">{children ? children : <Outlet />}</div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="container mx-auto px-4 py-6">
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Comercio Verificado</h3>
              <p className="text-gray-300 text-sm">
                Plataforma de verificación de cuentas para comercios seguros y confiables.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Enlaces Útiles</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Términos de Servicio</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Política de Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Soporte</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contacto</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <p>Email: soporte@comercioverificado.com</p>
                <p>Teléfono: +1 (555) 123-4567</p>
              </div>
            </div>
          </div> */}
          <div className="border-gray-700 mt-6 pt-4 text-center text-sm text-gray-300">
            <p>
              &copy; {new Date().getFullYear()} - {NOMBRE_APP}
            </p>
          </div>
        </div>
      </footer>
      <AlertCambioDeRolEmpresa user={user} />
      <Toaster position="top-right" />

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iniciar Sesión</DialogTitle>
            <DialogDescription>
              <FormLogin
                redirect={false}
                afterSubmit={() => setOpenDialog(false)}
              />
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
