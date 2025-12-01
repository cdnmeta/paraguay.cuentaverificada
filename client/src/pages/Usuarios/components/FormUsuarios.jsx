import React, { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// ShadCN UI (assumes you've installed the components)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  Check,
  ChevronsUpDown,
  UploadCloud,
  ArrowLeftToLine,
  ChevronsLeft,
  ArrowRightToLine,
  ChevronsRight,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Eye,
  EyeOff,
} from "lucide-react";
import paisesCode from "@/utils/paises-flag.json";

// Dual list (external lib)
import DualListBox from "react-dual-listbox";
import "react-dual-listbox/lib/react-dual-listbox.css";
import { ComboBox } from "@/components/customs/comboBoxShadcn/ComboBox1";
import { getGruposHabilitados } from "@/apis/auth.api";
import langListDualbox from "@/assets/lang/lang-list-dualbox";
import {
  CANT_MIN_CARACTERES_CONTRASENA,
  IMAGE_SCHEMA_NO_REQUERIDO,
  MAXIMO_PESO_IMAGENES_BYTES,
  REGEX_CEDULA_IDENTIDAD,
} from "@/utils/constants";
import { actualizarUsuario, crearUsuario, getUsersByQuery, getUsuarioById } from "@/apis/usuarios.api";
import { toast } from "sonner";
import { useAlertDialogStore } from "@/store/useAlertDialogStore";
import { cargarURL } from "@/utils/funciones";
import { GruposSistema } from "../types/GruposSistema";

/**
 * Props:
 * - idUsuario?: number | string  -> si existe, se carga en modo edición.
 * - afterSubmit?: (payload: any) => void  -> hook para ejecutar luego del submit.
 * - apiBaseUrl?: string -> base URL para las llamadas. Por defecto '/api'.
 * - getGrupos?: () => Promise<{value:string,label:string}[]>  -> para poblar opciones de grupos. Si no se pasa, usa fetch(`${apiBaseUrl}/grupos`).
 */
