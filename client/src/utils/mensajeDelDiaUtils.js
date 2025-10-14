// Utilidades para iconos del mensaje del día
// Ubicación: client/src/utils/mensajeDelDiaUtils.js

import React from 'react'
import { Smile, Heart, Star, Sun, Target } from 'lucide-react'

// Función para obtener icono según el tipo de mensaje
export const getMensajeIcon = (tipoMensaje) => {
  const iconos = {
    1: <Smile className="h-6 w-6 text-primary" />, // Motivacional
    2: <Heart className="h-6 w-6 text-red-500" />, // Amor/Amistad
    3: <Star className="h-6 w-6 text-yellow-500" />, // Logros
    4: <Sun className="h-6 w-6 text-orange-500" />, // Energía
    5: <Target className="h-6 w-6 text-blue-500" /> // Metas
  }
  
  return iconos[tipoMensaje] || iconos[1]
}

// Función para obtener color de fondo según el tipo de mensaje
export const getMensajeColor = (tipoMensaje) => {
  const colores = {
    1: 'bg-primary/10 text-primary border-primary/20', // Motivacional
    2: 'bg-red-50 text-red-600 border-red-200', // Amor/Amistad
    3: 'bg-yellow-50 text-yellow-600 border-yellow-200', // Logros
    4: 'bg-orange-50 text-orange-600 border-orange-200', // Energía
    5: 'bg-blue-50 text-blue-600 border-blue-200' // Metas
  }
  
  return colores[tipoMensaje] || colores[1]
}

// Función para obtener nombre del tipo de mensaje
export const getTipoMensajeNombre = (tipoMensaje) => {
  const nombres = {
    1: 'Motivacional',
    2: 'Amor y Amistad',
    3: 'Logros',
    4: 'Energía',
    5: 'Metas'
  }
  
  return nombres[tipoMensaje] || 'Motivacional'
}

// Constantes para localStorage
export const STORAGE_KEYS = {
  ULTIMO_MENSAJE: 'ultimo_mensaje_del_dia',
  FECHA_ULTIMO_MENSAJE: 'fecha_ultimo_mensaje_del_dia'
}

// Función para verificar si es un nuevo día
export const esNuevoDia = (fechaGuardada) => {
  const hoy = new Date().toDateString()
  return fechaGuardada !== hoy
}

// Función para formatear la fecha del mensaje
export const formatearFechaMensaje = (fecha) => {
  try {
    const fechaObj = new Date(fecha)
    return fechaObj.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch {
    return 'Fecha no disponible'
  }
}