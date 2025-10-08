// Ejemplo de cómo usar el store de comercio desde cualquier componente

import React from 'react';
import { useNavigate } from 'react-router-dom';
import useComercioStore from '@/store/useComercioStore';

export default function EjemploUsoComercioStore() {
  const navigate = useNavigate();
  const { 
    comercioActual, 
    loading, 
    error, 
    cargarComercio, 
    reintentarCarga,
    limpiarComercioActual 
  } = useComercioStore();

  // Ejemplo 1: Cargar comercio por slug
  const handleCargarComercio = async (slug) => {
    try {
      const comercio = await cargarComercio(slug, navigate);
      console.log('Comercio cargado:', comercio);
    } catch (error) {
      console.error('Error al cargar comercio:', error);
    }
  };

  // Ejemplo 2: Reintentar carga
  const handleReintentarCarga = () => {
    const slug = 'ejemplo-slug';
    reintentarCarga(slug, navigate);
  };

  // Ejemplo 3: Limpiar comercio actual
  const handleLimpiarComercio = () => {
    limpiarComercioActual();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Ejemplo de uso del Store de Comercio</h2>
      
      {/* Estado de carga */}
      {loading && <p className="text-blue-600">Cargando...</p>}
      
      {/* Mostrar error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Mostrar comercio actual */}
      {comercioActual && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <h3 className="font-bold">Comercio Actual:</h3>
          <p>Razón Social: {comercioActual.razon_social}</p>
          <p>RUC: {comercioActual.ruc}</p>
          <p>NUV: {comercioActual.codigo_nuv}</p>
        </div>
      )}
      
      {/* Botones de ejemplo */}
      <div className="space-x-2">
        <button
          onClick={() => handleCargarComercio('ejemplo-slug')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Cargar Comercio
        </button>
        
        <button
          onClick={handleReintentarCarga}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Reintentar Carga
        </button>
        
        <button
          onClick={handleLimpiarComercio}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Limpiar Comercio
        </button>
      </div>
    </div>
  );
}