import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { estadosVerificacionDeComercio } from "@/utils/constants";
import { format, parse } from "date-fns";
import { EyeIcon } from "lucide-react";

const formatDateDateDfn = (date, formato = "dd/MM/yyyy") => {
  console.log(date)
  if (!date) return "";
  // Si date es un string o Timestamp, intenta convertirlo a Date
  const d = typeof date.toDate === "function" ? date.toDate() : new Date(date);
  return format(d, formato);
}

const BodyRechazado = ({comercio}) => {
    return (
      <div>
        <p className="text-muted-foreground">
          Este comercio fue rechazado el{" "}
          <b>
            {formatDateDateDfn(comercio.fecha_actualizacion_estado)}
          </b>{" "}
          por el sgte. motivo:
        </p>
        <p>
          <b>{comercio.motivo_rechazo}</b>
        </p>
      </div>
    ); 
}
export default function DetalleSolicitudComercio({comercio}) {

  console.log(comercio)

    const setBodyMostrarByEstado = (estado) => {
        switch(estado) {
            case 5: // Comercio Rechazado
                return <BodyRechazado comercio={comercio} />;
            case 6: // Pago Rechazado
                return <BodyRechazado comercio={comercio} />;
            default:
                return null;
        }
    }

  return (
    <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <EyeIcon />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Estado de {comercio.razon_social}</DialogTitle>
            <DialogDescription>
              Estado actual del comercio {comercio.estados_comercios.descripcion}
            </DialogDescription>
          </DialogHeader>
            {setBodyMostrarByEstado(comercio?.estado)}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cerrar</Button>
            </DialogClose>
            
          </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}

