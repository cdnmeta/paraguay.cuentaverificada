import React from "react";
import { Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-tables/data-table";

const ListadoPlanes = ({ 
  data = [], 
  columnasHabilitadas = {},
  opcionesHabilitadas = { editar: true, eliminar: true },
  onEdit,
  onDelete
}) => {
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
    fecha_creacion: true
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
                  onClick={() => onDelete?.(plan)}
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
    </div>
  );
};

export default ListadoPlanes;