import React from 'react';
import { Badge } from '@/components/ui/badge';
import { estadosVerificacionDeComercio } from '@/utils/constants';

export default function BadgeEstadosSolicitudesCuentas({ estado }) {
    let className = ""

    switch (estado) {
        case 1:
            estado = "Pend. Activacion"
            className = "bg-red-500"
            break;
        case 2:
            estado = "Activo"
            className = "bg-green-500"
            break;
        case 3:
            estado = "Aguardando Verificación"
            className = "bg-yellow-500"
            break;
        case 4:
            estado = "Pend. Aprobación"
            className = "bg-blue-500"
            break;
        case 5:
            estado = "Verificación Rechazada"
            className = "bg-gray-500"
            break;
    }

  return (
    <div>
      <Badge className={className}>{estado}</Badge>
    </div>
  )
}
