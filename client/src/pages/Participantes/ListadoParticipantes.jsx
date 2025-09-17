import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-tables/data-table";
import { Check, Copy, Eye, Edit, Trash2, X, DollarSign } from "lucide-react";
import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { EVENTS } from "@/utils/events";

export default function ListadoParticipantes({ 
  data = [], 
  opcionesLista = {}, 
  columnasHabilitadas = {} 
}) {
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({});

  // Configuración por defecto de opciones
  const defaultOpciones = {
    mostrarVer: true,
    mostrarEliminar: false,
    mostrarCopiar: false,
    mostrarDetallesCompra: true,
    ...opcionesLista
  };

  // Configuración por defecto de columnas
  const defaultColumnas = {
    id: true,
    nombre: true,
    apellido: true,
    email: true,
    documento: true,
    telefono: true,
    fechaCreacion: true,
    acciones: true,
    total_meta_comprada: true,
    porcentaje_participacion: true,
    ...columnasHabilitadas
  };

  const CardVerDetallesCompras = ({ participante }) => {
    

    // Usar datos del participante si existen, sino usar ejemplo
    const compras = participante?.detalles_compras || [];

    const formatearFecha = (fecha) => {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formatearMonto = (monto) => {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD', // Cambiar según la moneda
        minimumFractionDigits: 2
      }).format(monto);
    };

    const totalCompras = compras.reduce((sum, compra) => sum + compra.total_venta, 0);

    return (
        <div className="space-y-6">
          {/* Resumen del participante */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-sm font-medium text-gray-600">Total Meta Comprada</Label>
              <p className="text-lg font-semibold">{formatearMonto(participante?.total_meta_comprada || totalCompras)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Porcentaje de Participación</Label>
              <p className="text-lg font-semibold">{participante?.porcentaje_participacion || '0'}%</p>
            </div>
          </div>

          {/* Tabla de compras */}
          <div>
            <Label className="text-base font-medium mb-3 block">Historial de Compras ({compras.length})</Label>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Compra
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto Meta
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Venta
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Compra
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {compras.map((compra, index) => (
                    <tr key={compra.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{compra.id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatearMonto(compra.monto_meta)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatearMonto(compra.total_venta)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatearFecha(compra.fecha_compra)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Resumen total */}
            <div className="mt-4 flex justify-end">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-blue-800">Total de compras:</span>
                  <span className="text-lg font-bold text-blue-900">{formatearMonto(totalCompras)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
    )
  }

  // Función para manejar acciones
  const handleAccion = (accion, participante) => {
    switch (accion) {
        case 'detallesCompra':
            console.log('Detalles de compra del participante:', participante);
            setDialogConfig({
                title: `Detalles de Compra - ${participante.nombre} ${participante?.apellido || ''}`,
                description: 'Historial completo de compras del participante',
                content: <CardVerDetallesCompras participante={participante} />
            });
            setOpenDialog(true);
            break;
      case 'ver':
        console.log('Ver participante:', participante);
        setDialogConfig({
          title: 'Detalle del Participante',
          description: 'Información completa del participante',
          content: (
            <div className="space-y-4">
              <div>
                <Label>Nombre Completo</Label>
                <Input value={`${participante.nombre} ${participante.apellido}`} readOnly />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={participante.email} readOnly />
              </div>
              <div>
                <Label>Documento</Label>
                <Input value={participante.documento} readOnly />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input value={participante.telefono} readOnly />
              </div>
            </div>
          )
        });
        setOpenDialog(true);
        break;
      case 'editar':
        console.log('Editar participante:', participante);
        toast.info('Función de editar en desarrollo');
        break;
      case 'eliminar':
        console.log('Eliminar participante:', participante);
        setDialogConfig({
          title: 'Confirmar Eliminación',
          description: '¿Está seguro que desea eliminar este participante?',
          content: (
            <div className="space-y-4">
              <p>Esta acción no se puede deshacer.</p>
              <div className="p-4 bg-red-50 rounded-md">
                <p className="text-red-800 font-medium">
                  {participante.nombre} {participante.apellido}
                </p>
                <p className="text-red-600 text-sm">{participante.email}</p>
              </div>
            </div>
          ),
          actions: (
            <>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button 
                variant="destructive" 
                onClick={() => {
                  // Aquí iría la lógica para eliminar
                  toast.success('Participante eliminado');
                  setOpenDialog(false);
                }}
              >
                Eliminar
              </Button>
            </>
          )
        });
        setOpenDialog(true);
        break;
      case 'copiar':
        navigator.clipboard.writeText(participante.email);
        toast.success('Email copiado al portapapeles');
        break;
      default:
        break;
    }
  };

  // Definición de columnas
  const columnas = [
    // ID
    defaultColumnas.id && {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.id}</span>
      ),
    },
    
    // Nombre
    defaultColumnas.nombre && {
      accessorKey: "nombre",
      header: "Nombre",
    },
    
    // Apellido
    defaultColumnas.apellido && {
      accessorKey: "apellido",
      header: "Apellido",
    },

    defaultColumnas.total_meta_comprada && {
        accessorKey: "total_meta_comprada",
        header: "Meta Comprada",
    },

    defaultColumnas.total_meta_comprada && {
        accessorKey: "porcentaje_participacion",
        header: "Porcentaje de Participación",
        cell: ({ row }) => (
          <span>{(row.original.porcentaje_participacion)}%</span>
        ),
    },

    
    // Email
    defaultColumnas.email && {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <span className="truncate max-w-[200px]">{row.original.email}</span>
          {defaultOpciones.mostrarCopiar && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleAccion('copiar', row.original)}
              title="Copiar email"
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
        </div>
      ),
    },
    
    // Documento
    defaultColumnas.documento && {
      accessorKey: "documento",
      header: "Documento",
    },
    
    // Teléfono
    defaultColumnas.telefono && {
      accessorKey: "telefono",
      header: "Teléfono",
    },
    
    
    // Fecha de creación
    defaultColumnas.fechaCreacion && {
      accessorKey: "fecha_creacion",
      header: "Fecha Creación",
      cell: ({ row }) => {
        const fecha = row.original.fecha_creacion;
        return fecha ? new Date(fecha).toLocaleDateString() : 'N/A';
      },
    },
    
    // Acciones
    defaultColumnas.acciones && {
      header: "Acciones",
      cell: ({ row }) => {
        const participante = row.original;
        return (
          <div className="flex gap-1">
            {defaultOpciones.mostrarVer && (
              <Button
                onClick={() => handleAccion('ver', participante)}
                variant="outline"
                size="icon"
                className="h-8 w-8"
                title="Ver detalles"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            
            
            {defaultOpciones.mostrarEliminar && (
              <Button
                onClick={() => handleAccion('eliminar', participante)}
                variant="outline"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700"
                title="Eliminar participante"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}

            {defaultOpciones.mostrarDetallesCompra && (
              <Button
                onClick={() => handleAccion('detallesCompra', participante)}
                variant="outline"
                size="icon"
                className="h-8 w-8"
                title="Ver detalles de compra"
                >
                <DollarSign className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ].filter(Boolean); // Filtrar columnas deshabilitadas

  return (
    <>
      <DataTable 
        columns={columnas} 
        data={data} 
        placeholder="Buscar participantes..." 
        pageSize={10}
        options={{ ocultar_boton_ver_columnas: false }}
      />

      {/* Dialog para acciones */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className={
          dialogConfig.title?.includes('Detalles de Compra') 
            ? "sm:max-w-[800px] max-h-[90vh] overflow-y-auto" 
            : "sm:max-w-[500px]"
        }>
          <DialogHeader>
            <DialogTitle>{dialogConfig.title}</DialogTitle>
            <DialogDescription>{dialogConfig.description}</DialogDescription>
          </DialogHeader>
          
          {dialogConfig.content && (
            <div className="py-4">
              {dialogConfig.content}
            </div>
          )}
          
          <DialogFooter>
            {dialogConfig.actions ? (
              dialogConfig.actions
            ) : (
              <DialogClose asChild>
                <Button variant="outline">Cerrar</Button>
              </DialogClose>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}