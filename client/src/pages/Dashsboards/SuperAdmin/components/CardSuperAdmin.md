# CardSuperAdmin Component

Componente de tarjeta personalizada para el dashboard de Super Administrador, basado en el diseño de `DashBoardUsarioProtegido.jsx` pero adaptado específicamente para funciones administrativas.

## Características

- **Diseño responsive** con efectos hover suaves
- **Variantes de color** para categorizar diferentes tipos de acciones
- **Soporte para múltiples tipos de iconos** (Lucide, imágenes, componentes)
- **Animaciones fluidas** al hacer hover y al hacer clic
- **Backdrop blur** para un efecto moderno

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `icon` | `string \| React.Component \| React.Element` | - | Icono a mostrar (URL de imagen, componente Lucide, o elemento React) |
| `title` | `string` | - | Título de la tarjeta |
| `desc` | `string` | - | Descripción de la funcionalidad |
| `onClick` | `function` | - | Función a ejecutar al hacer clic |
| `variant` | `'default' \| 'warning' \| 'success' \| 'danger'` | `'default'` | Variante de color |

## Variantes

### Default
- **Color**: Azul primario
- **Uso**: Funciones generales de administración

### Warning  
- **Color**: Naranja
- **Uso**: Acciones que requieren atención (aprobaciones, pendientes)

### Success
- **Color**: Verde  
- **Uso**: Funciones relacionadas con comercios verificados

### Danger
- **Color**: Rojo
- **Uso**: Acciones críticas o de eliminación

## Ejemplos de Uso

```jsx
import CardSuperAdmin from './components/CardSuperAdmin';
import { Users, AlertTriangle } from 'lucide-react';

// Con icono de Lucide
<CardSuperAdmin 
  icon={Users}
  title="Gestión de Usuarios"
  desc="Ver y gestionar todos los usuarios del sistema"
  onClick={() => navigate('/usuarios')}
  variant="default"
/>

// Con imagen
<CardSuperAdmin 
  icon="/icons/comercio.png"
  title="Comercios"
  desc="Gestionar comercios registrados"
  onClick={() => navigate('/comercios')}
  variant="success"
/>

// Con variante de advertencia
<CardSuperAdmin 
  icon={AlertTriangle}
  title="Aprobaciones Pendientes"
  desc="Revisar solicitudes pendientes de aprobación"
  onClick={() => navigate('/aprobaciones')}
  variant="warning"
/>
```

## Efectos Visuales

- **Hover**: Escala 105%, sombra más pronunciada
- **Icon container**: Cambia color de fondo según variante
- **Text**: Color de texto se adapta a la variante al hacer hover
- **Transiciones**: 300ms de duración para suavidad

## Integración con Features

El componente se integra perfectamente con el sistema de features de SuperAdmin:

```jsx
// En features.js
export const seccionesFeatures = [
  {
    title: "Usuarios",
    desc: "Gestionar usuarios del sistema", 
    icon: Users,
    path: "/super-admin/usuarios",
    variant: "default"
  }
];

// En el dashboard
{secciones.map((item, index) => (
  <CardSuperAdmin 
    key={index}
    icon={item.icon}
    title={item.title}
    desc={item.desc}
    onClick={item.onClick}
    variant={item.variant}
  />
))}
```