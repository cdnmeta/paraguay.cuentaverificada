import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NumericFormat } from 'react-number-format';
import { toast } from 'sonner';
import { getMonedas } from '@/apis/moneda.api';
import { 
  crearMovimientoSemaforo, 
  actualizarMovimientoSemaforo, 
  obtenerMovimientoSemaforo 
} from '@/apis/semaforoFinanciero.api';
import { useNavigate } from 'react-router-dom';
import {BASE_URL,routes} from '@/pages/SemaforoFinanciero/config/routes'

// Schema de validación
const movimientoSchema = z.object({
  titulo: z.string().min(1, 'El título es requerido').max(255, 'El título es muy largo'),
  tipo_movimiento: z.string().min(1, 'Seleccione un tipo de movimiento'),
  id_estado: z.string().optional(),
  monto: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  id_moneda: z.string().min(1, 'Seleccione una moneda'),
  observacion: z.string().max(500, 'La observación es muy larga').optional()
});

// Constantes
const TIPOS_MOVIMIENTO = [
  { value: '1', label: 'Ingreso fijo' },
  { value: '2', label: 'Ingreso Ocasional' },
  { value: '3', label: 'Egreso Fijo' },
  { value: '4', label: 'Egreso Ocasional' },
  { value: '5', label: 'Por pagar' },
  { value: '6', label: 'Por Cobrar' }
];

const ESTADOS = [
  { value: '1', label: 'Pendiente' },
  { value: '2', label: 'Pagado' },
  { value: '3', label: 'Cobrado' }
];

const FormSemaforoFinancieroMovimiento = ({ id_movimiento, onSuccess }) => {
  const [monedas, setMonedas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(movimientoSchema),
    defaultValues: {
      titulo: '',
      tipo_movimiento: '',
      id_estado: '',
      monto: 0,
      id_moneda: '',
      observacion: ''
    }
  });

  // Cargar monedas al montar el componente
  useEffect(() => {
    const cargarMonedas = async () => {
      try {
        const response = await getMonedas();
        setMonedas(response.data);
      } catch (error) {
        console.error('Error al cargar monedas:', error);
        toast.error('Error al cargar las monedas');
      }
    };

    cargarMonedas();
  }, []);

  // Cargar datos del movimiento si es edición
  useEffect(() => {
    if (id_movimiento) {
      const cargarMovimiento = async () => {
        try {
          setLoadingData(true);
          const response = await obtenerMovimientoSemaforo(id_movimiento);
          const data = response.data;
          
          // Rellenar el formulario con los datos
          setValue('titulo', data.titulo);
          setValue('tipo_movimiento', data.tipo_movimiento.toString());
          setValue('id_estado', data.id_estado?.toString() || '');
          setValue('monto', data.monto);
          setValue('id_moneda', data.id_moneda.toString());
          setValue('observacion', data.observacion || '');
        } catch (error) {
          console.error('Error al cargar movimiento:', error);
          toast.error('Error al cargar los datos del movimiento');
          if (error.response?.status === 404) {
            navigate( `/${routes.index}`);
          }
        } finally {
          setLoadingData(false);
        }
      };

      cargarMovimiento();
    }
  }, [id_movimiento, setValue]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Convertir strings a números donde sea necesario
      const payload = {
        ...data,
        tipo_movimiento: parseInt(data.tipo_movimiento),
        id_estado: data.id_estado ? parseInt(data.id_estado) : null,
        id_moneda: parseInt(data.id_moneda)
      };

      if (id_movimiento) {
        // Actualizar movimiento existente
        await actualizarMovimientoSemaforo(id_movimiento, payload);
        toast.success('Movimiento actualizado exitosamente');
      } else {
        // Crear nuevo movimiento
        await crearMovimientoSemaforo(payload);
        toast.success('Movimiento creado exitosamente');
        reset(); // Limpiar formulario después de crear
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error al guardar movimiento:', error);
      const message = error.response?.data?.message || 'Error al guardar el movimiento';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Cargando datos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {id_movimiento ? 'Editar Movimiento' : 'Nuevo Movimiento'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              {...register('titulo')}
              placeholder="Ingrese el título del movimiento"
            />
            {errors.titulo && (
              <p className="text-sm text-red-500">{errors.titulo.message}</p>
            )}
          </div>

          {/* Tipo de Movimiento */}
          <div className="space-y-3">
            <Label>Tipo de Movimiento *</Label>
            <RadioGroup 
              value={watch('tipo_movimiento')} 
              onValueChange={(value) => setValue('tipo_movimiento', value)}
              className="grid grid-cols-2 gap-4"
            >
              {TIPOS_MOVIMIENTO.map((tipo) => (
                <div key={tipo.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={tipo.value} id={`tipo_${tipo.value}`} />
                  <Label htmlFor={`tipo_${tipo.value}`} className="text-sm font-normal">
                    {tipo.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.tipo_movimiento && (
              <p className="text-sm text-red-500">{errors.tipo_movimiento.message}</p>
            )}
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label htmlFor="id_estado">Estado</Label>
            <Select value={watch('id_estado')} onValueChange={(value) => setValue('id_estado', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un estado (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS.map((estado) => (
                  <SelectItem key={estado.value} value={estado.value}>
                    {estado.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.id_estado && (
              <p className="text-sm text-red-500">{errors.id_estado.message}</p>
            )}
          </div>

          {/* Monto */}
          <div className="space-y-2">
            <Label htmlFor="monto">Monto *</Label>
            <NumericFormat
              customInput={Input}
              value={watch('monto')}
              onValueChange={(values) => {
                setValue('monto', values.floatValue || 0);
              }}
              thousandSeparator=","
              decimalSeparator="."
              decimalScale={2}
              allowNegative={false}
              placeholder="0.00"
            />
            {errors.monto && (
              <p className="text-sm text-red-500">{errors.monto.message}</p>
            )}
          </div>

          {/* Moneda */}
          <div className="space-y-2">
            <Label htmlFor="id_moneda">Moneda *</Label>
            <Select value={watch('id_moneda')} onValueChange={(value) => setValue('id_moneda', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una moneda" />
              </SelectTrigger>
              <SelectContent>
                {monedas.map((moneda) => (
                  <SelectItem key={moneda.id} value={moneda.id.toString()}>
                    {moneda.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.id_moneda && (
              <p className="text-sm text-red-500">{errors.id_moneda.message}</p>
            )}
          </div>

          {/* Observación */}
          <div className="space-y-2">
            <Label htmlFor="observacion">Observación</Label>
            <Textarea
              id="observacion"
              {...register('observacion')}
              placeholder="Ingrese observaciones adicionales (opcional)"
              rows={3}
            />
            {errors.observacion && (
              <p className="text-sm text-red-500">{errors.observacion.message}</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {id_movimiento ? 'Actualizando...' : 'Guardando...'}
                </>
              ) : (
                id_movimiento ? 'Actualizar Movimiento' : 'Crear Movimiento'
              )}
            </Button>
            {!id_movimiento && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => reset()}
                disabled={loading}
              >
                Limpiar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FormSemaforoFinancieroMovimiento;