import React, { useState, useEffect } from 'react';
import { getTicketHilo, abrirTicket, getTicketInfoById, cerrarTicket, completarTicket } from '@/apis/tickets.api';
import TimeLineMensajes from '../components/TimeLineMensajes';
import ChatTicket from '../components/ChatTicket';
import {useAuthStore} from '@/hooks/useAuthStorge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

export default function TicketDetalle({ id_ticket }) {
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ticketInfo, setTicketInfo] = useState(null);
  const [pagination, setPagination] = useState({
    hasMore: false,
    hasPrevious: false,
    firstMessageId: null,
    lastMessageId: null
  });
  
  // Estados para el Dialog dinámico
  const [dialogOpen, setDialogOpen] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [motivoCierre, setMotivoCierre] = useState('');
  const [tipoOperacion, setTipoOperacion] = useState(null); // 'abrir', 'cerrar', 'completar'
  
  const { user } = useAuthStore();

  const grupos = user?.grupos || [];
  
  // Determinar si el usuario es cliente o soporte
  const esCliente = !grupos?.some(grupo => grupo.id === 5); // Grupo 5 es soporte
  const estadoTicket = ticketInfo?.id_estado || 1;

  const cargarMensajes = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const responseTicketInfo = await getTicketInfoById(id_ticket);
      const response = await getTicketHilo(id_ticket, params);
      const data = response.data;
      
      setMensajes(data.mensajes || []);
      setPagination(data.pagination || {});
      
      // Si es la primera carga, también podríamos obtener info del ticket
      // (esto dependería si el endpoint devuelve info del ticket)
      if (responseTicketInfo.data) {
        setTicketInfo(responseTicketInfo.data);
      }
      
    } catch (err) {
      console.error('Error al cargar mensajes:', err);
      setError('Error al cargar los mensajes del ticket');
    } finally {
      setLoading(false);
    }
  };

  const cargarMensajesAnteriores = async () => {
    if (!pagination.hasMore || loading) return;
    
    try {
      const response = await getTicketHilo(id_ticket, {
        lastMessageId: pagination.lastMessageId,
        limit: 15
      });
      
      const data = response.data;
      
      // Prepend mensajes anteriores
      setMensajes(prev => [...(data.mensajes || []), ...prev]);
      setPagination(data.pagination || {});
      
    } catch (err) {
      console.error('Error al cargar mensajes anteriores:', err);
    }
  };

  const manejarMensajeEnviado = () => {
    // Recargar mensajes después de enviar uno nuevo
    cargarMensajes();
  };

  const manejarConfirmarAbrirTicket = async () => {
    setProcesando(true);
    try {
      await abrirTicket(id_ticket);
      
      // Actualizar el estado del ticket localmente
      setTicketInfo(prev => prev ? { ...prev, id_estado: 2 } : null);
      
      // Recargar los mensajes para obtener datos actualizados
      await cargarMensajes();
      
      // Cerrar el dialog
      setDialogOpen(false);
      
    } catch (error) {
      console.error('Error al abrir ticket:', error);
      setError('Error al abrir el ticket. Por favor, intenta nuevamente.');
    } finally {
      setProcesando(false);
    }
  };

  // Factory para configuraciones de diálogo
  const getDialogConfig = (tipo) => {
    const configs = {
      abrir: {
        titulo: '¿Deseas aceptar este ticket?',
        descripcion: 'Al aceptar este ticket, serás asignado como responsable y podrás comenzar a enviar mensajes al cliente. Esta acción cambiará el estado del ticket a \'Abierto\'.',
        confirmText: 'Sí, aceptar ticket',
        confirmClass: 'bg-green-600 hover:bg-green-700',
        needsReason: false,
        action: () => manejarConfirmarAbrirTicket()
      },
      cerrar: {
        titulo: '¿Deseas cerrar este ticket?',
        descripcion: 'Al cerrar este ticket, no se podrán enviar más mensajes. Por favor, proporciona una razón para el cierre.',
        confirmText: 'Sí, cerrar ticket',
        confirmClass: 'bg-red-600 hover:bg-red-700',
        needsReason: true,
        action: () => manejarCerrarTicket()
      },
      completar: {
        titulo: '¿Deseas marcar como completado este ticket?',
        descripcion: 'Esta acción marcará el ticket como resuelto. El cliente podrá verificar la solución y cerrarlo definitivamente.',
        confirmText: 'Sí, completar ticket',
        confirmClass: 'bg-blue-600 hover:bg-blue-700',
        needsReason: false,
        action: () => manejarCompletarTicket()
      }
    };
    return configs[tipo] || configs.abrir;
  };

  // Funciones para manejar las acciones
  const manejarCerrarTicket = async () => {
    if (!motivoCierre.trim()) {
      toast.error('Error al cerrar el ticket. Por favor, intenta nuevamente.');
      return;
    }

    setProcesando(true);
    try {
      await cerrarTicket(id_ticket, { motivo_cierre: motivoCierre });
      setTicketInfo(prev => prev ? { ...prev, id_estado: 7 } : null);
      
      setDialogOpen(false);
      setMotivoCierre('');
    } catch (error) {
      console.error('Error al cerrar ticket:', error);
      toast.error('Error al cerrar el ticket. Por favor, intenta nuevamente.');
    } finally {
      setProcesando(false);
    }
  };

  const manejarCompletarTicket = async () => {
    setProcesando(true);
    try {
      
      await completarTicket(id_ticket);
      setTicketInfo(prev => prev ? { ...prev, id_estado: 6 } : null);
      
      setDialogOpen(false);
    } catch (error) {
      console.error('Error al completar ticket:', error);
      setError('Error al completar el ticket. Por favor, intenta nuevamente.');
    } finally {
      setProcesando(false);
    }
  };

  // Función para abrir diálogo específico
  const abrirDialog = (tipo) => {
    setTipoOperacion(tipo);
    setMotivoCierre('');
    setDialogOpen(true);
  };

  // Función para cerrar diálogo
  const cerrarDialog = () => {
    setDialogOpen(false);
    setTipoOperacion(null);
    setMotivoCierre('');
  };

  // Función para confirmar acción del diálogo
  const confirmarAccion = () => {
    const config = getDialogConfig(tipoOperacion);
    config.action();
  };

  useEffect(() => {
    if (id_ticket) {
      cargarMensajes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_ticket]);

  if (loading && mensajes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando mensajes del ticket...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      
      {/* Header del ticket */}
      <div className=" border rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
          <Button className="mr-4" variant={'outline'} onClick={() => window.history.back()}>&lt; Volver</Button>
            Ticket #{id_ticket}
            {ticketInfo?.asunto && ` - ${ticketInfo.asunto}`}
          </h2>
          <div className="flex items-center space-x-2">
            
            {/* Botones dinámicos según estado */}
            {!esCliente && (
              <>
                {estadoTicket === 1 && (
                  <Button 
                    onClick={() => abrirDialog('abrir')}
                    className="bg-green-400 hover:bg-green-500 text-white"
                    disabled={procesando}
                  >
                    {procesando && tipoOperacion === 'abrir' ? 'Abriendo...' : 'Abrir Ticket'}
                  </Button>
                )}
                
                {[3, 4, 5].includes(estadoTicket) && (
                  <>
                    <Button 
                      onClick={() => abrirDialog('completar')}
                      className="bg-blue-400 hover:bg-blue-500 text-white"
                      disabled={procesando}
                    >
                      {procesando && tipoOperacion === 'completar' ? 'Completando...' : 'Completar'}
                    </Button>
                    
                    <Button 
                      onClick={() => abrirDialog('cerrar')}
                      className="bg-red-400 hover:bg-red-500 text-white"
                      disabled={procesando}
                    >
                      {procesando && tipoOperacion === 'cerrar' ? 'Cerrando...' : 'Cerrar'}
                    </Button>
                  </>
                )}
              </>
            )}
            
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              estadoTicket === 1 ? 'bg-gray-100 text-gray-800' :
              estadoTicket === 2 ? 'bg-blue-100 text-blue-800' :
              estadoTicket === 3 ? 'bg-yellow-100 text-yellow-800' :
              estadoTicket === 4 ? 'bg-orange-100 text-orange-800' :
              estadoTicket === 5 ? 'bg-purple-100 text-purple-800' :
              estadoTicket === 6 ? 'bg-green-100 text-green-800' :
              estadoTicket === 7 ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {estadoTicket === 1 ? 'Nuevo' :
               estadoTicket === 2 ? 'Abierto' :
               estadoTicket === 3 ? 'Pendiente Cliente' :
               estadoTicket === 4 ? 'Pendiente Soporte' :
               estadoTicket === 5 ? 'En Espera' :
               estadoTicket === 6 ? 'Resuelto' :
               estadoTicket === 7 ? 'Cerrado' :
               'Desconocido'}
            </span>
            
            <span className="text-sm text-gray-500">
              {esCliente ? 'Cliente' : 'Soporte'}
            </span>
          </div>
        </div>
      </div>

      {/* Botón para cargar mensajes anteriores */}
      {pagination.hasMore && (
        <div className="text-center">
          <button
            onClick={cargarMensajesAnteriores}
            disabled={loading}
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Cargar mensajes anteriores'}
          </button>
        </div>
      )}

      {/* Timeline de mensajes */}
      <TimeLineMensajes 
        mensajes={mensajes} 
        usuarioActual={user}
      />

      {/* Chat para enviar mensajes */}
      <ChatTicket
        ticketId={id_ticket}
        estadoTicket={estadoTicket}
        esCliente={esCliente}
        onMensajeEnviado={manejarMensajeEnviado}
        disabled={estadoTicket === 1 && !esCliente} // Deshabilitar si es ticket nuevo y es soporte hasta que lo abra
      />

      {/* Dialog dinámico */}
      <AlertDialog open={dialogOpen} onOpenChange={cerrarDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {tipoOperacion ? getDialogConfig(tipoOperacion).titulo : ''}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {tipoOperacion ? getDialogConfig(tipoOperacion).descripcion : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Campo de motivo para cerrar ticket */}
          {tipoOperacion && getDialogConfig(tipoOperacion).needsReason && (
            <div className="py-4">
              <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-2">
                Motivo del cierre *
              </label>
              <Textarea
                id="motivo"
                value={motivoCierre}
                onChange={(e) => setMotivoCierre(e.target.value)}
                placeholder="Describe brevemente el motivo por el cual se cierra este ticket..."
                className="min-h-[100px]"
                disabled={procesando}
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={procesando}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmarAccion}
              disabled={procesando || (tipoOperacion && getDialogConfig(tipoOperacion).needsReason && !motivoCierre.trim())}
              className={tipoOperacion ? getDialogConfig(tipoOperacion).confirmClass : ''}
            >
              {procesando ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </div>
              ) : (
                tipoOperacion ? getDialogConfig(tipoOperacion).confirmText : 'Confirmar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
    </div>
  );
}
