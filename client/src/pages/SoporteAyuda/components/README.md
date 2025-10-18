# Sistema de Chat para Tickets - Documentación

## 📋 Componentes Implementados

### 1. **TimeLineMensajes**
Componente para mostrar la conversación del ticket tipo chat.

#### Props:
- `mensajes`: Array de mensajes del ticket
- `usuarioActual`: Objeto del usuario actual (para identificar mensajes propios)

#### Características:
- ✅ **Diseño tipo WhatsApp**: Mensajes propios a la derecha, ajenos a la izquierda
- ✅ **Identificación de roles**: Cliente, Soporte, Sistema con colores diferentes
- ✅ **Mensajes internos**: Marcados visualmente para soporte
- ✅ **Archivos adjuntos**: Links a archivos con iconos
- ✅ **Timestamps**: Fecha y hora formateada
- ✅ **Scroll automático**: Para conversaciones largas

### 2. **ChatTicket**
Componente para enviar nuevos mensajes.

#### Props:
- `ticketId`: ID del ticket
- `estadoTicket`: Estado actual del ticket (1-7)
- `esCliente`: Boolean para determinar si es cliente o soporte
- `onMensajeEnviado`: Callback cuando se envía un mensaje
- `disabled`: Para deshabilitar temporalmente

#### Características:
- ✅ **Control de estados**: Basado en estados del ticket
- ✅ **Mensajes internos**: Solo disponible para soporte
- ✅ **Archivos adjuntos**: Máximo 5 archivos
- ✅ **Validaciones**: Previene envío en estados incorrectos
- ✅ **Feedback visual**: Indicadores de estado y carga

### 3. **TicketDetalle**
Componente principal que integra Timeline y Chat.

#### Props:
- `id_ticket`: ID del ticket a mostrar

#### Características:
- ✅ **Paginación**: Carga mensajes con scroll infinito
- ✅ **Auto-refresh**: Recarga después de enviar mensajes
- ✅ **Control de roles**: Detecta automáticamente cliente vs soporte
- ✅ **Estados visuales**: Muestra estado del ticket
- ✅ **Manejo de errores**: Con feedback visual

## 🔄 Estados del Ticket

```javascript
const estados = {
  1: { nombre: 'Nuevo', descripcion: 'Esperando asignación' },
  2: { nombre: 'Abierto', descripcion: 'Conversación activa' },
  3: { nombre: 'Pendiente Cliente', descripcion: 'Esperando respuesta del cliente' },
  4: { nombre: 'Pendiente Soporte', descripcion: 'Esperando respuesta del soporte' },
  5: { nombre: 'En Espera', descripcion: 'Pausado temporalmente' },
  6: { nombre: 'Resuelto', descripcion: 'Problema solucionado' },
  7: { nombre: 'Cerrado', descripcion: 'Ticket finalizado' }
};
```

### **Reglas de Envío de Mensajes:**

#### **Cliente puede enviar cuando:**
- Estado 2 (Abierto)
- Estado 3 (Pendiente Cliente)

#### **Soporte puede enviar cuando:**
- Estados 1, 2, 3, 4, 5 (todos excepto resuelto/cerrado)

#### **Nadie puede enviar cuando:**
- Estado 6 (Resuelto)
- Estado 7 (Cerrado)

## 🎨 Estilos y UX

### **Colores por Rol:**
- **Cliente**: Gris claro
- **Soporte**: Verde claro
- **Sistema**: Amarillo claro
- **Mensajes propios**: Azul (independiente del rol)

### **Indicadores Visuales:**
- 🔒 **Mensaje interno**: Borde amarillo con icono de candado
- 📎 **Archivos**: Enlaces con icono de clip
- ⏰ **Timestamps**: Fecha/hora en formato local
- 🟢 **Estado activo**: Verde para estados que permiten envío
- 🔴 **Estado bloqueado**: Rojo para estados que bloquean envío

## 📡 APIs Utilizadas

### **Endpoints:**
```javascript
// Obtener mensajes con paginación
GET /tickets/:id/hilo?lastMessageId=123&limit=15

// Cliente envía mensaje
POST /tickets/mensaje
Body: { mensaje: "...", id_ticket: 123 }

// Soporte envía mensaje  
POST /tickets/soporte/mensaje
Body: { mensaje: "...", id_ticket: 123, es_interno: true }
```

