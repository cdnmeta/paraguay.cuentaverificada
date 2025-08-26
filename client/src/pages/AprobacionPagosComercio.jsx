import React from "react";
import ListSolicitudesComercioPagos from "./AprobacionPagosComercio/ListSolicitudesComercioPagos";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AprobacionPagosComercio() {
  return (
    <div>
      <head>
        <title>Aprobacion de pagos de comercio</title>
      </head>
      <div className="w-full px-4">
        <Card className="w-full">
          <CardHeader className="pb-2 sm:pb-3">
            <h1 className="text-base sm:text-lg md:text-xl font-semibold tracking-tight">
              Solicitudes de Comercio para Pagos
            </h1>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="grid grid-cols-1">
              <ListSolicitudesComercioPagos />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
