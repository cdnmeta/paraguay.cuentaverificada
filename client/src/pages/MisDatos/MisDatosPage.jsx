// MisDatosSoloEditables.jsx
import { useEffect, useState, useCallback } from "react";

// shadcn/ui
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import FormCambiarPassword from "./components/FormCambiarPassword";
import FormMisDatos from "./components/FormMisDatos";
import FormDireciones from "./components/FormDireciones";
import { toast } from "sonner";
import { getMisDatos } from "@/apis/usuarios.api";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { PUBLIC_ROUTES } from "@/utils/routes.routes";
import LoadingSpinner from "@/components/customs/loaders/LoadingSpinner";
// import { useAuthStore } from "@/hooks/useAuthStorge"; // Descomentado cuando se necesite

/**
 * Props opcionales:
 * - user: datos no editables y valores iniciales
 */
export default function MisDatosPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // const { logout } = useAuthStore(); // Descomentado cuando se necesite

  const loadDatos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMisDatos();
      console.log(res.data);
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

  const handleUpdateSuccess = (updatedData) => {
    // Actualizar los datos del usuario en el estado local
    setUser((prev) => ({ ...prev, ...updatedData }));
    // Opcional: recargar los datos desde el servidor
    // loadDatos();
  };


  const handleOlvideMiPin = () => {
    navigate("/recovery-pin");
    //logout();
  }

  if(loading) return <LoadingSpinner message="Cargando mis datos..." />
  return (
    <div className="flex justify-center px-4 py-8">
      <div className="w-full max-w-2xl rounded-3xl bg-background text-foreground px-4 py-8">
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
            <Button onClick={handleOlvideMiPin} variant="link" className="mt-4 p-0">
              ¿Olvidaste tu PIN?
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
