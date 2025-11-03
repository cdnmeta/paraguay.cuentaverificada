import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  RefreshCw, 
  MessageSquare,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { getMensajesEstadosAnimo, eliminarMensajeEstadoAnimo } from '@/apis/estados-animos.api';
import ListadoEstadosAnimos from '../components/ListadoEstadosAnimos';
import FormMensajeEstadoAnimo from '../components/FormMensajeEstadoAnimo';

export default function EstadosAnimosPage() {
  const [estadosAnimos, setEstadosAnimos] = useState([]);
  const [loading, setLoading] = useState(true);
  // Estados para los diálogos
  const [formDialog, setFormDialog] = useState({
    open: false,
    id: null, // null para crear, número para editar
    title: ''
  });

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    id: null,
    titulo: ''
  });

  // Cargar estados de ánimos
  const cargarEstadosAnimos = async () => {
    try {
      setLoading(true);
      const response = await getMensajesEstadosAnimo();
      
      if (response.data && Array.isArray(response.data)) {
        setEstadosAnimos(response.data);
      } else {
        setEstadosAnimos([]);
      }
    } catch (error) {
      console.error('Error al cargar estados de ánimos:', error);
      toast.error('Error al cargar los estados de ánimos');
      setEstadosAnimos([]);
    } finally {
      setLoading(false);
    }
  };

  // Manejar creación de nuevo estado
  const handleNuevoEstado = () => {
    setFormDialog({
      open: true,
      id: null,
      title: 'Crear Nuevo Estado de Ánimo'
    });
  };

  // Manejar edición
  const handleEditarEstado = (registro) => {
    setFormDialog({
      open: true,
      id: registro.id,
      title: 'Editar Estado de Ánimo'
    });
  };

  // Manejar eliminación
  const handleEliminarEstado = (registro) => {
    setDeleteDialog({
      open: true,
      id: registro.id,
      titulo: registro.mensaje || 'Sin título'
    });
  };

  // Confirmar eliminación
  const confirmarEliminacion = async () => {
    try {
      await eliminarMensajeEstadoAnimo(deleteDialog.id);
      toast.success('Estado de ánimo eliminado exitosamente');
      setDeleteDialog({ open: false, id: null, titulo: '' });
      cargarEstadosAnimos(); // Recargar datos
    } catch (error) {
      console.error('Error al eliminar estado de ánimo:', error);
      toast.error('Error al eliminar el estado de ánimo');
    }
  };

  // Manejar éxito del formulario
  const handleFormSuccess = () => {
    setFormDialog({ open: false, id: null, title: '' });
    cargarEstadosAnimos(); // Recargar datos
  };

  // Manejar cancelación del formulario
  const handleFormCancel = () => {
    setFormDialog({ open: false, id: null, title: '' });
  };

  // Manejar vista de detalles (placeholder)
  const handleVerDetalles = (registro) => {
    toast.info(`Ver detalles de: ${registro.mensaje}`);
  };

  // Efecto para cargar datos al montar el componente
  useEffect(() => {
    cargarEstadosAnimos();
  }, []);

  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estados de Ánimos</h1>
          <p className="text-muted-foreground">
            Gestiona los mensajes y estados de ánimo de los usuarios
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={cargarEstadosAnimos}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={handleNuevoEstado}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Estado
          </Button>
        </div>
      </div>



      {/* Listado de Estados */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Estados de Ánimos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>Cargando estados de ánimos...</p>
              </div>
            </div>
          ) : (
           <div className="grid grid-cols-1">
             <ListadoEstadosAnimos 
              data={estadosAnimos}
              onEdit={handleEditarEstado}
              onDelete={handleEliminarEstado}
              onView={handleVerDetalles}
            />
           </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para formulario */}
      <Dialog open={formDialog.open} onOpenChange={(open) => !open && handleFormCancel()}
        
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {e.preventDefault()}}
        >
          <DialogHeader>
            <DialogTitle>{formDialog.title}</DialogTitle>
            <DialogDescription>
              {formDialog.id ? 'Actualiza la información del estado de ánimo' : 'Completa los datos para crear un nuevo estado de ánimo'}
            </DialogDescription>
          </DialogHeader>
          <FormMensajeEstadoAnimo
            id={formDialog.id}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, id: null, titulo: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar estado de ánimo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el estado de ánimo:
              <br />
              <span className="font-semibold">"{deleteDialog.titulo}"</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteDialog({ open: false, id: null, titulo: '' })}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarEliminacion}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
