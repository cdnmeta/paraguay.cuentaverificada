import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PhotoView, PhotoProvider } from 'react-photo-view';
import { NumericFormat } from 'react-number-format';
import { Eye, CheckCircle, XCircle, FileImage } from 'lucide-react';
import { toast } from 'sonner';
import { aprobarSolicitudRecarga, rechazarSolicitudRecarga } from '@/apis/wallets.api';
import { DataTable } from '@/components/ui/data-tables/data-table';
import 'react-photo-view/dist/react-photo-view.css';
import { cargarURL } from '@/utils/funciones';

// Componente que combina FirebaseImage con PhotoView
const FirebaseImageWithPhotoView = ({ comprobante_url, alt, className }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  React.useEffect(() => {
    const loadImage = async () => {
      try {
        setLoading(true);
        setError(false);
        const url = await cargarURL(comprobante_url);
        setImageUrl(url);
      } catch (err) {
        console.error('Error al cargar imagen de Firebase:', err);
        setError(true);
        // Fallback: intentar construir URL del backend
        setImageUrl(`${import.meta.env.VITE_URL_BASE_BACKEND_API}/${comprobante_url}`);
      } finally {
        setLoading(false);
      }
    };

    if (comprobante_url) {
      loadImage();
    }
  }, [comprobante_url]);

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 dark:bg-gray-800`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 dark:bg-gray-800`}>
        <FileImage className="h-12 w-12 text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">Error al cargar imagen</span>
      </div>
    );
  }

  return (
    <PhotoProvider>
      <PhotoView src={imageUrl}>
        <img
          src={imageUrl}
          alt={alt}
          className={className}
        />
      </PhotoView>
    </PhotoProvider>
  );
};

