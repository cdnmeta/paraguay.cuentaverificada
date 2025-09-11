import React, { useEffect, useState } from "react";
import DualListBox from "react-dual-listbox";
import "react-dual-listbox/lib/react-dual-listbox.css";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftToLine,
  ArrowRightToLine,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
} from "lucide-react";

import langDualBox from "@/assets/lang/lang-list-dualbox";
import { getGruposHabilitados } from "@/apis/auth.api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { asignarGrupos, getGruposByUsuarioId } from "@/apis/usuarios.api";

const schema = z.object({
  id_usuario: z.coerce.number().int().positive("id_usuario inválido"),
  // RHF maneja strings en runtime; Zod los convierte a numbers al validar/enviar
  grupos: z.array(z.string().transform((value) => Number(value))),
});

function FormAsignarRoles({ id_usuario, afterSubmit=() => {} }) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    register,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      id_usuario: Number(id_usuario) || 0,
      grupos: [],
    },
  });

  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar opciones y preselección del usuario
  const loadGrupos = async (id) => {
    setLoading(true);
    try {
      // Trae disponibles + asignados en paralelo
      const [respDisponibles, respUsuario] = await Promise.all([
        getGruposHabilitados(),
        getGruposByUsuarioId(id), // si tu API no requiere id, deja getGruposByUsuario()
      ]);

      const gruposDisponibles = respDisponibles?.data ?? [];
      const gruposUsuario = respUsuario?.data ?? []; // puede ser [{id, descripcion}] o [id,...]

      // Mapeo de opciones para el DualListBox
      const mappedOptions = gruposDisponibles.map((g) => ({
        value: String(g.id),
        label: g.descripcion,
      }));
      setOptions(mappedOptions);

      // Set para filtrar válidos
      const disponiblesSet = new Set(mappedOptions.map((o) => o.value));

      // Normalizar la respuesta del usuario a array de strings
      const idsUsuarioStr = gruposUsuario?.grupos.map((g) =>
        String(g?.id ?? g?.id_grupo ?? g)
      );

      // Preselección que exista en disponibles
      const preseleccion = idsUsuarioStr.filter((idStr) =>
        disponiblesSet.has(idStr)
      );

      // Pasar preselección al form
      setValue("grupos", preseleccion, { shouldValidate: true });
    } catch (error) {
        console.log(error)
      toast.error("Error al cargar los grupos: " + (error?.message || "Desconocido"));
    } finally {
      setLoading(false);
    }
  };

  // Sincroniza id_usuario en el form y recarga data cuando cambia
  useEffect(() => {
    const id = Number(id_usuario) || 0;
    setValue("id_usuario", id);
    if (id > 0) loadGrupos(id);
  }, [id_usuario, setValue]);

  const onSubmit = async (data) => {
   try {
     // Gracias al transform del schema, data.grupos ya es number[]
    console.log("Asignar grupos ->", data);
    const dataEnviar = {
      id_usuario: data.id_usuario,
      grupos: data.grupos, // <- numbers
    };
    const response = await asignarGrupos(dataEnviar);

    toast.success(response?.data?.message || "Grupos asignados correctamente");

    afterSubmit?.();

   } catch (error) {
     console.log(error);
     if([400, 422].includes(error?.response?.status)) {
       const msg = error?.response?.data?.message || "Error de validación";
       toast.error(msg);
       return;
     }
    toast.error("Error al asignar los grupos: " + (error?.message || "Desconocido"));
   }
  };

  if (loading) {
    return <div>Cargando grupos...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
      <input type="hidden" {...register("id_usuario", { valueAsNumber: true })} />

      <div className="space-y-2">
        <label className="text-sm font-medium">Asignar grupos</label>

        <Controller
          name="grupos"
          control={control}
          render={({ field }) => (
            <DualListBox
              options={options}
              selected={field.value}
              onChange={field.onChange}
              canFilter
              availableLabel="Grupos disponibles"
              selectedLabel="Grupos asignados"
              // si tu versión usa placeholders en `lang`, ya estás pasando langDualBox
              lang={langDualBox}
              icons={{
                moveToAvailable: <ArrowLeftToLine size={18} />,
                moveAllToAvailable: <ChevronsLeft size={18} />,
                moveToSelected: <ArrowRightToLine size={18} />,
                moveAllToSelected: <ChevronsRight size={18} />,
                moveUp: <ChevronUp size={16} />,
                moveDown: <ChevronDown size={16} />,
                moveTop: <ChevronsUp size={16} />,
                moveBottom: <ChevronsDown size={16} />,
              }}
            />
          )}
        />

        {errors.grupos && (
          <p className="text-red-500 text-sm">{errors.grupos.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button  type="submit" disabled={isSubmitting}>
          Guardar asignación
        </Button>
      </div>
    </form>
  );
}

export default FormAsignarRoles;
