import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star, Shield, Crown, Zap } from 'lucide-react';
import { toast } from 'sonner';
import PlanCard from '../components/PlanCard';
import { useCotizacionesMoneda } from '../hooks/useCotizacionesMoneda';

export default function PlanesPage() {
  // Hook personalizado para cotizaciones
  const { formatearPrecio, loading } = useCotizacionesMoneda();
  
  // Plan de verificación - separado de los otros planes
  const [planVerificacion] = useState({
    id: 'verificacion',
    nombre: 'Verificación de Comercio',
    descripcion: 'Verifica tu cuenta para acceder a todas las funcionalidades de la plataforma',
    precio: 50, // Precio base en USD
    caracteristicas: [
      'Verificación de identidad',
      'Acceso completo a la plataforma',
      'Soporte prioritario',
      'Certificado de verificación'
    ],
    destacado: true,
    tipo: 'verificacion',
    icono: Shield,
    colorCard: 'border-green-500 bg-green-50',
    colorButton: 'bg-green-600 hover:bg-green-700'
  });

  // Planes de suscripción regulares - datos estáticos
  const [planes] = useState([
    {
      id: 1,
      nombre: 'Plan Básico',
      descripcion: 'Perfecto para empezar con las funciones esenciales',
      precio: 29, // Precio base en USD
      renovacion_plan: 'mes',
      renovacion_valor: 1,
      caracteristicas: [
        'Hasta 5 usuarios',
        'Almacenamiento básico',
        'Reportes estándar',
        'Soporte por email'
      ],
      destacado: false,
      tipo: 'basico',
      icono: Zap,
      colorCard: 'border-blue-200',
      colorButton: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 2,
      nombre: 'Plan Professional',
      descripcion: 'Para equipos que necesitan más funcionalidades avanzadas',
      precio: 79, // Precio base en USD
      renovacion_plan: 'mes',
      renovacion_valor: 1,
      caracteristicas: [
        'Hasta 25 usuarios',
        'Almacenamiento extendido',
        'Reportes avanzados',
        'Integraciones API',
        'Soporte prioritario'
      ],
      destacado: true,
      tipo: 'profesional',
      icono: Star,
      colorCard: 'border-purple-500 bg-purple-50',
      colorButton: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      id: 3,
      nombre: 'Plan Enterprise',
      descripcion: 'Solución completa para grandes organizaciones',
      precio: 149, // Precio base en USD
      renovacion_plan: 'mes',
      renovacion_valor: 1,
      caracteristicas: [
        'Usuarios ilimitados',
        'Almacenamiento ilimitado',
        'Reportes personalizados',
        'API completa',
        'Soporte 24/7',
        'Gestor de cuenta dedicado'
      ],
      destacado: false,
      tipo: 'enterprise',
      icono: Crown,
      colorCard: 'border-orange-200',
      colorButton: 'bg-orange-600 hover:bg-orange-700'
    }
  ]);

  // Función para manejar la selección de plan
  const handleSeleccionarPlan = (plan) => {
    console.log('Plan seleccionado:', plan);
    toast.success(`Has seleccionado el ${plan.nombre}`);
    // Aquí se implementará la lógica para proceder con el plan seleccionado
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Elige el Plan Perfecto para Ti
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Desde verificación básica hasta soluciones empresariales completas. 
            Encuentra el plan que mejor se adapte a tus necesidades.
          </p>
        </div>

        {/* Plan de Verificación - Separado */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verificación de Cuenta
            </h2>
            <p className="text-gray-600">
              Primer paso para acceder a todas nuestras funcionalidades
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <PlanCard 
                plan={planVerificacion} 
                esVerificacion={true}
                onSeleccionar={handleSeleccionarPlan}
                formatearPrecio={formatearPrecio}
              />
            </div>
          </div>
        </div>

        {/* Planes de Suscripción */}
        <div className="mb-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Planes de Suscripción
            </h2>
            <p className="text-gray-600">
              Elige el plan que mejor se adapte al tamaño y necesidades de tu equipo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {planes.map((plan) => (
              <PlanCard 
                key={plan.id} 
                plan={plan}
                onSeleccionar={handleSeleccionarPlan}
                formatearPrecio={formatearPrecio}
              />
            ))}
          </div>
        </div>

        {/* Información adicional */}
        <div className="text-center mt-12 p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ¿Necesitas ayuda para elegir?
          </h3>
          <p className="text-gray-600 mb-4">
            Nuestro equipo está aquí para ayudarte a encontrar la solución perfecta
          </p>
          <Button variant="outline" className="mr-4">
            Contactar Ventas
          </Button>
          <Button variant="ghost">
            Ver Comparación Detallada
          </Button>
        </div>

        {/* Estado de carga */}
        {loading && (
          <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
            Cargando cotizaciones...
          </div>
        )}
      </div>
    </div>
  );
}
