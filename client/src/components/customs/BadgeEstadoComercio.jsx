import React from 'react';
import { Badge } from '@/components/ui/badge';
import { estadosVerificacionDeComercio } from '@/utils/constants';

export default function BadgeEstadoComercio({ estado }) {
    const getBadgePalete = (estado) => {
        console.log(estado)
        const estadoSeleccionado = estadosVerificacionDeComercio.filter(item => item.value === estado)
        console.log(estadoSeleccionado)
       return estadoSeleccionado[0] || {className: 'bg-gray-500', label: 'Estado desconocido'};
    };
    return (
        <Badge
            className={getBadgePalete(estado).className}
        >
            {getBadgePalete(estado).label}
        </Badge>
    );
}


