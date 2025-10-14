# Sistema de Mensaje del Día

## 📋 Descripción

El sistema de "Mensaje del Día" permite mostrar mensajes motivacionales, consejos o información relevante a los usuarios una vez por día. El sistema incluye persistencia en localStorage para evitar mostrar el mismo mensaje múltiples veces en el mismo día.

## 🎯 Características

### Core Features
- ✅ **Una vez por día**: Solo se muestra un mensaje nuevo por día
- ✅ **Persistencia local**: Usa localStorage para recordar mensajes vistos
- ✅ **Tipos configurables**: Diferentes tipos de mensajes (motivacional, logros, etc.)
- ✅ **API integration**: Integrado con endpoint `/estados-animos/obtener-mensaje`
- ✅ **Dialog modal**: Solo se puede cerrar con botón específico
- ✅ **Reutilizable**: Hook y componente para usar en cualquier página

### UX Features
- 🚫 **No se puede cerrar accidentalmente**: Previene clicks fuera y escape key
- 🎨 **Iconos por tipo**: Cada tipo de mensaje tiene su icono distintivo
- 📱 **Responsive**: Adaptado para todos los dispositivos
- ⚡ **Loading states**: Indicadores de carga apropiados

## 📦 Archivos del Sistema

### 1. Hook Principal
**`/hooks/useMensajeDelDia.js`**
- Maneja toda la lógica del mensaje del día
- Persistencia en localStorage
- Estados de carga y error

### 2. Componente UI
**`/components/customs/MensajeDelDiaDialog.jsx`**
- Dialog modal reutilizable
- Componente Provider para uso simplificado

### 3. Utilidades
**`/utils/mensajeDelDiaUtils.js`**
- Iconos por tipo de mensaje
- Funciones de formato
- Constantes del sistema

### 4. API
**`/apis/estados-animos.api.js`**
- Función `getMensajeDelDia(params)`
- Integración con backend

## 🚀 Uso Básico

### Opción 1: Con Hook (Recomendado)
```jsx
import React from 'react'
import { useMensajeDelDiaSimple } from '@/hooks/useMensajeDelDia'
import { MensajeDelDiaDialog } from '@/components/customs/MensajeDelDiaDialog'

function MiPagina() {
  const {
    mensajeDelDia,
    mostrarMensaje,
    cargandoMensaje,
    cerrarMensajeDelDia
  } = useMensajeDelDiaSimple()

  return (
    <div>
      {/* Tu contenido normal */}
      <h1>Mi Página</h1>
      
      {/* Dialog del mensaje del día */}
      <MensajeDelDiaDialog
        open={mostrarMensaje}
        mensaje={mensajeDelDia}
        loading={cargandoMensaje}
        onClose={cerrarMensajeDelDia}
      />
    </div>
  )
}
```

### Opción 2: Con Provider (Más Simple)
```jsx
import React from 'react'
import { MensajeDelDiaProvider } from '@/components/customs/MensajeDelDiaDialog'

function MiApp() {
  return (
    <MensajeDelDiaProvider tipoMensaje={1} autoLoad={true}>
      {/* Tu aplicación completa */}
      <MiPagina />
    </MensajeDelDiaProvider>
  )
}
```

## 🔧 Configuración Avanzada

### Hook con Opciones
```jsx
const {
  mensajeDelDia,
  mostrarMensaje,
  cargandoMensaje,
  cerrarMensajeDelDia,
  fetchMensajeDelDia,
  limpiarCacheMensaje
} = useMensajeDelDia({
  autoLoad: true,           // Cargar automáticamente al montar
  tipoMensaje: 1,          // Tipo de mensaje (1-5)
  onMensajeObtenido: (msg) => {
    console.log('Nuevo mensaje:', msg)
  },
  onError: (error) => {
    console.error('Error:', error)
  }
})
```

### Tipos de Mensaje Disponibles
```javascript
const TIPOS_MENSAJE = {
  1: 'Motivacional',      // Mensajes de ánimo y motivación
  2: 'Amor y Amistad',    // Mensajes sobre relaciones
  3: 'Logros',            // Celebración de éxitos
  4: 'Energía',           // Mensajes energizantes
  5: 'Metas'              // Enfoque en objetivos
}
```

## 📊 Estructura de Datos

### Request DTO
```typescript
interface MensajeDelDiaRequest {
  id_mensaje_ant?: number;    // ID del último mensaje visto (opcional)
  id_tipo_mensaje: number;    // Tipo de mensaje (requerido, 1-5)
}
```

### Response DTO
```typescript
interface MensajeDelDiaResponse {
  mensaje: string;                    // Texto del mensaje
  id_tipo_animo: number;             // ID único del mensaje
  descripcion_tipo_mesaje: string;   // Descripción del tipo
}
```

