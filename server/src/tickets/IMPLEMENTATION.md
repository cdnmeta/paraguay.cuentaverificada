# Implementación de Paginación en getTicketHilo()

## ✅ Funcionalidades Implementadas

### 1. **Paginación Cursor-Based Optimizada**
- Usa `BETWEEN` en lugar de `OFFSET` para mejor rendimiento
- Compatible con paginación bidireccional
- Performance constante independiente del volumen de datos

### 2. **Control de Visibilidad por Rol**
- **Clientes**: Solo ven mensajes públicos (`es_interno = false`)
- **Soporte/Admin**: Ven todos los mensajes (públicos + internos)
- Control automático basado en `id_reportante` vs `id_asignado`

### 3. **Validación de Permisos**
- Verifica que el ticket existe y está activo
- Solo usuarios autorizados pueden ver el hilo (reportante o asignado)
- Manejo de excepciones apropiado

## 📋 Uso de la API

### **Endpoint**
```http
GET /tickets/:id/hilo
```

### **Query Parameters Disponibles**
```typescript
{
  lastMessageId?: number;     // Para cargar mensajes anteriores
  firstMessageId?: number;    // Para cargar mensajes siguientes  
  limit?: number;             // Cantidad (1-50, default: 15)
  includeInternal?: boolean;  // Forzar inclusión de mensajes internos
}
```

### **Ejemplos de Uso**

#### 1. **Carga Inicial** (últimos 15 mensajes)
```http
GET /tickets/123/hilo
```

#### 2. **Cargar Mensajes Anteriores** (scroll up)
```http
GET /tickets/123/hilo?lastMessageId=456&limit=15
```

#### 3. **Cargar Más Mensajes** (cantidad específica)
```http
GET /tickets/123/hilo?limit=25
```

#### 4. **Forzar Mensajes Internos** (para admins)
```http
GET /tickets/123/hilo?includeInternal=true
```

## 📤 Estructura de Respuesta

```typescript
{
  "mensajes": [
    {
      "id": 789,
      "mensaje": "Contenido del mensaje...",
      "url_archivo": ["https://...", "https://..."],
      "rol_autor": 1, // 1=cliente, 2=soporte, 3=sistema
      "es_interno": false,
      "fecha_creacion": "2024-10-16T10:30:00Z",
      "id_autor": 123,
      "autor_nombre": "Juan",
      "autor_apellido": "Pérez", 
      "autor_email": "juan@example.com"
    }
    // ... más mensajes
  ],
  "pagination": {
    "hasMore": true,           // ¿Hay más mensajes anteriores?
    "hasPrevious": false,      // ¿Hay mensajes siguientes?
    "firstMessageId": 789,     // ID del primer mensaje en respuesta
    "lastMessageId": 750,      // ID del último mensaje en respuesta  
    "count": 15,               // Cantidad de mensajes retornados
    "limit": 15                // Límite solicitado
  }
}
```

## 🔄 Flujo Frontend Recomendado

### **Estado del Componente**
```javascript
const [mensajes, setMensajes] = useState([]);
const [pagination, setPagination] = useState({
  hasMore: true,
  hasPrevious: false,
  firstMessageId: null,
  lastMessageId: null
});
const [loading, setLoading] = useState(false);
```

### **Cargar Mensajes Iniciales**
```javascript
const loadInitialMessages = async (ticketId) => {
  setLoading(true);
  try {
    const response = await fetch(`/api/tickets/${ticketId}/hilo`);
    const data = await response.json();
    
    setMensajes(data.mensajes);
    setPagination(data.pagination);
  } catch (error) {
    console.error('Error loading messages:', error);
  } finally {
    setLoading(false);
  }
};
```

### **Cargar Mensajes Anteriores** (Scroll Up)
```javascript
const loadMoreMessages = async (ticketId) => {
  if (!pagination.hasMore || loading) return;
  
  setLoading(true);
  try {
    const url = `/api/tickets/${ticketId}/hilo?lastMessageId=${pagination.lastMessageId}&limit=15`;
    const response = await fetch(url);
    const data = await response.json();
    
    // Prepend mensajes anteriores (al inicio del array)
    setMensajes(prev => [...data.mensajes, ...prev]);
    setPagination(prev => ({
      ...prev,
      hasMore: data.pagination.hasMore,
      lastMessageId: data.pagination.lastMessageId
    }));
  } catch (error) {
    console.error('Error loading more messages:', error);
  } finally {
    setLoading(false);
  }
};
```

### **Scroll Infinito** (Intersection Observer)
```javascript
const observerRef = useRef();
const lastMessageRef = useCallback(node => {
  if (loading) return;
  if (observerRef.current) observerRef.current.disconnect();
  
  observerRef.current = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && pagination.hasMore) {
      loadMoreMessages(ticketId);
    }
  });
  
  if (node) observerRef.current.observe(node);
}, [loading, pagination.hasMore]);

// En el render, aplicar ref al último mensaje
<div ref={lastMessageRef}>Último mensaje...</div>
```

## 🚀 Ventajas de Performance

### **Comparación con Implementación Anterior**
| Aspecto | Anterior (OFFSET) | Nuevo (Cursor) |
|---------|-------------------|----------------|
| **Complejidad** | O(n) | O(log n) |
| **Performance** | Degrada con páginas altas | Constante |
| **Consistencia** | ❌ Afectada por nuevos mensajes | ✅ No afectada |
| **Escalabilidad** | ❌ Lenta con muchos registros | ✅ Siempre rápida |
| **Tiempo Real** | ❌ Problemas con actualizaciones | ✅ Compatible |

### **Optimizaciones Incluidas**
- ✅ **LEFT JOIN** eficiente con usuarios
- ✅ **CTE** para queries complejas  
- ✅ **Índices** recomendados para performance óptima
- ✅ **Soft Delete** con filtro `activo = true`
- ✅ **Límite máximo** para prevenir sobrecarga

## 🔧 Configuración de Índices

Para optimal performance, crear estos índices en PostgreSQL:

```sql
-- Índice principal para paginación
CREATE INDEX idx_ticket_mensaje_paginacion 
ON ticket_mensaje (id_ticket, activo, fecha_creacion DESC, id DESC);

-- Índice para JOIN con usuarios  
CREATE INDEX idx_ticket_mensaje_autor 
ON ticket_mensaje (id_autor);

-- Índice para filtros por rol
CREATE INDEX idx_ticket_mensaje_rol 
ON ticket_mensaje (id_ticket, rol_autor, es_interno);
```

## 🐛 Manejo de Errores

La implementación maneja los siguientes casos:

- **404**: Ticket no encontrado o eliminado
- **403**: Usuario sin permisos para ver el ticket
- **400**: Parámetros de paginación inválidos
- **500**: Errores de base de datos (con logging detallado)

## 🔮 Próximas Mejoras

1. **WebSocket Integration**: Para mensajes en tiempo real
2. **Caché Redis**: Para tickets frecuentemente consultados  
3. **Búsqueda Full-Text**: Para buscar en contenido de mensajes
4. **Filtros Avanzados**: Por fecha, autor, tipo de mensaje
5. **Exportar Conversación**: Generar PDF/HTML del hilo completo