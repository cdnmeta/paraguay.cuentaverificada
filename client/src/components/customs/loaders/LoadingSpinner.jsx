import { Loader2 } from "lucide-react";

const LoadingSpinner = ({
  message = "Cargando sesión...",
  variant = "default",
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4 p-8">
        {/* Spinner */}
        <div className="relative">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div
            className="absolute inset-0 h-8 w-8 rounded-full border-2 border-primary/20 border-t-transparent animate-spin"
            style={{ animationDuration: "1.5s" }}
          />
        </div>

        {/* Mensaje de carga */}
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">{message}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Por favor espera un momento...
          </p>
        </div>

        {/* Indicador de progreso animado */}
        <div className="w-32 h-1 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full animate-pulse"
            style={{
              background:
                "linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)",
              animation: "shimmer 2s infinite",
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
