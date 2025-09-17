"use client";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-tables/data-table";
import useComerciosRealTime from "@/hooks/useComerciosRealTime";
import { Eye, X } from "lucide-react";
import React, { use, useEffect, useRef, useState, useTransition } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { set } from "date-fns";
import { doc, updateDoc } from "firebase/firestore";
import { db, storage } from "@/firebaseConfig";
import { useAuthStore } from "@/hooks/useAuthStorge";
import { toast } from "sonner";
import BadgeEstadoComercio from "@/components/customs/BadgeEstadoComercio";
import { estadosVerificacionDeComercio } from "@/utils/constants";
import { getDownloadURL, ref } from "firebase/storage";
import { OpcionesComercio } from "./OpcionesAprobacionComercio";
import {
  getComerciosAprovacionPagos,
  getComerciosForUser,
} from "@/apis/comercios.api";
import { EVENTS, on } from "@/utils/events";

export default function ListSolicitudesComercioPagos() {
  const [comercioConfirmarpago, setcomercioConfirmarpago] = useState([]);
  const [reloadComercios, setReloadComercios] = useState(false);

  const handleReloadComercios = () => {
    setReloadComercios((prev) => !prev);
  };

  const loadComercios = async () => {
    try {
      const comercios = await getComerciosAprovacionPagos();
      console.log(comercios);
      setcomercioConfirmarpago(comercios.data);
    } catch (error) {
      toast.error(
        "Error al cargar los comercios para confirmar pagos." +
          error?.message || "Error desconocido al cargar comercios"
      );
    }
  };

  useEffect(() => {
    loadComercios();
    const solitudesEventsOff = on(EVENTS.SOLICITUDES_PAGOS_ACTUALIZADA, () => {
      loadComercios();
    });

    return () => {
      solitudesEventsOff();
    };
  }, []);

  useEffect(() => {
    loadComercios();
  }, [reloadComercios]);

  const columnasComercio = [
    {
      accessorKey: "razon_social",
      header: "Razón Social",
    },
    {
      accessorKey: "ruc",
      header: "RUC",
    },
    {
      header: "Cod. vendedor",
      size: 150,
      cell: ({ row }) => {
        const comercio = row.original;
        if (!comercio.codigo_vendedor) {
          return <span className="text-red-500">No asignado</span>;
        }
        return <span>{comercio.codigo_vendedor}</span>;
      },
    },
    {
      header: "Fecha Solicitud",
      cell: ({ row }) => {
        const comercio = row.original;
        console.log(comercio.fecha_solicitud_verificacion);
        return (
          <span>
            {new Date(
              comercio.fecha_solicitud_verificacion
            ).toLocaleDateString()}
          </span>
        );
      },
    },
    {
      header: "Vendedor",
      accessorKey: "nombre_completo_vendedor",
    },
    {
      header: "Estado",
      cell: ({ row }) => {
        const comercio = row.original;
        return (
          <BadgeEstadoComercio estado={comercio?.id_estado_comercio_actual} />
        );
      },
    },

    {
      header: "Opciones",
      cell: ({ row }) => (
        <OpcionesComercio
          reloadComercios={handleReloadComercios}
          comercio={row.original}
        />
      ),
    },
  ];

  return (
    <div>
      <DataTable columns={columnasComercio} data={comercioConfirmarpago} />
    </div>
  );
}
