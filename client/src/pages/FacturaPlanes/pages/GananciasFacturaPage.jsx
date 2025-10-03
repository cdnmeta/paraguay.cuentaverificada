import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-tables/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { getGananciasFacturas } from '@/apis/facturas-suscripciones.api';
import { set } from 'date-fns';

export default function GananciasFacturaPage() {
  const [gananciasFacturas, setGananciasFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDetalles, setSelectedDetalles] = useState([]);
  const [selectedFacturaId, setSelectedFacturaId] = useState(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    obtenerGananciasFacturas();
  }, []);

  const obtenerGananciasFacturas = async () => {
    try {
      setLoading(true);
      const response = await getGananciasFacturas();
      setGananciasFacturas(response.data || []);
    } catch (error) {
      console.error('Error al obtener ganancias facturas:', error);
      toast.error('Error al cargar las ganancias de facturas');
      setGananciasFacturas([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear moneda
  const formatearMoneda = (monto, simbolo='PYG') => {
    if (!monto && monto !== 0) return `${simbolo} 0`;
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: simbolo,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(monto);
  };

  // Función para obtener badge de estado
  const getBadgeEstado = (estado) => {
    const estados = {
      1: { label: 'Pendiente', variant: 'outline' },
      2: { label: 'Pagado', variant: 'default' },
      3: { label: 'Cancelado', variant: 'destructive' }
    };
    const estadoInfo = estados[estado] || { label: 'Desconocido', variant: 'secondary' };
    return <Badge variant={estadoInfo.variant}>{estadoInfo.label}</Badge>;
  };

  // Función para ver detalles de ganancias
  const verDetallesGanancias = (factura) => {
    setSelectedDetalles(factura.detalles_ganancias || []);
    setSelectedFacturaId(factura.id);
    setOpenDialog(true);
  };

  // Definir columnas para la tabla principal
const columnas = [
    {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => (
            <div className="font-medium">#{row.getValue('id')}</div>
        ),
    },
    {
        accessorKey: 'nro_factura',
        header: 'Nro. Factura',
        cell: ({ row }) => {
            const nroFactura = row.getValue('nro_factura');
            return <div>{nroFactura || 'Sin asignar'}</div>;
        },
    },
    {
        accessorKey: 'razon_social',
        header: 'Razón Social',
    },
    {
        accessorKey: 'total_factura',
        header: 'Total Factura',
        cell: ({ row }) => (
            <div className="font-semibold text-green-600">
                {formatearMoneda(row.getValue('total_factura'), row.original.sigla_iso)}
            </div>
        ),
    },
    {
        accessorKey: 'total_grav_10',
        header: 'Gravado 10%',
        cell: ({ row }) => (
            <div>{formatearMoneda(row.getValue('total_grav_10'), row.original.sigla_iso)}</div>
        ),
    },
    {
        accessorKey: 'total_iva_10',
        header: 'IVA 10%',
        cell: ({ row }) => (
            <div>{formatearMoneda(row.getValue('total_iva_10'), row.original.sigla_iso)}</div>
        ),
    },
    {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => getBadgeEstado(row.getValue('estado')),
    },
    {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => verDetallesGanancias(row.original)}
                    className="h-8 w-8 p-0"
                >
                    <Eye className="h-4 w-4" />
                </Button>
            </div>
        ),
    },
];

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Ganancias de Facturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-center">Cargando...</div>
            </div>
          ) : (
            <DataTable
              data={gananciasFacturas}
              columns={columnas}
              placeholder="Buscar facturas..."
              pageSize={10}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialog para mostrar detalles de ganancias */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Detalles de Ganancias - Factura #{selectedFacturaId}
            </DialogTitle>
            <DialogDescription>
              Distribución de ganancias por participante
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tipo Participante</TableHead>
                  <TableHead>Usuario</TableHead>
                  
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedDetalles.map((detalle) => (
                  <TableRow key={detalle.id}>
                    <TableCell className="font-medium">#{detalle.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {detalle.descripcion_tipo_participante}
                      </Badge>
                    </TableCell>
                    <TableCell>
                        {detalle.nombre_usuario || 'Sin asignar'}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatearMoneda(detalle.monto, detalle.sigla_iso)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-semibold">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatearMoneda(
                      selectedDetalles.reduce(
                        (acc, detalle) => acc + detalle.monto,
                        0
                      ),
                      selectedDetalles[0]?.sigla_iso
                    )}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            
            {selectedDetalles.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No hay detalles de ganancias disponibles
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}