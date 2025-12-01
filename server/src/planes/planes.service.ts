import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { DatabasePromiseService } from '@/database/database-promise.service';
import { DeletePlanDto } from './dto/delete-plan.dto';
import { PlanesTipoRepartir } from './types/planes-tipo-repartir';

@Injectable()
export class PlanesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly databasePromiseService: DatabasePromiseService,
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
        ORDER BY ID ASC;
      
      
      `;

      const planes = await this.databasePromiseService.result(sql, []);
      return planes.rows;
    } catch (error) {
      throw error;
    }
  }

  async crearPlan(createPlanDto: CreatePlanDto) {
    const porcentajesRepartir = createPlanDto.porcentajes_repartir;
    let porcentaje_primera_venta_empresa = 0;
    let porcentaje_venta_recurrente_empresa = 0;

    const suma_porcentajes_primera_venta = porcentajesRepartir.reduce(
      (sum, pr) => sum + pr.porcentaje_primera_venta,
      0,
    );
    if (suma_porcentajes_primera_venta != 100) {
      throw new BadRequestException(
        'La suma de los porcentajes de primera venta no puede ser diferente a 100',
      );
    }
    const suma_porcentajes_venta_renovacion = porcentajesRepartir.reduce(
      (sum, pr) => sum + pr.porcentaje_venta_recurrente,
      0,
    );
    if (suma_porcentajes_venta_renovacion != 100) {
      throw new BadRequestException(
        'La suma de los porcentajes de venta por renovación no puede ser diferente a 100',
      );
    }

    try {
      const nuevoPlan = await this.prisma.$transaction(async (tx) => {
        const planCreado = await tx.planes.create({
          data: {
            nombre: createPlanDto.nombre,
            descripcion: createPlanDto.descripcion,
            precio: createPlanDto.precio,
            precio_sin_iva: createPlanDto.precio_sin_iva,
            renovacion_plan: createPlanDto.renovacion_plan,
            renovacion_valor: createPlanDto.renovacion_valor,
            tipo_iva: createPlanDto.tipo_iva,
            id_usuario_creacion: createPlanDto.id_usuario,
            precio_oferta: createPlanDto.precio_oferta,
          },
        });
        // guardar los porcentajes de repartir
        for (const pr of porcentajesRepartir) {
          await tx.planes_porcentajes_repartir.create({
            data: {
              id_plan: planCreado.id,
              id_tipo: pr.id_tipo,
              porcentaje_primera_venta: pr.porcentaje_primera_venta,
              porcentaje_venta_recurrente: pr.porcentaje_venta_recurrente,
            },
          });
        }
        return planCreado;
      });
      return nuevoPlan;
    } catch (error) {
      throw error;
    }
  }

  async actualizarPlan(id: number, updatePlanDto: UpdatePlanDto) {
    // Solo procesar porcentajes_repartir si viene en el DTO
    if (updatePlanDto.porcentajes_repartir) {
      const porcentajesRepartir = updatePlanDto.porcentajes_repartir;
      let porcentaje_primera_venta_empresa = 0;
      let porcentaje_venta_recurrente_empresa = 0;

      const suma_porcentajes_primera_venta = porcentajesRepartir.reduce(
        (sum, pr) => sum + pr.porcentaje_primera_venta,
        0,
      );
      if (suma_porcentajes_primera_venta != 100) {
        throw new BadRequestException(
          'La suma de los porcentajes de primera venta no puede ser diferente a 100',
        );
      }

      const suma_porcentajes_venta_renovacion = porcentajesRepartir.reduce(
        (sum, pr) => sum + pr.porcentaje_venta_recurrente,
        0,
      );
      if (suma_porcentajes_venta_renovacion != 100) {
        throw new BadRequestException(
          'La suma de los porcentajes de venta por renovación no puede ser diferente a 100',
        );
      }

      

      try {
        const planActualizado = await this.prisma.$transaction(async (tx) => {
          // Actualizar el plan
          const planUpdated = await tx.planes.update({
            where: { id },
            data: {
              nombre: updatePlanDto.nombre,
              descripcion: updatePlanDto.descripcion,
              precio: updatePlanDto.precio,
              precio_sin_iva: updatePlanDto.precio_sin_iva,
              renovacion_plan: updatePlanDto.renovacion_plan,
              renovacion_valor: updatePlanDto.renovacion_valor,
              tipo_iva: updatePlanDto.tipo_iva,
              precio_oferta: updatePlanDto.precio_oferta,
              id_usuario_actualizacion: updatePlanDto.id_usuario_actualizacion,
              fecha_actualizacion: new Date(),
            },
          });

          // Eliminar los porcentajes existentes
          await tx.planes_porcentajes_repartir.deleteMany({
            where: { id_plan: id },
          });

          // Crear los nuevos porcentajes
          for (const pr of porcentajesRepartir) {
            await tx.planes_porcentajes_repartir.create({
              data: {
                id_plan: id,
                id_tipo: pr.id_tipo,
                porcentaje_primera_venta: pr.porcentaje_primera_venta,
                porcentaje_venta_recurrente: pr.porcentaje_venta_recurrente,
              },
            });
          }

          return planUpdated;
        });
        
        return planActualizado;
      } catch (error) {
        throw error;
      }
    } else {
      // Si no hay porcentajes_repartir, solo actualizar los campos básicos
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
  }

  async getPlanById(id: number) {
    try {
      const plansql = `SELECT
            p.id,
            p.nombre,
            p.descripcion,
            p.precio,
            p.precio_oferta,
            p.precio_sin_iva,
            p.renovacion_plan,
            p.renovacion_valor,
            p.tipo_iva,
            COALESCE(
              json_agg(
                json_build_object(
                  'id', ppr.id,
                  'id_tipo', ppr.id_tipo,
                  'tipo', ptr.descripcion,
                  'porcentaje_primera_venta', ppr.porcentaje_primera_venta,
                  'porcentaje_venta_recurrente', ppr.porcentaje_venta_recurrente
                )
              ) FILTER (WHERE ppr.id IS NOT NULL),
              '[]'::json
            ) AS porcentajes_reparto
          FROM planes p
          LEFT JOIN planes_porcentajes_repartir ppr
            ON ppr.id_plan = p.id
            AND ppr.activo = true
          LEFT JOIN planes_tipo_repartir ptr
            ON ptr.id = ppr.id_tipo
            AND ptr.activo = true
          WHERE p.activo = true and p.id = $1
          GROUP BY
            p.id,
            p.nombre,
            p.descripcion,
            p.precio,
            p.precio_oferta,
            p.precio_sin_iva,
            p.renovacion_plan,
            p.renovacion_valor,
            p.tipo_iva;
          `

      const planResult = await this.databasePromiseService.result(plansql, [id]);
      if (planResult.rowCount === 0) {
        throw new NotFoundException('Plan no encontrado');
      }

      return planResult.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async deletePlan(id: number, dataEliminar: DeletePlanDto) {
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
        ) AS PLAN_EXISTE`;
      const planEliminarUsado = (await this.databasePromiseService.result(
        sqlPlanYaUsado,
        [id],
      )) as { rows: { plan_existe: boolean }[] };
      if (planEliminarUsado.rows[0].plan_existe) {
        throw new BadRequestException(
          'No se puede eliminar el plan porque ya está asociado a una suscripción activa.',
        );
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
