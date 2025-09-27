import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const TablaSemaforoMovimientos = ({ movimientos, moneda, onEdit, onDelete }) => {
  const formatMoney = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '0';
    
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: moneda?.toLowerCase().includes('guaraní') || moneda?.toLowerCase().includes('guarani') ? 'PYG' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTipoMovimientoLabel = (tipo) => {
    const tipos = {
      1: 'Ingreso fijo',
      2: 'Ingreso Ocasional',
      3: 'Egreso Fijo',
      4: 'Egreso Ocasional',
      5: 'Por pagar',
      6: 'Por Cobrar'
    };
    return tipos[tipo] || 'Desconocido';
  };

  const getEstadoLabel = (estado) => {
    const estados = {
      1: 'Pendiente',
      2: 'Pagado',
      3: 'Cobrado'
    };
    return estados[estado] || 'Sin estado';
  };

  const getEstadoBadgeVariant = (estado) => {
    switch (estado) {
      case 1: return 'secondary'; // Pendiente
      case 2: return 'default'; // Pagado
      case 3: return 'default'; // Cobrado
      default: return 'outline';
    }
  };

  const getTipoMovimientoVariant = (tipo) => {
    // Ingresos (1, 2, 6) - verde
    if ([1, 2, 6].includes(tipo)) return 'default';
    // Egresos (3, 4, 5) - rojo
    if ([3, 4, 5].includes(tipo)) return 'destructive';
    return 'outline';
  };

  if (!movimientos || movimientos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay movimientos para mostrar</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Observación</TableHead>
            <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movimientos.map((movimiento) => (
            <TableRow key={movimiento.id}>
              <TableCell className="font-medium">
                {movimiento.titulo}
              </TableCell>
              <TableCell>
                <Badge variant={getTipoMovimientoVariant(movimiento.tipo_movimiento)}>
                  {getTipoMovimientoLabel(movimiento.tipo_movimiento)}
                </Badge>
              </TableCell>
              <TableCell>
                {movimiento.id_estado ? (
                  <Badge variant={getEstadoBadgeVariant(movimiento.id_estado)}>
                    {getEstadoLabel(movimiento.id_estado)}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatMoney(movimiento.monto)}
              </TableCell>
              <TableCell>
                {formatDate(movimiento.fecha)}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {movimiento.observacion || (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit && onEdit(movimiento.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete && onDelete(movimiento.id, movimiento.titulo)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TablaSemaforoMovimientos;