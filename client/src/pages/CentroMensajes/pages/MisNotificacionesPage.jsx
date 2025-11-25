import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import api from '@/apis/axiosBase';

// Componentes locales
import { FiltrosNotificacionesForm, ListaNotificacionesInfinita } from '../components';

export default function MisNotificacionesPage() {
  // Estados locales
  const [filtrosActuales, setFiltrosActuales] = useState({});
  const [tiposNotificacion, setTiposNotificacion] = useState([]);
  const [isLoadingTipos, setIsLoadingTipos] = useState(true);

  /**
   * Cargar tipos de notificación disponibles al montar el componente
   */
  useEffect(() => {
    const loadTiposNotificacion = async () => {
      try {
        setIsLoadingTipos(true);
        
        // Hacer una consulta inicial para obtener los tipos disponibles
        const response = await api.get('/notificaciones/mis-notificaciones', {
          params: { limit: 1 },
          withCredentials: true,
        });
        
        const tiposDisponibles = response.data?.data?.tipos_disponibles || [];
        setTiposNotificacion(tiposDisponibles);
        
      } catch (error) {
        console.error('Error al cargar tipos de notificación:', error);
        toast.error('Error al cargar los filtros');
        // Usar tipos por defecto en caso de error
        setTiposNotificacion([]);
      } finally {
        setIsLoadingTipos(false);
      }
    };

    loadTiposNotificacion();
  }, []);

  /**
   * Manejar el envío de filtros desde el formulario
   * @param {import('../types/notificaciones.types.js').FiltrosNotificaciones} filtros
   */
  const handleFiltrosSubmit = (filtros) => {
    setFiltrosActuales(filtros);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Mis Notificaciones
          </h1>
          <p className="text-muted-foreground">
            Mantente al día con todas tus notificaciones importantes
          </p>
        </div>

        {/* Card con filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros de búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTipos ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Cargando filtros...</p>
              </div>
            ) : (
              <FiltrosNotificacionesForm
                tiposNotificacion={tiposNotificacion}
                onSubmit={handleFiltrosSubmit}
              />
            )}
          </CardContent>
        </Card>

        {/* Lista infinita de notificaciones */}
        <ListaNotificacionesInfinita
          filtros={filtrosActuales}
          limitPorPagina={10}
        />
      </div>
    </div>
  );
}
