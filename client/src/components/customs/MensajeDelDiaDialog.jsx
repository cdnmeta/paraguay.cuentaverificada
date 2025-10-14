// Componente reutilizable para mostrar el mensaje del día
// Ubicación sugerida: client/src/components/customs/MensajeDelDiaDialog.jsx

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Smile, X, Loader2, Heart, Star, Sun, Target } from 'lucide-react'
import { useMensajeDelDia } from '@/hooks/useMensajeDelDia'

/**
 * Componente para mostrar el mensaje del día en un dialog modal
 * 
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.open - Si el dialog está abierto
 * @param {Object|null} props.mensaje - Datos del mensaje del día
 * @param {boolean} props.loading - Estado de carga
 * @param {Function} props.onClose - Función para cerrar el dialog
 * @param {string} props.className - Clases CSS adicionales
 * @param {React.ReactNode} props.icon - Icono personalizado (opcional)
 */
export const MensajeDelDiaDialog = ({
  open = false,
  mensaje = null,
  loading = false,
  onClose,
  className = "",
  icon = null
}) => {
  // Evitar cerrar con clicks fuera o escape
  const handleOpenChange = () => {
    // Solo permitir cerrar con el botón
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className={`sm:max-w-[500px] max-h-[80vh] overflow-y-auto ${className}`}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                {icon || <Smile className="h-6 w-6 text-primary" />}
              </div>
              <DialogTitle className="text-xl font-semibold">
                Mensaje del Día
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-muted"
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {mensaje && (
          <div className="space-y-4">
            {/* Estado de ánimo */}
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className="bg-primary/10 text-primary border-primary/20"
              >
                {mensaje.descripcion_tipo_mesaje || 'Motivacional'}
              </Badge>
            </div>

            {/* Mensaje principal */}
            <DialogDescription className="text-base leading-relaxed text-foreground">
              {mensaje.mensaje}
            </DialogDescription>

            {/* Decoración visual */}
            <div className="flex items-center justify-center py-4">
              <div className="w-16 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 rounded-full"></div>
            </div>
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button 
            onClick={onClose}
            className="w-full sm:w-auto"
            disabled={loading}
          >
            {loading ? (
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
  )
}

/**
 * Componente simplificado que incluye el hook useMensajeDelDia
 * Para uso directo sin manejar estado externo
 */
export const MensajeDelDiaProvider = ({ 
  children, 
  tipoMensaje = 1,
  autoLoad = true 
}) => {
  const {
    mensajeDelDia,
    mostrarMensaje,
    cargandoMensaje,
    cerrarMensajeDelDia
  } = useMensajeDelDia({ autoLoad, tipoMensaje })

  return (
    <>
      {children}
      <MensajeDelDiaDialog
        open={mostrarMensaje}
        mensaje={mensajeDelDia}
        loading={cargandoMensaje}
        onClose={cerrarMensajeDelDia}
      />
    </>
  )
}

export default MensajeDelDiaDialog