import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NumericFormat } from 'react-number-format';
import { DatePicker } from '@/components/date-picker1';
import { executeWithErrorHandler } from '@/utils/funciones';
import { registrarAbonoMovimiento } from '@/apis/semaforoFinanciero.api';

// Schema de validación basado en el DTO
const abonoSchema = z.object({
  monto: z
    .number({ 
      required_error: 'El campo monto es obligatorio.',
      invalid_type_error: 'El campo monto debe ser un número.'
    })
    .min(0.01, { message: 'El monto debe ser mayor a 0.' }),
  fecha_abono: z
    .date()
    .optional()
    .or(z.string().optional())
    .refine((val) => !val || val instanceof Date || !isNaN(Date.parse(val)), {
      message: 'El campo fecha_abono debe ser una fecha válida.'
    }),
  id_movimiento: z
    .number({ 
      required_error: 'El campo id_movimiento es obligatorio.',
      invalid_type_error: 'El campo id_movimiento debe ser un número entero.'
    })
    .int({ message: 'El campo id_movimiento debe ser un número entero.' })
    .min(1, { message: 'El campo id_movimiento debe ser al menos 1.' })
});

const FormAbonoMovimiento = ({ movimiento, onSuccess }) => {
  const form = useForm({
    resolver: zodResolver(abonoSchema),
    defaultValues: {
      monto: 0,
      fecha_abono: new Date(), // Usar objeto Date para DateTimePicker
      id_moneda: movimiento?.id_moneda_movimiento || 1,
      id_movimiento: movimiento?.id || 0
    }
  });

  const { handleSubmit, formState: { isSubmitting }, reset } = form;

  const onSubmit = async (values) => {
    try {
      // Convertir fecha a formato ISO si se proporciona
      const payload = {
        ...values,
        fecha_abono: values.fecha_abono ? 
          (values.fecha_abono instanceof Date ? 
            values.fecha_abono.toISOString() : 
            new Date(values.fecha_abono).toISOString()) : 
          undefined
      };

      const response = await executeWithErrorHandler(
        () => registrarAbonoMovimiento(payload),
        {
          mensajeExito: 'Abono registrado exitosamente',
          mostrarToastExito: true,
          mostrarToastError: true
        }
      );

      if (response.success) {
        reset();
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error al registrar abono:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">
          Registrar Abono para: {movimiento?.descripcion}
        </h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><span className="font-medium">Monto original:</span> {movimiento?.monto?.toLocaleString()} {movimiento?.id_moneda === 1 ? 'USD' : 'PYG'}</p>
          <p><span className="font-medium">Saldo pendiente:</span> {movimiento?.saldo?.toLocaleString()} {movimiento?.id_moneda === 1 ? 'USD' : 'PYG'}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="monto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto del Abono *</FormLabel>
                <FormControl>
                  <NumericFormat
                    customInput={Input}
                    thousandSeparator={'.'}
                    decimalSeparator=","
                    decimalScale={2}
                    fixedDecimalScale={false}
                    allowNegative={false}
                    placeholder="Ingrese el monto del abono"
                    value={field.value}
                    onValueChange={(values) => {
                      field.onChange(values.floatValue || 0);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fecha_abono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha del Abono</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Seleccione la fecha del abono"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


          <FormField
            control={form.control}
            name="id_movimiento"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormControl>
                  <Input type="hidden" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={isSubmitting}
            >
              Limpiar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Registrar Abono'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FormAbonoMovimiento;