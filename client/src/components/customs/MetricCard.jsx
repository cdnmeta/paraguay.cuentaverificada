// MetricCard.jsx
import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Paleta de colores basada en shadcn/ui design tokens
const VARIANTS = {
  default: {
    card: "border-border",
    ring: "ring-ring/50",
    value: "text-foreground",
    icon: "text-muted-foreground",
    focus: "focus-visible:ring-ring",
    accent: "bg-accent",
  },
  primary: {
    card: "border-primary/20 bg-primary/5",
    ring: "ring-primary/50",
    value: "text-primary",
    icon: "text-primary",
    focus: "focus-visible:ring-primary",
    accent: "bg-primary/10",
  },
  secondary: {
    card: "border-secondary/50 bg-secondary/5",
    ring: "ring-secondary/50", 
    value: "text-secondary-foreground",
    icon: "text-secondary-foreground",
    focus: "focus-visible:ring-secondary",
    accent: "bg-secondary/20",
  },
  success: {
    card: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50",
    ring: "ring-green-500/50",
    value: "text-green-700 dark:text-green-400",
    icon: "text-green-600 dark:text-green-400",
    focus: "focus-visible:ring-green-500",
    accent: "bg-green-500",
  },
  warning: {
    card: "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/50",
    ring: "ring-yellow-500/50",
    value: "text-yellow-700 dark:text-yellow-400",
    icon: "text-yellow-600 dark:text-yellow-400",
    focus: "focus-visible:ring-yellow-500",
    accent: "bg-yellow-500",
  },
  destructive: {
    card: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50",
    ring: "ring-red-500/50",
    value: "text-red-700 dark:text-red-400",
    icon: "text-red-600 dark:text-red-400",
    focus: "focus-visible:ring-red-500",
    accent: "bg-red-500",
  },
  info: {
    card: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50",
    ring: "ring-blue-500/50",
    value: "text-blue-700 dark:text-blue-400",
    icon: "text-blue-600 dark:text-blue-400",
    focus: "focus-visible:ring-blue-500",
    accent: "bg-blue-500",
  },
};

/**
 * MetricCard - Componente de tarjeta de métricas con paleta shadcn/ui
 * @param {string}  title                    Título de la métrica (e.g., "Precio Meta")
 * @param {number|string} value             Valor principal a mostrar
 * @param {string}  [unit]                  Unidad de medida (e.g., "USD", "%")
 * @param {string}  [iconSrc]               URL de ícono (opcional)
 * @param {React.ReactNode} [icon]          Componente de ícono React (opcional)
 * @param {string}  [href]                  Si existe, la card es un enlace <a>
 * @param {function} [onClick]              Si existe, la card es clickeable <button>
 * @param {number}  [digitosNum=2]          Dígitos decimales para formateo numérico
 * @param {string}  [variant="default"]     Variante de color: default|primary|secondary|success|warning|destructive|info
 * @param {string}  [size="default"]        Tamaño: sm|default|lg
 * @param {string}  [className]             Clases CSS adicionales
 * @param {string}  [locale="es-PY"]        Locale para formateo numérico
 * @param {object}  [formatOptions]         Opciones adicionales para Intl.NumberFormat
 * @param {boolean} [disabled=false]        Deshabilita interacción
 * @param {boolean} [showAccent=true]       Muestra línea de acento superior
 */
export default function MetricCard({
  title,
  value,
  unit,
  iconSrc,
  icon,
  href,
  onClick,
  digitosNum = 2,
  variant = "default",
  size = "default",
  className,
  locale = "es-PY",
  formatOptions,
  disabled = false,
  showAccent = true,
}) {
  const variantStyles = VARIANTS[variant] || VARIANTS.default;

  // Tamaños predefinidos
  const sizeStyles = {
    sm: {
      card: "min-h-[140px]",
      content: "p-4 pt-2",
      icon: "h-6 w-6",
      title: "text-sm font-medium",
      value: "text-xl font-bold",
      unit: "text-xs",
    },
    default: {
      card: "min-h-[160px]",
      content: "p-6 pt-4",
      icon: "h-8 w-8",
      title: "text-base font-semibold",
      value: "text-2xl font-bold",
      unit: "text-sm",
    },
    lg: {
      card: "min-h-[200px]",
      content: "p-8 pt-6",
      icon: "h-10 w-10",
      title: "text-lg font-semibold",
      value: "text-3xl font-bold",
      unit: "text-base",
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.default;

  const isNumber = typeof value === "number" && Number.isFinite(value);
  const formatted = isNumber
    ? new Intl.NumberFormat(locale, { maximumFractionDigits: digitosNum, ...formatOptions }).format(value)
    : String(value ?? "—");

  // Componente base: si es interactivo, envolvemos la Card
  const CardWrapper = ({ children }) => {
    if (href) {
      return (
        <a
          href={href}
          className={cn(
            "block transition-all duration-200",
            !disabled && "hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            variantStyles.focus,
            disabled && "pointer-events-none opacity-50"
          )}
          aria-label={title}
        >
          {children}
        </a>
      );
    }
    
    if (onClick) {
      return (
        <button
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "w-full text-left transition-all duration-200",
            !disabled && "hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            variantStyles.focus,
            disabled && "opacity-50 cursor-not-allowed"
          )}
          aria-label={title}
        >
          {children}
        </button>
      );
    }
    
    return <>{children}</>;
  };

  return (
    <CardWrapper>
      <Card 
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          currentSize.card,
          variantStyles.card,
          !disabled && (href || onClick) && "cursor-pointer",
          className
        )}
      >
        {/* Línea de acento superior */}
        {showAccent && (
          <div className={cn("absolute top-0 left-0 right-0 h-1", variantStyles.accent)} />
        )}

        <CardContent className={cn("flex flex-col items-center justify-center text-center h-full space-y-3", currentSize.content)}>
          {/* Ícono */}
          {icon && (
            <div className={cn("flex items-center justify-center", currentSize.icon, variantStyles.icon)}>
              {icon}
            </div>
          )}
          
          {iconSrc && (
            <img 
              src={iconSrc} 
              alt="" 
              className={cn(currentSize.icon, "object-contain")} 
              loading="lazy" 
            />
          )}

          {/* Título */}
          <h3 className={cn(currentSize.title, "text-muted-foreground tracking-tight text-center")}>
            {title}
          </h3>

          {/* Valor principal */}
          <div className={cn(currentSize.value, variantStyles.value, "leading-none text-center")}>
            {formatted}
          </div>

          {/* Unidad */}
          {unit && (
            <p className={cn(currentSize.unit, "text-muted-foreground font-medium")}>
              {unit}
            </p>
          )}
        </CardContent>
      </Card>
    </CardWrapper>
  );
}