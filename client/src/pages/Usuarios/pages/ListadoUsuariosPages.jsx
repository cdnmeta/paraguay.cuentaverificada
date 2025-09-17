import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormFiltroUsuarios from "@/pages/Usuarios/components/FormFiltroUsuarios";
import ListUsuariosFiltrados from "@/pages/Usuarios/components/ListUsuariosFiltrados";
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {getUsersByQuery} from '@/apis/usuarios.api'
import { routes as usuariosRoutes } from "@/pages/Usuarios/config/routes";


export default function ListadoUsuariosPages() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [configDilaog, setConfigDialog] = useState({});

  const navigate = useNavigate()

  const columnas = [
    {
      accessorKey: "nombre",
      header: "Nombre",
    },
    {
      accessorKey: "apellido",
      header: "Apellido",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      header: "Roles Asignados",
      cell: ({ row }) => {
        const roles = row.original?.roles_asignados || [];
        return (
          <div className="flex flex-wrap gap-1">
            {roles.map((rol, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 text-xs font-medium  px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
              >
                {rol.descripcion}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "documento",
      header: "Documento",
    },
    {
      accessorKey: "telefono",
      header: "Teléfono",
    },
    {
      header: "Por. Comisión 1era venta",
      cell: ({ row }) => {
        const comisiones = row.original.porcentaje_comision_primera_venta;
        if (!comisiones) {
          return <span className="text-red-500">No asignado</span>;
        }
        return <span>{comisiones}%</span>;
      },
      filterFn: "includesString",
    },
    {
      header: "Por. Comisión Recurrente",
      cell: ({ row }) => {
        const comisiones = row.original.porcentaje_comision_recurrente;
        if (!comisiones) {
          return <span className="text-red-500">No asignado</span>;
        }
        return <span>{comisiones}%</span>;
      },
    },
    {
      header: "Acciones",
      cell: ({ row }) => {
        const userId = row.original.id;
        return (
          <div className="flex gap-2">
            <Button onClick={() => onclickEditUser(userId)} variant="outline" size="icon" title="Editar Usuario">
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const onclickEditUser = (id) =>  navigate(`../${id}`, { relative: "path" }); // <- sube de .../listado a .../usuarios/:id

  const loadUsuarios = async () => {
    try {
      const response = await getUsersByQuery();
      setUsuarios(response.data);
    } catch (error) {
      console.log(error);
      toast.error("Error al buscar usuarios");
    }
  };

  useEffect(() => {
    loadUsuarios();
  
    return () => {
      setUsuarios([]);
    }
  }, [])
  

  return (
    <div className="container mx-auto bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-xl font-bold">Filtro de Usuarios</h1>

      <FormFiltroUsuarios
        onResults={setUsuarios}
        onLoadingChange={setLoading}
      />

      <div className="flex items-center mt-2 justify-between">
        <p className="text-sm text-muted-foreground">
          {loading
            ? "Cargando resultados..."
            : `Resultados: ${usuarios.length}`}
        </p>
      </div>

      {!loading && usuarios.length > 0 && (
        <div className="grid grid-cols-1">
          <ListUsuariosFiltrados data={usuarios} columns={columnas} />
        </div>
      )}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent
          className="sm:max-w-[605px]"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {configDilaog.title && configDilaog.title}
            </DialogTitle>
            <DialogDescription>
              {configDilaog.description && configDilaog.description}
            </DialogDescription>
          </DialogHeader>
          <p>{configDilaog.componente && configDilaog.componente}</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cerrar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
