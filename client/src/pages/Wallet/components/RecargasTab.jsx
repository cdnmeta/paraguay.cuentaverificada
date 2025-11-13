import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { obtenerMiMovimientosDeWallet } from "@/apis/wallets.api";
import FormRehabilitacionRecarga from './FormRehabilitacionRecarga';
import { EstadosMovimiento } from "../config/type";
import { emit } from "@/utils/events";
import { walletEvents } from "../config/events";

const RecargasTab = ({ walletData }) => {
  // Usar los movimientos del walletData
  const movimientos = walletData?.movimientos || [];
  
  // Estados para el dialog de rehabilitación
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMovimiento, setSelectedMovimiento] = useState(null);

  // Función para abrir el dialog de rehabilitación
  const handleOpenRehabilitacionDialog = (movimiento) => {
    setSelectedMovimiento(movimiento);
    setDialogOpen(true);
  };

  // Función para cerrar el dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedMovimiento(null);
  };

  // Función llamada cuando la rehabilitación es exitosa
  const handleRehabilitacionSuccess = () => {
    handleCloseDialog();
    // Aquí podrías agregar lógica para refrescar los datos si es necesario

    // emitir evento de refresco de movimientos
    emit(walletEvents.ACTUALIZAR_WALLET,{
      when:new Date()
    })
  };

  const formatMoney = (amount = 0, currency = "PYG") => {
    if (!amount) return `0 ${currency}`;
    return `${amount.toLocaleString("es-PY")} ${currency}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-PY", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case "Verificado":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          color: "bg-green-100 text-green-800 border-green-200",
          text: "Verificado",
        };
      case "Pendiente":
        return {
          icon: <Clock className="h-4 w-4" />,
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          text: "Pendiente",
        };
      case "Rechazado":
        return {
          icon: <XCircle className="h-4 w-4" />,
          color: "bg-red-100 text-red-800 border-red-200",
          text: "Rechazado",
        };
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          color: "bg-gray-100 text-gray-800 border-gray-200",
          text: estado || "Desconocido",
        };
    }
  };

  const getTipoMovimiento = (idTipo) => {
    // Determinar si es ingreso o egreso basado en el tipo de movimiento
    // Para este ejemplo, asumimos que tipo 1 es recarga/ingreso
    return idTipo === 1 ? "ingreso" : "egreso";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Historial de Movimientos
        </h3>
        <Badge variant="secondary" className="text-sm">
          {movimientos.length} movimientos
        </Badge>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {movimientos.map((movimiento) => {

          const esRechazado = movimiento.id_estado == EstadosMovimiento.RECHAZADO;
          const tipoMovimiento = getTipoMovimiento(
            movimiento.id_tipo_movimiento
          );
          const estadoBadge = getEstadoBadge(movimiento.descripcion_estado);

          const isIngreso = tipoMovimiento === "ingreso";
          const colorIcon = isIngreso
            ? "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400"
            : "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400";

          const colorAmount = isIngreso
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 dark:text-red-400";

          return (
            <Card
              key={movimiento.id}
              className={`transition-all hover:shadow-md border-l-4 border-l-transparent hover:border-l-green-500 ${
                movimiento.descripcion_estado === 'Rechazado' ? 'cursor-pointer hover:opacity-70' : 'cursor-default'
              }`}
              onClick={() => {
                if (movimiento.descripcion_estado === 'Rechazado') {
                  handleOpenRehabilitacionDialog(movimiento);
                }
              }}
            >
              <CardContent className="p-3 sm:p-4">
                {/* Contenedor principal: columna en móvil, fila en >=sm */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {/* Izquierda: icono + info */}
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                    {/* Icono */}
                    <div className={`p-2 rounded-full shrink-0 ${colorIcon}`}>
                      {isIngreso ? (
                        <ArrowUpCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                      ) : (
                        <ArrowDownCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                      )}
                    </div>

                    {/* Texto */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-medium text-foreground text-sm sm:text-base truncate">
                          {isIngreso ? "Recarga de saldo" : "Gasto de saldo"}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-[10px] sm:text-xs flex items-center gap-1 ${estadoBadge.color}`}
                        >
                          {estadoBadge.icon}
                          {estadoBadge.text}
                          {movimiento.descripcion_estado === 'Rechazado' && (
                            <span className="text-[8px] sm:text-[10px] ml-1 opacity-75">
                              (Click para rehabilitar)
                            </span>
                          )}
                        </Badge>
                      </div>

                      <div className="flex items-center text-xs sm:text-sm text-muted-foreground mb-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(movimiento.fecha)}
                      </div>

                      {
                        esRechazado && (
                          <div className="text-xs sm:text-sm text-red-600 dark:text-red-400 break-words">
                            Motivo de rechazo: {movimiento.motivo_rechazo}
                          </div>
                        )
                      }
                      {
                        !esRechazado && (
                          <div>
                            {movimiento.observacion && (
                              <p className="text-xs text-muted-foreground line-clamp-2 sm:line-clamp-none break-words">
                                {movimiento.observacion}
                              </p>
                            )}
                          </div>
                        )
                      }
                      
                    </div>
                  </div>

                  {/* Derecha: monto + tipo */}
                  <div className="text-right sm:text-right">
                    <p
                      className={`font-semibold ${colorAmount} text-base sm:text-lg`}
                    >
                      {isIngreso ? "+" : "-"}{" "}
                      {formatMoney(movimiento.monto, walletData?.sigla_iso)}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground capitalize">
                      {tipoMovimiento}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {movimientos.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <ArrowUpCircle className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No hay movimientos
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Aún no tienes recargas registradas en tu cuenta.
          </p>
        </div>
      )}

      {/* Dialog para rehabilitar solicitud rechazada */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rehabilitar Solicitud de Recarga</DialogTitle>
          </DialogHeader>
          {selectedMovimiento && (
            <FormRehabilitacionRecarga
              movimiento={selectedMovimiento}
              onCancel={handleCloseDialog}
              onSuccess={handleRehabilitacionSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecargasTab;
