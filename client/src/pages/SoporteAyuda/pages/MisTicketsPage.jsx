import React, { useState, useEffect } from 'react';
import { getMisTickets } from '@/apis/tickets.api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, User, Tag, AlertCircle, Plus } from 'lucide-react';
import FormCreacionTicket from '../components/FormCreacionTicket';
import {routes as SoporteAyudaRoutes} from '@/pages/SoporteAyuda/config/routes'
import { useNavigate } from 'react-router-dom';

export default function MisTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const navigate = useNavigate()

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await getMisTickets();
      setTickets(response.data);
    } catch (err) {
      setError('Error al cargar los tickets');
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleTicketCreated = () => {
    setIsDialogOpen(false);
    fetchTickets(); // Refrescar la lista de tickets
  };

  const handleCancelCreate = () => {
    setIsDialogOpen(false);
  };

  const getEstadoBadgeVariant = (estadoId) => {
    switch (estadoId) {
      case 1: // nuevo
        return 'default';
      case 2: // abierto
        return 'outline';
      case 3: // pendiente cliente
        return 'warning';
      case 4: // pendiente soporte
        return 'secondary';
      case 5: // en espera
        return 'outline';
      case 6: // resuelto
        return 'success';
      case 7: // cerrado
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad?.toLowerCase()) {
      case 'alta':
        return 'text-red-500';
      case 'media':
        return 'text-yellow-500';
      case 'baja':
        return 'text-green-500';
      default:
        return ' text-foreground';
    }
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return {
      fecha: date.toLocaleDateString('es-PY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      hora: date.toLocaleTimeString('es-Py', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64 text-red-500">
          <AlertCircle className="h-6 w-6 mr-2" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Mis Tickets de Soporte</h1>
          <p className="text-foreground">Gestiona y consulta el estado de tus solicitudes de soporte</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 md:mt-0">
              <Plus className="h-4 w-4 mr-2" />
              Crear Nuevo Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Ticket de Soporte</DialogTitle>
            </DialogHeader>
            <FormCreacionTicket 
              onSuccess={handleTicketCreated} 
              onCancel={handleCancelCreate}
            />
          </DialogContent>
        </Dialog>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex flex-col items-center">
            <Tag className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No tienes tickets</h3>
            <p className=" text-foreground">Aún no has creado ningún ticket de soporte</p>
          </div>
        </div>
      ) : (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tickets.map((ticket) => {
            const { fecha, hora } = formatearFecha(ticket.ultimo_mensaje_at);
            const { fecha: fechaCreacion, hora: horaCreacion } = formatearFecha(ticket.fecha_creacion);
            
            return (
              <Card 
                key={ticket.id} 
                className="hover:shadow-md transition-shadow duration-200 cursor-pointer"
                onClick={() => navigate(`/${SoporteAyudaRoutes.ticketDetalle(ticket.id)}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getEstadoBadgeVariant(ticket.id_estado)}>
                          {ticket.descripcion_estado}
                        </Badge>
                        <span className="text-xs  text-foreground">#{ticket.id}</span>
                      </div>
                      <h3 
                        className="font-medium text-foreground text-sm leading-5 mb-1"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title={ticket.asunto}
                      >
                        {ticket.asunto}
                      </h3>
                    </div>
                    <div className={`ml-2 ${getPrioridadColor(ticket.prioridad)}`}>
                      <AlertCircle className="h-4 w-4" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <span className='text-xs font-medium'>
                    Creado el {fechaCreacion} {horaCreacion}
                  </span>
                  <div className="space-y-3">
                    {/* Fecha y hora del último mensaje */}
                    <div className="flex items-center text-xs text-foreground">
                      <span className='mr-2'>Último Mensaje</span>
                      <Calendar className="h-3 w-3 mr-1.5" />
                      <span className="mr-3">{fecha}</span>
                      <Clock className="h-3 w-3 mr-1.5" />
                      <span>{hora}</span>
                    </div>

                    {/* Tipo de ticket */}
                    <div className="flex items-center text-xs text-foreground">
                      <Tag className="h-3 w-3 mr-1.5" />
                      <span className="truncate">
                        {ticket.descripcion_tipo_ticket || 'No Asignado'}
                      </span>
                    </div>

                    {/* Nombre del soporte asignado */}
                    <div className="flex items-center text-xs text-foreground">
                      <User className="h-3 w-3 mr-1.5" />
                      <span className="truncate">
                        {ticket.nombre_asignado || 'Sin asignar'}
                      </span>
                    </div>

                    {/* Prioridad */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-xs  text-foreground">Prioridad:</span>
                      <span className={`text-xs font-medium ${getPrioridadColor(ticket.prioridad)}`}>
                        {ticket.prioridad}
                      </span>
                    </div>

                    {/* Reportante */}
                    <div className="text-xs  text-foreground truncate">
                      Reportado por: {ticket.nombre_reportante}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        </div>

        
      )}
    </div>
  );
}