const ListadoSolicitudesRecargas = ({ solicitudes, onRecargarDatos }) => {
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rechazarDialogOpen, setRechazarDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [monto, setMonto] = useState('');
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [confirmacionCheck, setConfirmacionCheck] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState(''); // 'aprobar' o 'rechazar'

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMoney = (amount) => {
    if (!amount) return '0 PYG';
    return `${amount.toLocaleString('es-PY')} PYG`;
  };

  const getEstadoBadge = (estado) => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente' };
      case 'verificado':
        return { color: 'bg-green-100 text-green-800', text: 'Verificado' };
      case 'rechazado':
        return { color: 'bg-red-100 text-red-800', text: 'Rechazado' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: estado };
    }
  };

  const handleVerSolicitud = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setMonto(solicitud.monto ? solicitud.monto.toString() : '');
    setDialogOpen(true);
  };

  const handleCloseDialog = (e) => {
    if (e) {
      e.preventDefault();
    }
    setDialogOpen(false);
    setSelectedSolicitud(null);
    setMonto('');
    setMotivoRechazo('');
    setConfirmacionCheck(false);
  };

  const handleRechazarClick = (e) => {
    e.preventDefault();
    setActionType('rechazar');
    setRechazarDialogOpen(true);
  };

  const handleAprobarClick = (e) => {
    e.preventDefault();
    if (!monto || parseFloat(monto.replace(/,/g, '')) <= 0) {
      toast.error('Por favor ingresa un monto válido');
      return;
    }
    setActionType('aprobar');
    setConfirmDialogOpen(true);
  };

  const handleConfirmRechazar = async (e) => {
    e.preventDefault();
    if (!motivoRechazo.trim()) {
      toast.error('Por favor ingresa el motivo del rechazo');
      return;
    }
    setRechazarDialogOpen(false);
    setConfirmDialogOpen(true);
  };

  const handleFinalConfirm = async (e) => {
    e.preventDefault();
    if (!confirmacionCheck) {
      toast.error('Debes confirmar la verificación del movimiento');
      return;
    }

    setLoading(true);
    try {
      if (actionType === 'aprobar') {
        const montoNumerico = parseFloat(monto.replace(/,/g, ''));
        await aprobarSolicitudRecarga(selectedSolicitud.id_movimiento, {
          monto: montoNumerico,
          observacion: selectedSolicitud.observacion || ''
        });
        toast.success('Solicitud aprobada correctamente');
      } else if (actionType === 'rechazar') {
        await rechazarSolicitudRecarga(selectedSolicitud.id_movimiento, {
          motivo_rechazo: motivoRechazo
        });
        toast.success('Solicitud rechazada correctamente');
      }
      
      // Cerrar todos los diálogos
      setConfirmDialogOpen(false);
      setDialogOpen(false);
      
      // Recargar datos
      if (onRecargarDatos) {
        onRecargarDatos();
      }
    } catch (error) {
      console.error('Error al procesar solicitud:', error);
      toast.error('Error al procesar la solicitud');
    } finally {
      setLoading(false);
      setSelectedSolicitud(null);
      setMonto('');
      setMotivoRechazo('');
      setConfirmacionCheck(false);
      setActionType('');
    }
  };

  // Definición de columnas para el DataTable
  const columns = React.useMemo(() => [
    {
      header: "Solicitante",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.solicitante}</div>
          <div className="text-sm text-gray-500">{row.original.email_solicitante}</div>
        </div>
      ),
    },
    {
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.tipo_movimiento_desc}
        </Badge>
      ),
    },
    {
      header: "Monto",
      cell: ({ row }) => {
        const monto = row.original.monto;
        return (
          <div className="text-right font-medium">
            {monto ? formatMoney(monto) : "Sin especificar"}
          </div>
        );
      },
    },
    {
      header: "Estado",
      cell: ({ row }) => {
        const estado = row.original.estado_desc;
        const estadoBadge = getEstadoBadge(estado);
        return (
          <Badge className={`${estadoBadge.color}`}>
            {estadoBadge.text}
          </Badge>
        );
      },
    },
    {
      header: "Fecha",
      cell: ({ row }) => (
        <div className="text-sm">
          {formatDate(row.original.fecha_creacion)}
        </div>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div>
          <Button
            onClick={() => handleVerSolicitud(row.original)}
            variant="outline"
            size="sm"
            className="whitespace-nowrap"
          >
            <Eye className="h-4 w-4 mr-2" />
            Revisar
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ], []);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            Solicitudes de Recarga Pendientes
          </h3>
          <Badge variant="secondary" className="text-sm">
            {solicitudes?.length || 0} solicitudes
          </Badge>
        </div>

        <DataTable
          data={solicitudes || []}
          columns={columns}
          placeholder="Buscar solicitudes por solicitante, email, tipo..."
          pageSize={10}
        />
      </div>

      {/* Dialog principal para revisar solicitud */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent 
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Revisar Solicitud de Recarga</DialogTitle>
          </DialogHeader>
          
          {selectedSolicitud && (
            <div className="space-y-6">
              {/* Información del solicitante */}
              <div className="rounded-lg p-4">
                <h4 className="font-medium mb-2">Información del Solicitante</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Nombre:</span>
                    <p className="font-medium">{selectedSolicitud.solicitante}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="font-medium">{selectedSolicitud.email_solicitante}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Fecha:</span>
                    <p className="font-medium">{formatDate(selectedSolicitud.fecha_creacion)}</p>
                  </div>
                </div>
              </div>

              {/* Comprobante de pago */}
              <div>
                <h4 className="font-medium mb-3">Comprobante de Pago</h4>
                <FirebaseImageWithPhotoView 
                  comprobante_url={selectedSolicitud.comprobante_url}
                  alt="Comprobante de pago"
                  className="w-full max-w-md h-64 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                />
              </div>

              {/* Observación del usuario */}
              {selectedSolicitud.observacion && (
                <div>
                  <h4 className="font-medium mb-2">Observación del Usuario</h4>
                  <p className="text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border">
                    {selectedSolicitud.observacion}
                  </p>
                </div>
              )}

              {/* Input para monto */}
              <div>
                <Label htmlFor="monto" className="text-sm font-medium">
                  Monto de la Recarga (PYG)
                </Label>
                <NumericFormat
                  value={monto}
                  onValueChange={(values) => setMonto(values.value)}
                  thousandSeparator=","
                  decimalSeparator="."
                  placeholder="Ingrese el monto"
                  customInput={Input}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRechazarClick}
              disabled={loading}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rechazar
            </Button>
            <Button 
              onClick={handleAprobarClick}
              disabled={loading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Aprobar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de rechazo */}
      <AlertDialog open={rechazarDialogOpen} onOpenChange={setRechazarDialogOpen}>
        <AlertDialogContent onPointerDownOutside={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Rechazar Solicitud</AlertDialogTitle>
            <AlertDialogDescription>
              Por favor, ingresa el motivo del rechazo de esta solicitud de recarga.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="my-4">
            <Label htmlFor="motivoRechazo" className="text-sm font-medium">
              Motivo del Rechazo
            </Label>
            <Textarea
              id="motivoRechazo"
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              placeholder="Describe el motivo del rechazo..."
              className="mt-1 min-h-[100px]"
            />
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRechazarDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRechazar}>
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmación final */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent onPointerDownOutside={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'aprobar' ? 'Confirmar Aprobación' : 'Confirmar Rechazo'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'aprobar' 
                ? '¿Has comprobado correctamente el movimiento y deseas aprobarlo?'
                : '¿Estás seguro que deseas rechazar esta solicitud de recarga?'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="my-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="confirmacion"
                checked={confirmacionCheck}
                onCheckedChange={setConfirmacionCheck}
              />
              <Label htmlFor="confirmacion" className="text-sm">
                {actionType === 'aprobar' 
                  ? 'Confirmo que he verificado correctamente el comprobante y el monto'
                  : 'Confirmo que deseo rechazar esta solicitud'
                }
              </Label>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleFinalConfirm}
              disabled={!confirmacionCheck || loading}
            >
              {loading ? 'Procesando...' : (actionType === 'aprobar' ? 'Aprobar' : 'Rechazar')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ListadoSolicitudesRecargas;