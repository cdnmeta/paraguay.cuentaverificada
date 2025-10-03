import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

/**
 * Componente para renderizar una tarjeta individual de plan
 * @param {Object} plan - Objeto con los datos del plan
 * @param {boolean} esVerificacion - Si es el plan de verificación especial
 * @param {Function} onSeleccionar - Callback cuando se selecciona el plan
 * @param {Function} formatearPrecio - Función para formatear precios en múltiples monedas
 */
export default function PlanCard({ 
  plan, 
  esVerificacion = false, 
  onSeleccionar,
  formatearPrecio 
}) {
  const IconComponent = plan.icono;
  const precios = formatearPrecio(plan.precio);

  const handleClick = () => {
    onSeleccionar(plan);
  };

  return (
    <Card className={`relative h-full flex flex-col ${plan.colorCard} ${plan.destacado ? 'shadow-lg scale-105' : 'shadow-md'} hover:shadow-xl transition-all duration-300`}>
      {plan.destacado && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-3 py-1">
            Más Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-3">
          <div className={`p-3 rounded-full ${plan.destacado ? 'bg-white shadow-md' : 'bg-gray-100'}`}>
            <IconComponent className={`h-8 w-8 ${plan.destacado ? 'text-purple-600' : 'text-gray-600'}`} />
          </div>
        </div>
        
        <CardTitle className="text-xl font-bold">{plan.nombre}</CardTitle>
        <CardDescription className="text-sm text-gray-600 mt-2">
          {plan.descripcion}
        </CardDescription>
        
        <div className="mt-4">
          <div className="text-3xl font-bold text-gray-900">
            {precios.usd}
            {!esVerificacion && (
              <span className="text-lg font-normal text-gray-500">/{plan.renovacion_plan}</span>
            )}
          </div>
          <div className="text-lg font-semibold text-gray-700 mt-1">
            {precios.pyg}
            {!esVerificacion && (
              <span className="text-sm font-normal text-gray-500">/{plan.renovacion_plan}</span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {plan.caracteristicas.map((caracteristica, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{caracteristica}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button 
          className={`w-full ${plan.colorButton} text-white font-semibold py-2 px-4 rounded-lg transition-colors`}
          onClick={handleClick}
        >
          {esVerificacion ? 'Verificar Ahora' : 'Seleccionar Plan'}
        </Button>
      </CardFooter>
    </Card>
  );
}