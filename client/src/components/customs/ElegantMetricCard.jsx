// ElegantMetricCard.jsx
import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Paleta de colores elegante con gradientes sutiles
const ELEGANT_VARIANTS = {
  default: {
    card: "bg-gradient-to-br from-card via-card to-card/95 border-border/50 shadow-sm hover:shadow-md",
    ring: "ring-ring/30",
    value: "text-foreground",
    icon: "text-muted-foreground",
    accent: "bg-gradient-to-r from-accent to-accent/80",
    glow: "shadow-accent/20",
    focus: "focus-visible:ring-ring/50",
  },
  emerald: {
    card: "bg-gradient-to-br from-emerald-50 via-emerald-25 to-white border-emerald-200/60 dark:from-emerald-950/20 dark:via-emerald-950/10 dark:to-background dark:border-emerald-800/30",
    ring: "ring-emerald-300/40",
    value: "text-emerald-700 dark:text-emerald-400",
    icon: "text-emerald-600 dark:text-emerald-500",
    accent: "bg-gradient-to-r from-emerald-400 to-emerald-500",
    glow: "shadow-emerald-200/30 dark:shadow-emerald-900/20",
    focus: "focus-visible:ring-emerald-400/50",
  },
  sapphire: {
    card: "bg-gradient-to-br from-blue-50 via-blue-25 to-white border-blue-200/60 dark:from-blue-950/20 dark:via-blue-950/10 dark:to-background dark:border-blue-800/30",
    ring: "ring-blue-300/40",
    value: "text-blue-700 dark:text-blue-400",
    icon: "text-blue-600 dark:text-blue-500",
    accent: "bg-gradient-to-r from-blue-400 to-blue-500",
    glow: "shadow-blue-200/30 dark:shadow-blue-900/20",
    focus: "focus-visible:ring-blue-400/50",
  },
  amber: {
    card: "bg-gradient-to-br from-amber-50 via-amber-25 to-white border-amber-200/60 dark:from-amber-950/20 dark:via-amber-950/10 dark:to-background dark:border-amber-800/30",
    ring: "ring-amber-300/40",
    value: "text-amber-700 dark:text-amber-400",
    icon: "text-amber-600 dark:text-amber-500",
    accent: "bg-gradient-to-r from-amber-400 to-amber-500",
    glow: "shadow-amber-200/30 dark:shadow-amber-900/20",
    focus: "focus-visible:ring-amber-400/50",
  },
  rose: {
    card: "bg-gradient-to-br from-rose-50 via-rose-25 to-white border-rose-200/60 dark:from-rose-950/20 dark:via-rose-950/10 dark:to-background dark:border-rose-800/30",
    ring: "ring-rose-300/40",
    value: "text-rose-700 dark:text-rose-400",
    icon: "text-rose-600 dark:text-rose-500",
    accent: "bg-gradient-to-r from-rose-400 to-rose-500",
    glow: "shadow-rose-200/30 dark:shadow-rose-900/20",
    focus: "focus-visible:ring-rose-400/50",
  },
  violet: {
    card: "bg-gradient-to-br from-violet-50 via-violet-25 to-white border-violet-200/60 dark:from-violet-950/20 dark:via-violet-950/10 dark:to-background dark:border-violet-800/30",
    ring: "ring-violet-300/40",
    value: "text-violet-700 dark:text-violet-400",
    icon: "text-violet-600 dark:text-violet-500",
    accent: "bg-gradient-to-r from-violet-400 to-violet-500",
    glow: "shadow-violet-200/30 dark:shadow-violet-900/20",
    focus: "focus-visible:ring-violet-400/50",
  },
  slate: {
    card: "bg-gradient-to-br from-slate-50 via-slate-25 to-white border-slate-200/60 dark:from-slate-950/20 dark:via-slate-950/10 dark:to-background dark:border-slate-800/30",
    ring: "ring-slate-300/40",
    value: "text-slate-700 dark:text-slate-400",
    icon: "text-slate-600 dark:text-slate-500",
    accent: "bg-gradient-to-r from-slate-400 to-slate-500",
    glow: "shadow-slate-200/30 dark:shadow-slate-900/20",
    focus: "focus-visible:ring-slate-400/50",
  },
};

// Estilos de tamaño con proporciones elegantes
const ELEGANT_SIZES = {
  sm: {
    card: "min-h-[120px] max-w-sm",
    content: "p-4 gap-2",
    icon: "w-8 h-8",
    iconContainer: "w-12 h-12",
    title: "text-xs font-medium tracking-wide uppercase",
    value: "text-lg font-bold",
    unit: "text-xs",
    badge: "text-xs px-2 py-0.5",
  },
  default: {
    card: "min-h-[140px] max-w-md",
    content: "p-6 gap-3",
    icon: "w-10 h-10",
    iconContainer: "w-14 h-14",
    title: "text-sm font-medium tracking-wide uppercase",
    value: "text-2xl font-bold",
    unit: "text-sm",
    badge: "text-sm px-3 py-1",
  },
  lg: {
    card: "min-h-[180px] max-w-lg",
    content: "p-8 gap-4",
    icon: "w-12 h-12",
    iconContainer: "w-16 h-16",
    title: "text-base font-medium tracking-wide uppercase",
    value: "text-3xl font-bold",
    unit: "text-base",
    badge: "text-base px-4 py-1.5",
  },
};

