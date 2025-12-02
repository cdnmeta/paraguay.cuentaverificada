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
import NoImage from "@/components/customs/NoImage";
import { cargarURL } from "@/utils/funciones";
import { User } from "lucide-react";
// import { useAuthStore } from "@/hooks/useAuthStorge"; // Descomentado cuando se necesite

/**
 * Props opcionales:
 * - user: datos no editables y valores iniciales
 */
export default function MisDatosPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [solicitudVerificacion, setSolicitudVerificacion] = useState(null);
  const [imageUrls, setImageUrls] = useState({
    selfie: null,
    cedulaFrente: null,
    cedulaReverso: null,
  });
  const [loadingImages, setLoadingImages] = useState(false);
  const navigate = useNavigate();

  // const { logout } = useAuthStore(); // Descomentado cuando se necesite

  const loadImages = useCallback(async (userData) => {
    if (!userData) return;

    setLoadingImages(true);
    try {
      const promises = [];
      const newImageUrls = {
        selfie: null,
        cedulaFrente: null,
        cedulaReverso: null,
      };

      if (userData.selfie) {
        promises.push(
          cargarURL(userData.selfie).then((url) => {
            newImageUrls.selfie = url;
          })
        );
      }

      if (userData.cedula_frente) {
        promises.push(
          cargarURL(userData.cedula_frente).then((url) => {
            newImageUrls.cedulaFrente = url;
          })
        );
      }

      if (userData.cedula_reverso) {
        promises.push(
          cargarURL(userData.cedula_reverso).then((url) => {
            newImageUrls.cedulaReverso = url;
          })
        );
      }

      await Promise.all(promises);
      setImageUrls(newImageUrls);
    } catch (error) {
      console.error("Error cargando imágenes:", error);
      toast.error("Error al cargar las imágenes");
    } finally {
      setLoadingImages(false);
    }
  }, []);

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
      if (user.vfd == true) {
        setSolicitudVerificacion(3);
      }
      setUser(res.data);

      // Cargar las imágenes después de obtener los datos del usuario
      await loadImages(res.data);
    } catch (error) {
      toast.error("Error al cargar mis datos" + error.message);
    } finally {
      setLoading(false);
    }
  }, [loadImages]);

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



  if (loading) return <LoadingSpinner message="Cargando mis datos..." />;
  return (
    <div className="flex justify-center">
      <div className="container mx-auto rounded-3xl bg-background text-foreground py-8">
        {solicitudVerificacion === 2 && (
          <div
            id="verificacion"
            className="mt-6 mb-2 text-center border border-yellow-400/50 bg-yellow-400/10 rounded-lg p-4"
          >
            <p className="text-md  text-yellow-400 mb-2">
              Tu cuenta está en proceso de verificación. Recibirás una
              notificación una vez que se complete.
            </p>
          </div>
        )}

        {solicitudVerificacion === 3 && (
          <div
            id="verificacion"
            className="mt-6 mb-2 text-center border border-green-400/50 bg-green-400/10 rounded-lg p-4"
          >
            <p className="text-md  text-green-400 mb-2">
              Tu cuenta está verificada. desde{" "}
              {new Date(user?.f_vfd).toLocaleDateString()}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Cuenta</h1>
            </div>
          </div>
        </div>
        <p className="text-muted-foreground mb-6">
          Datos personales y seguridad.
        </p>
        {/* Datos solo lectura */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
          <Card>
            <CardHeader>
              <CardTitle>Datos no editables</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 ">
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

          {/* Formulario: solo Dirección, Email, Teléfono */}

          {imageUrls.selfie ? (
            <div className="relative">
              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                Selfie
              </div>
              <img
                className="w-full h-48 object-cover rounded-lg"
                src={imageUrls.selfie}
                alt="Selfie Usuario"
              />
            </div>
          ) : (
            <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-lg">
              {loadingImages ? (
                <div className="text-sm text-gray-500">Cargando selfie...</div>
              ) : (
                <NoImage />
              )}
            </div>
          )}

          {imageUrls.cedulaFrente ? (
            <div className="relative">
              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                Cédula Frente
              </div>
              <img
                className="w-full h-48 object-cover rounded-lg"
                src={imageUrls.cedulaFrente}
                alt="Cédula Frente"
              />
            </div>
          ) : (
            <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-lg">
              {loadingImages ? (
                <div className="text-sm text-gray-500">
                  Cargando cédula frente...
                </div>
              ) : (
                <NoImage />
              )}
            </div>
          )}

          {imageUrls.cedulaReverso ? (
            <div className="relative">
              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                Cédula Reverso
              </div>
              <img
                className="w-full h-48 object-cover rounded-lg"
                src={imageUrls.cedulaReverso}
                alt="Cédula Reverso"
              />
            </div>
          ) : (
            <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-lg">
              {loadingImages ? (
                <div className="text-sm text-gray-500">
                  Cargando cédula reverso...
                </div>
              ) : (
                <NoImage />
              )}
            </div>
          )}
        </div>

        <div>
          <Separator className="my-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Card>
            <CardHeader>
              <CardTitle>Editar datos</CardTitle>
            </CardHeader>
            <CardContent>
              <FormMisDatos user={user} onSuccess={handleUpdateSuccess} />
            </CardContent>
          </Card>

          {/*Form para direcciones usuarios*/}
          <FormDireciones />
        </div>

        <div>
          <Separator className="my-6" />
        </div>

        <Card className={"mt-6 border-red-500"}>
          <CardHeader>
            <CardTitle>Seguridad</CardTitle>
          </CardHeader>
          <CardContent>
            <FormCambiarPassword />
            <Button
              onClick={handleOlvideMiPin}
              variant="link"
              className="mt-4 p-0 text-yellow-500 hover:underline"
            >
              ¿Olvidaste tu PIN?
            </Button>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}
