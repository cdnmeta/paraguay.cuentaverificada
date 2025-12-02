// Dashboard.jsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/hooks/useAuthStorge";
import { getMensajeDelDia } from "@/apis/estados-animos.api";
import { PROTECTED_ROUTES } from "@/utils/routes.routes";
import {
  CheckCircle2Icon,
  Smile,
  X,
  Loader2,
  Clock,
  Calendar,
  AlertTriangle,
  NotebookIcon,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { routes as RecordatoriosUsuariosRoutes } from "@/pages/recordatoriosUsuarios/config/routes";
import { routes as FavoritosRoutes } from "@/pages/Favoritos/config/routes";
import { routes as SoporteAyudaRoutes } from "@/pages/SoporteAyuda/config/routes";
import { routes as WalletRoutes } from "@/pages/Wallet/config/routes";
import { routes as SuscripcionesRoutes } from "@/pages/Suscripciones/config/routes";
import { routes as RecordatoriosRoutes } from "@/pages/Recordatorios/config/routes";
import recordatoriosAPI from "@/apis/recordatorios.api";
import { EstadosRecordatorios } from "./Recordatorios/types/EstadosRecordatorios";
import { solicitarVerificacionCuentausuario } from "@/apis/verificacionCuenta.api";
import { getMisDatos } from "@/apis/usuarios.api";
import { toast } from "sonner";
import { crearEnlaceWhatsApp } from "@/utils/funciones";

// Schema de validación para archivar recordatorios
const completionSchema = z.object({
  motivo: z
    .string()
    .min(3, "El motivo debe tener al menos 3 caracteres")
    .max(200, "El motivo no puede exceder 200 caracteres"),
});

// Función para formatear fecha
const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  return format(date, "dd/MM/yyyy HH:mm", { locale: es });
};

const emociones = [
  { emoji: "😄", label: "Entusiasmado", id: 1 },
  { emoji: "😊", label: "Contento", id: 2 },
  { emoji: "😐", label: "Pensativo", id: 3 },
  { emoji: "😟", label: "Decepcionado", id: 4 },
  { emoji: "😢", label: "Triste", id: 5 },
  { emoji: "😇", label: "Sorpréndeme", id: 6 },
];

