// Hook personalizado para manejar el mensaje del día
// Ubicación sugerida: client/src/hooks/useMensajeDelDia.js

import { useState, useEffect } from 'react'
import { getMensajeDelDia } from '@/apis/estados-animos.api'

// Constantes para el localStorage
const STORAGE_KEY_ULTIMO_MENSAJE = 'ultimo_mensaje_del_dia'
const STORAGE_KEY_FECHA_ULTIMO_MENSAJE = 'fecha_ultimo_mensaje_del_dia'

// Funciones para manejar localStorage del mensaje del día
const obtenerUltimoMensajeVisto = () => {
  try {
    const ultimoId = localStorage.getItem(STORAGE_KEY_ULTIMO_MENSAJE)
    const fechaUltimo = localStorage.getItem(STORAGE_KEY_FECHA_ULTIMO_MENSAJE)
    const hoy = new Date().toDateString()
    
    // Si la fecha es diferente a hoy, permitir ver un nuevo mensaje
    if (fechaUltimo !== hoy) {
      return null
    }
    
    return ultimoId ? parseInt(ultimoId) : null
  } catch (error) {
    console.error('Error al obtener último mensaje del localStorage:', error)
    return null
  }
}

const guardarMensajeVisto = (idMensaje) => {
  try {
    const hoy = new Date().toDateString()
    localStorage.setItem(STORAGE_KEY_ULTIMO_MENSAJE, idMensaje.toString())
    localStorage.setItem(STORAGE_KEY_FECHA_ULTIMO_MENSAJE, hoy)
  } catch (error) {
    console.error('Error al guardar mensaje en localStorage:', error)
  }
}

export const useMensajeDelDia = (options = {}) => {
  const { 
    autoLoad = true, 
    tipoMensaje = 1,
    onMensajeObtenido,
    onError 
  } = options

  const [mensajeDelDia, setMensajeDelDia] = useState(null)
  const [mostrarMensaje, setMostrarMensaje] = useState(false)
  const [cargandoMensaje, setCargandoMensaje] = useState(false)

  // Obtener mensaje del día
  const fetchMensajeDelDia = async () => {
    try {
      setCargandoMensaje(true)
      
      // Obtener el último ID de mensaje visto
      const ultimoIdVisto = obtenerUltimoMensajeVisto()
      
      // Preparar parámetros según el DTO
      const params = {
        id_tipo_mensaje: tipoMensaje // Tipo de mensaje configurable
      }
      
      // Si hay un mensaje anterior visto hoy, incluir el ID para evitar repetición
      if (ultimoIdVisto) {
        params.id_mensaje_ant = ultimoIdVisto
      }
      
      const response = await getMensajeDelDia(params)
      
      // Solo mostrar si hay un mensaje válido y es status 200
      if (response.status === 200 && response.data && response.data.mensaje) {
        setMensajeDelDia(response.data)
        setMostrarMensaje(true)
        
        // Callback opcional
        if (onMensajeObtenido) {
          onMensajeObtenido(response.data)
        }
        
        console.log('📝 Mensaje del día obtenido:', {
          mensaje: response.data.mensaje,
          tipo: response.data.descripcion_tipo_mesaje,
          id_tipo_animo: response.data.id_tipo_animo
        })
        
        return response.data
      } else {
        console.log('📝 No hay mensaje nuevo para mostrar hoy')
        return null
      }
    } catch (error) {
      console.error('Error al obtener mensaje del día:', error)
      
      // Callback opcional para manejo de errores
      if (onError) {
        onError(error)
      }
      
      return null
    } finally {
      setCargandoMensaje(false)
    }
  }

  // Cerrar mensaje del día y guardarlo como visto
  const cerrarMensajeDelDia = () => {
    if (mensajeDelDia) {
      // Guardar el ID del tipo de ánimo como mensaje visto
      const idParaGuardar = mensajeDelDia.id_tipo_animo
      if (idParaGuardar) {
        guardarMensajeVisto(idParaGuardar)
        console.log('💾 Mensaje guardado como visto:', idParaGuardar)
      }
    }
    
    // Cerrar el dialog
    setMostrarMensaje(false)
    setMensajeDelDia(null)
  }

  // Reabrir mensaje (útil para testing o casos especiales)
  const reabrirMensaje = () => {
    if (mensajeDelDia) {
      setMostrarMensaje(true)
    }
  }

  // Limpiar cache del mensaje (útil para development/testing)
  const limpiarCacheMensaje = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_ULTIMO_MENSAJE)
      localStorage.removeItem(STORAGE_KEY_FECHA_ULTIMO_MENSAJE)
      console.log('🗑️ Cache de mensaje del día limpiado')
    } catch (error) {
      console.error('Error al limpiar cache:', error)
    }
  }

  // Auto-cargar mensaje si está habilitado
  useEffect(() => {
    if (autoLoad) {
      fetchMensajeDelDia()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad, tipoMensaje])

  return {
    // Estados
    mensajeDelDia,
    mostrarMensaje,
    cargandoMensaje,
    
    // Funciones
    fetchMensajeDelDia,
    cerrarMensajeDelDia,
    reabrirMensaje,
    limpiarCacheMensaje,
    
    // Funciones de localStorage (para casos especiales)
    obtenerUltimoMensajeVisto,
    guardarMensajeVisto
  }
}

// Hook simplificado para uso básico
export const useMensajeDelDiaSimple = () => {
  return useMensajeDelDia({ autoLoad: true, tipoMensaje: 1 })
}

export default useMensajeDelDia