import { useState, useEffect } from 'react';
import { getCotizacionesEmpresa } from '@/apis/cotizacion-empresa.api';
import { convertirMoneda } from '@/utils/funciones';
import { toast } from 'sonner';

/**
 * Hook personalizado para manejar cotizaciones de moneda y conversiones
 * @returns {Object} Objeto con cotizaciones, estado de carga y función de formateo
 */
export function useCotizacionesMoneda() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar cotizaciones al montar el componente
  useEffect(() => {
    cargarCotizaciones();
  }, []);

  const cargarCotizaciones = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCotizacionesEmpresa();
      setCotizaciones(response?.data || []);
    } catch (error) {
      console.error('Error al cargar cotizaciones:', error);
      setError(error);
      toast.error('Error al cargar las cotizaciones de moneda');
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear precio en diferentes monedas
  const formatearPrecio = (precioUSD) => {
    if (loading || cotizaciones.length === 0) {
      return {
        usd: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(precioUSD),
        pyg: loading ? 'Cargando...' : 'No disponible'
      };
    }

    try {
      // Convertir de USD (ID: 1) a PYG (ID: 2)
      const conversionPYG = convertirMoneda(cotizaciones, precioUSD, 1, 2);
      
      return {
        usd: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(precioUSD),
        pyg: new Intl.NumberFormat('es-PY', {
          style: 'currency',
          currency: 'PYG',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(conversionPYG.venta)
      };
    } catch (error) {
      console.error('Error en conversión de moneda:', error);
      return {
        usd: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(precioUSD),
        pyg: 'No disponible'
      };
    }
  };

  // Función para convertir un monto específico
  const convertirMonto = (monto, monedaOrigen, monedaDestino) => {
    if (cotizaciones.length === 0) {
      throw new Error('No hay cotizaciones disponibles');
    }

    return convertirMoneda(cotizaciones, monto, monedaOrigen, monedaDestino);
  };

  // Función para recargar cotizaciones manualmente
  const recargarCotizaciones = () => {
    cargarCotizaciones();
  };

  return {
    cotizaciones,
    loading,
    error,
    formatearPrecio,
    convertirMonto,
    recargarCotizaciones
  };
}