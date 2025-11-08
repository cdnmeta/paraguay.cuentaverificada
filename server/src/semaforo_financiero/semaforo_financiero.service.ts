import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateSemaforoFinancieroDto, RegistrarAbonoMovimientoDto } from './dto/create-semaforo_financiero.dto';
import { BorrarAbonoSemaforoFinancieroDto, UpdateSemaforoFinancieroDto } from './dto/update-semaforo_financiero.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { DatabasePromiseService } from '@/database/database-promise.service';
import { sqlConsultaDesglozadaSemaforoFinancieroPorUsuario, sqlConteoMovimientosSemaforoFinancieroPorUsuario } from './sql/consultas';
import { Prisma } from '@prisma/client';
import { QuerySemaforoFinancieroByUsuarioDto } from './dto/query-semaforo-financiero';
import { Cron } from '@nestjs/schedule';
import { SEMAFORO_FINANCIERO_CRON_TIME } from '@/utils/constants';

@Injectable()
export class SemaforoFinancieroService {
  constructor(private readonly prismaService: PrismaService,
    private readonly databasePromiseService: DatabasePromiseService
  ) {}

  private readonly logger = new Logger(SemaforoFinancieroService.name);

  @Cron(SEMAFORO_FINANCIERO_CRON_TIME) // ejecutar segun configuración en .env
  async registrarFijosMensuales() {
    try {
      const tiempo = new Date();
      this.logger.log(`Iniciando el proceso de registro de movimientos fijos del mes anterior el ${new Date().toISOString()}`);
      // buscar todos los movimientos fijos (ingreso fijo y egreso fijo) del mes anterior

      const sqlInserMasivoFijosMesAnterior = `WITH
        BOUNDS AS (
          SELECT
            DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' AS INI_MES_ANT,
            DATE_TRUNC('month', CURRENT_DATE) AS INI_MES_ACT
        ),
        SRC AS (
          SELECT
            SM.ID_USUARIO,
            SM.TITULO,
            SM.TIPO_MOVIMIENTO, -- 1 ingreso fijo, 3 egreso fijo
            SM.MONTO,
            SM.ID_MONEDA,
            SM.OBSERVACION,
            SM.VISIBLE
          FROM
            SEMAFORO_MOVIMIENTOS SM
            JOIN USUARIOS U ON U.ID = SM.ID_USUARIO
            CROSS JOIN BOUNDS B
          WHERE
            SM.TIPO_MOVIMIENTO IN (1, 3)
            AND SM.ACTIVO = TRUE -- movimiento ACTIVO (origen)
            AND U.ACTIVO = TRUE -- USUARIO ACTIVO
            AND SM.FECHA_CREACION >= B.INI_MES_ANT
            AND SM.FECHA_CREACION < B.INI_MES_ACT
        )
      INSERT INTO
        SEMAFORO_MOVIMIENTOS (
          ID_USUARIO,
          TITULO,
          TIPO_MOVIMIENTO,
          ID_ESTADO,
          MONTO,
          ID_MONEDA,
          OBSERVACION,
          FECHA_CREACION,
          FECHA_ACTUALIZACION,
          VISIBLE,
          FECHA_VENCIMIENTO,
          ACTIVO,
          ACUMULADO,
          SALDO
        )
      SELECT
        S.ID_USUARIO,
        S.TITULO,
        S.TIPO_MOVIMIENTO,
        1 AS ID_ESTADO, -- ajusta si tu flujo requiere otro estado
        S.MONTO,
        S.ID_MONEDA,
        S.OBSERVACION,
        NOW(), -- o date_trunc('month', current_date)
        NOW(),
        COALESCE(S.VISIBLE, TRUE),
        NULL, -- o calcula nueva fecha de vencimiento si aplica
        TRUE, -- insertar como ACTIVO
        0::FLOAT, -- reinicia acumulado
        S.MONTO -- saldo inicial = monto (ajusta si corresponde)
      FROM
        SRC S
        CROSS JOIN BOUNDS B
      WHERE
        NOT EXISTS ( -- evita duplicar en el mes actual
          SELECT
            1
          FROM
            SEMAFORO_MOVIMIENTOS T
          WHERE
            T.ID_USUARIO = S.ID_USUARIO
            AND T.TIPO_MOVIMIENTO = S.TIPO_MOVIMIENTO
            AND T.ID_MONEDA = S.ID_MONEDA
            AND T.TITULO = S.TITULO
            AND T.ACTIVO = TRUE
            AND T.FECHA_CREACION >= B.INI_MES_ACT
            AND T.FECHA_CREACION < (B.INI_MES_ACT + INTERVAL '1 month')
        )
      RETURNING
        ID,
        ID_USUARIO,
        TITULO,
        TIPO_MOVIMIENTO,
        MONTO,
        ID_MONEDA;`

      const resultadoInsertMasivoFijosMesAnterior = await this.databasePromiseService.tx(async (tx) => {
        const resultado = await tx.result(sqlInserMasivoFijosMesAnterior);
        return resultado;
      });

      const tiempoFin = new Date();

      const duracion = tiempoFin.getTime() - tiempo.getTime();

      if(resultadoInsertMasivoFijosMesAnterior.rowCount && resultadoInsertMasivoFijosMesAnterior.rowCount > 0){
        this.logger.log(`Se registraron ${resultadoInsertMasivoFijosMesAnterior.rowCount} movimientos fijos para el mes actual.`);
      }

      this.logger.log(`Finalizó el proceso de registro de movimientos fijos del mes anterior, tardó: ${duracion} ms.`);

    } catch (error) {
      this.logger.error('Error al registrar movimientos fijos del mes anterior', error);
    }
  }

