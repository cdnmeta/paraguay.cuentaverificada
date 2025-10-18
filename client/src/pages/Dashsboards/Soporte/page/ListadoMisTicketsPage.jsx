import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import FiltroTickets from '../components/FiltroTickets';
import ListadoTickets from '@/pages/SoporteAyuda/components/ListadoTickets';
import { listadoTicketsSoporte } from '@/apis/tickets.api';

export default function ListadoMisTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtrosActuales, setFiltrosActuales] = useState({});
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    nuevos: 0,
    abiertos: 0,
    pendientes: 0
  });

  // Configuración de columnas para el listado (vista de soporte)
  const columnasHabilitadas = {
    id: true,
    asunto: true,
    estado: true,
    prioridad: true,
    tipo_ticket: true,
    reportante: true,
    telefono_reportante: false, // Los soportes no ven teléfonos completos
    fecha_creacion: true,
    fecha_actualizacion: true,
    acciones: true,
    // Campos que no necesita el soporte
    asignado: false, // No necesita ver a quién está asignado (es a él mismo)
    dial_code_reportante: false
  };

  // Configuración de opciones para el listado (vista de soporte)
  const opcionesHabilitadas = {
    mostrarVer: true,
    mostrarResponder: true,
    mostrarAbrir: true, // Puede abrir tickets nuevos
    mostrarCompletar: true, // Puede completar tickets
    mostrarCerrar: false // No puede cerrar tickets (solo admin)
  };


  // Cargar tickets iniciales
  useEffect(() => {
    // Función para cargar tickets iniciales
    const cargarTicketsIniciales = async () => {
      // obterner querys de la url para filtros iniciales
      const query = new URLSearchParams(window.location.search);
      const estados = query.get('estado');
      const prioridad = query.get('prioridad');
      const params = {}

      switch (estados) {
        case 'nuevo':
          params.id_estado = 1;
          break;
        case 'abierto':
          params.id_estado = 2;
          break;
        case 'pendiente_soporte':
          params.id_estado = 4;
          break;
      }

      if (prioridad === 'alta') {
        params.prioridad = 1;
      }else if(prioridad === 'media'){
        params.prioridad = 2;
      }else if(prioridad === 'baja'){
        params.prioridad = 3;
      }


      setLoading(true);
      try {
        const response = await listadoTicketsSoporte(params);
        const ticketsData = response.data || [];
        
        setTickets(ticketsData);
        calcularEstadisticas(ticketsData);
        setFiltrosActuales({});
      } catch (error) {
        console.error('Error al cargar tickets:', error);
        toast.error('Error al cargar los tickets');
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    cargarTicketsIniciales();
  }, []);

  // Función para cargar tickets
  const cargarTickets = async (filtros = {}) => {
    setLoading(true);
    try {
      const response = await listadoTicketsSoporte(filtros);
      const ticketsData = response.data || [];
      
      setTickets(ticketsData);
      calcularEstadisticas(ticketsData);
      setFiltrosActuales(filtros);
      
      if (Object.keys(filtros).length > 0) {
        toast.success(`Se encontraron ${ticketsData.length} tickets con los filtros aplicados`);
      }
    } catch (error) {
      console.error('Error al cargar tickets:', error);
      toast.error('Error al cargar los tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas de los tickets
  const calcularEstadisticas = (ticketsData) => {
    const stats = {
      total: ticketsData.length,
      nuevos: ticketsData.filter(t => t.id_estado === 1).length,
      abiertos: ticketsData.filter(t => t.id_estado === 2).length,
      pendientes: ticketsData.filter(t => [3, 4, 5].includes(t.id_estado)).length
    };
    setEstadisticas(stats);
  };

  // Manejar filtrado
  const handleFiltrar = (filtros) => {
    cargarTickets(filtros);
  };

  // Manejar limpieza de filtros
  const handleLimpiarFiltros = () => {
    setFiltrosActuales({});
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Tickets Asignados</h1>
          <p className="text-muted-foreground">
            Gestiona los tickets que tienes asignados como soporte
          </p>
        </div>
      </div>


      {/* Componente de filtros */}
      <FiltroTickets
        onFiltrar={handleFiltrar}
        onLimpiar={handleLimpiarFiltros}
        loading={loading}
      />

      {/* Listado de tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              Listado de Tickets
              {Object.keys(filtrosActuales).length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  Filtrado
                </Badge>
              )}
            </span>
            {loading && (
              <Loader2 className="h-5 w-5 animate-spin" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Cargando tickets...</p>
              </div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay tickets</h3>
                <p className="text-muted-foreground">
                  {Object.keys(filtrosActuales).length > 0 
                    ? 'No se encontraron tickets con los filtros aplicados'
                    : 'No tienes tickets asignados en este momento'
                  }
                </p>
              </div>
            </div>
          ) : (
            <ListadoTickets
              data={tickets}
              columnas_habilitar={columnasHabilitadas}
              opciones_habilitar={opcionesHabilitadas}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
