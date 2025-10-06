# MetricCard Component

Un componente React que utiliza la estructura **Card** nativa de shadcn/ui para mostrar métricas importantes con una paleta de colores consistente y accesible.

## 🎯 Características

- 🧩 **Estructura Card nativa**: Usa `Card`, `CardContent` de shadcn/ui
- 🎨 **7 variantes de color**: default, primary, secondary, success, warning, destructive, info
- 📏 **3 tamaños optimizados**: sm (compacto), default (estándar), lg (destacado)
- 🔗 **Interactividad inteligente**: Enlaces, botones y estados disabled
- 🌍 **Internacionalización**: Formateo numérico localizado con `Intl.NumberFormat`
- ♿ **Accesibilidad completa**: ARIA labels, navegación por teclado, focus visible
- 🎯 **Línea de acento**: Banda superior colorida opcional para mayor énfasis
- 🌙 **Modo oscuro**: Soporte automático con variables CSS de shadcn/ui

## 📦 Instalación

```bash
# Asegúrate de tener shadcn/ui configurado
npx shadcn-ui@latest init

# Instala el componente Card si no lo tienes
npx shadcn-ui@latest add card
```

## 🚀 Uso básico

```jsx
import MetricCard from '@/components/customs/MetricCard';
import { DollarSign, TrendingUp, Users } from 'lucide-react';

function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard
        title="Ingresos Totales"
        value={125000}
        unit="USD"
        variant="success"
        icon={<DollarSign />}
      />
      
      <MetricCard
        title="Crecimiento"
        value={15.5}
        unit="%"
        variant="info"
        icon={<TrendingUp />}
        onClick={() => handleViewDetails()}
      />
      
      <MetricCard
        title="Usuarios"
        value={1250}
        variant="primary"
        icon={<Users />}
        href="/usuarios"
      />
    </div>
  );
}
```

## 📋 Props API

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `title` | `string` | - | **Requerido.** Título descriptivo de la métrica |
| `value` | `number \| string` | - | **Requerido.** Valor principal a mostrar |
| `unit` | `string` | - | Unidad de medida opcional (ej: "USD", "%", "items") |
| `icon` | `ReactNode` | - | Componente de ícono (recomendado: Lucide React) |
| `iconSrc` | `string` | - | URL de imagen alternativa para ícono |
| `variant` | `VariantType` | `"default"` | Variante de color (ver tabla abajo) |
| `size` | `SizeType` | `"default"` | Tamaño del componente |
| `href` | `string` | - | Si se proporciona, convierte la card en enlace |
| `onClick` | `function` | - | Si se proporciona, convierte la card en botón |
| `disabled` | `boolean` | `false` | Deshabilita toda interacción |
| `showAccent` | `boolean` | `true` | Muestra la línea de acento superior |
| `digitosNum` | `number` | `2` | Decimales para formateo numérico |
| `locale` | `string` | `"es-PY"` | Locale para formateo (ej: "en-US", "es-ES") |
| `formatOptions` | `object` | - | Opciones adicionales para `Intl.NumberFormat` |
| `className` | `string` | - | Clases CSS adicionales para la Card |

### Tipos disponibles

```typescript
type VariantType = "default" | "primary" | "secondary" | "success" | "warning" | "destructive" | "info"
type SizeType = "sm" | "default" | "lg"
```

## Variantes de color

### Default
Color neutral usando `bg-card` y `text-foreground`

```jsx
<MetricCard variant="default" title="Métrica" value={100} />
```

### Primary
Usa el color primario del tema

```jsx
<MetricCard variant="primary" title="Usuarios" value={1250} />
```

### Success
Verde para métricas positivas

```jsx
<MetricCard variant="success" title="Crecimiento" value={15.5} unit="%" />
```

### Warning
Amarillo para alertas o métricas que requieren atención

```jsx
<MetricCard variant="warning" title="Alertas" value={3} />
```

### Destructive
Rojo para errores o métricas negativas

```jsx
<MetricCard variant="destructive" title="Errores" value={2} />
```

### Info
Azul para información general

```jsx
<MetricCard variant="info" title="Información" value={42} />
```

### Secondary
Color secundario del tema

```jsx
<MetricCard variant="secondary" title="Secundario" value={200} />
```

## Tamaños

### Small (sm)
Ideal para dashboards compactos
- Altura mínima: 160px
- Padding: 16px
- Ícono: 32x32px

### Default
Tamaño estándar recomendado
- Altura mínima: 200px
- Padding: 24px
- Ícono: 40x40px

### Large (lg)
Para métricas principales destacadas
- Altura mínima: 240px
- Padding: 32px
- Ícono: 48x48px

## Formateo de números

El componente usa `Intl.NumberFormat` para formateo localizado:

```jsx
// Formato de moneda
<MetricCard
  value={1250.75}
  formatOptions={{ style: 'currency', currency: 'USD' }}
  locale="en-US"
/>

// Formato de porcentaje
<MetricCard
  value={0.156}
  formatOptions={{ style: 'percent' }}
/>

// Sin decimales
<MetricCard
  value={8500000}
  digitosNum={0}
/>
```

## Interactividad

### Como enlace
```jsx
<MetricCard
  title="Ver detalles"
  value={100}
  href="/detalles"
/>
```

### Como botón
```jsx
<MetricCard
  title="Acción"
  value={100}
  onClick={() => handleClick()}
/>
```

### Deshabilitado
```jsx
<MetricCard
  title="No disponible"
  value={0}
  disabled
  onClick={() => {}} // No se ejecutará
/>
```

## Personalización con CSS

El componente utiliza las variables CSS de shadcn/ui, por lo que automáticamente se adapta al tema configurado:

```css
/* Ejemplo de variables que usa el componente */
:root {
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --border: 214.3 31.8% 91.4%;
  --ring: 222.2 47.4% 11.2%;
}
```

## Accesibilidad

- Usa etiquetas `aria-label` apropiadas
- Soporte completo para navegación por teclado
- Estados de focus visibles
- Contraste de colores conforme a WCAG

## Compatibilidad

- React 16.8+
- Tailwind CSS 3.0+
- shadcn/ui components
- Navegadores modernos con soporte para CSS Grid y Flexbox