/**
 * ElegantMetricCard - Componente de métrica elegante y moderno
 * @param {string}  title                    Título de la métrica
 * @param {number|string} value             Valor principal
 * @param {string}  [unit]                  Unidad de medida
 * @param {React.ReactNode} [icon]          Ícono React
 * @param {string}  [iconSrc]               URL de imagen para ícono
 * @param {string}  [href]                  Enlace URL
 * @param {function} [onClick]              Función de click
 * @param {number}  [digitosNum=2]          Decimales para formateo
 * @param {string}  [variant="default"]     Variante de color
 * @param {string}  [size="default"]        Tamaño del componente
 * @param {string}  [className]             Clases CSS adicionales
 * @param {string}  [locale="es-PY"]        Locale para formateo
 * @param {object}  [formatOptions]         Opciones de formateo
 * @param {boolean} [disabled=false]        Estado deshabilitado
 * @param {boolean} [showAccent=true]       Mostrar línea de acento
 * @param {boolean} [showGlow=true]         Mostrar efecto de brillo
 * @param {string}  [trend]                 Tendencia: "up", "down", "neutral"
 * @param {string}  [subtitle]              Subtítulo opcional
 * @param {string}  [badge]                 Texto de badge opcional
 */
export default function ElegantMetricCard({
  title,
  value,
  unit,
  icon,
  iconSrc,
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
  showGlow = true,
  trend,
  subtitle,
  badge,
}) {
  const variantStyles = ELEGANT_VARIANTS[variant] || ELEGANT_VARIANTS.default;
  const sizeStyles = ELEGANT_SIZES[size] || ELEGANT_SIZES.default;

  const isNumber = typeof value === "number" && Number.isFinite(value);
  const formatted = isNumber
    ? new Intl.NumberFormat(locale, { maximumFractionDigits: digitosNum, ...formatOptions }).format(value)
    : String(value ?? "—");

  // Componente wrapper para interactividad
  const CardWrapper = ({ children }) => {
    if (href) {
      return (
        <a
          href={href}
          className={cn(
            "block group transition-all duration-300 ease-out",
            !disabled && "hover:scale-[1.02] active:scale-[0.98]",
            !disabled && "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            variantStyles.focus,
            disabled && "pointer-events-none opacity-60"
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
            "w-full group transition-all duration-300 ease-out",
            !disabled && "hover:scale-[1.02] active:scale-[0.98]",
            !disabled && "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            variantStyles.focus,
            disabled && "opacity-60 cursor-not-allowed"
          )}
          aria-label={title}
        >
          {children}
        </button>
      );
    }
    
    return <div className="group">{children}</div>;
  };

  // Indicador de tendencia
  const TrendIndicator = () => {
    if (!trend) return null;
    
    const trendStyles = {
      up: "text-emerald-600 dark:text-emerald-400",
      down: "text-rose-600 dark:text-rose-400", 
      neutral: "text-slate-500 dark:text-slate-400",
    };
    
    const trendIcons = {
      up: "↗",
      down: "↘",
      neutral: "→",
    };
    
    return (
      <span className={cn("text-xs font-medium", trendStyles[trend])}>
        {trendIcons[trend]}
      </span>
    );
  };

  return (
    <CardWrapper>
      <Card 
        className={cn(
          "relative overflow-hidden border transition-all duration-300 ease-out",
          sizeStyles.card,
          variantStyles.card,
          showGlow && variantStyles.glow,
          !disabled && (href || onClick) && "cursor-pointer",
          "group-hover:shadow-lg",
          className
        )}
      >
        {/* Línea de acento superior con gradiente */}
        {showAccent && (
          <div 
            className={cn(
              "absolute top-0 left-0 right-0 h-1 opacity-80 group-hover:opacity-100 transition-opacity",
              variantStyles.accent
            )} 
          />
        )}

        {/* Efecto de brillo sutil */}
        {showGlow && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        )}

        <CardContent className={cn("relative flex flex-col", sizeStyles.content)}>
          {/* Header con título y badge */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                sizeStyles.title, 
                "text-muted-foreground/80 truncate"
              )}>
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-muted-foreground/60 mt-1 truncate">
                  {subtitle}
                </p>
              )}
            </div>
            
            {badge && (
              <Badge 
                variant="secondary" 
                className={cn(sizeStyles.badge, "ml-2 shrink-0")}
              >
                {badge}
              </Badge>
            )}
          </div>

          {/* Contenido principal */}
          <div className="flex items-center justify-between flex-1">
            <div className="flex-1 min-w-0">
              {/* Valor y tendencia */}
              <div className="flex items-baseline gap-2">
                <span className={cn(
                  sizeStyles.value, 
                  variantStyles.value,
                  "truncate"
                )}>
                  {formatted}
                </span>
                <TrendIndicator />
              </div>
              
              {/* Unidad */}
              {unit && (
                <p className={cn(
                  sizeStyles.unit, 
                  "text-muted-foreground/70 font-medium mt-1"
                )}>
                  {unit}
                </p>
              )}
            </div>

            {/* Ícono con contenedor elegante */}
            {(icon || iconSrc) && (
              <div className={cn(
                "shrink-0 rounded-full flex items-center justify-center ml-4",
                "bg-gradient-to-br from-background to-background/80",
                "border border-border/50 shadow-sm",
                "group-hover:shadow-md transition-all duration-300",
                sizeStyles.iconContainer
              )}>
                {icon ? (
                  <div className={cn(sizeStyles.icon, variantStyles.icon)}>
                    {icon}
                  </div>
                ) : iconSrc ? (
                  <img 
                    src={iconSrc} 
                    alt="" 
                    className={cn(sizeStyles.icon, "object-contain")} 
                    loading="lazy" 
                  />
                ) : null}
              </div>
            )}
          </div>
        </CardContent>

        {/* Overlay sutil para interactividad */}
        {(href || onClick) && !disabled && (
          <div className="absolute inset-0 bg-gradient-to-br from-foreground/0 to-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        )}
      </Card>
    </CardWrapper>
  );
}