### Ejemplo de Response
```json
{
  "mensaje": "¡Vamos! Tu entusiasmo es contagioso; aprovechemos para avanzar juntos 💪",
  "id_tipo_animo": 1,
  "descripcion_tipo_mesaje": "Entusiasmado"
}
```

## 💾 Sistema de Persistencia

### LocalStorage Keys
- `ultimo_mensaje_del_dia`: ID del último mensaje visto
- `fecha_ultimo_mensaje_del_dia`: Fecha del último mensaje

### Lógica de Control
1. **Al cargar**: Verificar si hay mensaje visto hoy
2. **Si es nuevo día**: Permitir nuevo mensaje (limpiar cache)
3. **Si ya vio mensaje hoy**: No llamar API
4. **Al cerrar mensaje**: Guardar ID y fecha en localStorage

### Funciones de Cache
```javascript
// Limpiar cache (útil para development)
const { limpiarCacheMensaje } = useMensajeDelDia()
limpiarCacheMensaje()

// Obtener último mensaje visto
const ultimoId = obtenerUltimoMensajeVisto()
```

## 🎨 Personalización

### Icono Personalizado
```jsx
<MensajeDelDiaDialog
  open={mostrarMensaje}
  mensaje={mensajeDelDia}
  onClose={cerrarMensajeDelDia}
  icon={<CustomIcon className="h-6 w-6 text-primary" />}
/>
```

### Estilos Personalizados
```jsx
<MensajeDelDiaDialog
  open={mostrarMensaje}
  mensaje={mensajeDelDia}
  onClose={cerrarMensajeDelDia}
  className="custom-dialog-styles"
/>
```

## 🧪 Testing y Development

### Limpiar Cache para Testing
```javascript
// En consola del navegador o en código
localStorage.removeItem('ultimo_mensaje_del_dia')
localStorage.removeItem('fecha_ultimo_mensaje_del_dia')
```

### Mock para Development
```javascript
// En development, puedes mockear la API
const mockResponse = {
  status: 200,
  data: {
    mensaje: "Mensaje de prueba para development",
    id_tipo_animo: 99,
    descripcion_tipo_mesaje: "Testing"
  }
}
```

### Forzar Nuevo Mensaje
```javascript
const { fetchMensajeDelDia, limpiarCacheMensaje } = useMensajeDelDia()

// Limpiar cache y obtener nuevo mensaje
limpiarCacheMensaje()
fetchMensajeDelDia()
```

## 🔄 Integración en Páginas Existentes

### En Dashboard Principal
```jsx
// En DashBoardUsarioProtegido.jsx
import { useMensajeDelDiaSimple } from '@/hooks/useMensajeDelDia'
import { MensajeDelDiaDialog } from '@/components/customs/MensajeDelDiaDialog'

// Agregar el hook y el dialog
const { mensajeDelDia, mostrarMensaje, cargandoMensaje, cerrarMensajeDelDia } = useMensajeDelDiaSimple()

// En el JSX, antes del cierre del componente
<MensajeDelDiaDialog
  open={mostrarMensaje}
  mensaje={mensajeDelDia}
  loading={cargandoMensaje}
  onClose={cerrarMensajeDelDia}
/>
```

### En Layout Global
```jsx
// En el layout principal de la aplicación
function MainLayout({ children }) {
  return (
    <MensajeDelDiaProvider tipoMensaje={1}>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </MensajeDelDiaProvider>
  )
}
```

## 🛠️ Troubleshooting

### Mensaje no aparece
1. Verificar que la API esté funcionando
2. Revisar console.log para errores
3. Limpiar localStorage si está en development
4. Verificar que el tipoMensaje sea válido (1-5)

### Mensaje aparece múltiples veces
1. Verificar que se llame `cerrarMensajeDelDia()` correctamente
2. Revisar que localStorage esté funcionando
3. Verificar que no haya múltiples instancias del hook

### Errores de API
- El sistema es silencioso por diseño (no muestra errores al usuario)
- Revisar console para logs de debug
- Verificar token de autenticación
- Verificar formato de parámetros enviados

## 📈 Futuras Mejoras

### Funcionalidades Sugeridas
- [ ] Programar mensajes por horario específico
- [ ] Mensajes basados en el comportamiento del usuario
- [ ] Estadísticas de mensajes vistos
- [ ] Compartir mensajes en redes sociales
- [ ] Mensajes push/notificaciones
- [ ] Personalización por usuario
- [ ] Sistema de "me gusta" en mensajes

### Optimizaciones Técnicas
- [ ] Cache más inteligente con TTL
- [ ] Prefetch de mensajes
- [ ] Compresión de datos en localStorage
- [ ] Backup en IndexedDB
- [ ] Service Worker para offline