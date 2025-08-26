import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { storage } from "@/firebaseConfig";
import { getMetadata, ref } from "firebase/storage";
import { useStorageURL } from "@/hooks/useStorageURL"; // usa el hook JS que ya hicimos

/**
 * Componente reutilizable para mostrar una imagen desde Firebase Storage.
 * - Valida tipo y tamaño por metadata.
 * - Limita dimensiones de render.
 */
function StorageImage({
  path,
  label,
  storageInstance,
  allowedMime = ["image/jpeg", "image/png", "image/webp"],
  maxBytes = 5 * 1024 * 1024, // 5MB
  className = "w-full max-w-[320px] h-[220px] rounded-md border object-contain bg-white",
}) {
  const { url, loading, error } = useStorageURL(storageInstance, path);
  const [metaErr, setMetaErr] = React.useState(null);
  const [isTooBig, setIsTooBig] = React.useState(false);
  const [mimeErr, setMimeErr] = React.useState(null);

  // Validar metadata (tamaño y tipo)
  React.useEffect(() => {
    let active = true;
    async function checkMeta() {
      setMetaErr(null);
      setIsTooBig(false);
      setMimeErr(null);
      if (!path) return;

      try {
        const m = await getMetadata(ref(storageInstance, path));
        if (!active) return;
        if (m.size > maxBytes) setIsTooBig(true);
        if (m.contentType && !allowedMime.includes(m.contentType)) {
          setMimeErr(`Tipo no permitido (${m.contentType}).`);
        }
      } catch (e) {
        // Si no hay permisos para metadata, no romper la UI
        if (!active) return;
        setMetaErr(e?.message || "No se pudo leer metadata.");
      }
    }
    checkMeta();
    return () => { active = false; };
  }, [path, storageInstance, maxBytes, allowedMime]);

  const showEmpty = !path || error || !url || mimeErr || isTooBig;

  return (
    <div className="flex flex-col gap-2">
      {label && <p className="font-semibold">{label}</p>}

      {loading ? (
        <Skeleton className="w-full max-w-[320px] h-[220px] rounded-md" />
      ) : showEmpty ? (
        <div className="w-full max-w-[320px] h-[220px] rounded-md border grid place-items-center text-sm text-gray-500">
          {(!path && "Sin imagen") ||
            (mimeErr && mimeErr) ||
            (isTooBig && `Imagen supera ${Math.round(maxBytes / (1024 * 1024))}MB`) ||
            "No disponible"}
        </div>
      ) : (
        <img
          src={url}
          alt={label || "Imagen"}
          className={className}
          loading="lazy"
          decoding="async"
        />
      )}

      {/* Mensaje suave si falla metadata (no bloquea la imagen) */}
      {metaErr && (
        <span className="text-xs text-muted-foreground">({metaErr})</span>
      )}
    </div>
  );
}

export default function InfoComercioAprobar({ comercio }) {
  // Mapea todas las imágenes que quieras mostrar
  const images = [
    { key: "foto_interior", label: "Foto interior", path: comercio.foto_interior },
    { key: "foto_exterior", label: "Foto exterior", path: comercio.foto_exterior },
    { key: "imagen_factura_servicio", label: "Factura de servicio", path: comercio.imagen_factura_servicio },
    { key: "cedula_frontal_propietario", label: "Cédula frontal (propietario)", path: comercio.cedula_frontal_propietario },
    { key: "cedula_reverso_propietario", label: "Cédula reverso (propietario)", path: comercio.cedula_reverso_propietario },
    { key: "cedula_frontal_usuario", label: "Cédula frontal (usuario)", path: comercio.cedula_frontal_usuario },
    { key: "cedula_reverso_usuario", label: "Cédula reverso (usuario)", path: comercio.cedula_reverso_usuario },
  ].filter(Boolean); // quita nulos

  return (
    <div className="w-full p-2">
      <div className="flex flex-col gap-1">
        <p><span className="font-semibold">Razón Social:</span> {comercio.razon_social}</p>
        <p><span className="font-semibold">RUC:</span> {comercio.ruc}</p>
        <p><span className="font-semibold">Teléfono:</span> {comercio.telefono}</p>
        <p><span className="font-semibold">Estado:</span> {comercio.descripcion_estado_actual}</p>
      </div>

      <Separator className="my-3" />

      {/* Render dinámico y reutilizable */}
     <div className="max-h-[400px] overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-2">
        {images.map(({ key, label, path }) => (
          <StorageImage
            key={key}
            label={label}
            path={path}
            storageInstance={storage}
            // límites de render (puedes ajustarlos)
            className="w-full max-w-[360px] h-[240px] rounded-md border object-contain bg-white"
            // validaciones (puedes cambiarlas)
            allowedMime={["image/jpeg", "image/png", "image/webp"]}
            maxBytes={5 * 1024 * 1024}
          />
        ))}
      </div>
     </div>
    </div>
  );
}
