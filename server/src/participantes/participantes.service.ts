import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateParticipanteDto } from './dto/create-participante.dto';
import { UpdateParticipanteDto } from './dto/update-participante.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { compras_participantes } from '@prisma/client';
import { DatabaseService } from '@/database/database.service';
import { RepartirParticipantesDto } from './dto/repartir-participantes';
import { redondearDecimales } from '@/utils/funciones';
interface Ganancia {
  observacion?: string;
  id_moneda: number;
  id_factura: number | null;
  id_usuario: number | null;
  monto: number;
  tipo_ganancia: number; // 1=venta plan
  tipo_participante: number; // 1=participante, 2=vendedor, 3=empresa
}

@Injectable()
export class ParticipantesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dbService: DatabaseService,
  ) {}
  async create(createParticipanteDto: CreateParticipanteDto) {
    try {
      // verificar si ya es un inversor
      const esInversor = await this.prisma.usuarios_grupos.findFirst({
        where: {
          id_usuario: createParticipanteDto.id_usuario,
          id_grupo: 4,
        },
      });

      const meta_informacion =
        await this.prisma.participacion_empresa.findFirst({
          where: {
            id: 1,
          },
        });

      if (!esInversor) {
        throw new BadRequestException('El usuario no es un participante');
      }

      if (!meta_informacion) {
        throw new BadRequestException('No se encontró información de meta');
      }

      if (!meta_informacion.saldo_participacion) {
        throw new BadRequestException(
          'No hay saldo de participación disponible',
        );
      }

      if (
        Number(meta_informacion.saldo_participacion) <
        createParticipanteDto.monto_meta
      ) {
        throw new BadRequestException(
          'El monto solicitado supera el saldo de participación',
        );
      }

      const participacion = await this.prisma.$transaction(async (tx) => {
        // verificar si ya tiene alguna participacion
        let participacion_cabecera: compras_participantes | null = null;
        const participante = await tx.compras_participantes.findFirst({
          include: {
            detalles_participacion: {
              where: {
                estado: 1,
                activo: true,
              },
            },
          },
          where: {
            id_usuario: createParticipanteDto.id_usuario,
            activo: true,
          },
        });

        if (!participante) {
          const participacion_cabecera_creada =
            await tx.compras_participantes.create({
              data: {
                id_usuario: createParticipanteDto.id_usuario,
              },
            });
          participacion_cabecera = participacion_cabecera_creada;
        } else {
          participacion_cabecera = participante;
        }

        // realizar calculos para la bolsa

        const saldo_meta =
          Number(meta_informacion.saldo_participacion) -
          createParticipanteDto.monto_meta;
        const total_meta_vendida =
          (Number(meta_informacion.total_vendido) || 0) +
          createParticipanteDto.monto_meta;
        // la cantidad de meta que compraste
        const total_meta_comprada =
          createParticipanteDto.monto_meta * createParticipanteDto.precio_meta;
        // la cantidad de meta que va tener el usuario
        const total_meta_usuario = participacion_cabecera
          ? Number(participacion_cabecera.total_meta) +
            createParticipanteDto.monto_meta
          : createParticipanteDto.monto_meta;
        // la cantidad de participacion del usuario
        const porcentaje_participacion =
          (total_meta_usuario * 100) /
          Number(meta_informacion.total_participacion);

        // registrar detalles de la participación
        await tx.compras_detalles_participantes.create({
          data: {
            id_compras_participantes: participacion_cabecera.id,
            precio: createParticipanteDto.precio_meta,
            monto_meta: createParticipanteDto.monto_meta,
            total_venta: total_meta_comprada,
            id_moneda: 1, // agregar desde participacion_empresa
          },
        });

        // actualizar cabecera de participación
        await tx.compras_participantes.update({
          where: {
            id: participacion_cabecera.id,
          },
          data: {
            total_meta: total_meta_usuario,
            porcentaje_participacion: porcentaje_participacion,
            fecha_actualizacion: new Date(),
            id_usuario_actualizacion: createParticipanteDto.id_usuario_creacion,
            id_usuario_creacion: createParticipanteDto.id_usuario_creacion,
          },
        });

        // actualizar info de la participación
        await tx.participacion_empresa.update({
          where: {
            id: 1,
          },
          data: {
            total_vendido: total_meta_vendida,
            saldo_participacion: saldo_meta,
            id_usuario_actualizacion: createParticipanteDto.id_usuario_creacion,
            fecha_actualizacion: new Date(),
          },
        });

        return participacion_cabecera;
      });

      return participacion;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Registra la distribución de ganancias de una venta de plan/suscripción.
   *
   * Reglas de negocio (sin cambios):
   * - Solo procesa si la factura existe, está activa y con estado = 2 (pagado).
   * - Si existe vendedor en la suscripción, calcula su ganancia según sea primera venta o recurrente.
   * - Los participantes (grupo id = 4 y usuarios activos) reciben un monto proporcional a su porcentaje de participación.
   * - La empresa recibe un porcentaje según sea primera venta o recurrente.
   * - Todos los montos se calculan sobre el total gravado 10% (sin IVA) y se redondean a 2 decimales.
   *
   * @param id_factura  ID de la factura (debe existir, estar activa y pagada: estado = 2).
   * @param options     { primera_venta?: boolean }  Si es true, usa porcentajes de primera venta; si es false, porcentajes recurrentes.
   * @throws BadRequestException si la factura no existe/no está pagada o si no hay configuración de participación.
   */
  async repartirGananciasDeVentaPlan(
    id_factura: number,
    options: RepartirParticipantesDto,
  ) {
    // Helper local para redondeo consistente a 2 decimales
    const toTwo = (n: number) => Number(n.toFixed(2));

    try {
      const { primera_venta = false } = options;

      const ganancias: Ganancia[] = [];
      const gananciasForUsuario: any = {};

      await this.prisma.$transaction(async (prisma) => {
        // 1) Buscar la factura pagada + su suscripción (incluye vendedor)
        const factura = await prisma.factura_suscripciones.findFirst({
          where: { id: id_factura, activo: true, estado: 2 }, // estado 2 = pagado
          include: {
            suscripciones: { select: { id: true, id_vendedor: true } },
          },
        });

        if (!factura) {
          throw new BadRequestException(
            'No se encontró la factura o no está pagada',
          );
        }

        // 2) Suscripción asociada a la factura
        const suscripcionFactura = factura?.suscripciones;

        // 3) Vendedor y Participantes (grupo 4 = participantes) con usuarios activos
        const vendedor = suscripcionFactura?.id_vendedor ?? null;

        const participantes = await prisma.usuarios_grupos.findMany({
          where: { id_grupo: 4, usuarios: { activo: true } },
          include: { usuarios: true },
        });

        // 4) Configuración de participación (porcentajes y parámetros globales)
        const infoMeta = await prisma.participacion_empresa.findFirst();
        if (!infoMeta) {
          throw new BadRequestException(
            'Información de participación no configurada',
          );
        }

        const idMonedaAsignarComisiones = 1; // Asignar la moneda correspondiente, por ejemplo, 1 para USD
        const tipoGanacia = 1; // 1=venta plan

        // Base de cálculo: total gravado 10% (monto sin IVA)
        let monto_factura_sin_iva = Number(factura.total_grav_10) || 0;
        monto_factura_sin_iva = toTwo(monto_factura_sin_iva);

        // ------------------------------------------------------------
        // Ganancia del VENDEDOR (si existe)
        // ------------------------------------------------------------
        if (vendedor) {
          let montoVendedor = 0;

          if (primera_venta) {
            const pct = Number(infoMeta.porcentaje_vendedores_primera_venta);
            montoVendedor = (pct / 100) * monto_factura_sin_iva;
          } else {
            const pct = Number(infoMeta.porcentaje_vendedores_recurrente);
            montoVendedor = (pct / 100) * monto_factura_sin_iva;
          }

          montoVendedor = toTwo(montoVendedor);

          // Agregar a la lista de ganancias a registrar
          ganancias.push({
            id_moneda: idMonedaAsignarComisiones,
            tipo_ganancia: tipoGanacia, // 1=venta plan
            id_factura: factura.id,
            id_usuario: vendedor,
            monto: montoVendedor,
            tipo_participante: 2, // 2 = vendedor
          });

          gananciasForUsuario[vendedor] = montoVendedor;

          // TODO: Persistir el registro de ganancia del vendedor si corresponde.
          // Ejemplo (referencial): await prisma.ganancias_vendedor.create({ data: { id_vendedor: vendedor, id_factura, monto: montoVendedor, ... } });
        }

        // ------------------------------------------------------------
        // Ganancias de PARTICIPANTES
        // ------------------------------------------------------------
        let montoParticipantes = 0;
        let montoRepartirse = 0;
        let montoDistribuidoParticipantes = 0;
        let gananciaEmpresa = 0;
        if (participantes.length > 0) {

          // Determinar el monto total a repartirse entre todos los participantes
          if (primera_venta) {
            const pct = Number(infoMeta.porcentaje_participantes_primera_venta);
            montoRepartirse = (pct / 100) * monto_factura_sin_iva;
          } else {
            const pct = Number(infoMeta.porcentaje_participantes_recurrente);
            montoRepartirse = (pct / 100) * monto_factura_sin_iva;
          }
          montoRepartirse = toTwo(montoRepartirse);
          montoParticipantes = montoRepartirse;
          // Distribución proporcional según "porcentaje_participacion" por usuario
          await Promise.all(
            participantes.map(async (participante) => {
              // Consulta del porcentaje de participación del usuario (debe venir ya en %)
              const dataParticipacion = await this.dbService.query(
                `
              select com.porcentaje_participacion
              from compras_participantes com
              left join usuarios us on com.id_usuario = us.id and us.activo = true
              where com.id_usuario = $1
            `,
                [participante.id_usuario],
              );

              if (dataParticipacion.rowCount === 0) return; // si no tiene participación, se omite

              const dataParticipante = dataParticipacion.rows[0];
              if (!dataParticipante) return; // seguridad adicional

              const porcentajeParticipante = Number(
                dataParticipante.porcentaje_participacion,
              );
              let gananciaParticipante =
                (montoRepartirse * porcentajeParticipante) / 100;

              gananciaParticipante = toTwo(gananciaParticipante);


              // Agregar a la lista de ganancias a registrar
              ganancias.push({
                id_moneda: idMonedaAsignarComisiones,
                tipo_ganancia: tipoGanacia, // 1=venta plan
                id_factura: factura.id,
                id_usuario: participante.id_usuario,
                monto: gananciaParticipante,
                tipo_participante: 1, // 1 = participante
              });

              // sumar a la ganancia del usuario
              if (gananciasForUsuario[participante.id_usuario]) {
                gananciasForUsuario[participante.id_usuario] +=
                  gananciaParticipante;
              } else {
                gananciasForUsuario[participante.id_usuario] =
                  gananciaParticipante;
              }

              // Sumar al monto ya distribuido entre participantes
              montoDistribuidoParticipantes += gananciaParticipante;

              // TODO: Persistir el registro de ganancia del participante si corresponde.
            }),
          );

          // Ajuste por redondeo: si hay diferencia, se asigna a la ganancia de la empresa
          const diferencia = toTwo(montoRepartirse - montoDistribuidoParticipantes);
          if (diferencia > 0) {
            gananciaEmpresa += diferencia;
            ganancias.push({
              id_moneda: idMonedaAsignarComisiones,
              tipo_ganancia: tipoGanacia, // 1=venta plan
              id_factura: factura.id,
              id_usuario: null, // 0 o null para representar a la empresa
              monto: gananciaEmpresa,
              tipo_participante: 4, // 4 = Ganancia Empresa
            });
          }
        }

        // ------------------------------------------------------------
        // Ganancia de la EMPRESA
        // ------------------------------------------------------------
        let montoEmpresa = 0;
        if (primera_venta) {
          const pct = Number(infoMeta.porcentaje_empresa_primera_venta);
          montoEmpresa = (pct / 100) * monto_factura_sin_iva;
        } else {
          const pct = Number(infoMeta.porcentaje_empresa_recurrente);
          montoEmpresa = (pct / 100) * monto_factura_sin_iva;
        }

        if (!vendedor) {
          if (primera_venta) {
            montoEmpresa += toTwo(
              (Number(infoMeta.porcentaje_vendedores_primera_venta || 0) /
                100) *
                monto_factura_sin_iva,
            );
          } else {
            montoEmpresa += toTwo(
              (Number(infoMeta.porcentaje_vendedores_recurrente || 0) / 100) *
                monto_factura_sin_iva,
            );
          }
        }

        montoEmpresa = toTwo(montoEmpresa);
        // Agregar a la lista de ganancias a registrar
        ganancias.push({
          id_moneda: idMonedaAsignarComisiones,
          tipo_ganancia: tipoGanacia, // 1=venta plan
          id_factura: factura.id,
          id_usuario: null, // 0 o null para representar a la empresa
          monto: montoEmpresa,
          tipo_participante: 3, // 3 = empresa
        });
        
        //1 - TODO: Persistir el registro de ganancia de los participantes si corresponde.
        let participaciones_actual = Number(infoMeta.total_participacion_global) + Number(montoParticipantes);
        let precio_meta = Number(participaciones_actual) / Number(infoMeta.total_participacion);

        console.log('gananciasRepartir', ganancias);
        console.log('ganancias por cada usuario', gananciasForUsuario);
        console.log("Total wallet master",redondearDecimales(participaciones_actual))
        console.log("Precio Meta:",redondearDecimales(precio_meta,6))
        console.log("Cantidad repartir entre participantes:",redondearDecimales(montoParticipantes))
        console.log("Total a repartido entre participantes:",redondearDecimales(montoDistribuidoParticipantes))
        console.log("Total Ganancia empresa:",redondearDecimales(gananciaEmpresa))


        // 1- registrar las ganacias por la venta de un plan
        await prisma.ganancias_futuras.createMany({
          data: ganancias.map((g) => ({
            id_moneda: g.id_moneda,
            tipo_ganancia: g.tipo_ganancia, // 1=venta plan
            id_factura: g.id_factura,
            id_usuario: g.id_usuario,
            monto: g.monto,
            tipo_participante: g.tipo_participante,
          })),
        });
        



        // 2- registrar ganancias entre usuarios cada usuario (vendedor, participante)
        for (const [idStr, monto] of Object.entries(gananciasForUsuario)) {
          const id_usuario = Number(idStr);
          const montoAsignar = monto as number;
          await prisma.usuarios.update({
            where: { id: id_usuario },
            data: { saldo: { increment: montoAsignar } },
          });
        }


        // 3- registrar ganancias globales (Wallet Mater)
        await prisma.participacion_empresa.update({
          where: { id: 1 },
          data: {
            total_participacion_global: participaciones_actual,
          },
        });

        // 4- Actualizar precio META
        await prisma.participacion_empresa.update({
          where: { id: 1 },
          data: {
            precio_meta: redondearDecimales(precio_meta,6),
          },
        });
      });
    } catch (error) {
      throw error;
    }
  }
}
