import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSemaforoFinancieroDto, RegistrarAbonoMovimientoDto } from './dto/create-semaforo_financiero.dto';
import { BorrarAbonoSemaforoFinancieroDto, UpdateSemaforoFinancieroDto } from './dto/update-semaforo_financiero.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { DatabasePromiseService } from '@/database/database-promise.service';
import { sqlConsultaDesglozadaSemaforoFinancieroPorUsuario, sqlConteoMovimientosSemaforoFinancieroPorUsuario } from './sql/consultas';
import { Prisma } from '@prisma/client';
import { QuerySemaforoFinancieroByUsuarioDto } from './dto/query-semaforo-financiero';

@Injectable()
export class SemaforoFinancieroService {
  constructor(private readonly prismaService: PrismaService,
    private readonly databasePromiseService: DatabasePromiseService
  ) {}

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
          fecha_vencimiento: data.fecha_vencimiento

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

      const es_mismo_mes = movimientoExistente && movimientoExistente.fecha_creacion.getMonth() + 1 === mesActual;

      
      // Si no es el mismo mes y el tipo de movimiento es ingreso fijo o egreso fijo, crear un nuevo registro
      if (!es_mismo_mes && [1,3].includes(movimientoExistente.tipo_movimiento)) {

        return this.prismaService.semaforo_movimientos.create({
          data: {
            titulo: updateSemaforoFinancieroDto!.titulo,
            tipo_movimiento: movimientoExistente.tipo_movimiento,
            id_estado:  1, // Por defecto, si no se proporciona, es Pendiente
            monto: updateSemaforoFinancieroDto!.monto,
            id_moneda: updateSemaforoFinancieroDto!.id_moneda,
            observacion: updateSemaforoFinancieroDto!.observacion,
            id_usuario:updateSemaforoFinancieroDto!.id_usuario,
            saldo: updateSemaforoFinancieroDto!.monto, // Inicialmente, el saldo es igual al monto
            acumulado: 0, // Inicialmente, el acumulado es 0
            fecha_vencimiento: updateSemaforoFinancieroDto!.fecha_vencimiento
          }
        })

      }
      
      return await this.prismaService.semaforo_movimientos.update({
        where: { id },
        data: updateSemaforoFinancieroDto,
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
