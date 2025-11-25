/**
 * Ejemplos de uso de los componentes de notificaciones
 * 
 * Este archivo contiene ejemplos prácticos de cómo usar los componentes
 * del sistema de notificaciones en diferentes escenarios.
 */

// ============================================================================
// EJEMPLO 1: Uso básico del componente principal
// ============================================================================

import React from 'react';
import MisNotificacionesPage from './pages/MisNotificacionesPage';

export function EjemploUsoBasico() {
  return (
    <div className="min-h-screen bg-background">
      {/* El componente maneja todo internamente */}
      <MisNotificacionesPage />
    </div>
  );
}

// ============================================================================
// EJEMPLO 2: Uso individual de componentes
// ============================================================================

import { 
  FiltrosNotificacionesForm, 
  ListaNotificacionesInfinita 
} from './components';

export function EjemploUsoIndividual() {
  const [filtros, setFiltros] = React.useState({});
  const [tiposNotificacion] = React.useState(tiposNotificacionEjemplo);

  const handleFiltrosChange = (nuevosFiltros) => {
    console.log('Filtros aplicados:', nuevosFiltros);
    setFiltros(nuevosFiltros);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Formulario de filtros personalizado */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Filtrar Notificaciones</h2>
        <FiltrosNotificacionesForm
          tiposNotificacion={tiposNotificacion}
          onSubmit={handleFiltrosChange}
        />
      </div>

      {/* Lista con configuración personalizada */}
      <ListaNotificacionesInfinita
        filtros={filtros}
        limitPorPagina={15} // Más elementos por página
      />
    </div>
  );
}

// ============================================================================
// EJEMPLO 3: Integración con otros filtros personalizados
// ============================================================================

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { tiposNotificacionEjemplo, configuracionesPorRol } from './datos-ejemplo';

export function EjemploConFiltrosPersonalizados() {
  const [filtros, setFiltros] = React.useState({});
  const [filtrosRapidos] = React.useState([
    { label: 'Últimos 7 días', filtro: { fecha_desde: '2023-11-11' } },
    { label: 'No leídas', filtro: { id_estado: 5 } },
    { label: 'Sistema', filtro: { tipo_notificacion: 3 } },
  ]);

  const aplicarFiltroRapido = (filtro) => {
    setFiltros(filtro);
  };

  return (
    <div className="space-y-6">
      {/* Filtros rápidos personalizados */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium">Filtros rápidos:</span>
        {filtrosRapidos.map((item, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => aplicarFiltroRapido(item.filtro)}
          >
            {item.label}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFiltros({})}
        >
          Limpiar
        </Button>
      </div>

      {/* Mostrar filtros activos */}
      {Object.keys(filtros).length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Filtros activos:</span>
          {Object.entries(filtros).map(([key, value]) => (
            <Badge key={key} variant="secondary">
              {key}: {value}
            </Badge>
          ))}
        </div>
      )}

      {/* Lista de notificaciones */}
      <ListaNotificacionesInfinita
        filtros={filtros}
        limitPorPagina={10}
      />
    </div>
  );
}

// ============================================================================
// EJEMPLO 4: Manejo de eventos y callbacks personalizados
// ============================================================================

export function EjemploConEventosPersonalizados() {
  const [estadisticas, setEstadisticas] = React.useState({
    totalFiltradas: 0,
    ultimaActualizacion: null,
  });

  // Interceptar y procesar filtros antes de enviarlos
  const handleFiltros = (filtros) => {
    console.log('Procesando filtros:', filtros);
    
    // Actualizar estadísticas
    setEstadisticas(prev => ({
      ...prev,
      ultimaActualizacion: new Date().toLocaleTimeString(),
    }));

    // Aquí podrías agregar lógica adicional como:
    // - Logging/analytics
    // - Validaciones personalizadas  
    // - Transformaciones de datos
    
    return filtros;
  };

  return (
    <div className="space-y-4">
      {/* Panel de estadísticas */}
      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Estadísticas</h3>
        <p className="text-sm text-muted-foreground">
          Última actualización: {estadisticas.ultimaActualizacion || 'Nunca'}
        </p>
      </div>

      {/* Componente principal con callbacks */}
      <MisNotificacionesPage 
        onFiltrosChange={handleFiltros}
      />
    </div>
  );
}

// ============================================================================
// EJEMPLO 5: Configuración avanzada y personalización
// ============================================================================

export function EjemploConfiguracionAvanzada() {
  const [rolUsuario] = React.useState('usuario'); // Vendría del contexto de auth
  const config = configuracionesPorRol[rolUsuario];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Panel de Notificaciones</h1>
        <p className="text-muted-foreground">Rol: {rolUsuario}</p>
      </div>

      {/* Lista con configuración basada en rol */}
      <ListaNotificacionesInfinita
        filtros={{}}
        limitPorPagina={config.limitPorPagina}
      />
    </div>
  );
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export default {
  EjemploUsoBasico,
  EjemploUsoIndividual,
  EjemploConFiltrosPersonalizados,
  EjemploConEventosPersonalizados,
  EjemploConfiguracionAvanzada,
};