import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Trash } from "lucide-react";
import { getUsersByQuery } from "@/apis/usuarios.api";

export default function FormFiltroUsuarios({ onResults, onLoadingChange }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      nombre: "",
      apellido: "",
      email: "",
      documento: "",
      telefono: ""
    }
  });

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

  return (
    <form onSubmit={handleSubmit(handleOnSubmit)} className="p-4 border rounded-md bg-white">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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