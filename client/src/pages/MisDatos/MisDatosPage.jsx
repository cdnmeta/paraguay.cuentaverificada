// MisDatosSoloEditables.jsx
import { useEffect, useState, useCallback } from "react";

// shadcn/ui
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FormCambiarPassword from "./components/FormCambiarPassword";
import FormMisDatos from "./components/FormMisDatos";
import FormDireciones from "./components/FormDireciones";
import { toast } from "sonner";
import { getMisDatos } from "@/apis/usuarios.api";
import { Link, useNavigate } from "react-router-dom";
import { PUBLIC_ROUTES } from "@/utils/routes.routes";
import LoadingSpinner from "@/components/customs/loaders/LoadingSpinner";
import { useAuthStore } from "@/hooks/useAuthStorge";
import { solicitarVerificacionCuentausuario } from "@/apis/verificacionCuenta.api";
// import { useAuthStore } from "@/hooks/useAuthStorge"; // Descomentado cuando se necesite

/**
 * Props opcionales:
 * - user: datos no editables y valores iniciales
 */
export default function MisDatosPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [solicitudVerificacion, setSolicitudVerificacion] = useState(null);
  const [solicitandoVerificacion, setSolicitandoVerificacion] = useState(false);
  const navigate = useNavigate();

  const { user: userAuth } = useAuthStore(); // Usuario autenticado

  // const { logout } = useAuthStore(); // Descomentado cuando se necesite

  const loadDatos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMisDatos();
      const user = res.data;
      if (!user.vfd && user.estado === 2) {
        setSolicitudVerificacion(1);
      } else if (user.estado === 3) {
        setSolicitudVerificacion(2);
      }
      if(user.vfd == true){
        setSolicitudVerificacion(3);
      }
      setUser(res.data);
    } catch (error) {
      toast.error("Error al cargar mis datos" + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDatos();
  }, [loadDatos]);

  // Efecto para manejar el scroll al hash #verificacion
  useEffect(() => {
    const scrollToVerificacion = () => {
      const hash = window.location.hash;
      if (hash === "#verificacion") {
        // Pequeño delay para asegurar que el componente esté renderizado
        setTimeout(() => {
          const element = document.getElementById("verificacion");
          if (element) {
            element.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 100);
      }
    };

    // Ejecutar al cargar los datos del usuario
    if (user) {
      scrollToVerificacion();
    }

    // Escuchar cambios en el hash
    window.addEventListener("hashchange", scrollToVerificacion);

    return () => {
      window.removeEventListener("hashchange", scrollToVerificacion);
    };
  }, [user]); // Se ejecuta cuando user cambie (cuando los datos se carguen)

  const handleUpdateSuccess = (updatedData) => {
    // Actualizar los datos del usuario en el estado local
    setUser((prev) => ({ ...prev, ...updatedData }));
    // Opcional: recargar los datos desde el servidor
    // loadDatos();
  };

  const handleOlvideMiPin = () => {
    navigate("/recovery-pin");
    //logout();
  };

  const handleVerificationClick = () => {
    setShowVerificationDialog(true);
  };

  const handleConfirmVerification = async () => {
    try {
      setSolicitandoVerificacion(true);
      await solicitarVerificacionCuentausuario();
      setShowVerificationDialog(false);
      setSolicitudVerificacion(2);
      toast.success("Solicitud de verificación enviada");
    } catch (error) {
      toast.error(error.message || "Error al solicitar verificación");
    } finally {
      setSolicitandoVerificacion(false);
    }
  };

  const handleCloseDialog = () => {
    setShowVerificationDialog(false);
  };

  if (loading) return <LoadingSpinner message="Cargando mis datos..." />;
  return (
    <div className="flex justify-center px-4 py-8">
      <div className="w-full max-w-2xl rounded-3xl bg-background text-foreground px-4 py-8">
        {solicitudVerificacion === 1 && (
          <div id="verificacion" className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Tu cuenta no está verificada. Verifica tu cuenta para acceder a <b>más funcionalidades.</b>
            </p>
            <Button
              disabled={solicitandoVerificacion}
              onClick={handleVerificationClick}
              variant="outline"
            >
              Verificar mi cuenta
            </Button>
          </div>
        )}

        {solicitudVerificacion === 2 && (
          <div id="verificacion" className="mt-6 mb-2 text-center border border-yellow-400/50 bg-yellow-400/10 rounded-lg p-4">
            <p className="text-md  text-yellow-400 mb-2">
              Tu cuenta está en proceso de verificación. Recibirás una
              notificación una vez que se complete.
            </p>
          </div>
        )}

        {solicitudVerificacion === 3 && (
          <div id="verificacion" className="mt-6 mb-2 text-center border border-green-400/50 bg-green-400/10 rounded-lg p-4">
            <p className="text-md  text-green-400 mb-2">Tu cuenta está verificada. desde {new Date(user?.f_vfd).toLocaleDateString()}</p>
          </div>
        )}

        <h1 className="text-3xl font-bold tracking-tight">Mis Datos</h1>
        {/* Datos solo lectura */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Datos no editables</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Nombre/s</span>
              <p className="font-medium">{user?.nombre}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Apellidos</span>
              <p className="font-medium">{user?.apellido}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Cédula</span>
              <p className="font-medium">{user?.documento}</p>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        {/* Formulario: solo Dirección, Email, Teléfono */}
        <Card>
          <CardHeader>
            <CardTitle>Editar datos</CardTitle>
          </CardHeader>
          <CardContent>
            <FormMisDatos user={user} onSuccess={handleUpdateSuccess} />
          </CardContent>
        </Card>

        {/*Form para direcciones usuarios*/}
        <div className="mt-6">
          <FormDireciones />
        </div>

        <Card className={"mt-6"}>
          <CardHeader>
            <CardTitle>Seguridad</CardTitle>
          </CardHeader>
          <CardContent>
            <FormCambiarPassword />
            <Button
              onClick={handleOlvideMiPin}
              variant="link"
              className="mt-4 p-0"
            >
              ¿Olvidaste tu PIN?
            </Button>
          </CardContent>
        </Card>

        

        {/* Dialog de confirmación de verificación */}
        <Dialog open={showVerificationDialog} onOpenChange={() => {}}>
          <DialogContent
            className="sm:max-w-[425px]"
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>Verificación de cuenta</DialogTitle>
              <DialogDescription>
                Se solicitará una verificación de tu cuenta. Este proceso puede
                requerir documentación adicional y puede tomar algunos días en
                completarse.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={handleCloseDialog}>
                Cerrar
              </Button>
              <Button
                disabled={solicitandoVerificacion}
                onClick={handleConfirmVerification}
              >
                {solicitandoVerificacion ? "Solicitando..." : "Confirmar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
