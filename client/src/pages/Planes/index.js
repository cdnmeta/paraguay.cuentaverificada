// Exportaciones principales del módulo de Planes
export { default as PlanesPage } from './pages/PlanesPage.jsx';
export { default as PlanCard } from './components/PlanCard.jsx';
export { default as PlanForm } from './components/PlanForm.jsx';
export { useCotizacionesMoneda } from './hooks/useCotizacionesMoneda.js';


// Tipos de datos para planes (pueden expandirse a TypeScript en el futuro)
export const PLAN_TYPES = {
  VERIFICACION: 'verificacion',
  BASICO: 'basico',
  PROFESIONAL: 'profesional',
  ENTERPRISE: 'enterprise'
};

export const RENOVACION_TYPES = {
  DIA: 'dia',
  SEMANA: 'semana', 
  MES: 'mes',
  YEAR: 'año'
};

// Utilidades para planes
export const utils = {
  // Función para calcular precio anual con descuento
  calcularPrecioAnual: (precioMensual, descuentoPorcentaje = 15) => {
    const precioAnual = precioMensual * 12;
    const descuento = (precioAnual * descuentoPorcentaje) / 100;
    return precioAnual - descuento;
  },
  
  // Función para formatear período de renovación
  formatearPeriodo: (tipo, valor) => {
    const sufijo = valor === 1 ? '' : 's';
    return `${valor} ${tipo}${sufijo}`;
  },
  
  // Función para determinar si un plan es popular/destacado
  esPlanDestacado: (planId) => {
    // Lógica para determinar planes destacados
    return planId === 2; // Por ejemplo, plan profesional
  }
};