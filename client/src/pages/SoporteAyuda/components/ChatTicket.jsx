import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { soporteAgregarMensajeTicket, clienteAgregarMensajeTicket } from '../../../apis/tickets.api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';

// Validación con Zod
const mensajeSchema = z.object({
  mensaje: z.string()
    .min(1, 'El mensaje no puede estar vacío')
    .max(2000, 'El mensaje no puede exceder 2000 caracteres'),
  esInterno: z.boolean().optional(),
});

// Validación para archivos
const validarArchivos = (files) => {
  const errores = [];
  const maxFiles = 5;
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/', 'video/'];
  
  if (files.length > maxFiles) {
    errores.push(`Máximo ${maxFiles} archivos permitidos`);
  }
  
  files.forEach((file, index) => {
    // Validar tamaño
    if (file.size > maxSize) {
      errores.push(`Archivo ${index + 1}: Tamaño máximo 5MB`);
    }
    
    // Validar tipo
    const isValidType = allowedTypes.some(type => file.type.startsWith(type));
    if (!isValidType) {
      errores.push(`Archivo ${index + 1}: Solo se permiten imágenes y videos`);
    }
  });
  
  return errores;
};

const ChatTicket = ({ 
  ticketId, 
  estadoTicket, 
  esCliente = true, 
  onMensajeEnviado = () => {},
  disabled = false 
}) => {
  const [archivos, setArchivos] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [erroresArchivos, setErroresArchivos] = useState([]);
  const fileInputRef = useRef(null);

  // Configurar React Hook Form con Zod
  const form = useForm({
    resolver: zodResolver(mensajeSchema),
    defaultValues: {
      mensaje: '',
      esInterno: false,
    },
  });

  // Estados del ticket: 1=nuevo, 2=abierto, 3=pendiente cliente, 4=pendiente soporte, 5=en espera, 6=resuelto, 7=cerrado
  const puedeEnviarMensaje = () => {
    if (disabled) return false;
    
    // No se puede enviar si está resuelto o cerrado
    if (estadoTicket === 6 || estadoTicket === 7) return false;
    
    // Cliente puede enviar solo si está pendiente de cliente o abierto
    if (esCliente) {
      return estadoTicket === 2 || estadoTicket === 3; // abierto o pendiente cliente
    }
    
    // Soporte puede enviar en la mayoría de estados excepto cerrado/resuelto
    return estadoTicket !== 6 && estadoTicket !== 7;
  };

  const obtenerMensajeEstado = () => {
    if (disabled) {
      if (estadoTicket === 1 && !esCliente) {
        return 'Debes aceptar el ticket antes de poder enviar mensajes';
      }
      return 'Función deshabilitada temporalmente';
    }
    
    switch (estadoTicket) {
      case 1: 
        if (esCliente) {
          return 'Ticket nuevo - Esperando asignación de soporte';
        } else {
          return 'Ticket nuevo - Haz clic en "Abrir Ticket" para aceptarlo';
        }
      case 2: return 'Ticket abierto - Puedes enviar mensajes';
      case 3: return esCliente ? 'Esperando tu respuesta' : 'Pendiente respuesta del cliente';
      case 4: return esCliente ? 'Esperando respuesta del soporte' : 'Puedes responder al cliente';
      case 5: return 'Ticket en espera';
      case 6: return 'Ticket resuelto - No se pueden enviar más mensajes';
      case 7: return 'Ticket cerrado - No se pueden enviar más mensajes';
      default: return 'Estado desconocido';
    }
  };

  const manejarSeleccionArchivos = (event) => {
    const archivosSeleccionados = Array.from(event.target.files);
    
    // Validar archivos
    const errores = validarArchivos(archivosSeleccionados);
    setErroresArchivos(errores);
    
    if (errores.length === 0) {
      setArchivos(archivosSeleccionados);
    } else {
      // Limpiar selección si hay errores
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const eliminarArchivo = (index) => {
    setArchivos(prev => prev.filter((_, i) => i !== index));
    setErroresArchivos([]);
  };

  const onSubmit = async (data) => {
    if (archivos.length === 0 && !data.mensaje.trim()) {
      return;
    }

    setEnviando(true);
    
    try {
      const formData = new FormData();
      formData.append('mensaje', data.mensaje);
      formData.append('id_ticket', ticketId);
      
      // Solo soporte puede enviar mensajes internos
      if (!esCliente) {
        formData.append('es_interno', data.esInterno || false);
      }
      
      // Agregar archivos
      archivos.forEach(archivo => {
        formData.append('archivos', archivo);
      });

      // Llamar API correspondiente según el tipo de usuario
      if (esCliente) {
        await clienteAgregarMensajeTicket(formData);
      } else {
        await soporteAgregarMensajeTicket(formData);
      }

      // Limpiar formulario
      form.reset();
      setArchivos([]);
      setErroresArchivos([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Notificar que se envió el mensaje
      onMensajeEnviado();
      
    } catch (error) {
      if([400].includes(error?.response?.status)){
        toast.error(error.response?.data?.message || 'Error al enviar el mensaje. Por favor, intenta nuevamente.');
        return;
      }
      toast.error('Error al enviar el mensaje. Por favor, intenta nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  const puedeEnviar = puedeEnviarMensaje();
  const { watch } = form;
  const mensaje = watch('mensaje');

  return (
    <div className=" border rounded-lg p-4 shadow-sm">
      
      {/* Estado del ticket */}
      <div className={`mb-4 p-3 rounded-lg text-sm ${
        puedeEnviar ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
      }`}>
        <div className="flex items-center">
          <span className={`w-2 h-2 rounded-full mr-2 ${puedeEnviar ? 'bg-green-400' : 'bg-red-400'}`}></span>
          {obtenerMensajeEstado()}
        </div>
      </div>

      {/* Formulario con React Hook Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Checkbox para mensaje interno (solo soporte) */}
          {!esCliente && (
            <FormField
              control={form.control}
              name="esInterno"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!puedeEnviar || enviando}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm text-gray-700">
                      🔒 Mensaje interno (solo visible para soporte)
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          )}

          {/* Textarea para el mensaje */}
          <FormField
            control={form.control}
            name="mensaje"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={puedeEnviar ? 'Escribe tu mensaje aquí...' : 'No puedes enviar mensajes en este estado'}
                    
                    disabled={!puedeEnviar || enviando}
                    className="resize-none min-h-[120px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Selección de archivos */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={manejarSeleccionArchivos}
                className="hidden"
                disabled={!puedeEnviar || enviando}
                accept="image/*,video/*"
              />
              
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={!puedeEnviar || enviando}
                className="flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Adjuntar archivos (máx. 5, 5MB)
              </Button>
            </div>

            {/* Errores de validación de archivos */}
            {erroresArchivos.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm font-medium text-red-800 mb-1">Errores en archivos:</p>
                <ul className="text-sm text-red-700 space-y-1">
                  {erroresArchivos.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Lista de archivos seleccionados */}
            {archivos.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-700 mb-2">Archivos seleccionados:</p>
                <div className="space-y-2">
                  {archivos.map((archivo, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                      <div className="flex items-center space-x-2 flex-1">
                        <span className="text-xs text-gray-500">
                          {archivo.type.startsWith('image/') ? '🖼️' : '🎥'}
                        </span>
                        <span className="text-sm text-gray-600 truncate flex-1">{archivo.name}</span>
                        <span className="text-xs text-gray-400">
                          {(archivo.size / (1024 * 1024)).toFixed(1)}MB
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarArchivo(index)}
                        disabled={enviando}
                        className="ml-2 text-red-500 hover:text-red-700 h-6 w-6 p-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botón de enviar */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!puedeEnviar || enviando || (!mensaje?.trim() && archivos.length === 0)}
              className="flex items-center"
            >
              {enviando ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Enviar mensaje
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ChatTicket;