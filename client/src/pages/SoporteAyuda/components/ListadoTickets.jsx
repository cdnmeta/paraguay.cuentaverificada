import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-tables/data-table";
import { Eye, MessageSquare, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import {routes as SoporteAyudaRoutes} from '@/pages/SoporteAyuda/config/routes'

export default function ListadoTickets({ 
  data = [], 
  opciones_habilitar = {}, 
  columnas_habilitar = {} 
}) {
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({});

  const navigate = useNavigate()

  // Configuración por defecto de opciones
  const defaultOpciones = {
    mostrarVer: true,
    mostrarResponder: true,
    mostrarCerrar: false,
    mostrarAbrir: false,
    mostrarCompletar: false,
    ...opciones_habilitar
  };

  // Configuración por defecto de columnas
  const defaultColumnas = {
    id: true,
    asunto: true,
    estado: true,
    prioridad: true,
    tipo_ticket: true,
    reportante: true,
    asignado: true,
    dial_code_reportante: true,
    telefono_reportante: true,
    fecha_creacion: true,
    fecha_actualizacion: true,
    acciones: true,
    ...columnas_habilitar
  };

  // Función para obtener el color del estado
  const getEstadoColor = (estadoId) => {
    switch (estadoId) {
      case 1: return 'bg-blue-500'; // Nuevo
      case 2: return 'bg-green-500'; // Abierto
      case 3: return 'bg-yellow-500'; // Pend. Cliente
      case 4: return 'bg-orange-500'; // Pend. Soporte
      case 5: return 'bg-purple-500'; // En Espera
      case 6: return 'bg-green-600'; // Resuelto
      case 7: return 'bg-gray-500'; // Cerrado
      default: return 'bg-gray-400';
    }
  };

  // Función para obtener el texto del estado
  const getEstadoTexto = (estadoId) => {
    switch (estadoId) {
      case 1: return 'Nuevo';
      case 2: return 'Abierto';
      case 3: return 'Pend. Cliente';
      case 4: return 'Pend. Soporte';
      case 5: return 'En Espera';
      case 6: return 'Resuelto';
      case 7: return 'Cerrado';
      default: return 'Desconocido';
    }
  };

  // Función para obtener el color de prioridad
  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case 1: return 'bg-red-500'; // Alta
      case 2: return 'bg-yellow-500'; // Media
      case 3: return 'bg-green-500'; // Baja
      default: return 'bg-gray-400';
    }
  };

  // Función para obtener el texto de prioridad
  const getPrioridadTexto = (prioridad) => {
    switch (prioridad) {
      case 1: return 'Alta';
      case 2: return 'Media';
      case 3: return 'Baja';
      default: return 'Normal';
    }
  };

  // Componente para ver detalles del ticket
  const CardVerDetallesTicket = ({ ticket }) => {
    const formatearFecha = (fecha) => {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return (
      <div className="space-y-6">
        {/* Información básica del ticket */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-600">ID del Ticket</Label>
            <p className="text-lg font-semibold">#{ticket.id}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Estado</Label>
            <Badge className={`${getEstadoColor(ticket.id_estado)} text-white`}>
              {getEstadoTexto(ticket.id_estado)}
            </Badge>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Prioridad</Label>
            <Badge className={`${getPrioridadColor(ticket.prioridad)} text-white`}>
              {getPrioridadTexto(ticket.prioridad)}
            </Badge>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Tipo de Ticket</Label>
            <p className="text-sm">{ticket.descripcion_tipo || 'No especificado'}</p>
          </div>
        </div>

        {/* Información del reportante */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <Label className="text-base font-medium mb-3 block">Información del Reportante</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium text-gray-600">Nombre</Label>
              <p>{ticket.nombre_usuario_reportante || 'No disponible'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Teléfono</Label>
              <p>{ticket.dial_code_reportante} {ticket.telefono_reportante || 'No disponible'}</p>
            </div>
          </div>
        </div>

        {/* Información del asignado */}
        {ticket.nombre_asignado && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <Label className="text-base font-medium mb-3 block">Asignado a</Label>
            <p>{ticket.nombre_asignado}</p>
          </div>
        )}

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-600">Fecha de Creación</Label>
            <p className="text-sm">{formatearFecha(ticket.fecha_creacion)}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Última Actualización</Label>
            <p className="text-sm">{formatearFecha(ticket.fecha_actualizacion)}</p>
          </div>
        </div>

        {/* Motivo de cierre (si aplica) */}
        {ticket.motivo_cierre && (
          <div className="p-4 bg-yellow-50 rounded-lg">
            <Label className="text-base font-medium mb-2 block">Motivo de Cierre</Label>
            <p className="text-sm">{ticket.motivo_cierre}</p>
          </div>
        )}
      </div>
    );
  };

  // Función para manejar acciones
  const handleAccion = (accion, ticket) => {
    switch (accion) {
      case 'ver':
        console.log('Ver ticket:', ticket);
        setDialogConfig({
          title: `Ticket #${ticket.id} - ${ticket.asunto}`,
          description: 'Información completa del ticket',
          content: <CardVerDetallesTicket ticket={ticket} />
        });
        setOpenDialog(true);
        break;
      case 'abrir':
        console.log('Abrir ticket:', ticket);
        toast.info('Abriendo ticket...');
        navigate(`/${SoporteAyudaRoutes.ticketDetalle(ticket.id)}`);
        // Aquí iría la lógica para abrir el ticket
        break;
      case 'cerrar':
        console.log('Cerrar ticket:', ticket);
        setDialogConfig({
          title: 'Cerrar Ticket',
          description: '¿Está seguro que desea cerrar este ticket?',
          content: (
            <div className="space-y-4">
              <p>Esta acción marcará el ticket como cerrado.</p>
              <div className="p-4 bg-yellow-50 rounded-md">
                <p className="text-yellow-800 font-medium">Ticket: {ticket.asunto}</p>
                <p className="text-yellow-600 text-sm">#{ticket.id}</p>
              </div>
            </div>
          ),
          actions: (
            <>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button 
                variant="destructive" 
                onClick={() => {
                  toast.success('Ticket cerrado exitosamente');
                  setOpenDialog(false);
                }}
              >
                Cerrar Ticket
              </Button>
            </>
          )
        });
        setOpenDialog(true);
        break;
      case 'completar':
        console.log('Completar ticket:', ticket);
        toast.success('Ticket marcado como completado');
        break;
      default:
        break;
    }
  };

  // Definición de columnas
  const columnas = [
    // ID
    defaultColumnas.id && {
      header: "ID",
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium">#{row.original.id}</span>
      ),
    },
    
    // Asunto
    defaultColumnas.asunto && {
      header: "Asunto",
      cell: ({ row }) => (
        <div className="max-w-[200px]">
          <p className="truncate font-medium" title={row.original.asunto}>
            {row.original.asunto}
          </p>
        </div>
      ),
    },
    
    // Estado
    defaultColumnas.estado && {
      header: "Estado",
      cell: ({ row }) => (
        <Badge className={`${getEstadoColor(row.original.id_estado)} text-white text-xs`}>
          {getEstadoTexto(row.original.id_estado)}
        </Badge>
      ),
    },

    // Prioridad
    defaultColumnas.prioridad && {
      header: "Prioridad",
      cell: ({ row }) => (
        <Badge className={`${getPrioridadColor(row.original.prioridad)} text-white text-xs`}>
          {getPrioridadTexto(row.original.prioridad)}
        </Badge>
      ),
    },

    // Tipo de Ticket
    defaultColumnas.tipo_ticket && {
      header: "Tipo",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.descripcion_tipo || 'N/A'}</span>
      ),
    },

    // Reportante
    defaultColumnas.reportante && {
      header: "Reportante",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.nombre_usuario_reportante || 'No disponible'}</span>
      ),
    },

    // Asignado
    defaultColumnas.asignado && {
      header: "Asignado",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.nombre_asignado || 'Sin asignar'}</span>
      ),
    },

    // Teléfono del reportante
    (defaultColumnas.dial_code_reportante || defaultColumnas.telefono_reportante) && {
      header: "Teléfono",
      cell: ({ row }) => {
        const dialCode = row.original.dial_code_reportante || '';
        const telefono = row.original.telefono_reportante || '';
        return (
          <span className="text-sm font-mono">
            {dialCode} {telefono || 'N/A'}
          </span>
        );
      },
    },
    
    // Fecha de creación
    defaultColumnas.fecha_creacion && {
      header: "Creado",
      cell: ({ row }) => {
        const fecha = row.original.fecha_creacion;
        return fecha ? (
          <span className="text-sm">
            {new Date(fecha).toLocaleDateString('es-ES')}
          </span>
        ) : 'N/A';
      },
    },

    // Fecha de actualización
    defaultColumnas.fecha_actualizacion && {
      header: "Actualizado",
      cell: ({ row }) => {
        const fecha = row.original.fecha_actualizacion;
        return fecha ? (
          <span className="text-sm">
            {new Date(fecha).toLocaleDateString('es-ES')}
          </span>
        ) : 'N/A';
      },
    },
    
    // Acciones
    defaultColumnas.acciones && {
      header: "Acciones",
      cell: ({ row }) => {
        const ticket = row.original;
        return (
          <div className="flex gap-1">
            {defaultOpciones.mostrarVer && (
              <Button
                onClick={() => handleAccion('ver', ticket)}
                variant="outline"
                size="icon"
                className="h-8 w-8"
                title="Ver detalles"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            
            
            {defaultOpciones.mostrarAbrir && ticket.id_estado === 1 && (
              <Button
                onClick={() => handleAccion('abrir', ticket)}
                variant="outline"
                size="icon"
                className="h-8 w-8 text-green-600 hover:text-green-700"
                title="Abrir ticket"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            )}

            {defaultOpciones.mostrarCompletar && [2, 3, 4, 5].includes(ticket.id_estado) && (
              <Button
                onClick={() => handleAccion('completar', ticket)}
                variant="outline"
                size="icon"
                className="h-8 w-8 text-green-600 hover:text-green-700"
                title="Completar ticket"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}

            {defaultOpciones.mostrarCerrar && [2, 3, 4, 5].includes(ticket.id_estado) && (
              <Button
                onClick={() => handleAccion('cerrar', ticket)}
                variant="outline"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700"
                title="Cerrar ticket"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ].filter(Boolean); // Filtrar columnas deshabilitadas

  return (
    <>
      <DataTable 
        columns={columnas} 
        data={data} 
        placeholder="Buscar tickets..." 
        pageSize={10}
        options={{ ocultar_boton_ver_columnas: false }}
      />

      {/* Dialog para acciones */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className={
          dialogConfig.title?.includes('Ticket #') 
            ? "sm:max-w-[800px] max-h-[90vh] overflow-y-auto" 
            : "sm:max-w-[500px]"
        }>
          <DialogHeader>
            <DialogTitle>{dialogConfig.title}</DialogTitle>
            <DialogDescription>{dialogConfig.description}</DialogDescription>
          </DialogHeader>
          
          {dialogConfig.content && (
            <div className="py-4">
              {dialogConfig.content}
            </div>
          )}
          
          <DialogFooter>
            {dialogConfig.actions ? (
              dialogConfig.actions
            ) : (
              <DialogClose asChild>
                <Button variant="outline">Cerrar</Button>
              </DialogClose>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}