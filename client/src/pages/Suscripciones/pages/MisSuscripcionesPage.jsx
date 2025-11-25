import { getMisSuscripciones } from '@/apis/suscripciones.api';
import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  Calendar, 
  CreditCard, 
  Package,
  Receipt,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MisSuscripcionesPage() {
  const [suscripciones, setSuscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroAño, setFiltroAño] = useState('todos');

  useEffect(() => {
    const loadMisSuscripciones = async () => {
      try {
        setLoading(true);
        const response = await getMisSuscripciones();
        setSuscripciones(response.data);
      } catch (err) {
        setError('Error al cargar las suscripciones');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadMisSuscripciones();
  }, []);

  const getEstadoBadgeColor = (estado) => {
    switch (estado.toLowerCase()) {
      case 'activa':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'vencida':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFacturaEstadoBadge = (estado) => {
    switch (estado) {
      case 2: // pagada
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle className="w-3 h-3" />,
          text: 'Pagada'
        };
      case 1: // pendiente
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Clock className="w-3 h-3" />,
          text: 'Pendiente'
        };
      case 0: // cancelada
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <XCircle className="w-3 h-3" />,
          text: 'Cancelada'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <Clock className="w-3 h-3" />,
          text: 'Desconocido'
        };
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  // Obtener años disponibles para el filtro
  const añosDisponibles = useMemo(() => {
    const años = [...new Set(suscripciones.map(suscripcion => {
      try {
        return new Date(suscripcion.fecha_creacion).getFullYear();
      } catch {
        return null;
      }
    }).filter(año => año !== null))];
    return años.sort((a, b) => b - a); // Ordenar de más reciente a más antiguo
  }, [suscripciones]);

  // Filtrar suscripciones por año
  const suscripcionesFiltradas = useMemo(() => {
    if (filtroAño === 'todos') return suscripciones;
    
    return suscripciones.filter(suscripcion => {
      try {
        const añoSuscripcion = new Date(suscripcion.fecha_creacion).getFullYear();
        return añoSuscripcion === parseInt(filtroAño);
      } catch {
        return false;
      }
    });
  }, [suscripciones, filtroAño]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando suscripciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 space-y-6">
      {/* Header con filtro */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <Package className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Mis Suscripciones</h1>
        </div>
        
        {/* Filtro por año */}
        {añosDisponibles.length > 0 && (
          <div className="flex items-center space-x-3">
            <div className="text-sm text-muted-foreground">
              {suscripcionesFiltradas.length} de {suscripciones.length} suscripciones
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={filtroAño} onValueChange={setFiltroAño}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por año" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los años</SelectItem>
                  {añosDisponibles.map((año) => (
                    <SelectItem key={año} value={año.toString()}>
                      {año}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {suscripciones.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tienes suscripciones activas</p>
          </CardContent>
        </Card>
      ) : suscripcionesFiltradas.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay suscripciones para el año seleccionado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="w-full space-y-6">
          {suscripcionesFiltradas.map((suscripcion) => (
            <Card key={suscripcion.id_suscripcion} className="shadow-lg">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    <span>{suscripcion.razon_social}</span>
                  </CardTitle>
                  <Badge className={getEstadoBadgeColor(suscripcion.descripcion_estado_suscripcion)}>
                    {suscripcion.descripcion_estado_suscripcion.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Información de la suscripción */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">RUC</p>
                    <p className="text-sm font-mono">{suscripcion.ruc}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Plan</p>
                    <p className="text-sm font-semibold">{suscripcion.nombre_plan}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Fecha de Creación</span>
                    </p>
                    <p className="text-sm">{formatDate(suscripcion.fecha_creacion)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Fecha de Vencimiento</span>
                    </p>
                    <p className="text-sm">{formatDate(suscripcion.fecha_vencimiento)}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Descripción del Plan</p>
                  <p className="text-sm">{suscripcion.descripcion_plan}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Monto:</span>
                  <span className="text-lg font-bold text-green-600">
                    ${suscripcion.monto_suscripcion}
                  </span>
                </div>

                {/* Facturas asociadas */}
                {suscripcion.facturas && suscripcion.facturas.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center space-x-2">
                        <Receipt className="w-4 h-4" />
                        <span>Facturas Asociadas ({suscripcion.facturas.length})</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 w-full">
                        {suscripcion.facturas.map((factura) => {
                          const estadoBadge = getFacturaEstadoBadge(factura.estado);
                          return (
                            <Card key={factura.id} className="border-l-4 border-l-primary bg-muted/20">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium text-muted-foreground">
                                    Factura #{factura.id}
                                  </span>
                                  <Badge className={`${estadoBadge.color} text-xs flex items-center space-x-1`}>
                                    {estadoBadge.icon}
                                    <span>{estadoBadge.text}</span>
                                  </Badge>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Monto:</span>
                                    <span className="text-sm font-semibold">
                                      ${factura.monto} {factura.sigla_iso}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Moneda:</span>
                                    <span className="text-sm">{factura.moneda}</span>
                                  </div>
                                  {factura.fecha_creacion && (
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-muted-foreground">Emisión:</span>
                                      <span className="text-sm">{formatDate(factura.fecha_creacion)}</span>
                                    </div>
                                  )}
                                  {factura.nro_factura && (
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-muted-foreground">N° Factura:</span>
                                      <span className="text-sm font-mono">{factura.nro_factura}</span>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