### **Estructura de Mensaje:**
```javascript
{
  id: 789,
  mensaje: "Contenido del mensaje...",
  url_archivo: ["https://...", "https://..."],
  rol_autor: 1, // 1=cliente, 2=soporte, 3=sistema
  es_interno: false,
  fecha_creacion: "2024-10-16T10:30:00Z",
  id_autor: 123,
  autor_nombre: "Juan",
  autor_apellido: "Pérez",
  autor_email: "juan@example.com"
}
```

## 💻 Uso en el Código

### **Importación:**
```jsx
import TicketDetalle from '../pages/SoporteAyuda/pages/TicketDetalle';
import TimeLineMensajes from '../pages/SoporteAyuda/components/TimeLineMensajes';
import ChatTicket from '../pages/SoporteAyuda/components/ChatTicket';
```

### **Uso Básico:**
```jsx
// Página completa de ticket
<TicketDetalle id_ticket={123} />

// Solo timeline (sin chat)
<TimeLineMensajes 
  mensajes={mensajes} 
  usuarioActual={user} 
/>

// Solo chat (sin timeline)
<ChatTicket
  ticketId={123}
  estadoTicket={2}
  esCliente={true}
  onMensajeEnviado={() => console.log('Mensaje enviado')}
/>
```

### **Con Estados Personalizados:**
```jsx
const [ticketData, setTicketData] = useState(null);

const manejarMensajeEnviado = () => {
  // Recargar datos del ticket
  fetchTicketData();
  // Mostrar notificación
  toast.success('Mensaje enviado correctamente');
};

return (
  <TicketDetalle 
    id_ticket={ticketId}
    onMensajeEnviado={manejarMensajeEnviado}
  />
);
```

## 🚀 Funcionalidades Avanzadas

### **Scroll Infinito:**
- Carga automática de mensajes anteriores
- Botón "Cargar más" cuando hay más mensajes
- Performance optimizada con paginación cursor-based

### **Archivos Adjuntos:**
- Soporte para múltiples formatos
- Preview visual en la interfaz
- Validación de cantidad (máx. 5)
- Eliminación individual antes de enviar

### **Mensajes en Tiempo Real:** (Futuro)
- WebSocket integration
- Notificaciones push
- Indicadores de "escribiendo..."
- Estado de entrega/lectura

## 🔧 Configuración

### **Dependencias Necesarias:**
```json
{
  "date-fns": "^2.x.x",
  "axios": "^1.x.x",
  "react": "^18.x.x"
}
```

### **Configuración de APIs:**
```javascript
// En tickets.api.js
const URL_ENDPOINT = "tickets";
const api = axios.create({
  baseURL: `${URL_BASE_BACKEND_API}/${URL_ENDPOINT}`,
});
```

## 🧪 Testing

### **Casos de Prueba Recomendados:**

1. **Estados del Ticket:**
   - Verificar que se bloquee envío en estados 6 y 7
   - Comprobar mensajes apropiados por estado

2. **Roles de Usuario:**
   - Cliente no puede enviar mensajes internos
   - Soporte puede enviar mensajes internos
   - Detección automática de rol

3. **Archivos Adjuntos:**
   - Máximo 5 archivos
   - Validación de tipos de archivo
   - Eliminación individual

4. **Paginación:**
   - Carga inicial de mensajes
   - Scroll infinito hacia atrás
   - Performance con muchos mensajes

5. **UX/UI:**
   - Responsive design
   - Estados de carga
   - Manejo de errores

## 🐛 Troubleshooting

### **Problemas Comunes:**

1. **"No se pueden enviar mensajes"**
   - Verificar estado del ticket
   - Comprobar permisos de usuario
   - Revisar configuración de roles

2. **"Archivos no se suben"**
   - Verificar límite de 5 archivos
   - Comprobar tipos de archivo permitidos
   - Revisar configuración del servidor

3. **"Mensajes no se cargan"**
   - Verificar conexión a API
   - Comprobar ID del ticket
   - Revisar permisos de acceso

4. **"Timeline no actualiza"**
   - Verificar callback `onMensajeEnviado`
   - Comprobar estados de React
   - Revisar re-renderizado de componentes