  async create(data: CreateSemaforoFinancieroDto) {
    try {
      const usuarioExistente = await this.prismaService.usuarios.findFirst({
        where: { id: data.id_usuario, activo: true },
      });
      if (!usuarioExistente)
        throw new NotFoundException('El usuario no existe o no está activo.');
      return this.prismaService.semaforo_movimientos.create({
        data: {
          titulo: data.titulo,
          tipo_movimiento: data.tipo_movimiento,
          id_estado:  1, // Por defecto, si no se proporciona, es Pendiente
          monto: data.monto,
          id_moneda: data.id_moneda,
          observacion: data.observacion,
          id_usuario: data.id_usuario,
          saldo: data.monto, // Inicialmente, el saldo es igual al monto
          acumulado: 0, // Inicialmente, el acumulado es 0
          fecha_vencimiento: data.fecha_vencimiento,
          fecha_creacion: data.fecha || new Date(),

        },
      });
    } catch (error) {
      throw error;
    }
  }

  async registrarAbonoMovimiento(id_movimiento: number, data: RegistrarAbonoMovimientoDto, tx?: Prisma.TransactionClient) {
    try {
      const movimientoExistente = await this.prismaService.semaforo_movimientos.findFirst({
        where: { id: id_movimiento, activo: true, visible: true },
      });

      if (!movimientoExistente) {
        throw new NotFoundException('El movimiento no existe o no está activo.');
      }

      if(movimientoExistente.id_usuario !== data.id_usuario){
        throw new ForbiddenException('No tiene permiso para abonar a este movimiento.');
      }

      if(data.monto > (movimientoExistente.saldo ?? 0)){
        throw new BadRequestException('El monto del abono no puede ser mayor al saldo pendiente.');
      }

      const movimiento = await this.prismaService.runInTransaction(tx, async (client) => {
        // Ya verificamos que movimientoExistente no es null arriba, pero TypeScript necesita que lo verifiquemos dentro del scope de la transacción
        
        let saldo_asignar = 0;
        let acumulado_asignar = 0;
        let tipo_movimiento_abono = 1;
        
        if (movimientoExistente.tipo_movimiento === 5) { // Cuentas por pagar
          tipo_movimiento_abono = 2; // Pago
        } else if (movimientoExistente.tipo_movimiento === 6) { // Cuentas por cobrar
          tipo_movimiento_abono = 1; // Cobro
        }

        // Calcular nuevo saldo - ya sabemos que saldo no es null por la verificación arriba
        const saldoActual = movimientoExistente.saldo ?? 0; // Usar nullish coalescing como fallback
        saldo_asignar = saldoActual - data.monto;
        
        // Calcular nuevo acumulado
        const acumuladoActual = movimientoExistente.acumulado ?? 0;
        acumulado_asignar = acumuladoActual + data.monto;

        // Actualizar el movimiento principal
        const movimientoActualizado = await client.semaforo_movimientos.update({
          where: { id: id_movimiento },
          data: {
            saldo: saldo_asignar,
            acumulado: acumulado_asignar,
            // Actualizar estado si el saldo llega a 0
            id_estado: saldo_asignar <= 0 ? 2 : movimientoExistente.id_estado,
          },
        });

        // Crear registro del abono/pago
        const registroAbono = await client.semaforo_abonos.create({
          data: {
            tipo_abono: tipo_movimiento_abono,
            monto_abono: data.monto,
            id_semaforo_movimiento: id_movimiento,  
            fecha_abono: data.fecha_abono || new Date(),     
            id_moneda: movimientoExistente.id_moneda,
          },
        });

        return {
          movimientoActualizado,
          registroAbono,
        };
      });

      return movimiento;
    } catch (error) {
      throw error;
    }
  }

