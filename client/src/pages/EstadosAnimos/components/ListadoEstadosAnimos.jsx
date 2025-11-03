import React, { useMemo } from 'react';
import { DataTable } from '@/components/ui/data-tables/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  MessageSquare,
  Heart,
  Smile,
  Frown,
  Meh
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ListadoEstadosAnimos = ({ 
  data = [], 
  onEdit = () => {},
  onDelete = () => {},
  onView = () => {}
}) => {
  
  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  // Definición de columnas para el DataTable
  const columns = useMemo(() => {
    // Función para obtener el icono según el tipo de estado de ánimo
    const getTipoIcon = (tipo) => {
      const iconos = {
        1: Heart, // Feliz
        2: Smile, // Contento
        3: Meh,   // Normal
        4: Frown, // Triste
        5: MessageSquare, // Otro (default)
      };
      return iconos[tipo] || MessageSquare;
    };

    // Función para obtener el color/variante del badge según el tipo
    const getTipoBadgeVariant = (tipo) => {
      const variants = {
        1: 'default', // Feliz - Verde
        2: 'secondary', // Contento - Azul
        3: 'outline', // Normal - Gris
        4: 'destructive', // Triste - Rojo
        5: 'default', // Otro
      };
      return variants[tipo] || 'default';
    };

    // Función para obtener el label del tipo
    const getTipoLabel = (tipo) => {
      const labels = {
        1: 'Feliz',
        2: 'Contento', 
        3: 'Normal',
        4: 'Triste',
        5: 'Otro'
      };
      return labels[tipo] || 'Desconocido';
    };

    return [
      {
        id: 'tipo',
        header: 'Estado',
        cell: ({ row }) => {
          const descripcion = row.original.descripcion_estado_animo;
          return (
            <div className="flex items-center gap-2">
              <Badge>
                {descripcion}
              </Badge>
            </div>
          );
        },
      },
      {
        id: 'mensaje',
        header: 'Mensaje',
        accessorKey: 'mensaje',
        cell: ({ row }) => {
          const mensaje = row.getValue('mensaje');
          return (
            <div className="max-w-xs">
              <p className="truncate" title={mensaje}>
                {mensaje || 'Sin mensaje'}
              </p>
            </div>
          );
        },
      },
      {
        id: 'fecha_creacion',
        header: 'Fecha de Creación',
        accessorKey: 'fecha_creacion',
        cell: ({ row }) => {
          const fecha = row.getValue('fecha_creacion');
          return (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm">{formatDate(fecha)}</span>
            </div>
          );
        },
      },
      {
        id: 'fecha_actualizacion',
        header: 'Última Actualización',
        accessorKey: 'fecha_actualizacion',
        cell: ({ row }) => {
          const fecha = row.getValue('fecha_actualizacion');
          return (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm">{formatDate(fecha)}</span>
            </div>
          );
        },
      },
      {
        id: 'activo',
        header: 'Estado',
        accessorKey: 'activo',
        cell: ({ row }) => {
          const activo = row.getValue('activo');
          return (
            <Badge variant={activo ? 'default' : 'secondary'}>
              {activo ? 'Activo' : 'Inactivo'}
            </Badge>
          );
        },
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const registro = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Ver detalles"
                onClick={() => onView(registro)}
              >
                <Eye className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Editar"
                onClick={() => onEdit(registro)}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                title="Eliminar"
                onClick={() => onDelete(registro)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          );
        },
      },
    ];
  }, [onView, onEdit, onDelete]);

  return (
    <div className="space-y-4">
      <DataTable
        data={data}
        columns={columns}
        placeholder="Buscar estados de ánimo..."
        pageSize={10}
        options={{
          ocultar_boton_ver_columnas: false
        }}
      />
    </div>
  );
};

export default ListadoEstadosAnimos;