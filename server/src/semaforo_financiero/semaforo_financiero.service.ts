import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSemaforoFinancieroDto } from './dto/create-semaforo_financiero.dto';
import { UpdateSemaforoFinancieroDto } from './dto/update-semaforo_financiero.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { DatabasePromiseService } from '@/database/database-promise.service';
import { sqlConsultaDesglozadaSemaforoFinancieroPorUsuario } from './sql/consultas';

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
          id_estado: data.id_estado || 1, // Por defecto, si no se proporciona, es Pendiente
          monto: data.monto,
          id_moneda: data.id_moneda,
          observacion: data.observacion,
          id_usuario: data.id_usuario,
        },
      });
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

  async finanzasDeglosadasPorUsuario(id_usuario: number) {
    try {
      const resultado = await this.databasePromiseService.result(sqlConsultaDesglozadaSemaforoFinancieroPorUsuario  , [id_usuario]);
      return resultado.rows;
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
      const movimientoExistente =
        await this.prismaService.semaforo_movimientos.findFirst({
          where: { id, activo: true, },
        });
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
        await this.prismaService.semaforo_movimientos.delete({
          where: { id },
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
