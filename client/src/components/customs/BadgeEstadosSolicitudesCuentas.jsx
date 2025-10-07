import React from 'react';
import { Badge } from '@/components/ui/badge';
import { estadosVerificacionDeComercio } from '@/utils/constants';

export default function BadgeEstadosSolicitudesCuentas({ estado }) {
    let className = ""

    switch (estado) {
        case 1:
            estado = "Recibido"
            className = "bg-yellow-500"
            break;
        case 2:
            estado = "Pendiente Aprobación"
            className = "bg-blue-500"
            break;
        case 3:
            estado = "Aprobado"
            className = "bg-green-500"
            break;
        case 4:
            estado = "Rechazado"
            className = "bg-red-500"
            break;
        case 5:
            estado = "Código Verificado"
            className = "bg-purple-500"
            break;
        default:
            estado = "Desconocido"
            className = "bg-gray-500"
    }

  return (
    <div>
      <Badge className={className}>{estado}</Badge>
    </div>
  )
}
