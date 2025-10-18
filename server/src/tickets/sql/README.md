# Documentación de Consultas SQL - Mensajes de Tickets

## Esquema de Base de Datos

Este módulo se basa en el esquema real de Prisma con las siguientes tablas:

### Tablas Principales:
- `ticket`: Información principal del ticket
- `ticket_mensaje`: Mensajes individuales del ticket 
- `usuarios`: Información de usuarios (autores de mensajes)
- `tipo_ticket`: Tipos de tickets disponibles

### Estructura de Campos Relevantes:

#### `ticket`:
- `id`: ID único del ticket
- `asunto`: Título/asunto del ticket
- `id_reportante`: Usuario que reportó el ticket
- `id_asignado`: Usuario asignado al ticket
- `prioridad`: 1=Alta, 2=Media, 3=Baja
- `id_estado`: 1=nuevo, 2=abierto, 3=pendiente cliente, etc.
- `activo`: Flag de soft delete

#### `ticket_mensaje`:
- `id`: ID único del mensaje
- `id_ticket`: Referencia al ticket
- `mensaje`: Contenido del mensaje
- `url_archivo`: Array de URLs de archivos adjuntos
- `id_autor`: ID del usuario autor
- `rol_autor`: 1=cliente, 2=soporte, 3=sistema
- `es_interno`: Si el mensaje es interno (no visible para cliente)
- `activo`: Flag de soft delete

## Consultas Implementadas

### 1. `GET_MENSAJES_PAGINADOS`

**Propósito**: Obtener mensajes paginados con información del autor

**Características**:
- ✅ **JOIN con usuarios**: Obtiene nombre, apellido, email del autor
- ✅ **Soft delete**: Filtra por `activo = true`
- ✅ **Cursor pagination**: Usa `id < lastMessageId` o `id > firstMessageId`
- ✅ **Ordenamiento**: Por `fecha_creacion DESC, id DESC`

**Campos Retornados**:
```typescript
{
  id: number;
  mensaje: string;
  url_archivo: string[];
  rol_autor: number;
  es_interno: boolean;
  fecha_creacion: Date;
  id_autor: number;
  autor_nombre: string;
  autor_apellido: string;
  autor_email: string;
}
```

### 2. `GET_MENSAJES_BY_ROLE`

**Propósito**: Filtrar mensajes según si se incluyen internos o no

**Casos de Uso**:
- **Cliente**: `includeInternal = false` - Solo mensajes públicos
- **Soporte**: `includeInternal = true` - Todos los mensajes
- **Admin**: `includeInternal = true` - Todos los mensajes

### 3. `GET_TICKET_WITH_LAST_MESSAGE`

**Propósito**: Información completa del ticket con preview del último mensaje

**Útil para**:
- Listados de tickets
- Dashboard de soporte
- Notificaciones de actividad

### 4. `GET_TICKET_STATS`

**Propósito**: Estadísticas y métricas del ticket

**Métricas Incluidas**:
- Total de mensajes
- Mensajes internos vs públicos  
- Mensajes por rol (cliente/soporte/sistema)
- Timestamps de primer y último mensaje

## Parámetros de Paginación

### Estructura de Parámetros:
```typescript
interface QueryParams {
  ticketId: number;           // ID del ticket
  lastMessageId?: number;     // Para paginación hacia atrás
  firstMessageId?: number;    // Para paginación hacia adelante
  limit: number;              // Cantidad de mensajes (default: 15)
  includeInternal?: boolean;  // Incluir mensajes internos
}
```

### Casos de Uso:

```typescript
// 1. Carga inicial - Últimos 15 mensajes
{
  ticketId: 123,
  lastMessageId: null,
  firstMessageId: null,
  limit: 15
}

// 2. Cargar mensajes anteriores (scroll up)
{
  ticketId: 123,
  lastMessageId: 150,  // ID del último mensaje mostrado
  firstMessageId: null,
  limit: 15
}

// 3. Para cliente (sin mensajes internos)
{
  ticketId: 123,
  lastMessageId: null,
  firstMessageId: null,
  limit: 15,
  includeInternal: false
}
```

