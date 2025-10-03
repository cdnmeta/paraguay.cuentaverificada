# Sidebar SuperAdmin

Este directorio contiene los componentes del sidebar específicamente diseñados para el dashboard de Super Administrador.

## Estructura

```
sidebar/
├── index.js                 # Exportaciones principales
├── app-sidebar.jsx         # Componente principal del sidebar
├── nav-main.jsx            # Navegación principal con menús colapsables
├── nav-projects.jsx        # Acceso rápido a funciones importantes
└── nav-user.jsx            # Menú de usuario con opciones específicas de SuperAdmin
```

## Componentes

### AppSidebarSuperAdmin
- **Archivo**: `app-sidebar.jsx`
- **Propósito**: Componente principal que integra todos los elementos del sidebar
- **Características**:
  - Sidebar colapsable con ícono
  - Navegación específica para SuperAdmin
  - Acceso rápido a funciones críticas

### NavMainSuperAdmin
- **Archivo**: `nav-main.jsx`
- **Propósito**: Navegación principal con menús expandibles
- **Secciones**:
  - Gestión de Usuarios
  - Comercios
  - Planes y Suscripciones
  - Reportes y Analytics

### NavProjectsSuperAdmin
- **Archivo**: `nav-projects.jsx`
- **Propósito**: Acceso rápido a funciones importantes
- **Enlaces rápidos**:
  - Dashboard Principal
  - Verificaciones Pendientes
  - Configuración del Sistema
  - Base de Datos

### NavUserSuperAdmin
- **Archivo**: `nav-user.jsx`
- **Propósito**: Menú de usuario con opciones específicas
- **Opciones**:
  - Mi Perfil
  - Configuración
  - Gestión de Permisos
  - Notificaciones
  - Verificaciones
  - Cerrar sesión

## Uso

```jsx
import { AppSidebarSuperAdmin } from './components/sidebar';

// En el layout
<SidebarProvider>
  <AppSidebarSuperAdmin />
  <SidebarInset>
    {/* Contenido principal */}
  </SidebarInset>
</SidebarProvider>
```

## Características del Diseño

- **Responsive**: Se adapta a móvil y desktop
- **Colapsable**: Puede minimizarse a solo íconos
- **Temática SuperAdmin**: Colores orange/amber para destacar el rol
- **Navegación jerárquica**: Menús expandibles con sub-elementos
- **Avatar personalizado**: Muestra iniciales con color distintivo

## Personalización

Para modificar los elementos de navegación, edita el objeto `superAdminData` en `app-sidebar.jsx`:

```jsx
const superAdminData = {
  navigation: [
    // Elementos de navegación principal
  ],
  quickAccess: [
    // Elementos de acceso rápido
  ]
}
```