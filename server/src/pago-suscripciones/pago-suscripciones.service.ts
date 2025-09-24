import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RegistrarPagoSuscripcionDTO } from './dto/create-pago.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { CotizacionEmpresaService } from '@/cotizacion-empresa/cotizacion-empresa.service';
import { VerificacionComercioService } from '@/verificacion-comercio/verificacion-comercio.service';

@Injectable()
export class PagoSuscripcionesService {
  constructor(
    private prismaServices: PrismaService,
    private cotizacionService: CotizacionEmpresaService,
    private verificacionComercioService: VerificacionComercioService,
  ) {}
  async registrarPago(
    crearPagoDto: RegistrarPagoSuscripcionDTO,
    id_usuario: number,
  ) {
    try {
      // Lógica para registrar el pago de suscripción
      let montos_pagados_a_moneda_base = [];

      let convertirMonedaAMonedaBase = false;

      let montoConvertir: number = 1;



      let facturaCancelada = false;

      // validar que la moneda de pago sea la base (misma que la factura)

      const factura = await this.prismaServices.factura_suscripciones.findFirst(
        {
          select: {
            id_moneda: true,
            total_factura: true,
            id_suscripcion: true,
          },
          where: { id: crearPagoDto.id_factura },
        },
      );

      // obtener suscripcion de la factura
      const suscripcion = await this.prismaServices.suscripciones.findFirst({
        select: { id: true, id_plan: true, id_comercio: true },
        where: { id: factura?.id_suscripcion },
      });

      if (!factura) {
        throw new NotFoundException('Factura no encontrada');
      }

      if (factura?.id_moneda == null) {
        throw new NotFoundException(
          'La factura no tiene una moneda base asignada.',
        );
      }

     const montoConvertido = await this.cotizacionService.convertirPorIdCotizacion(
        crearPagoDto.id_cotizacion,
        crearPagoDto.id_moneda,
        factura.id_moneda,
        crearPagoDto.monto,
      );

      // buscar los pagos ya hechos y sumarlos para determinar el total pagado

      const pagosRealizados =
        await this.prismaServices.pagos_factura_suscripciones.findMany({
          where: {
            id_factura: crearPagoDto.id_factura,
            activo: true,
            estado: 1,
          },
        });

      const totalPagado = pagosRealizados.reduce(
        (sum, pago) => sum + parseFloat(pago.monto_base.toFixed(2)),
        0,
      );

      // verificar si el monto total pagado es suficiente para cubrir la factura
      if (factura.total_factura == null) {
        throw new Error('La factura no tiene un monto total asignado.');
      }

      const haySobrante =
        totalPagado + montoConvertido.montoConvertido.venta > factura.total_factura;

      if (haySobrante) {
        throw new BadRequestException(
          'El monto total pagado excede el monto de la factura',
        );
      }

      // si el se cancela la factura
      if (
        totalPagado + montoConvertido.montoConvertido.venta ==
        factura.total_factura
      ) {
        facturaCancelada = true;
      }

      console.log('monto convertido:', montoConvertido);

      const dataInsertar = {
        fecha_pago: crearPagoDto.fecha_pago,
        id_factura: crearPagoDto.id_factura,
        id_cotizacion: crearPagoDto.id_cotizacion,
        monto_base: montoConvertido.montoConvertido,
        monto: crearPagoDto.monto,
        id_moneda: crearPagoDto.id_moneda,
        metodo_pago: crearPagoDto.id_metodo_pago,
        estado: 1, // Asumiendo que 1 es el estado de pago exitoso
        id_usuario: id_usuario,
        id_entidad_financiera: crearPagoDto.id_entidad_financiera ?? null, // or throw an error if undefined is not valid
      };

      const resultPago = await this.prismaServices.$transaction(async (prisma) => {
        const pagoCreado = await prisma.pagos_factura_suscripciones.create({
          data: {
            fecha_pago: crearPagoDto.fecha_pago,
            id_factura: crearPagoDto.id_factura,
            id_cotizacion: crearPagoDto.id_cotizacion,
            monto_base: Number(montoConvertido.montoConvertido.venta.toFixed(2)),
            monto: Number(crearPagoDto.monto.toFixed(2)),
            id_moneda: crearPagoDto.id_moneda,
            metodo_pago: crearPagoDto.id_metodo_pago,
            estado: 1, // Asumiendo que 1 es el estado de pago exitoso
            id_usuario: id_usuario,
            id_entidad_financiera: crearPagoDto.id_entidad_financiera ?? null,
            nro_comprobante: crearPagoDto.numero_comprobante || null,
          },
        });

        // actualizar estado de la factura si fue cancelada
        if (facturaCancelada) {
          await prisma.factura_suscripciones.update({
            where: { id: crearPagoDto.id_factura },
            data: { estado: 2 },
          });
        }

        return pagoCreado;
      });
      const comercio = await this.prismaServices.comercio.findFirst({
        where: { id: suscripcion?.id_comercio, activo: true },
      });

      // si comercio esta en estado Pend. verificacion de Pago y la factura se cancela, poner el comercio en estado 2 (Pago Aprobado)
      if (facturaCancelada && comercio?.estado === 1) {
        const dataAprobacion = {
          id_usuario: id_usuario,
          fecha_aprobacion: new Date(),
        }
        await this.verificacionComercioService.aprobarPagosolicitudVerificacion(
          comercio.id,
          dataAprobacion
        );
      }

      return resultPago;
    } catch (error) {
      console.error('Error al crear el pago de suscripción:', error);
      throw error;
    }
  }
}
