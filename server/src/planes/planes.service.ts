import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { DatabasePromiseService } from '@/database/database-promise.service';
import { DeletePlanDto } from './dto/delete-plan.dto';

@Injectable()
export class PlanesService {
  constructor(private readonly prisma: PrismaService,
    private readonly databasePromiseService: DatabasePromiseService
  ) {}

  async findAll() {
    try {
      let sql = `SELECT
          PL.ID,
          PL.NOMBRE,
          PL.DESCRIPCION,
          PL.ACTIVO,
          PL.FECHA_CREACION,
          PL.FECHA_ACTUALIZACION,
          PL.PRECIO,
          PL.PRECIO_SIN_IVA,
          PL.TIPO_IVA,
          PL.RENOVACION_VALOR,
          PL.RENOVACION_PLAN,
          (CONCAT_WS(' ', USR.NOMBRE, USR.APELLIDO)) AS NOMBRE_USUARIO_CREACION,
          PMO.NOMBRE AS DESCRIPCION_MONEDA,
          PMO.SIGLA_ISO,
          (
            CASE
              WHEN PL.TIPO_IVA = 1 THEN 'Exentas'
              WHEN PL.TIPO_IVA = 2 THEN '5%'
              WHEN PL.TIPO_IVA = 3 THEN '10%'
            END
          ) AS DESCRIPCION_TIPO_IVA
        FROM
          PLANES PL
          LEFT JOIN USUARIOS USR ON USR.ID = PL.ID_USUARIO_CREACION
          LEFT JOIN MONEDAS PMO ON PMO.ID = (
            SELECT
              EMC.ID_MONEDA_PLANES
            FROM
              EMPRESA_CONFIG EMC
            LIMIT
              1
          )::INTEGER
        WHERE
          PL.ACTIVO = TRUE
      
      
      `

    const planes = await this.databasePromiseService.result(sql, []);
    return planes.rows;
    } catch (error) {
      throw error;
    }
  }

  async crearPlan(createPlanDto: CreatePlanDto) {
    try {
      const nuevoPlan = await this.prisma.planes.create({
        data: {
          nombre: createPlanDto.nombre,
          descripcion: createPlanDto.descripcion,
          precio: createPlanDto.precio,
          precio_sin_iva: createPlanDto.precio_sin_iva,
          renovacion_plan: createPlanDto.renovacion_plan,
          renovacion_valor: createPlanDto.renovacion_valor,
          tipo_iva: createPlanDto.tipo_iva,
          id_usuario_creacion: createPlanDto.id_usuario,
        },
      });
      return nuevoPlan;
    } catch (error) {
      throw error;
    }
  }

  async actualizarPlan(id:number, updatePlanDto: UpdatePlanDto) {
    try {
        const planActualizado = await this.prisma.planes.update({
        where: { id },
        data: {
            ...updatePlanDto,
            fecha_actualizacion: new Date(),
        },
      });
      return planActualizado;
    } catch (error) {
        throw error;
    }
  }

  async getPlanById(id: number) {
    try {
      const plan = await this.prisma.planes.findFirst({
        where: { id,activo: true },
        
      });
      return plan;
    } catch (error) {
      throw error;
    }
  }

  async deletePlan(id: number, dataEliminar:DeletePlanDto) {
    try {
      const sqlPlanYaUsado = `SELECT
        EXISTS (
          SELECT
            1
          FROM
            SUSCRIPCIONES SUS
          WHERE
            SUS.ID_PLAN = $1
            and sus.activo = true
        ) AS PLAN_EXISTE`
      const planEliminarUsado = await this.databasePromiseService.result(sqlPlanYaUsado, [id]) as { rows: { plan_existe: boolean }[] };
      if(planEliminarUsado.rows[0].plan_existe) {
        throw new BadRequestException('No se puede eliminar el plan porque ya está asociado a una suscripción activa.');
      }
      const planEliminado = await this.prisma.planes.update({
        where: { id },
        data: {
          activo: false,
          fecha_eliminacion: new Date(),
          id_usuario_eliminacion: dataEliminar.id_usuario_eliminacion,
        },
      });
      return planEliminado;
    } catch (error) {
      throw error;
    }
  }

}
