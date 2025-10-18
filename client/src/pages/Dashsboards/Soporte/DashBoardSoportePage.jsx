import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Ticket, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  TrendingUp,
  Plus,
  MessageSquare,
  XCircle,
  Pause
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getResumenMisTickets } from '@/apis/tickets.api';
import { routes } from './config/route';

export default function DashBoardSoportePage() {
  const [statsData, setStatsData] = useState([]);
  const [secondaryStats, setSecondaryStats] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResumenTickets = async () => {
      try {
        setLoading(true);
        const response = await getResumenMisTickets();
        const data = response.data;
        
        // Mapear los datos de la API a las estadísticas principales del dashboard
        const mappedStats = [
          {
            title: 'Total Tickets',
            value: data.cant_total_tickets.toString(),
            description: 'Tickets totales en el sistema',
            icon: Ticket,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
          },
          {
            title: 'Nuevos',
            value: data.cant_nuevos.toString(),
            description: 'Tickets recién creados',
            icon: Plus,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
          },
          {
            title: 'Pendiente Soporte',
            value: data.cant_pend_soporte.toString(),
            description: 'Esperando respuesta del soporte',
            icon: Clock,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100',
          },
          {
            title: 'Resueltos',
            value: data.cant_resueltos.toString(),
            description: 'Tickets resueltos',
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
          },
        ];

        // Estadísticas secundarias
        const mappedSecondaryStats = [
          {
            title: 'Abiertos',
            value: data.cant_abiertos.toString(),
            description: 'Tickets en estado abierto',
            icon: MessageSquare,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
          },
          {
            title: 'Pendiente Cliente',
            value: data.cant_pend_cliente.toString(),
            description: 'Esperando respuesta del cliente',
            icon: Users,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
          },
          {
            title: 'En Espera',
            value: data.cant_en_espera.toString(),
            description: 'Tickets pausados',
            icon: Pause,
            color: 'text-gray-600',
            bgColor: 'bg-gray-50',
          },
          {
            title: 'Cerrados',
            value: data.cant_cerrados.toString(),
            description: 'Tickets finalizados',
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
          },
        ];

        setStatsData(mappedStats);
        setSecondaryStats(mappedSecondaryStats);
        
        // Procesar tickets recientes de la API
        if (data.tickets_recientes && Array.isArray(data.tickets_recientes)) {
          const processedTickets = data.tickets_recientes.map(ticket => ({
            id: ticket.id,
            subject: ticket.descripcion,
            priority: getPriorityText(ticket.prioridad),
            status: 'Nuevo', // Asumiendo que los tickets recientes son nuevos
            user: ticket.reportante,
            time: formatTimeAgo(ticket.fecha_creacion),
            originalData: ticket
          }));
          setRecentTickets(processedTickets);
        } else {
          setRecentTickets([]);
        }
      } catch (err) {
        setError('Error al cargar las estadísticas');
        console.error('Error fetching stats:', err);
        
        // Datos de respaldo en caso de error
        setStatsData([
          {
            title: 'Total Tickets',
            value: '0',
            description: 'Error al cargar datos',
            icon: Ticket,
            color: 'text-gray-600',
            bgColor: 'bg-gray-100',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchResumenTickets();
  }, []);

  // Función auxiliar para convertir prioridad numérica a texto
  const getPriorityText = (prioridadNum) => {
    switch (prioridadNum) {
      case 1: return 'Alta';
      case 2: return 'Media'; 
      case 3: return 'Baja';
      default: return 'Media';
    }
  };

  // Función auxiliar para formatear tiempo relativo
  const formatTimeAgo = (fechaCreacion) => {
    const now = new Date();
    const createdDate = new Date(fechaCreacion);
    const diffMs = now - createdDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `Hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Media': return 'bg-yellow-100 text-yellow-800';
      case 'Baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'En Proceso': return 'bg-blue-100 text-blue-800';
      case 'Resuelto': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Soporte</h1>
          <p className="text-gray-600 mt-1">Panel de control para gestión de tickets de soporte</p>
        </div>
      </div>

      {/* Estadísticas */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                <div className="p-2 rounded-full bg-gray-100">
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              {error}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Estadísticas Secundarias */}
      {!loading && !error && secondaryStats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {secondaryStats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden border-l-4" style={{borderLeftColor: stat.color.replace('text-', '#')}}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tickets Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Tickets Recientes
            </CardTitle>
            <CardDescription>
              Últimos tickets creados en el sistema y asignados a ti
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-48 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Error al cargar tickets recientes
              </div>
            ) : recentTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <MessageSquare className="h-8 w-8 mb-2" />
                <p>No hay tickets recientes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTickets.map((ticket, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-blue-600">#T-{ticket.id}</span>
                        <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <Button className={'bg-green-500'}>
                          <Link to={`/${routes.ticketDetail(ticket.id)}`} className="text-xs">Ver Detalle</Link>
                        </Button>
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate" title={ticket.subject}>
                        {ticket.subject}
                      </p>
                      <p className="text-xs text-gray-500">
                        {ticket.user} • {ticket.time}
                      </p>
                    </div>
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link to={`/${routes.ticketsListado}`}>
                  Ver Todos los tickets
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Acciones Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Acciones Rápidas
            </CardTitle>
            <CardDescription>
              Herramientas frecuentemente utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to={`/${routes.ticketsListado}`}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Ver mis tickets asignados
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to={`/${routes.ticketsListado}?estado=pendiente_soporte`}>
                  <Clock className="h-4 w-4 mr-2" />
                  Tickets Pendientes Responder
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to={`/${routes.ticketsListado}?prioridad=alta`}>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Tickets urgentes
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Bienvenido al Sistema de Soporte</CardTitle>
          <CardDescription>
            Desde este panel puedes gestionar todos los aspectos del soporte técnico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">📋 Ver Tickets</h3>
              <p className="text-sm text-gray-600">
                Ver, Abrir y solucionar tickets de soporte de manera eficiente
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">📊 Reportes y Análisis</h3>
              <p className="text-sm text-gray-600">
                Buscar y ver tickets por estado, prioridad o usuario
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}