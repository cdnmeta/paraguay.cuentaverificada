import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { estadosVerificacionDeComercio } from "@/utils/constants";
import { Badge, Pencil } from "lucide-react";
import BadgeEstadoComercio from "@/components/customs/BadgeEstadoComercio";
import DetalleSolicitudComercio from "./DetalleSolicitudComercio";
import { Button } from "@/components/ui/button";

const ListSolicitudesComercios = ({ comercios,id_usuario,onSeleccionarComercio = () => {} }) => {


  if (!comercios || comercios.length === 0) {
    return (
      <div className="text-gray-500 text-sm mt-4">
        No hay comercios pendientes de verificación.
      </div>
    );
  }


  return (
    <div className="space-y-2 mt-8">
      <Separator />
      <h3 className="text-lg font-semibold text-center text-muted-foreground">
        Solicitudes Pendientes de Verificación
      </h3>

      {comercios.length === 0 ? (
        <p className="text-sm text-center text-gray-500">
          No hay comercios pendientes de verificación.
        </p>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {comercios.map((comercio) => (
            <div
              key={comercio.id}
              className="flex items-center justify-between border rounded-md px-4 py-2 bg-muted"
            >
              <div>
                <p className="font-medium">{comercio.razon_social}</p>
                <p className="text-sm text-muted-foreground">
                  RUC: {comercio.ruc}
                </p>
              </div>
              <div className="space-x-1">
                <BadgeEstadoComercio estado={comercio?.estados_comercios.id} />
                <DetalleSolicitudComercio comercio={comercio} />
                {
                  [2,3,5,6].includes(comercio?.estados_comercios.id) && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSeleccionarComercio(comercio.id);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )
                }
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListSolicitudesComercios;