export default function DashBoardUsarioProtegido() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Estados para el mensaje del día
  const [mensajeDelDia, setMensajeDelDia] = useState(null);
  const [mostrarMensaje, setMostrarMensaje] = useState(false);
  const [cargandoMensaje, setCargandoMensaje] = useState(false);
  const [recordatoriosHoy, setRecordatoriosHoy] = useState([]);
  const [mostrarEmociones, setMostrarEmociones] = useState(
    user?.estado_del_dia ? false : true
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [completedReminders, setCompletedReminders] = useState(new Set());
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [solicitandoVerificacion, setSolicitandoVerificacion] = useState(false);

  // Estado para datos de verificación independiente del user store
  const [userData, setUserData] = useState(null);
  const [loadingUserData, setLoadingUserData] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setFocus,
  } = useForm({
    resolver: zodResolver(completionSchema),
    defaultValues: {
      motivo: "",
    },
  });

  const getMensajeWhatsAppVerificacion = ({ nombre_user = null }) => {
    return `Hola, soy *${nombre_user}* y quiero obtener mi Cuenta Verificada GRATIS de por vida. Quedo atento para continuar.`;
  };

  const loadREcordatoriosHoy = async () => {
    try {
      const response = await recordatoriosAPI.obtenerMisRecordatoriosHoy();
      setRecordatoriosHoy(response.data || []);
    } catch {
      setRecordatoriosHoy([]);
    }
  };

  // Función para cargar datos de usuario para verificación
  const loadUserVerificationData = async () => {
    try {
      setLoadingUserData(true);
      const res = await getMisDatos();
      setUserData(res.data);
    } catch (error) {
      console.error("Error al cargar datos de verificación:", error);
    } finally {
      setLoadingUserData(false);
    }
  };

  useEffect(() => {
    loadREcordatoriosHoy();
    loadUserVerificationData();
  }, []);

  // Obtener mensaje del día
  const fetchMensajeDelDia = async (id_emocion) => {
    try {
      setCargandoMensaje(true);

      // Preparar parámetros según el DTO
      const params = {
        id_tipo_mensaje: id_emocion, // Tipo de mensaje para ánimo/motivación (requerido)
      };

      const response = await getMensajeDelDia(params);

      // Solo mostrar si hay un mensaje válido y es status 200
      if (response.status === 200 && response.data && response.data.mensaje) {
        setMensajeDelDia(response.data);
        setMostrarMensaje(true);

        console.log("📝 Mensaje del día obtenido:", {
          mensaje: response.data.mensaje,
          tipo: response.data.descripcion_tipo_mesaje,
          id_tipo_animo: response.data.id_tipo_animo,
        });
      } else {
        console.log("📝 No hay mensaje nuevo para mostrar hoy");
      }
    } catch (error) {
      console.error("Error al obtener mensaje del día:", error);
      // No mostrar error al usuario, el mensaje del día es opcional
    } finally {
      setCargandoMensaje(false);
    }
  };

  // Cerrar mensaje del día y guardarlo como visto
  const cerrarMensajeDelDia = () => {
    // Cerrar el dialog y ocultar emociones
    setMostrarMensaje(false);
    setMensajeDelDia(null);
    setMostrarEmociones(false); // Ocultar las emociones después de ver el mensaje
  };

  // Manejar selección de emoción - cargar mensaje del día
  const handleEmotionClick = async (emocion) => {
    console.log("👤 Usuario se siente:", emocion.label);

    // Cargar mensaje del día basado en la emoción seleccionada
    await fetchMensajeDelDia(emocion.id);
  };

  // Manejar clic en cerrar recordatorio
  const handleCloseReminder = (reminder) => {
    setSelectedReminder(reminder);
    setDialogOpen(true);
  };

  const handleSolicitudVerificacion = () => {
    setShowVerificationDialog(true);
  };

  // Manejar apertura del dialog
  useEffect(() => {
    if (dialogOpen) {
      setTimeout(() => {
        setFocus("motivo");
      }, 100);
    }
  }, [dialogOpen, setFocus]);

  // Manejar cancelación del dialog
  const handleCancel = () => {
    setDialogOpen(false);
    setSelectedReminder(null);
    reset();
  };

  // Manejar confirmación de archivado
  const handleConfirmComplete = async (data) => {
    if (!selectedReminder) return;

    try {
      const key = `${selectedReminder.titulo}-${selectedReminder.fecha_recordatorio}`;

      // Marcar como archivado localmente
      setCompletedReminders((prev) => new Set([...prev, key]));

      console.log("📝 Recordatorio archivado:", {
        titulo: selectedReminder.titulo,
        motivo: data.motivo,
        fecha_archivado: new Date().toISOString(),
      });

      // Aquí puedes llamar a tu API para marcar como completado
      await recordatoriosAPI.actualizarEstadoRecordatorio(selectedReminder.id, {
        id_estado: EstadosRecordatorios.ARCHIVADO,
        observacion: data.motivo,
      });

      // Cerrar dialog y limpiar
      setDialogOpen(false);
      setSelectedReminder(null);
      reset();
    } catch (error) {
      console.error("Error al completar recordatorio:", error);
    }
  };

  const handleConfirmVerification = async () => {
    try {
      setSolicitandoVerificacion(true);
      const responseSolicitud = await solicitarVerificacionCuentausuario();
      const { verificador } = responseSolicitud.data;
      setShowVerificationDialog(false);
      toast.success("Solicitud de verificación enviada");
      const mensajeEnviarWsp = getMensajeWhatsAppVerificacion({
        nombre_user: `${user?.nombre} ${user?.apellido}`,
      });
      const url = crearEnlaceWhatsApp(
        verificador?.nro_telefono_verificacion,
        mensajeEnviarWsp
      );
      // Recargar datos de verificación después de solicitar
      setUserData((prevData) => ({ ...prevData, estado: 3 }));
      // Abrir enlace de WhatsApp en una nueva pestaña
      window.open(url, "_self");
    } catch (error) {
      toast.error(error.message || "Error al solicitar verificación");
    } finally {
      setSolicitandoVerificacion(false);
    }
  };

  const handleCloseDialog = () => {
    setShowVerificationDialog(false);
  };

  // Filtrar recordatorios visibles
  const recordatoriosVisibles = recordatoriosHoy.filter((reminder) => {
    const key = `${reminder.titulo}-${reminder.fecha_recordatorio}`;
    return !completedReminders.has(key);
  });

  const secciones = [
    {
      icon: "/icons/cuenta.png",
      title: "Cuenta",
      onClick: () => navigate(`${PROTECTED_ROUTES.misDatos}`),
      desc: "Datos - Seguridad - Más",
      habilitado: true,
    },
    {
      icon: "/icons/favorito.png",
      title: "Favoritos",
      desc: "Comercios - Productos - Links",
      onClick: () => navigate(`/${FavoritosRoutes.index}`),
      habilitado: true,
    },
    {
      icon: "/icons/publicar.png",
      title: "Publicar Estados",
      desc: "Sobre lo que quieras comprar",
      habilitado: true,
    },
    {
      icon: "/icons/recordatorios.png",
      title: "Recordatorios",
      desc: "Administra tus recordatorios",
      habilitado: true,
      onClick: () => navigate(`/${RecordatoriosRoutes.index}`),
    },
    {
      icon: "/icons/semaforo.png",
      title: "Semáforo Financiero",
      onClick: () => navigate(`/semaforo-financiero`),
      desc: "Controla tus finanzas",
      habilitado: true,
    },
    {
      icon: "/icons/donde-guarde.png",
      title: "¿Dónde lo guardé?",
      onClick: () => navigate(`/${RecordatoriosUsuariosRoutes.index}`),
      desc: "Que no se te olvide nada",
      habilitado: true,
    },
    {
      icon: "/icons/wallet.png",
      title: "Wallet",
      desc: "Depósitos - Pagos - Ganancias",
      onClick: () => navigate(`/${WalletRoutes.index}`),
      habilitado: () => userData?.vfd === true,
    },
    {
      icon: "/icons/suscripcion.png",
      title: "Suscripciones",
      desc: "Planes - Facturas - Historial",
      onClick: () => navigate(`/${SuscripcionesRoutes.MIS_SUSCRIPCIONES}`),
      habilitado: true,
    },
    {
      icon: "/icons/soporte.png",
      title: "Soporte y Ayuda",
      desc: "Estamos aqui para ayudarte",
      habilitado: true,
      onClick: () => navigate(`/${SoporteAyudaRoutes.index}`),
    },
  ];

  const seccionesFiltradas = secciones.filter(
    (item) =>
      item.habilitado === true ||
      (typeof item.habilitado === "function" && item.habilitado())
  );
  const listaPromoVerificaion = [
    "🔔 Verifica tu cuenta por solo 24 USD al año.",
    "🎁  Hoy: GRATIS de por vida.",
    "🔥 Oferta especial: Para los primeros 5.000 Usuarios.",
  ];
  return (
    <div className="min-h-screen text-white">
      {/* Recordatorios del día */}
      {recordatoriosVisibles.length > 0 && (
        <div className="w-full mx-auto mt-6 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recordatorios de Hoy
            </h3>
            <Badge variant="secondary" className="w-fit">
              {recordatoriosVisibles.length} pendiente
              {recordatoriosVisibles.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          <ScrollArea className="w-full max-h-96">
            <div className="space-y-3 pr-4">
              {recordatoriosVisibles.map((recordatorio, index) => (
                <Alert
                  key={index}
                  className="relative border-l-4 border-l-yellow-500 bg-yellow-50 hover:bg-yellow-100 transition-colors duration-200"
                >
                  <NotebookIcon className="text-yellow-600" />
                  <div className="flex-1 pr-8">
                    <AlertTitle className="text-start text-yellow-900 font-semibold">
                      {recordatorio?.titulo}
                    </AlertTitle>
                    {recordatorio?.descripcion && (
                      <AlertDescription className="text-start text-yellow-800 mt-1">
                        {recordatorio?.descripcion}
                      </AlertDescription>
                    )}
                    <div className="flex items-center gap-2 text-xs text-yellow-700 mt-2">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Recordatorio:{" "}
                        {formatDate(recordatorio.fecha_recordatorio)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 text-yellow-600"
                    onClick={() => handleCloseReminder(recordatorio)}
                    aria-label={`Cerrar recordatorio: ${recordatorio.titulo}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </Alert>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
      <div className="w-full flex flex-col md:flex-row lg:flex-row gap-2  mb-6 px-2">
        {!loadingUserData &&
          userData?.vfd == false &&
          userData?.estado === 2 && (
            <Alert className="">
              <CheckCircle2Icon />
              <AlertTitle>¡Bienvenido!</AlertTitle>
              <AlertDescription>
                <div 
                  className="mt-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors duration-200"
                  onClick={handleSolicitudVerificacion}
                >
                  <div className="flex flex-col gap-1 text-sm sm:text-base">
                    <span className="block">🔔 Verifica tu cuenta por solo 24 USD al año.</span>
                    <span className="block">🎁 Hoy: GRATIS de por vida.</span>
                    <span className="block">🔥 Oferta especial: Para los primeros 5.000 Usuarios.</span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        {!loadingUserData && userData?.estado === 3 && (
          <Alert className="border-yellow-400/50 bg-yellow-400/10">
            <CheckCircle2Icon className="text-yellow-400" />
            <AlertTitle className="text-yellow-400">
              Verificación en Proceso
            </AlertTitle>
            <AlertDescription>
              <p className="text-yellow-400">
                Tu cuenta está en proceso de verificación. Recibirás una
                notificación una vez que se complete.
              </p>
            </AlertDescription>
          </Alert>
        )}
        {!loadingUserData && userData?.vfd == true && (
          <Alert className="">
            <CheckCircle2Icon />
            <AlertTitle>Hola, {`${user?.nombre} ${user?.apellido}`}</AlertTitle>
            <AlertDescription>
              <div className="flex gap-2 ">
                <p>
                  Te gustaría <b>Verificar un comercio</b>
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate(PROTECTED_ROUTES.verificacionComercio)}
              >
                Verificar
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="max-w-7xl mx-auto text-center space-y-4">
        <p className="text-foreground text-xl italic">
          Hola, {`${user?.nombre} ${user?.apellido}`}
        </p>
        {mostrarEmociones && (
          <h1 className=" text-foreground text-3xl font-bold">
            ¿Cómo te sientes hoy?
          </h1>
        )}

        {/* Emociones - Solo mostrar si no se ha visto mensaje hoy */}
        {mostrarEmociones && (
          <div className="bg-background/90 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg">
            {cargandoMensaje ? (
              <div className="flex flex-col items-center space-y-4 py-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-lg font-medium text-foreground">
                  Buscando tu mensaje del día...
                </p>
                <p className="text-sm text-muted-foreground">
                  Preparando algo especial para ti ✨
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {emociones.map((item, i) => (
                    <div
                      key={i}
                      className="cursor-pointer hover:shadow-md transition-all duration-300 hover:scale-105 group  hover:bg-primary/5"
                      onClick={() => handleEmotionClick(item)}
                    >
                      <div className="flex flex-col items-center p-4 space-y-2">
                        <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                          {item.emoji}
                        </div>
                        <p className="text-sm font-medium text-center group-hover:text-primary transition-colors">
                          {item.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm italic mt-4 text-muted-foreground">
                  ✨ Seleccioná tu ánimo y dejá que Dios te hable hoy
                </p>
              </>
            )}
          </div>
        )}

        {/* Mensaje cuando ya se vio el mensaje del día */}
        {!mostrarEmociones && !mostrarMensaje && (
          <Card className="rounded-xl p-6 shadow-lg">
            <div className="flex flex-col items-center space-y-4">
              <div className="text-6xl">✨</div>
              <h2 className="text-2xl font-bold text-foreground">
                ¡Mensaje del día!
              </h2>
              <p className="text-muted-foreground text-center max-w-md">
                Ya has recibido tu mensaje inspirador de hoy. Vuelve mañana para
                descubrir un nuevo mensaje.
              </p>
            </div>
          </Card>
        )}

        {/* Secciones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-10">
          {seccionesFiltradas.map((item, i) => (
            <Card
              key={i}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 gap-3 group p-4"
              onClick={item.onClick}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0">
                  <img
                    src={item.icon}
                    alt={item.title}
                    className="w-6 h-6 object-contain filter group-hover:brightness-110 transition-all"
                  />
                </div>
                <CardTitle className="text-lg  font-semibold group-hover:text-primary transition-colors">
                  {item.title}
                </CardTitle>
              </div>
              <CardDescription className="text-muted-foreground text-sm">
                {item.desc}
              </CardDescription>
            </Card>
          ))}
        </div>
      </div>

      {/* Dialog de confirmación de recordatorio */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="sm:max-w-md"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <DialogTitle>Archivar Recordatorio</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-gray-600">
              Al cerrar, este recordatorio se marcará como archivado.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(handleConfirmComplete)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="motivo" className="text-sm font-medium">
                Motivo de archivado *
              </Label>
              <Textarea
                id="motivo"
                placeholder="Describe brevemente por qué archivaste este recordatorio..."
                className="min-h-[80px] resize-none"
                {...register("motivo")}
              />
              {errors.motivo && (
                <p className="text-sm text-red-600">{errors.motivo.message}</p>
              )}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="w-full sm:w-auto"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Procesando..." : "Marcar como archivado"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog del Mensaje del Día */}
      <Dialog open={mostrarMensaje} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Smile className="h-6 w-6 text-primary" />
                </div>
                <DialogTitle className="text-xl font-semibold">
                  Mensaje del Día
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>

          {mensajeDelDia && (
            <div className="space-y-4">
              {/* Estado de ánimo */}
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  {mensajeDelDia.descripcion_tipo_mesaje || "Motivacional"}
                </Badge>
              </div>

              {/* Mensaje principal */}
              <DialogDescription className="text-base leading-relaxed text-foreground">
                {mensajeDelDia.mensaje}
              </DialogDescription>

              {/* Decoración visual */}
              <div className="flex items-center justify-center py-4">
                <div className="w-16 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 rounded-full"></div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              onClick={cerrarMensajeDelDia}
              className="w-full sm:w-auto"
              disabled={cargandoMensaje}
            >
              {cargandoMensaje ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cerrando...
                </>
              ) : (
                "Cerrar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/*Dialog de Solicitud de Verificación de Cuenta*/}
      {/* Dialog de confirmación de verificación */}
      <Dialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
      >
        <DialogContent
          className="sm:max-w-[425px]"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Verificación de Cuenta</DialogTitle>
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
  );
}
