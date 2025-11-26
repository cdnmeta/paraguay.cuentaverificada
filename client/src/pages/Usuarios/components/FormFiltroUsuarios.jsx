import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Trash } from "lucide-react";
import { filtrosUsuarios, getUsersByQuery } from "@/apis/usuarios.api";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FormFiltroUsuarios({ onResults, onLoadingChange }) {
  const [gruposUsuarios, setGruposUsuarios] = useState([]);
  const { register, handleSubmit, reset,control,watch } = useForm({
    defaultValues: {
      nombre: "",
      apellido: "",
      email: "",
      documento: "",
      telefono: "",
      id_grupo: "",
    },
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      onLoadingChange(true);
      try {
        const response = await filtrosUsuarios();
        console.log("Filtros de usuarios:", response.data);
        setGruposUsuarios(response.data.grupos);
      } catch (error) {
        toast.error("Error al obtener filtros de usuarios");
        console.error("Error al obtener filtros de usuarios:", error);
      } finally {
        onLoadingChange(false);
      }
    };

    fetchData();
  }, []);

  const handleOnSubmit = async (data) => {
    try {
      onLoadingChange(true);

      // Filtrar campos vacíos
      const filtros = Object.entries(data).reduce((acc, [key, value]) => {
        if (value && value.trim() !== "") {
          acc[key] = value;
        }
        return acc;
      }, {});

      const response = await getUsersByQuery(filtros);
      if(response.data.length === 0) {
        toast.info("No se encontraron usuarios con los filtros aplicados");
      }
      onResults(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Error al buscar usuarios");
    } finally {
      onLoadingChange(false);
    }
  };

  const handleLimpiar = () => {
    reset();
    onResults([]);
  };

  console.log(watch())

  return (
    <form
      onSubmit={handleSubmit(handleOnSubmit)}
      className="p-4 border rounded-md"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="flex flex-col space-y-1">
          <Label>Nombre</Label>
          <Input
            type="text"
            placeholder="Buscar por nombre"
            {...register("nombre")}
          />
        </div>

        <div className="flex flex-col space-y-1">
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="Buscar por email"
            {...register("email")}
          />
        </div>

        <div className="flex flex-col space-y-1">
          <Label>Documento</Label>
          <Input
            type="text"
            placeholder="Buscar por documento"
            {...register("documento")}
          />
        </div>
        <div className="flex flex-col space-y-1">
          <Controller 
            name="id_grupo"
            control={control}
            render={({ field }) => (
              <>
              <Label>Grupo Usuario</Label>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className={"w-full"}>
                  <SelectValue placeholder="Seleccione Grupo" />
                </SelectTrigger>
                <SelectContent>
                  {
                    gruposUsuarios.map((grupo) => (
                      <SelectItem key={grupo.id} value={grupo.id.toString()}>{grupo.descripcion}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              </>
            )}
          />
        </div>
      </div>

      <div className="flex space-x-2 justify-end">
        <Button type="submit">
          <Search className="mr-2 h-4 w-4" />
          Buscar
        </Button>
        <Button type="button" variant="outline" onClick={handleLimpiar}>
          <Trash className="mr-2 h-4 w-4" />
          Limpiar
        </Button>
      </div>
    </form>
  );
}
