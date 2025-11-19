import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import api from '@/apis/axiosBase';

/**
 * Componente de lista infinita de notificaciones
 * @param {import('../types/notificaciones.types.js').ListaNotificacionesInfinitaProps} props
 */
export default function ListaNotificacionesInfinita({ filtros, limitPorPagina = 10 }) {
  // Estado del componente
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [error, setError] = useState(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Ref para el sentinel del scroll infinito
  const loadMoreRef = useRef();
  const observerRef = useRef();

  /**
   * Función para cargar notificaciones del backend
   */
  const loadNotificaciones = useCallback(async (pageNumber, reset = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      const params = {
        ...filtros,
        page: pageNumber,
        limit: limitPorPagina,
      };

      const response = await api.get('/notificaciones/mis-notificaciones', { 
        params,
        withCredentials: true,
      });

      const data = response.data;
      const nuevasNotificaciones = data.data?.notificaciones || [];

      if (reset) {
        setItems(nuevasNotificaciones);
      } else {
        setItems(prev => [...prev, ...nuevasNotificaciones]);
      }

      setHasNext(data.hasNext || false);
      setPage(pageNumber);

    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      setError('Error al cargar las notificaciones');
      
      if (reset) {
        toast.error('Error al cargar las notificaciones');
        setItems([]);
      } else {
        toast.error('Error al cargar más notificaciones');
      }
    } finally {
      if (reset) {
        setIsLoading(false);
        setIsFirstLoad(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, [filtros, limitPorPagina]);

  /**
   * Efecto para resetear y cargar cuando cambian los filtros
   */
  useEffect(() => {
    setPage(1);
    setItems([]);
    setHasNext(false);
    loadNotificaciones(1, true);
  }, [loadNotificaciones]);

  /**
   * Configuración del IntersectionObserver para scroll infinito
   */
  useEffect(() => {
    const currentLoadMoreRef = loadMoreRef.current;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (
          target.isIntersecting && 
          hasNext && 
          !isLoadingMore && 
          !isLoading
        ) {
          loadNotificaciones(page + 1, false);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '20px',
      }
    );

    if (currentLoadMoreRef) {
      observerRef.current.observe(currentLoadMoreRef);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNext, isLoadingMore, isLoading, page, loadNotificaciones]);

  /**
   * Función para formatear fecha
   */
  const formatFecha = (fechaString) => {
    try {
      return format(new Date(fechaString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  /**
   * Función para obtener el badge del estado
   */
  const getEstadoBadge = (estado, descripcion_estado) => {
    switch (estado) {
      case 1: // Pendiente
        return {
          variant: "secondary",
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
          text: descripcion_estado || "Pendiente"
        };
      case 2: // Enviada
        return {
          variant: "secondary", 
          className: "bg-blue-100 text-blue-800 border-blue-200",
          text: descripcion_estado || "Enviada"
        };
      case 3: // Leído
        return {
          variant: "secondary", 
          className: "bg-green-100 text-green-800 border-green-200",
          text: descripcion_estado || "Leído"
        };
      case 4: // Error
        return {
          variant: "secondary",
          className: "bg-red-100 text-red-800 border-red-200",
          text: descripcion_estado || "Error"
        };
      case 5: // No leído
        return {
          variant: "secondary",
          className: "bg-gray-100 text-gray-800 border-gray-200",
          text: descripcion_estado || "No leído"
        };
      default:
        return {
          variant: "secondary",
          className: "bg-gray-100 text-gray-800 border-gray-200",
          text: descripcion_estado || "Desconocido"
        };
    }
  };

  /**
   * Componente de skeleton para carga inicial
   */
  const NotificationSkeleton = () => (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="flex justify-between items-start">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Loading inicial con skeletons
  if (isLoading && isFirstLoad) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <NotificationSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Estado de error
  if (error && items.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error al cargar notificaciones</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => loadNotificaciones(1, true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Reintentar
          </button>
        </CardContent>
      </Card>
    );
  }

  // Lista vacía
  if (items.length === 0 && !isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay notificaciones</h3>
          <p className="text-muted-foreground">
            No se encontraron notificaciones con los filtros aplicados.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Lista de notificaciones */}
      {items.map((notificacion) => {
        const estadoBadge = getEstadoBadge(
          notificacion.id_estado_notificacion, 
          notificacion.descripcion_estado
        );
        
        return (
          <Card key={notificacion.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Icono */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Bell className="h-6 w-6 text-primary" />
                  </div>
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  {/* Header con título y estado */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                    <h3 className="text-lg font-semibold text-foreground line-clamp-2">
                      {notificacion.titulo}
                    </h3>
                    <Badge 
                      variant={estadoBadge.variant}
                      className={estadoBadge.className}
                    >
                      {estadoBadge.text}
                    </Badge>
                  </div>

                  {/* Cuerpo del mensaje */}
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {notificacion.cuerpo}
                  </p>

                  {/* Footer con fecha y tipo */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>{formatFecha(notificacion.fecha_creacion)}</span>
                    </div>
                    
                    <Badge variant="outline">
                      {notificacion.descripcion_tipo_notificacion}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Sentinel para scroll infinito */}
      <div ref={loadMoreRef} />

      {/* Indicador de carga para más páginas */}
      {isLoadingMore && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-muted-foreground">Cargando más notificaciones...</span>
        </div>
      )}

      {/* Mensaje cuando no hay más elementos */}
      {!hasNext && items.length > 0 && !isLoadingMore && (
        <div className="text-center py-6">
          <p className="text-muted-foreground">
            No hay más notificaciones que mostrar
          </p>
        </div>
      )}
    </div>
  );
}