export default function FormUsuario({
  idUsuario,
  afterSubmit,
  apiBaseUrl = "/api",
  getGrupos,
}) {
  // Determinar modo edición antes de armar el schema
  const isEditing = !!idUsuario;
  // ---- Dial codes (puedes reemplazar por tu fuente real) ----
  const dialCodes = useMemo(
    () =>
      paisesCode.map((p) => ({
        value: p.code,
        label: `${p.country} (${p.countryCode})`,
      })),
    []
  );

  const baseShape = {
    nombre: z
      .string({ required_error: 'El nombre es obligatorio' })
      .trim()
      .min(1, 'El nombre es obligatorio'),
    apellido: z.string().trim().optional().nullable(),
    documento: z
      .string({ required_error: 'El documento es obligatorio' })
      .trim()
      .regex(REGEX_CEDULA_IDENTIDAD, 'Formato cedula inválido'),
    correo: z
      .string({ required_error: 'El correo es obligatorio' })
      .trim()
      .email('El correo debe ser un correo válido'),
    codigo_pais: z.string().optional().nullable(),
    telefono: z.string().optional().nullable(),
    grupos: z.array(z.number()).optional().nullable(),
    cedula_frontal: z.any().optional().nullable(),
    cedula_reverso: z.any().optional().nullable(),
    selfie: z.any().optional().nullable(),
    id_usuario_embajador: z.coerce.number({invalid_type_error:"el embajador debe ser un numero"}).optional().nullable(),
  };


  const schemaCreate = z
    .object({
      ...baseShape,
      contrasena: z
        .string({ required_error: 'La contraseña es obligatoria' })
        .trim()
        .min(CANT_MIN_CARACTERES_CONTRASENA, 'La contraseña es obligatoria'),
      repetir_contrasena: z
        .string({ required_error: 'La contraseña es obligatoria' })
        .trim()
        .min(CANT_MIN_CARACTERES_CONTRASENA, 'La contraseña es obligatoria'),
    })
    .superRefine((val, ctx) => {
      if (val.telefono && !val.codigo_pais) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Si cargas teléfono, selecciona un dial code', path: ['codigo_pais'] });
      }
      if (val.contrasena !== val.repetir_contrasena) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Las contraseñas no coinciden', path: ['repetir_contrasena'] });
      }
      // En creación, pedimos imágenes obligatorias
      if (!val.selfie) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'La selfie es obligatoria', path: ['selfie'] });
      if (!val.cedula_frontal) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'La cédula frontal es obligatoria', path: ['cedula_frontal'] });
      if (!val.cedula_reverso) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'La cédula reverso es obligatoria', path: ['cedula_reverso'] });
    });

  const schemaEdit = z
    .object({
      ...baseShape,
      contrasena: z.string().trim().optional().nullable(),
      repetir_contrasena: z.string().trim().optional().nullable(),
    })
    .superRefine((val, ctx) => {
      if (val.telefono && !val.codigo_pais) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Si cargas teléfono, selecciona un dial code', path: ['codigo_pais'] });
      }
      // Contraseña opcional en edición; validar sólo si se envía
      if (val.contrasena || val.repetir_contrasena) {
        const pwd = val.contrasena ?? '';
        const rep = val.repetir_contrasena ?? '';
        if (pwd.length < CANT_MIN_CARACTERES_CONTRASENA) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: `La contraseña debe tener al menos ${CANT_MIN_CARACTERES_CONTRASENA} caracteres`, path: ['contrasena'] });
        }
        if (pwd !== rep) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Las contraseñas no coinciden', path: ['repetir_contrasena'] });
        }
      }
      // En edición NO exigimos imágenes
    });

  const schema = isEditing ? schemaEdit : schemaCreate;

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: "",
      contrasena: "",
      repetir_contrasena: "",
      apellido: "",
      documento: "",
      correo: "",
      codigo_pais: "",
      telefono: "",
      grupos: [],
      id_usuario_embajador: null,
    },
  });

  const [loading, setLoading] = useState(false);
  const isEdit = isEditing;
  
  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  // Previews
  const [previewFront, setPreviewFront] = useState(null);
  const [previewBack, setPreviewBack] = useState(null);
  const [previewSelfie, setPreviewSelfie] = useState(null);

  // Grupos
  const [optionsGrupos, setOptionsGrupos] = useState([]);

  // Embajadores
  const [optionsEmbajadores, setOptionsEmbajadores] = useState([]);

  const showAlert = useAlertDialogStore((state) => state.showAlert);

  // Carga de grupos y embajadores
  useEffect(() => {
    let active = true;
    async function loadGruposYEmbajadores() {
      try {
        let opts = [];
        const queryEmbajadores = { id_grupo: GruposSistema.EMBAJADOR }; // ID del grupo "Embajador"
        const [respDisponibles, respEmbajadores] = await Promise.all([
          getGruposHabilitados(),
          getUsersByQuery(queryEmbajadores),
        ]);
        const gruposDisponibles = respDisponibles?.data ?? [];
        const embajadoresData = respEmbajadores?.data ?? [];
        opts = gruposDisponibles?.map((g) => ({
          value: String(g.id),
          label: g.descripcion,
        }));
        
        const optsEmbajadores = embajadoresData?.map((e) => ({
          value: e.id,
          label: `${e.nombre} ${e.apellido || ''} - ${e.documento}`.trim(),
        })) || [];
        
        if (!active) return;
        setOptionsGrupos(opts);
        setOptionsEmbajadores(optsEmbajadores);
      } catch (e) {
        console.error("Error cargando grupos y embajadores", e);
      }
    }
    loadGruposYEmbajadores();
    return () => {
      active = false;
    };
  }, [apiBaseUrl, getGrupos]);

  // Carga en modo edición
  useEffect(() => {
    let active = true;
    async function loadUsuario() {
      if (!idUsuario) return;
      setLoading(true);
      try {
        const response = await getUsuarioById(idUsuario);
        const u = response?.data ?? response;
        reset({
          nombre: u?.nombre ?? "",
          contrasena: "", // no se rellena por seguridad
          apellido: u?.apellido ?? "",
          documento: u?.documento ?? "",
          correo: u?.email ?? u?.correo ?? "",
          codigo_pais: u?.codigo_pais ?? "+595",
          telefono: u?.telefono ?? "",
          grupos: Array.isArray(u?.grupos)
            ? u.grupos
                .map((g) => Number(g?.id ?? g?.id_grupo ?? g))
                .filter(Boolean)
            : [],
          id_usuario_embajador: u?.id_embajador || null,
        });
        // previews desde paths existentes (si tu API devuelve URLs)
        const imagePromises = [
          u?.cedula_frente ? cargarURL(u?.cedula_frente) : Promise.resolve(null),
          u?.cedula_reverso ? cargarURL(u?.cedula_reverso) : Promise.resolve(null),
          u?.selfie ? cargarURL(u?.selfie) : Promise.resolve(null),
        ];
        const [urlFront, urlBack, urlSelfie] = await Promise.all(imagePromises);
        setPreviewFront(urlFront);
        setPreviewBack(urlBack);
        setPreviewSelfie(urlSelfie);
            } catch (e) {
        console.error("Error cargando usuario", e);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadUsuario();
    return () => {
      active = false;
    };
  }, [idUsuario, apiBaseUrl, reset]);

  // --- Helpers de archivo
  const handleFileChange = (e, fieldName) => {
    const file = e.target.files?.[0];
    setValue(fieldName, file);
    if (!file) {
      // Si limpian el input
      if (fieldName === "cedula_frontal") setPreviewFront(null);
      if (fieldName === "cedula_reverso") setPreviewBack(null);
      if (fieldName === "selfie") setPreviewSelfie(null);
      return;
    }
    const url = URL.createObjectURL(file);
    if (fieldName === "cedula_frontal") setPreviewFront(url);
    if (fieldName === "cedula_reverso") setPreviewBack(url);
    if (fieldName === "selfie") setPreviewSelfie(url);
  };

  // --- Submit (multipart)
  const onSubmit = async (values) => {
    const formData = new FormData();
    formData.append("nombre", values.nombre ?? "");
    formData.append("documento", values.documento ?? "");
    formData.append("correo", values.correo ?? "");

    // contrasena: solo enviar si es creación o si el usuario la cambió
    if (!isEdit || (isEdit && values.contrasena)) {
      formData.append("contrasena", values.contrasena ?? "");
    }

    if (values.apellido) formData.append("apellido", values.apellido);

    // buscar el dial code correspondiente
    const codigoPais = paisesCode.find((p) => p.codigo === values.codigo_pais);
    if (codigoPais) formData.append("dial_code", codigoPais.countryCode);
    if (values.telefono) formData.append("telefono", values.telefono);

    // grupos como números
    const grupos = (values.grupos ?? []).filter(Boolean).map(Number);
    if (grupos.length) formData.append("grupos", JSON.stringify(grupos));

    // embajador para vendedores
    if (Array.isArray(values?.grupos) && values.grupos.includes(3) && values.id_usuario_embajador) {
      formData.append("id_usuario_embajador", values.id_usuario_embajador);
    }

    // archivos
    if (values.cedula_frontal instanceof File)
      formData.append("cedula_frontal", values.cedula_frontal);
    if (values.cedula_reverso instanceof File)
      formData.append("cedula_reverso", values.cedula_reverso);
    if (values.selfie instanceof File) formData.append("selfie", values.selfie);

    console.log(Object.fromEntries(formData.entries()));
    try {
      let response = null;
      if (isEdit) {
        response = await actualizarUsuario(idUsuario, formData);
      } else {
        response = await crearUsuario(formData);
      }

      if (typeof afterSubmit === "function") afterSubmit?.();
        toast.success(response?.data?.message || "Usuario guardado correctamente");
      if(!isEdit) handleLimpiar();
    } catch (e) {
      console.error("Error guardando usuario", e);
      if ([400, 422].includes(e?.response?.status)) {
        const msg = e?.response?.data?.message || "Error de validación";
        showAlert({
            title: "Error",
            description: msg,
            type: "error",
        })
        return;
      }
       showAlert({
            title: "Error",
            description: e?.message || "Error al guardar el usuario",
            type: "error",
        })
    }
  };

  // ---- UI auxiliares ----
  const selectedGrupos = watch("grupos") || [];

  const includeGrupo = (id) => selectedGrupos.includes(id);

  const handleLimpiar = () => {
    reset();
    setPreviewFront(null);
    setPreviewBack(null);
    setPreviewSelfie(null);
  };

  return (
    <Card className="w-full max-w-[70dvw] mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? "Editar Usuario" : "Registrar Usuario"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Columna izquierda */}
            <div className="space-y-3">
              <div className="grid gap-2">
                <Label>Nombre *</Label>
                <Input placeholder="Nombre" {...register("nombre")} />
                {errors.nombre && (
                  <p className="text-sm text-red-500">
                    {errors.nombre.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Apellido</Label>
                <Input placeholder="Apellido" {...register("apellido")} />
                {errors.apellido && (
                  <p className="text-sm text-red-500">
                    {errors.apellido.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Documento *</Label>
                <Input placeholder="Documento" {...register("documento")} />
                {errors.documento && (
                  <p className="text-sm text-red-500">
                    {errors.documento.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Correo *</Label>
                <Input
                  placeholder="correo@dominio.com"
                  type="email"
                  {...register("correo")}
                />
                {errors.correo && (
                  <p className="text-sm text-red-500">
                    {errors.correo.message}
                  </p>
                )}
              </div>

              {/* Contraseña: en edición es opcional */}
              <div className="grid gap-2">
                <Label>
                  Contraseña{" "}
                  {isEdit && (
                    <span className="text-muted-foreground">
                      (dejar vacío para no cambiar)
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <Input
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...register("contrasena")}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.contrasena && (
                  <p className="text-sm text-red-500">
                    {errors.contrasena.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>
                  Repetir Contraseña{" "}
                  {isEdit && (
                    <span className="text-muted-foreground">
                      (dejar vacío para no cambiar)
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <Input
                    placeholder="••••••••"
                    type={showRepeatPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...register("repetir_contrasena")}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                  >
                    {showRepeatPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.repetir_contrasena && (
                  <p className="text-sm text-red-500">
                    {errors.repetir_contrasena.message}
                  </p>
                )}
              </div>

              {/* Teléfono + Dial Code (Combobox) */}
              <div className="grid grid-cols-3 gap-2 items-end">
                <div className="col-span-1 space-y-2">
                  <Label>Codigo Pais</Label>
                  <Controller
                    control={control}
                    name="codigo_pais"
                    render={({ field }) => (
                      <ComboBox
                        value={field.value}
                        items={dialCodes}
                        onChange={field.onChange}
                        placeholder="Código"
                        error={!!errors.codigo_pais}
                      />
                    )}
                  />
                  {errors.codigo_pais && (
                    <p className="text-sm text-red-500">
                      {errors.codigo_pais.message}
                    </p>
                  )}
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Teléfono</Label>
                  <Input placeholder="981 000 000" {...register("telefono")} />
                  {errors.telefono && (
                    <p className="text-sm text-red-500">
                      {errors.telefono.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Columna derecha */}
            <div className="space-y-4">
              {/* Grupos (opcional) */}
              <div className="grid gap-2">
                <Label>Asignar Grupos (opcional)</Label>
                <Controller
                  control={control}
                  name="grupos"
                  render={({ field }) => (
                    <div>
                      <DualListBox
                        canFilter
                        options={optionsGrupos}
                        selected={(field.value || []).map(String)}
                        onChange={(vals) =>
                          field.onChange(vals.map((v) => Number(v)))
                        }
                        lang={langListDualbox}
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
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(selectedGrupos || []).map((gId) => {
                          const opt = optionsGrupos.find(
                            (o) => String(o.value) === String(gId)
                          );
                          return (
                            <Badge key={gId} variant="secondary">
                              {opt?.label || gId}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                />
              </div>

              {includeGrupo(3) && (
                <div className="flex flex-col gap-2">
                  <Label>Embajador Asignado (opcional)</Label>
                  <Controller
                    control={control}
                    name="id_usuario_embajador"
                    render={({ field }) => (
                      <ComboBox
                        value={field.value}
                        items={optionsEmbajadores}
                        onChange={field.onChange}
                        placeholder="Seleccionar embajador"
                        error={!!errors.id_usuario_embajador}
                        clearable={true}
                      />
                    )}
                  />
                  {errors.id_usuario_embajador && (
                    <p className="text-sm text-red-500">
                      {errors.id_usuario_embajador.message}
                    </p>
                  )}
                </div>
              )}

              <Separator />

              {/* Imágenes */}
              <div className="grid gap-3">
                <Label>Imágenes</Label>

                <div className="grid md:grid-cols-3 gap-3">
                  {/* Cédula frontal */}
                  <div className="space-y-2">
                    <Label>Cédula - Frontal</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "cedula_frontal")}
                    />
                    {errors.cedula_frontal && (
                      <p className="text-sm text-red-500">
                        {errors.cedula_frontal.message}
                      </p>
                    )}
                  </div>

                  {/* Cédula reverso */}
                  <div className="space-y-2">
                    <Label>Cédula - Reverso</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "cedula_reverso")}
                    />
                    {errors.cedula_reverso && (
                      <p className="text-sm text-red-500">
                        {errors.cedula_reverso.message}
                      </p>
                    )}
                  </div>

                  {/* Selfie */}
                  <div className="space-y-2">
                    <Label>Selfie</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "selfie")}
                    />
                    {errors.selfie && (
                      <p className="text-sm text-red-500">
                        {errors.selfie.message}
                      </p>
                    )}
                  </div>
                </div>
                {/*Preview imagenes*/}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-2">
                  {
                    <PhotoProvider>
                      {[previewFront, previewBack, previewSelfie].map(
                        (url, index) =>
                          url ? (
                            <PhotoView key={index} src={url}>
                              <img
                                src={url}
                                alt={`Previsualización ${index}`}
                                className="w-full h-48 object-cover rounded-xl border"
                              />
                            </PhotoView>
                          ) : null
                      )}
                    </PhotoProvider>
                  }
                </div>
              </div>

              {/* Acciones */}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button type="submit" disabled={isSubmitting || loading}>
              {isSubmitting || loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                </>
              ) : (
                <>{isEdit ? "Guardar cambios" : "Guardar"}</>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleLimpiar()}
              disabled={isSubmitting || loading}
            >
              Limpiar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}