  async eliminarabono(id_abono: number, data: BorrarAbonoSemaforoFinancieroDto) {
    try {
      const abonoExistente = await this.prismaService.semaforo_abonos.findFirst({
        where: { id: id_abono, activo: true },
      })
      if (!abonoExistente) {
        throw new NotFoundException('El abono no existe o no está activo.');
      }
      const movimiento = await this.prismaService.semaforo_movimientos.findFirst({
        where: { id: abonoExistente?.id_semaforo_movimiento, activo: true },
      });

      if (movimiento?.id_usuario !== data.id_usuario) {
        throw new ForbiddenException('No tiene permiso para eliminar este abono.');
      }

      const acumulado = (movimiento!.acumulado ?? 0) - abonoExistente.monto_abono;
      const saldo = (movimiento!.saldo ?? 0) + abonoExistente.monto_abono;

      const resultado = await this.prismaService.$transaction(async (tx) => {
        await tx.semaforo_abonos.delete({
          where: { id: id_abono },
        });
        await tx.semaforo_movimientos.update({
          where: { id: movimiento.id },
          data: { acumulado, saldo, id_estado: 1 },
        });
      });

      return resultado;

    } catch (error) {
      throw error;
    }
  }

  findAll() {
    try {
      return this.prismaService.semaforo_movimientos.findMany({
        where: { activo: true },
      });
    } catch (error) {
      throw error;
    }
  }

  async finanzasDeglosadasPorUsuario(id_usuario: number, query?: QuerySemaforoFinancieroByUsuarioDto) {
    try {
      let sql = sqlConsultaDesglozadaSemaforoFinancieroPorUsuario;
      const whereClausule:any = {id_usuario}

      if (query?.anio) {
        whereClausule.anio = query.anio;
      }else{
        whereClausule.anio = new Date().getFullYear(); // año actual
      }

      if (query?.mes) {
        console.log("hay mes")
        whereClausule.mes = query.mes;
      }else{
        whereClausule.mes = new Date().getMonth() + 1; // mes actual
      }

      if (query?.dia) {
        whereClausule.dia = query.dia;
      }else{
        whereClausule.dia = 1; // primer día del mes
      }

      console.log(sql)

      console.log(whereClausule)

      const resultado = await this.databasePromiseService.result(sql, whereClausule);

      const mainRow = resultado?.rows?.[0] ?? {};


      return mainRow;
    } catch (error) {
      throw error;
    }
  }

 async findOneByIdUser(id: number, id_usuario: number) {
    try {
      const movimiento = await this.prismaService.semaforo_movimientos.findFirst({
        where: { id, activo: true, id_usuario },
      });
      if (!movimiento) throw new NotFoundException('Movimiento no encontrado.');
      return movimiento;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateSemaforoFinancieroDto: UpdateSemaforoFinancieroDto) {
    try {

      const mesActual = new Date().getMonth() + 1; 
      const movimientoExistente =
        await this.prismaService.semaforo_movimientos.findFirst({
          where: { id, activo: true, },
        });

      if(!movimientoExistente) throw new NotFoundException('Movimiento no encontrado.');

      
      
      return await this.prismaService.semaforo_movimientos.update({
        where: { id },
        data: {
          ...updateSemaforoFinancieroDto,
          fecha_creacion: updateSemaforoFinancieroDto.fecha,
        }
      });
    } catch (error) {
      throw error;
    }
  }

 async remove(id: number) {
    try {
      const movimientoExistente =
        await this.prismaService.semaforo_movimientos.findFirst({
          where: { id, activo: true },
        });
      if (!movimientoExistente)
        throw new NotFoundException('El movimiento no existe.');

      const movimientoEliminado =
        await this.prismaService.semaforo_movimientos.update({
          where: { id },
          data: { activo: false },
        });
      return movimientoEliminado;
    } catch (error) {
      throw error;
    }
  }
}
