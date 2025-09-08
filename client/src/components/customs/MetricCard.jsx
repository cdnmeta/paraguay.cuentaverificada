// MetricCardTW.jsx
import React from "react";

// util mínima para clases
const cn = (...xs) => xs.filter(Boolean).join(" ");

// mapas de acentos (podés ampliar a gusto)
const ACCENTS = {
  emerald: {
    ring: "ring-emerald-400/60",
    value: "text-emerald-300",
    icon: "text-emerald-300",
    focus: "focus-visible:ring-emerald-400/70",
  },
  sky: {
    ring: "ring-sky-400/60",
    value: "text-sky-300",
    icon: "text-sky-300",
    focus: "focus-visible:ring-sky-400/70",
  },
  amber: {
    ring: "ring-amber-400/60",
    value: "text-amber-300",
    icon: "text-amber-300",
    focus: "focus-visible:ring-amber-400/70",
  },
  rose: {
    ring: "ring-rose-400/60",
    value: "text-rose-300",
    icon: "text-rose-300",
    focus: "focus-visible:ring-rose-400/70",
  },
};

/**
 * MetricCardTW (Tailwind only)
 * @param {string}  title                 Título (e.g., "Precio Meta")
 * @param {number|string} value          Valor (formatea si es number)
 * @param {string}  [unit]               Unidad (e.g., "USD")
 * @param {string}  [iconSrc]            URL de ícono (opcional)
 * @param {React.ReactNode} [icon]       Nodo React como ícono (opcional)
 * @param {string}  [href]               Si existe, la card es <a>
 * @param {function} [onClick]           Si existe, la card es <button>
 * @param {string}  [accent="emerald"]   Clave de ACCENTS (emerald|sky|amber|rose)
 * @param {string}  [className]          Clases extra para el contenedor
 * @param {string}  [locale="es-PY"]     Locale para formateo numérico
 * @param {object}  [formatOptions]      Opciones Intl.NumberFormat
 * @param {boolean} [disabled=false]     Deshabilita interacción
 */
export default function MetricCardTW({
  title,
  value,
  unit,
  iconSrc,
  icon,
  href,
  onClick,
  accent = "emerald",
  className,
  locale = "es-PY",
  formatOptions,
  disabled = false,
}) {
  const a = ACCENTS[accent] || ACCENTS.emerald;

  const isNumber = typeof value === "number" && Number.isFinite(value);
  const formatted = isNumber
    ? new Intl.NumberFormat(locale, { maximumFractionDigits: 2, ...formatOptions }).format(value)
    : String(value ?? "—");

  // wrapper semántico según props
  const Wrapper = href ? "a" : onClick ? "button" : "div";
  const interactive = !!(href || onClick);

  return (
    <Wrapper
      href={href}
      onClick={onClick}
      disabled={disabled}
      aria-label={title}
      className={cn(
        "block relative w-full min-h-[211px]",
        "rounded-[20px] ring-1 shadow-[0_10px_25px_rgba(0,0,0,.40)]",
        "bg-neutral-900/90 text-white overflow-hidden",
        a.ring,
        interactive && !disabled
          ? cn(
              "transition-all duration-300 cursor-pointer",
              "hover:scale-[1.02] hover:shadow-[0_16px_40px_rgba(0,0,0,.50)]",
              "focus:outline-none focus-visible:ring-2",
              a.focus
            )
          : "",
        disabled ? "opacity-60 cursor-not-allowed" : "",
        className
      )}
    >
      {/* capa de sombreado/gradiente */}
      <div className="pointer-events-none absolute inset-0 rounded-[20px] bg-gradient-to-b from-black/30 to-black/40" />

      {/* contenido */}
      <div className="relative z-10 flex flex-col items-center text-center p-5">
        {/* icono */}
        {icon ? (
          <div className={cn("mt-2 h-12 w-12", a.icon)}>{icon}</div>
        ) : iconSrc ? (
          <img src={iconSrc} alt="" className="mt-2 h-12 w-12 object-contain" loading="lazy" />
        ) : null}

        {/* título */}
        <h2 className="mt-4 text-[1.25rem] font-semibold tracking-tight">{title}</h2>

        {/* valor con acento */}
        <div className={cn("mt-1 font-extrabold text-4xl sm:text-[2.25rem] leading-none", a.value)}>
          {formatted}
        </div>

        {/* unidad */}
        {unit ? <p className="mt-1 text-base text-white/80">{unit}</p> : null}
      </div>
    </Wrapper>
  );
}