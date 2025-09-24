# Recordatorios Usuarios - Frontend

## Descripción
Sistema completo de gestión de recordatorios para usuarios con soporte para múltiples imágenes, creación, edición y visualización.

## Estructura de Archivos

```
RecordatoriosUsuarios/
├── components/
│   ├── FormRecordatorio.jsx          # Formulario reutilizable crear/editar
│   ├── EditarRecordatorioWrapper.jsx # Wrapper para modo edición
│   └── ImagenesRecordatorioModal.jsx # Modal para visualizar imágenes
├── schemas/
│   └── recordatoriosSchema.js        # Validaciones Zod
├── services/
│   └── recordatoriosAPI.js          # Servicios API
├── RecordatoriosPage.jsx            # Página principal con DataTable
└── index.jsx                        # Definición de rutas
```

## Funcionalidades Implementadas

### ✅ **Página Principal (RecordatoriosPage)**
- **DataTable** con paginación y búsqueda
- **Columnas mostradas**: ID, Descripción, Estado, Imágenes, Fechas, Acciones
- **Estados visuales**: Badges con colores según estado del recordatorio
- **Preview de imágenes**: Miniaturas con contador y PhotoView
- **Acciones por fila**: Ver imágenes y Editar
- **Estado vacío**: Mensaje motivacional para crear primer recordatorio

### ✅ **Formulario (FormRecordatorio)**
- **Modo dual**: Crear y Editar automático según props
- **Validaciones Zod**: Descripción requerida, imágenes opcionales
- **Gestión de imágenes**:
  - Upload múltiple con preview
  - Validación de formato (PNG, JPG, JPEG)
  - Peso máximo por imagen (5MB)
  - Eliminación individual de nuevas imágenes

### ✅ **Edición Avanzada de Imágenes**
- **Imágenes existentes**: Preview con react-photo-view
- **Eliminación selectiva**: Marca imágenes para eliminar vía API
- **Vista de confirmación**: Muestra qué imágenes se eliminarán
- **Restaurar**: Opción de deshacer antes de guardar
- **Nuevas imágenes**: Se agregan a las existentes

### ✅ **Visualización de Imágenes**
- **Modal elegante**: Dialog con galería de imágenes
- **PhotoView integrado**: Zoom, rotación, navegación
- **Controles**: Zoom+, Zoom-, Rotar
- **Responsive**: Grilla adaptativa según pantalla
- **Contador**: Indicador de posición (X de Y)

### ✅ **Rutas y Navegación**
```
/recordatorios-usuarios/          # Listado principal
/recordatorios-usuarios/crear     # Crear nuevo
/recordatorios-usuarios/editar/:id # Editar existente
```

### ✅ **API Integration**
- **Autenticación JWT** automática
- **FormData** para upload de imágenes
- **Error handling** con toasts informativos
- **Loading states** en todas las operaciones

## Schemas de Validación

### CreateRecordatorio Schema
```javascript
{
  descripcion: string (3-500 caracteres),
  id_estado: number (opcional, default: 1),
  imagenes: array de File (opcional)
}
```

### Validaciones de Imágenes
- **Formatos**: PNG, JPG, JPEG únicamente
- **Peso**: Máximo 5MB por imagen
- **Cantidad**: Hasta 10 imágenes por recordatorio

## Componentes Reutilizables

### FormRecordatorio Props
```javascript
<FormRecordatorio 
  id_recordatorio={null}  // null = crear, number = editar
/>
```

### ImagenesRecordatorioModal Props
```javascript
<ImagenesRecordatorioModal 
  imagenes={[]}              // Array de URLs
  descripcion="Recordatorio" // Título del modal
/>
```

## Estados del Recordatorio

| ID | Label | Badge Color | Descripción |
|----|-------|-------------|-------------|
| 1 | Activo | default | Recordatorio activo |
| 2 | Completado | secondary | Tarea completada |
| 3 | Pendiente | destructive | Requiere atención |

## Flujo de Uso

### 1. **Listado**
- Usuario ve todos sus recordatorios
- Puede buscar por cualquier campo
- Accede a ver imágenes o editar

### 2. **Crear Recordatorio**
- Formulario limpio sin id_recordatorio
- Sube imágenes opcionales
- Validación en tiempo real

### 3. **Editar Recordatorio**
- Carga datos existentes automáticamente
- Muestra imágenes actuales con preview
- Permite eliminar imágenes existentes
- Permite agregar nuevas imágenes
- Actualización inteligente (solo cambios)

### 4. **Gestión de Imágenes**
- **Ver**: Modal con galería PhotoView
- **Eliminar**: API call específico
- **Agregar**: Upload con preview

## Integración con Backend

### Endpoints Utilizados
- `GET /recordatorios/mis-recordatorios` - Listado
- `GET /recordatorios/:id` - Obtener uno
- `POST /recordatorios` - Crear (multipart/form-data)
- `PUT /recordatorios/:id` - Actualizar (multipart/form-data)
- `DELETE /recordatorios/:id/imagenes` - Eliminar imágenes específicas

### Headers Requeridos
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data (para uploads)
```

## Dependencias Utilizadas

```json
{
  "react-hook-form": "Manejo de formularios",
  "zod": "Validación de schemas",
  "@hookform/resolvers": "Integración RHF + Zod",
  "react-photo-view": "Visualización de imágenes",
  "@tanstack/react-table": "DataTable avanzada",
  "sonner": "Notificaciones toast",
  "lucide-react": "Iconografía"
}
```

## Características Técnicas

### Performance
- **Lazy loading** de imágenes en DataTable
- **Debounced search** en DataTable
- **Optimistic updates** en eliminación de imágenes
- **Memoized columns** para evitar re-renders

### UX/UI
- **Loading states** en todas las operaciones
- **Error boundaries** con mensajes claros
- **Responsive design** en todos los componentes
- **Accessibility** con labels y ARIA attributes

### Security
- **JWT automático** desde AuthStore
- **Validación client-side** antes de API calls
- **File type validation** en uploads
- **Size validation** para prevenir abuse

## Próximas Mejoras Posibles

1. **Drag & Drop** para reordenar imágenes
2. **Bulk operations** (eliminar múltiples recordatorios)
3. **Filtros avanzados** por fechas y estados
4. **Export a PDF** de recordatorios
5. **Notificaciones push** para recordatorios
6. **Colaboración** (compartir recordatorios)
7. **Categorías** y etiquetas
8. **Búsqueda por contenido de imágenes** (OCR)