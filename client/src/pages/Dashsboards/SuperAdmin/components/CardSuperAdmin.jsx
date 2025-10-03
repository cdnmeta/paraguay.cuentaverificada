import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Componente de tarjeta personalizada para SuperAdmin
 * Basado en el diseño de DashBoardUsarioProtegido pero adaptado para administración
 */
export default function CardSuperAdmin({ 
  icon, 
  title, 
  desc, 
  onClick,
  variant = "default" // "default" | "warning" | "success" | "danger"
}) {
  
  // Determinar colores según variante
  const getVariantClasses = () => {
    switch (variant) {
      case "warning":
        return "hover:border-orange-500/50 hover:bg-orange-500/5 group-hover:text-orange-600";
      case "success":
        return "hover:border-green-500/50 hover:bg-green-500/5 group-hover:text-green-600";
      case "danger":
        return "hover:border-red-500/50 hover:bg-red-500/5 group-hover:text-red-600";
      default:
        return "hover:border-primary/50 hover:bg-primary/5 group-hover:text-primary";
    }
  };

  const getIconBgClasses = () => {
    switch (variant) {
      case "warning":
        return "bg-orange-100 group-hover:bg-orange-200 dark:bg-orange-900/20 dark:group-hover:bg-orange-800/30";
      case "success":
        return "bg-green-100 group-hover:bg-green-200 dark:bg-green-900/20 dark:group-hover:bg-green-800/30";
      case "danger":
        return "bg-red-100 group-hover:bg-red-200 dark:bg-red-900/20 dark:group-hover:bg-red-800/30";
      default:
        return "bg-primary/10 group-hover:bg-primary/20";
    }
  };

  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 group bg-background/95 backdrop-blur-sm border border-border/50 ${getVariantClasses()} ${onClick ? 'hover:shadow-xl' : 'cursor-default'}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className={`flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-full transition-colors ${getIconBgClasses()}`}>
          {/* Si el icono es una URL de imagen */}
          {typeof icon === 'string' && (icon.startsWith('/') || icon.startsWith('http')) ? (
            <img 
              src={icon} 
              alt={title}
              className="w-8 h-8 object-contain filter group-hover:brightness-110 transition-all"
            />
          ) : (
            /* Si el icono es un componente de Lucide */
            React.isValidElement(icon) ? (
              <div className="w-8 h-8 group-hover:scale-110 transition-transform duration-300">
                {icon}
              </div>
            ) : (
              /* Si el icono es un componente/función */
              icon && React.createElement(icon, { 
                className: "w-8 h-8 group-hover:scale-110 transition-transform duration-300" 
              })
            )
          )}
        </div>
        <CardTitle className={`text-lg font-semibold text-center transition-colors ${getVariantClasses().split(' ').find(c => c.includes('group-hover:text')) || 'group-hover:text-primary'}`}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-center text-muted-foreground text-sm leading-relaxed">
          {desc}
        </CardDescription>
      </CardContent>
    </Card>
  );
}