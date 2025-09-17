import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FormCotizacion from "../components/FormCotizacion";
import ListCotizacionesEmpresa from "../components/ListCotizacionesEmpresa";

export default function CotizacionEmpresaPage() {
  // Monedas estáticas para demo
 

  const loadSeo = () => {
    document.title = "Cotización de Empresa";
  };

  useEffect(() => {
    loadSeo();
  }, []);

  return (
    <div className="min-h-scree py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Solicitar Cotización Empresarial
              </CardTitle>
              <p className="text-center mt-2">
                Complete el formulario para recibir una cotización personalizada
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <FormCotizacion />
            </CardContent>
          </Card>
          
          {/* Lista de cotizaciones */}
          <div className="mt-8">
            <ListCotizacionesEmpresa />
          </div>
        </div>
      </div>
    </div>
  );
}
