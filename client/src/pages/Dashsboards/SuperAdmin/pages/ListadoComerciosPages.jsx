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
import { set } from "date-fns";
import FormFiltroUsuarios from "@/pages/Usuarios/components/FormFiltroUsuarios";
import ListUsuariosFiltrados from "@/pages/Usuarios/components/ListUsuariosFiltrados";
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FormFiltradoComercios from "../components/FormFiltradoComercios";
import { DataTable } from "@/components/ui/data-tables/data-table";
import { getComerciosByMany } from "@/apis/comercios.api";

export default function ListadoComercioPages() {
  const [comercios, setComercios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [configDilaog, setConfigDialog] = useState({});

  const navigate = useNavigate();

  const columnas = [
    {
      accessorKey: "razon_social",
      header: "Razon Social",
    },
    {
      accessorKey: "nombre_propietario",
      header: "Propietario",
    },
    {
      accessorKey: "ruc",
      header: "Ruc",
    },
    {
      accessorKey: "telefono",
      header: "Teléfono",
    },
    {
      accessorKey: "descripcion_estado",
      header: "Estado",
    }
  ];

  const onclickEditUser = (id) => navigate("/admin/usuarios/" + id);

  const loadPrimerosComericos = async () => {
    try {
      const response = await getComerciosByMany();
        setComercios(response.data);
    } catch (error) {
      console.error("Error al cargar los primeros comercios:", error);
    }
  };
  useEffect(() => {
    loadPrimerosComericos();
  }, []);

  return (
    <div className="container mx-auto">

      <div className="space-y-4 p-6 mt-2 border border-primary rounded-md ">
        <h1 className="text-xl font-bold">Filtro de Comercios</h1>
        <FormFiltradoComercios
          onResults={setComercios}
          onLoadingChange={setLoading}
        />

        <DataTable data={comercios} columns={columnas} pageSize={5} />
      </div>

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
