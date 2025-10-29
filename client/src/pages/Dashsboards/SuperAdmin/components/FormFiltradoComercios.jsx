import React, { useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";



// shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Search, Trash } from "lucide-react";
import { Label } from "@/components/ui/label";
import { getComerciosByMany, opcionesFiltroComercios } from "@/apis/comercios.api";

export default function FormFiltradoComercios({onResults, onLoadingChange}) {
  const [estadosComercios, setEstadosComercios] = useState([]);

  
  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: {
      razon_social: "",
      ruc: "",
      id_estado_comercio: ""
    }
  });

  const cargarOpcionesFiltro = async () => {
    try {
      const response = await opcionesFiltroComercios();
      const opciones = response.data;
      setEstadosComercios(opciones?.estados);
      // Manejar la respuesta y establecer las opciones de filtro
    } catch (error) {
      toast.error("Error al cargar opciones de filtro: " + error.message);
    }
  }


  React.useEffect(() => {
    cargarOpcionesFiltro();
  }, []);



  const handleOnSubmit = async (data) => {
    try {
      onLoadingChange(true)
      // Filtrar campos vacíos
      const filtros = Object.entries(data).reduce((acc, [key, value]) => {
        if (value && value.trim() !== "") {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      const response = await getComerciosByMany(filtros);
      onResults(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Error al buscar comercios");
    } finally {
      onLoadingChange(false);
    }
  }

  const handleLimpiar = () => {
    reset();
    onResults([]);
  }
  return (
    <form onSubmit={handleSubmit(handleOnSubmit)} className="p-4 border rounded-md">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex flex-col space-y-1">
          <Label>Nombre o Razón Social</Label>
          <Input 
            type="text" 
            placeholder="Buscar por Nombre o Razón Social"
            {...register("razon_social")}
          />
        </div>
        <div className="flex flex-col space-y-1">
          <Label>RUC</Label>
          <Input 
            type="text" 
            placeholder="Buscar por RUC"
            {...register("ruc")}
          />
        </div>
        <div className="flex flex-col space-y-1">
          <Label>Estados</Label>
          <Controller
            name="id_estado_comercio"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Seleccionar Estado" />
                </SelectTrigger>
                <SelectContent>
                 {
                  estadosComercios.map((estado) => (
                    <SelectItem key={estado.id} value={estado.id.toString()}>{estado.descripcion}</SelectItem>
                  ))
                 }
                </SelectContent>
              </Select>
            )}
          />
        </div>
        
      </div>
      <div className="flex space-x-2 justify-end ">
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
