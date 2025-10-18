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
import { useAuthStore } from "@/hooks/useAuthStorge";
import { getMensajeDelDia } from "@/apis/estados-animos.api";
import { PROTECTED_ROUTES } from "@/utils/routes.routes";
import { CheckCircle2Icon, Smile, X, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { routes as RecordatoriosUsuariosRoutes } from "@/pages/recordatoriosUsuarios/config/routes";
import { routes as FavoritosRoutes } from "@/pages/Favoritos/config/routes";
import { routes as SoporteAyudaRoutes } from "@/pages/SoporteAyuda/config/routes";


// Constantes para el localStorage del mensaje del día
const STORAGE_KEY_ULTIMO_MENSAJE = 'ultimo_mensaje_del_dia'
const STORAGE_KEY_FECHA_ULTIMO_MENSAJE = 'fecha_ultimo_mensaje_del_dia'

// Funciones para manejar localStorage del mensaje del día
const obtenerUltimoMensajeVisto = () => {
  try {
    const ultimoId = localStorage.getItem(STORAGE_KEY_ULTIMO_MENSAJE)
    const fechaUltimo = localStorage.getItem(STORAGE_KEY_FECHA_ULTIMO_MENSAJE)
    const hoy = new Date().toDateString()
    
    // Si la fecha es diferente a hoy, permitir ver un nuevo mensaje
    if (fechaUltimo !== hoy) {
      return null
    }
    
    return ultimoId ? parseInt(ultimoId) : null
  } catch (error) {
    console.error('Error al obtener último mensaje del localStorage:', error)
    return null
  }
}

const guardarMensajeVisto = (idMensaje) => {
  try {
    const hoy = new Date().toDateString()
    localStorage.setItem(STORAGE_KEY_ULTIMO_MENSAJE, idMensaje.toString())
    localStorage.setItem(STORAGE_KEY_FECHA_ULTIMO_MENSAJE, hoy)
  } catch (error) {
    console.error('Error al guardar mensaje en localStorage:', error)
  }
}

const emociones = [
  { emoji: "😄", label: "Entusiasmado", id:1 },
  { emoji: "😊", label: "Contento", id:2 },
  { emoji: "😐", label: "Pensativo", id:3 },
  { emoji: "😟", label: "Decepcionado", id:4 },
  { emoji: "😢", label: "Triste", id:5 },
  { emoji: "😇", label: "Sorpréndeme", id:6 },
];

export default function DashBoardUsarioProtegido() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  // Estados para el mensaje del día
  const [mensajeDelDia, setMensajeDelDia] = useState(null)
  const [mostrarMensaje, setMostrarMensaje] = useState(false)
  const [cargandoMensaje, setCargandoMensaje] = useState(false)
  const [mostrarEmociones, setMostrarEmociones] = useState(true)

  // Verificar al cargar si ya se vio un mensaje hoy
  useEffect(() => {
    const ultimoIdVisto = obtenerUltimoMensajeVisto()
    if (ultimoIdVisto) {
      // Ya se vio un mensaje hoy, ocultar emociones
      setMostrarEmociones(false)
      console.log('📝 Mensaje ya visto hoy, ocultando emociones')
    }
  }, [])

  // Obtener mensaje del día
  const fetchMensajeDelDia = async (id_emocion) => {
    try {
      setCargandoMensaje(true)
      
      // Obtener el último ID de mensaje visto
      const ultimoIdVisto = obtenerUltimoMensajeVisto()
      
      // Preparar parámetros según el DTO
      const params = {
        id_tipo_mensaje: id_emocion  // Tipo de mensaje para ánimo/motivación (requerido)
      }
      
      // Si hay un mensaje anterior visto hoy, incluir el ID para evitar repetición
      if (ultimoIdVisto) {
        params.id_mensaje_ant = ultimoIdVisto
      }
      
      const response = await getMensajeDelDia(params)
      
      // Solo mostrar si hay un mensaje válido y es status 200
      if (response.status === 200 && response.data && response.data.mensaje) {
        setMensajeDelDia(response.data)
        setMostrarMensaje(true)
        
        console.log('📝 Mensaje del día obtenido:', {
          mensaje: response.data.mensaje,
          tipo: response.data.descripcion_tipo_mesaje,
          id_tipo_animo: response.data.id_tipo_animo
        })
      } else {
        console.log('📝 No hay mensaje nuevo para mostrar hoy')
      }
    } catch (error) {
      console.error('Error al obtener mensaje del día:', error)
      // No mostrar error al usuario, el mensaje del día es opcional
    } finally {
      setCargandoMensaje(false)
    }
  }

  // Cerrar mensaje del día y guardarlo como visto
  const cerrarMensajeDelDia = () => {
    if (mensajeDelDia) {
      // Guardar el ID del tipo de ánimo como mensaje visto
      const idParaGuardar = mensajeDelDia.id_tipo_animo
      if (idParaGuardar) {
        guardarMensajeVisto(idParaGuardar)
        console.log('💾 Mensaje guardado como visto:', idParaGuardar)
      }
    }
    
    // Cerrar el dialog y ocultar emociones
    setMostrarMensaje(false)
    setMensajeDelDia(null)
    setMostrarEmociones(false) // Ocultar las emociones después de ver el mensaje
  }

  // Manejar selección de emoción - cargar mensaje del día
  const handleEmotionClick = async (emocion) => {
    console.log('👤 Usuario se siente:', emocion.label)
    
    // Verificar si ya se vio un mensaje hoy
    const ultimoIdVisto = obtenerUltimoMensajeVisto()
    if (ultimoIdVisto) {
      console.log('📝 Ya se vio un mensaje hoy')
      setMostrarEmociones(false) // Ocultar emociones si ya se vio mensaje
      return
    }
    
    // Cargar mensaje del día basado en la emoción seleccionada
    await fetchMensajeDelDia(emocion.id)
  }

  const secciones = [
    {
      icon: "/icons/2179332.png",
      title: "Cuenta",
      onClick: () => navigate(`${PROTECTED_ROUTES.misDatos}`),
      desc: "Datos - Seguridad - Más",
    },
    {
      icon: "/icons/1331244-f39d5970.png",
      title: "Favoritos",
      desc: "Comercios - Productos - Links",
      onClick: () => navigate(`/${FavoritosRoutes.index}`),
    },
    {
      icon: "/icons/1176025.png",
      title: "Publicar",
      desc: "Expresa lo que deseas comprar",
    },
    {
      icon: "/icons/443115.png",
      title: "Semáforo Financiero",
      onClick: () => navigate(`/semaforo-financiero`),
      desc: "No permitas que tus finanzas lleguen al rojo",
    },
    {
      icon: "/icons/80957-74a5697e.png",
      title: "¿Dónde lo guardé?",
      onClick: () => navigate(`/${RecordatoriosUsuariosRoutes.index}`),
      desc: "Que no se te olvide nada",
    },
    {
      icon: "/icons/709049.png",
      title: "Saldos",
      desc: "Depósitos - Pagos - Ganancias",
    },
    {
      icon: "/icons/709049.png",
      title: "Suscripciones",
      desc: "Planes - Facturas - Historial",
    },
    {
      icon: "/icons/709049.png",
      title: "Soporte y Ayuda",
      desc: "Autoayuda + asistencia personalizada",
      onClick: () => navigate(`/${SoporteAyudaRoutes.index}`),
    },
  ];
  return (
    <div className="min-h-screen text-white">
      <div className="w-full flex flex-col md:flex-row lg:flex-row gap-2 mb-6 px-2">
        {user?.vfd == false && (
          <Alert className="">
            <CheckCircle2Icon />
            <AlertTitle>¡Bienvenido!</AlertTitle>
            <AlertDescription>
              <p>Tu cuenta aun no ha sido verificada</p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() =>
                  navigate(`${PROTECTED_ROUTES.misDatos}#verificacion`)
                }
              >
                Deseas Verificarla?
              </Button>
            </AlertDescription>
          </Alert>
        )}
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
                    <Card
                      key={i}
                      className="cursor-pointer hover:shadow-md transition-all duration-300 hover:scale-105 group bg-background/50 backdrop-blur-sm border border-border/30 hover:border-primary/50 hover:bg-primary/5"
                      onClick={() => handleEmotionClick(item)}
                    >
                      <CardContent className="flex flex-col items-center p-4 space-y-2">
                        <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                          {item.emoji}
                        </div>
                        <p className="text-sm font-medium text-center group-hover:text-primary transition-colors">
                          {item.label}
                        </p>
                      </CardContent>
                    </Card>
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
          <div className="bg-background/90 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg">
            <div className="flex flex-col items-center space-y-4">
              <div className="text-6xl">✨</div>
              <h2 className="text-2xl font-bold text-foreground">
                ¡Mensaje del día!
              </h2>
              <p className="text-muted-foreground text-center max-w-md">
                Ya has recibido tu mensaje inspirador de hoy. Vuelve mañana para descubrir un nuevo mensaje.
              </p>
            </div>
          </div>
        )}

        {/* Secciones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10">
          {secciones.map((item, i) => (
            <Card
              key={i}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 group bg-background/95 backdrop-blur-sm border border-border/50 hover:border-primary/50"
              onClick={item.onClick}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <img
                    src={item.icon}
                    alt={item.title}
                    className="w-8 h-8 object-contain filter group-hover:brightness-110 transition-all"
                  />
                </div>
                <CardTitle className="text-lg font-semibold text-center group-hover:text-primary transition-colors">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-center text-muted-foreground text-sm leading-relaxed">
                  {item.desc}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

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
                  {mensajeDelDia.descripcion_tipo_mesaje || 'Motivacional'}
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
                'Cerrar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