## Indexación Recomendada

```sql
-- Índice principal para paginación de mensajes
CREATE INDEX idx_ticket_mensaje_paginacion 
ON ticket_mensaje (id_ticket, activo, fecha_creacion DESC, id DESC);

-- Índice para JOIN con usuarios
CREATE INDEX idx_ticket_mensaje_autor 
ON ticket_mensaje (id_autor);

-- Índice para filtros por rol y tipo
CREATE INDEX idx_ticket_mensaje_rol 
ON ticket_mensaje (id_ticket, rol_autor, es_interno);

-- Índice para búsqueda full-text (si se usa)
CREATE INDEX idx_ticket_mensaje_search 
ON ticket_mensaje USING gin(to_tsvector('spanish', mensaje));
```

## Roles y Permisos

### Tipos de Rol (`rol_autor`):
- `1`: **Cliente** - Usuario que reportó el ticket
- `2`: **Soporte** - Agente de atención al cliente
- `3`: **Sistema** - Mensajes automáticos

### Visibilidad de Mensajes:
- **Clientes**: Solo ven mensajes con `es_interno = false`
- **Soporte/Admin**: Ven todos los mensajes (`es_interno = true/false`)

## Performance y Optimización

### Ventajas del Cursor-Based Pagination:

1. **Consistencia**: Nuevos mensajes no afectan paginación existente
2. **Performance**: O(log n) vs O(n) del OFFSET
3. **Escalabilidad**: Rendimiento constante independiente del volumen
4. **Tiempo Real**: Compatible con actualizaciones en vivo

### Comparación de Performance:

| Método | Complejidad | Performance | Consistencia |
|--------|------------|-------------|--------------|
| OFFSET | O(n) | Degrada con páginas altas | ❌ Afectado por nuevos registros |
| Cursor | O(log n) | Constante | ✅ No afectado por nuevos registros |

## Implementación Backend Recomendada

```typescript
async getMensajes(params: GetMensajesQueryDto) {
  // 1. Preparar parámetros
  const queryParams = {
    ticketId: params.ticketId,
    lastMessageId: params.lastMessageId || null,
    firstMessageId: params.firstMessageId || null,
    limit: params.limit || 15,
    includeInternal: params.includeInternal ?? true
  };

  // 2. Ejecutar query principal
  const mensajes = await this.db.any(
    params.includeInternal !== false 
      ? GET_MENSAJES_PAGINADOS 
      : GET_MENSAJES_BY_ROLE, 
    queryParams
  );
  
  // 3. Verificar si hay más mensajes (opcional)
  let hasMore = false;
  if (params.lastMessageId && mensajes.length === queryParams.limit) {
    const result = await this.db.one(CHECK_HAS_MORE_MENSAJES, {
      ticketId: params.ticketId,
      lastMessageId: mensajes[mensajes.length - 1].id
    });
    hasMore = result.has_more;
  }

  // 4. Estructurar respuesta
  return {
    mensajes: mensajes.map(this.formatMensaje),
    pagination: {
      hasMore,
      hasPrevious: !!params.lastMessageId,
      firstMessageId: mensajes[0]?.id,
      lastMessageId: mensajes[mensajes.length - 1]?.id,
      count: mensajes.length
    }
  };
}
```

## Extensiones Futuras

### Funcionalidades Adicionales:
1. **Mensajes No Leídos**: Tracking de lectura por usuario
2. **Reacciones**: Sistema de likes/emojis en mensajes  
3. **Hilos**: Respuestas anidadas a mensajes específicos
4. **Menciones**: Sistema de @mentions entre usuarios
5. **Búsqueda Avanzada**: Filtros por fecha, autor, tipo, etc.

### Optimizaciones Avanzadas:
1. **Caché Redis**: Para tickets activos frecuentemente consultados
2. **WebSockets**: Actualizaciones en tiempo real
3. **Compresión**: Para mensajes largos o con muchos adjuntos
4. **Archivado**: Mover mensajes antiguos a tablas de archivo