import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import MediaGallery from './MediaGallery';

const TimeLineMensajes = ({ mensajes, usuarioActual }) => {
  const formatearFecha = (fecha) => {
    return format(new Date(fecha), 'dd/MM/yyyy HH:mm', { locale: es });
  };


  useEffect(() => {
    // Ir al último mensaje cuando se cargan mensajes nuevos
    if (mensajes && mensajes.length > 0) {
      // Pequeño delay para asegurar que el DOM se ha renderizado
      const timer = setTimeout(() => {
        const ultimoMensaje = mensajes[mensajes.length - 1];
        const contenedor = document.getElementById(`msg-${ultimoMensaje?.id}`);
        if (contenedor) {
          console.log("Haciendo scroll al último mensaje:", ultimoMensaje.id);
          contenedor.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'end',
            inline: 'nearest'
          });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [mensajes]); // Se ejecuta cuando cambia la lista de mensajes

  const esMensajeMio = (mensaje) => {
    return mensaje.id_autor === usuarioActual?.id;
  };

  const obtenerTipoUsuario = (rol_autor) => {
    switch (rol_autor) {
      case 1: return 'Cliente';
      case 2: return 'Soporte';
      case 3: return 'Sistema';
      default: return 'Usuario';
    }
  };

  const obtenerColorPorRol = (rol_autor, esMio) => {
    if (esMio) {
      return 'bg-blue-500 text-white';
    }
    
    switch (rol_autor) {
      case 1: return 'bg-gray-100 text-gray-800'; // Cliente
      case 2: return 'bg-green-100 text-green-800'; // Soporte
      case 3: return 'bg-yellow-100 text-yellow-800'; // Sistema
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!mensajes || mensajes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-lg">No hay mensajes en este ticket</p>
          <p className="text-sm">Inicia la conversación enviando un mensaje</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 p-4 h-96 overflow-y-auto border-primary border-2 rounded-lg">
      {mensajes.map((mensaje) => {
        const esMio = esMensajeMio(mensaje);
        
        return (
          <div 
            key={`msg-${mensaje.id}`} 
            id={`msg-${mensaje.id}`}
            className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-secondary shadow-sm ${esMio ? 'rounded-br-none' : 'rounded-bl-none'}`}>
              
              {/* Header del mensaje */}
              <div className={`flex items-center justify-between mb-2 ${esMio ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`text-xs font-medium ${esMio ? 'text-right' : 'text-left'}`}>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${obtenerColorPorRol(mensaje.rol_autor, esMio)}`}>
                    {esMio ? 'Tú' : `${mensaje.autor_nombre} (${obtenerTipoUsuario(mensaje.rol_autor)})`}
                  </span>
                </div>
              </div>

              {/* Contenido del mensaje */}
              <div className={`p-3 rounded-lg bg-white text-gray-800`}>
                
                {/* Mensaje interno (solo visible para soporte) */}
                {mensaje.es_interno && (
                  <div className="mb-2 p-2 bg-yellow-100 border-l-4 border-yellow-400 rounded">
                    <p className="text-xs text-yellow-800 font-medium">
                      🔒 Mensaje interno (solo visible para soporte)
                    </p>
                  </div>
                )}

                {/* Texto del mensaje */}
                <p className="text-sm whitespace-pre-wrap">{mensaje.mensaje}</p>

                {/* Archivos multimedia */}
                {mensaje.url_archivo && mensaje.url_archivo.length > 0 && (
                  <MediaGallery archivos={mensaje.url_archivo} esMio={esMio} />
                )}
              </div>

              {/* Footer con fecha */}
              <div className={`text-xs mt-1 ${esMio ? 'text-right' : 'text-left'}`}>
                {formatearFecha(mensaje.fecha_creacion)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TimeLineMensajes;