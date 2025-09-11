import React, { useState } from "react";
import FormFiltroUsuarios from "./components/FormFiltroUsuarios";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import ListUsuariosFiltrados from "./components/ListUsuariosFiltrados";
import { Button } from "@/components/ui/button";
import { set } from "date-fns";
import FormAsignarRoles from "./components/FormAsignarRoles";

export default function AsignarRolesEmpresaPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [configDilaog, setConfigDialog] = useState({});

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
      accessorKey: "documento",
      header: "Documento",
    },
    {
        header: "Acciones",
        
        cell: ({ row }) => {
            const userId = row.original.id;
            return (<div className="flex gap-2">
              <Button onClick={() =>handleabrirDialogAsignarRoles(userId)}>Asignar Rol</Button>
            </div>)
        }
    }
  ];


  const handleabrirDialogAsignarRoles = (id_usuario) =>{
    setOpenDialog(true);
    setConfigDialog({
        title: "Asignar Rol a Usuario",
        description: "Asignar rol a usuario",
        componente: <FormAsignarRoles id_usuario={id_usuario} afterSubmit={() => setOpenDialog(false)} />,
    })
  } 


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

      {
        !loading && usuarios.length > 0 && (
            <div className="grid grid-cols-1">
                <ListUsuariosFiltrados data={usuarios} columns={columnas} />
            </div>
        )
      }
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[605px]"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{configDilaog.title && configDilaog.title}</DialogTitle>
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
