import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { CotizacionDto } from './dto/regitrar-cotizacion.dto';
import { TasaAplicada } from './types';
import { AnularCotizacionDto } from './dto/anular-cotizacion.dto';

@Injectable()
export class CotizacionEmpresaService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly prisma: PrismaService,
  ) {}
  async getMonedas() {
    try {
      const monedaBase = `select m.id,m.nombre, m.simbolo,m.sigla_iso from monedas m where  m.id = (select id_moneda_base from empresa_config)`;
      const { rows: monedaBaseRows } = await this.dbService.query(monedaBase);
      const monedasSQL = `select m.id,m.nombre, m.simbolo,m.sigla_iso from monedas m where m.activo = true`;
      const monedas = await this.dbService.query(monedasSQL);
      return { monedaBase: monedaBaseRows[0], monedas: monedas.rows };
    } catch (error) {
      console.error('Error al obtener monedas:', error);
      throw error;
    }
  }

  async registrarCotizacionByMoneda(data: CotizacionDto) {
    try {
      
      if (data.id_moneda_origen === data.id_moneda_destino) {
        throw new BadRequestException('La moneda de origen y destino no pueden ser la misma.');
      }

      const result = await this.prisma.cotizacion_empresa.create({
        data: {
          id_moneda_origen: data.id_moneda_origen, // regitrar en moneda origen la moneda base de la empresa
          id_moneda_destino: data.id_moneda_destino,
          monto_compra: data.monto_compra,
          monto_venta: data.monto_venta,
          id_usuario_creacion: data.id_usuario_registro,
          activo: true,
          fecha_creacion: new Date(),
        },
      });
      return result;
    } catch (error) {
      throw error;
    }
  }
  async getCotizaciones() {
    try {
      const cotizacionesSQL = `
        SELECT DISTINCT ON (ce.id_moneda_origen, ce.id_moneda_destino)
        ce.id,
        ce.id_moneda_origen,
        ce.id_moneda_destino,
        ce.monto,
		ce.monto_pagos,
    ce.monto_compra,
    ce.monto_venta,
		(us.nombre || ' ' || us.apellido ) as nombre_usuario_registro,
        COALESCE(ce.fecha_actualizacion, ce.fecha_creacion) AS fecha,
        mo.nombre  AS moneda_origen_nombre,
        mo.sigla_iso AS moneda_origen_iso,
        md.nombre  AS moneda_destino_nombre,
        md.sigla_iso AS moneda_destino_iso
        FROM cotizacion_empresa ce
        JOIN monedas mo ON mo.id = ce.id_moneda_origen AND mo.activo = TRUE
        JOIN monedas md ON md.id = ce.id_moneda_destino AND md.activo = TRUE
		join usuarios us on us.id = ce.id_usuario_creacion
        WHERE ce.activo = TRUE
        ORDER BY
        ce.id_moneda_origen,
        ce.id_moneda_destino,
        COALESCE(ce.fecha_actualizacion, ce.fecha_creacion) DESC,
        ce.id DESC;  -- desempate estable
        `;
      const { rows } = await this.dbService.query(cotizacionesSQL);
      return rows;
    } catch (error) {
      console.error('Error al obtener cotizaciones:', error);
      throw error;
    }
  }


  /**
   * Convierte un monto de una moneda a otra utilizando una cotización específica por su ID.
   *
   * @param idCotizacion - ID de la cotización a utilizar para la conversión.
   * @param idMonedaOrigen - ID de la moneda de origen (moneda en la que se encuentra el monto a convertir).
   * @param idMonedaDestino - ID de la moneda destino (moneda a la que se desea convertir el monto).
   * @param monto - Monto a convertir.
   * @returns Un objeto con detalles de la conversión, incluyendo el monto convertido, la tasa aplicada, la ruta (directa o inversa) y un detalle descriptivo.
   * @throws {NotFoundException} Si no existe una cotización con el ID proporcionado.
   * @throws {BadRequestException} Si la cotización no está activa, si el par de monedas no corresponde a la cotización, o si se intenta invertir una tasa con valor 0.
   */
  async convertirPorIdCotizacion(
    idCotizacion: number,
    idMonedaOrigen: number,     // moneda con la que llega el monto a convertir (A)
    idMonedaDestino: number,    // moneda objetivo (B)
    monto: number,
  ) : Promise<TasaAplicada> {

    // Si las monedas son iguales, no hay conversión
    if(idMonedaDestino === idMonedaOrigen) {
      return {
        idCotizacion,
        idMonedaOrigen,
        idMonedaDestino,
        montoOrigen: monto,
        tasaAplicada: {compra: 1, venta: 1},
        montoConvertido: {compra: monto, venta: monto},
        ruta: 'DIRECTO',
        detalle: 'No se requiere conversión, las monedas son iguales.',
      };
    }

    const cot = await this.prisma.cotizacion_empresa.findFirst({
      where: { id: idCotizacion },
      select: {
        id: true,
        id_moneda_origen: true,   // A_cot
        id_moneda_destino: true,  // B_cot
        monto: true,               // tasa A_cot -> B_cot
        monto_compra: true,
        monto_venta: true,
        activo: true,
      },
    });

    if (!cot) {
      throw new NotFoundException(`No existe cotización con id=${idCotizacion}.`);
    }
    if (cot.activo === false) {
      throw new BadRequestException(`La cotización ${idCotizacion} no está activa.`);
    }


    if(!cot.monto_compra || cot.monto_compra <= 0) {
      throw new BadRequestException(`La cotización ${idCotizacion} tiene una tasa de compra inválida (${cot.monto_compra}).`);
    }
    if(!cot.monto_venta || cot.monto_venta <= 0) {
      throw new BadRequestException(`La cotización ${idCotizacion} tiene una tasa de venta inválida (${cot.monto_venta}).`);
    }

    // Determinar si la operación solicitada es DIRECTO o INVERSO respecto a la cotización
    const esDirecto =
      idMonedaOrigen === cot.id_moneda_origen &&
      idMonedaDestino === cot.id_moneda_destino;

    const esInverso =
      idMonedaOrigen === cot.id_moneda_destino &&
      idMonedaDestino === cot.id_moneda_origen;
    console.log(`Moneda origen: ${idMonedaOrigen}, Moneda destino: ${idMonedaDestino}`, esDirecto, esInverso);
    if (!esDirecto && !esInverso) {
      throw new BadRequestException(
        `El par de monedas solicitado (${idMonedaOrigen} -> ${idMonedaDestino}) no corresponde a la cotización ${idCotizacion} (guardada como ${cot.id_moneda_origen} -> ${cot.id_moneda_destino}).`
      );
    }

    let tasaAplicada: any = {}; // devolver la tasa aplicadoa en compra - venta
    let ruta: 'DIRECTO' | 'INVERSO';

    if (esInverso) {
      if (cot.monto === 0) {
        throw new BadRequestException('No se puede invertir una tasa con valor 0.');
      }
      tasaAplicada.compra =  (1 / cot.monto_compra); // B->A
      tasaAplicada.venta = (1 / cot.monto_venta);   // B->A
      ruta = 'INVERSO';
    } else {
      tasaAplicada.venta =  cot.monto_venta; // A->B
      tasaAplicada.compra = cot.monto_compra; // A->B
      ruta = 'DIRECTO';
    }

    const montoConvertido:any = {};

    montoConvertido.compra = monto * tasaAplicada.compra;
    montoConvertido.venta = monto * tasaAplicada.venta;

    return {
      idCotizacion: cot.id,
      idMonedaOrigen,
      idMonedaDestino,
      montoOrigen: monto,
      tasaAplicada,
      montoConvertido,
      ruta,
      detalle:
        ruta === 'INVERSO'
          ? `Se aplicó tasa inversa: (B→A)`
          : `Se aplicó tasa directa: (A→B)`,
    };
  }

  async anularCotizacion(idCotizacion: number,data:AnularCotizacionDto) {
    try {
      const cotizacion = await this.prisma.cotizacion_empresa.findFirst({
        where: { id: idCotizacion, activo: true },
      });
      if (!cotizacion) {
        throw new NotFoundException(`No existe cotización con id=${idCotizacion}.`);
      }
      await this.prisma.cotizacion_empresa.update({
        where: { id: idCotizacion },
        data: { activo: false,id_usuario_eliminacion: data.id_usuario_eliminacion },
      });
      return { message: `Cotización con id=${idCotizacion} eliminada correctamente.` };
    } catch (error) {
      throw error;
    }
  }

}
