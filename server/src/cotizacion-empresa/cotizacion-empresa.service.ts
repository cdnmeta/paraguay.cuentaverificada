import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { CotizacionDto } from './dto/regitrar-cotizacion.dto';

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
      const monedasSQL = `select m.id,m.nombre, m.simbolo,m.sigla_iso from monedas m where m.activo = true and m.id <> (select id_moneda_base from empresa_config)`;
      const monedas = await this.dbService.query(monedasSQL);
      return { monedaBase: monedaBaseRows[0], monedas: monedas.rows };
    } catch (error) {
      console.error('Error al obtener monedas:', error);
      throw error;
    }
  }

  async registrarCotizacionByMoneda(data: CotizacionDto) {
    try {
      const monedaHabilitadaSQL = `select exists (select 1  from monedas m where m.activo = true and m.id = $1 and $1 <> (select id_moneda_base from empresa_config ) ) as moneda_habilitada`;

      const { rows } = await this.dbService.query(monedaHabilitadaSQL, [
        data.id_moneda_destino,
      ]);
      if (!rows[0].moneda_habilitada) {
        throw new BadRequestException('La moneda no está habilitada');
      }

      const monedaBaseSQL = `select id_moneda_base from empresa_config limit 1`;

      const { rows: monedaBaseRows } =
        await this.dbService.query(monedaBaseSQL);
      const idMonedaBase = monedaBaseRows[0].id_moneda_base;

      const result = await this.prisma.cotizacion_empresa.create({
        data: {
          id_moneda_origen: idMonedaBase, // regitrar en moneda origen la moneda base de la empresa
          id_moneda_destino: data.id_moneda_destino,
          monto: data.monto,
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
        COALESCE(ce.fecha_actualizacion, ce.fecha_creacion) AS fecha,
        mo.nombre  AS moneda_origen_nombre,
        mo.sigla_iso AS moneda_origen_iso,
        md.nombre  AS moneda_destino_nombre,
        md.sigla_iso AS moneda_destino_iso
        FROM cotizacion_empresa ce
        JOIN monedas mo ON mo.id = ce.id_moneda_origen AND mo.activo = TRUE
        JOIN monedas md ON md.id = ce.id_moneda_destino AND md.activo = TRUE
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
  ) {

    // Si las monedas son iguales, no hay conversión
    if(idMonedaDestino === idMonedaOrigen) {
      return {
        idCotizacion,
        idMonedaOrigen,
        idMonedaDestino,
        montoOrigen: monto,
        tasaAplicada: 1,
        montoConvertido: monto,
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
        activo: true,
      },
    });

    if (!cot) {
      throw new NotFoundException(`No existe cotización con id=${idCotizacion}.`);
    }
    if (cot.activo === false) {
      throw new BadRequestException(`La cotización ${idCotizacion} no está activa.`);
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

    let tasaAplicada: number;
    let ruta: 'DIRECTO' | 'INVERSO';

    if (esInverso) {
      if (cot.monto === 0) {
        throw new BadRequestException('No se puede invertir una tasa con valor 0.');
      }
      tasaAplicada = 1 / cot.monto; // B->A
      ruta = 'INVERSO';
    } else {
      tasaAplicada = cot.monto;     // A->B
      ruta = 'DIRECTO';
    }

    const montoConvertido = monto * tasaAplicada;

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
          ? `Se aplicó tasa inversa: (B→A) = 1 / ${cot.monto}`
          : `Se aplicó tasa directa: (A→B) = ${cot.monto}`,
    };
  }

}
