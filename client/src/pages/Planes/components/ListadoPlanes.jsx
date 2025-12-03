import React, { useState } from "react";
import { Edit, Trash2, MoreHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-tables/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deletePlan } from "@/apis/planes.api";
import { toast } from "sonner";

const ListadoPlanes = ({ 
  data = [], 
  columnasHabilitadas = {},
  opcionesHabilitadas = { editar: true, eliminar: true },
  onEdit,
  onDelete
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (plan) => {
    setPlanToDelete(plan);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    
    try {
      setIsDeleting(true);
      await deletePlan(planToDelete.id);
      
      toast.success(`Plan "${planToDelete.nombre}" eliminado exitosamente`);
      
      // Llamar al callback después de la eliminación exitosa
      onDelete?.(planToDelete);
      
    } catch (error) {
      console.error("Error al eliminar el plan:", error);
      const errorMessage = error.response?.data?.message || "Error al eliminar el plan";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setPlanToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    if (isDeleting) return; // Prevenir cancelar mientras se está eliminando
    setShowDeleteDialog(false);
    setPlanToDelete(null);
  };

  

  // Función para formatear moneda según sigla ISO
  const formatearMoneda = (cantidad, siglaIso) => {
    if (!cantidad || !siglaIso) return '---';
    
    const opciones = {
      style: 'currency',
      currency: siglaIso,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    };

    try {
      // Intentar formatear con la moneda específica
      return new Intl.NumberFormat('es-PY', opciones).format(cantidad);
    } catch (error) {
      // Si la moneda no es compatible, usar formato genérico
      const simbolos = {
        'PYG': '₲',
        'USD': '$',
        'EUR': '€',
        'BRL': 'R$',
        'ARS': '$'
      };
      const simbolo = simbolos[siglaIso] || siglaIso;
      return `${simbolo} ${cantidad.toLocaleString()}`;
    }
  };

  // Configuración por defecto de columnas habilitadas
  const defaultColumns = {
    nombre: true,
    descripcion: true,
    precio: true,
    precio_sin_iva: true,
    descripcion_moneda: true,
    tipo_iva: true,
    descripcion_tipo_iva: true,
    renovacion_valor: true,
    renovacion_plan: true,
    activo: true,
    fecha_creacion: true,
    esta_en_oferta: true,
    precio_oferta: true
  };

  const columnsConfig = { ...defaultColumns, ...columnasHabilitadas };

  // Definir todas las columnas posibles
  const allColumns = [
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("nombre")}</div>
      ),
    },
    {
      accessorKey: "descripcion",
      header: "Descripción",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate">{row.getValue("descripcion")}</div>
      ),
    },
    {
      accessorKey: "precio",
      header: "Precio",
      cell: ({ row }) => {
        const precio = parseFloat(row.getValue("precio"));
        const siglaIso = row.original.sigla_iso;
        return (
          <div className="font-mono">
            {formatearMoneda(precio, siglaIso)}
          </div>
        );
      },
    },
    {
      accessorKey: "precio_sin_iva",
      header: "Precio sin IVA",
      cell: ({ row }) => {
        const precio = parseFloat(row.getValue("precio_sin_iva"));
        const siglaIso = row.original.sigla_iso;
        return (
          <div className="font-mono text-muted-foreground">
            {formatearMoneda(precio, siglaIso)}
          </div>
        );
      },
    },
    {
      accessorKey: "esta_en_oferta",
      header: "Oferta",
      cell: ({ row }) => {
        const data = row.original.esta_en_oferta;
        return (
          <Badge variant={data ? "success" : "destructive"}>
            {data ? "Sí" : "No"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "precio_oferta",
      header: "Precio Oferta",
      cell: ({ row }) => {
        const precio = parseFloat(row.getValue("precio_oferta"));
        const siglaIso = row.original.sigla_iso;
        const estaEnOferta = row.original.esta_en_oferta;
        if (!estaEnOferta) {
          return null;
        }
        return (
          <div className="font-mono text-green-600">
            {formatearMoneda(precio, siglaIso)}
          </div>
        );
      }
    },
    {
      accessorKey: "descripcion_moneda",
      header: "Moneda",
      cell: ({ row }) => {
        const siglaIso = row.original.sigla_iso;
        const descripcionMoneda = row.getValue("descripcion_moneda");
        return (
          <div className="text-sm">
            <div className="font-medium">{siglaIso}</div>
            <div className="text-muted-foreground text-xs">{descripcionMoneda}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "descripcion_tipo_iva",
      header: "IVA",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue("descripcion_tipo_iva")}</Badge>
      ),
    },
    {
      accessorKey: "renovacion_plan",
      header: "Renovación",
      cell: ({ row }) => {
        const valor = row.original.renovacion_valor;
        const plan = row.getValue("renovacion_plan");
        return (
          <div className="text-sm">
            {valor} {plan}
          </div>
        );
      },
    },
    {
      accessorKey: "activo",
      header: "Estado",
      cell: ({ row }) => (
        <Badge variant={row.getValue("activo") ? "default" : "secondary"}>
          {row.getValue("activo") ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      accessorKey: "fecha_creacion",
      header: "Fecha Creación",
      cell: ({ row }) => {
        const fecha = new Date(row.getValue("fecha_creacion"));
        return (
          <div className="text-sm text-muted-foreground">
            {fecha.toLocaleDateString()}
          </div>
        );
      },
    }
  ];

  // Filtrar columnas habilitadas
  const visibleColumns = allColumns.filter(column => 
    columnsConfig[column.accessorKey]
  );

  // Agregar columna de acciones si hay opciones habilitadas
  if (opcionesHabilitadas.editar || opcionesHabilitadas.eliminar) {
    visibleColumns.push({
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        const plan = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {opcionesHabilitadas.editar && (
                <DropdownMenuItem
                  onClick={() => onEdit?.(plan)}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {opcionesHabilitadas.eliminar && (
                <DropdownMenuItem
                  onClick={() => handleDeleteClick(plan)}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    });
  }

  return (
    <div className="w-full">
      <DataTable
        data={data}
        columns={visibleColumns}
        searchKey="nombre"
        searchPlaceholder="Buscar planes..."
      />
      
      <AlertDialog open={showDeleteDialog} onOpenChange={!isDeleting ? setShowDeleteDialog : undefined}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el plan <strong>"{planToDelete?.nombre}"</strong>?
              <br />
              Esta acción no se puede deshacer.
              {isDeleting && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Eliminando plan, por favor espere...
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={handleCancelDelete}
              disabled={isDeleting}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ListadoPlanes;