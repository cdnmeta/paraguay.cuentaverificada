import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateParticipanteDto } from './dto/create-participante.dto';
import { UpdateParticipanteDto } from './dto/update-participante.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { compras_participantes, factura_suscripciones, Prisma } from '@prisma/client';
import { DatabaseService } from '@/database/database.service';
import { OpcionesRepartirParticipantesDto } from './dto/repartir-participantes';
import { redondearDecimales, truncateNumber } from '@/utils/funciones';
import { DatabasePromiseService } from '@/database/database-promise.service';
import {
  consultaParticipacionByUsuario,
  consultaparticipantes,
} from './sql/consultas';
import { PlanesTipoRepartir } from '@/planes/types/planes-tipo-repartir';
interface Ganancia {
  observacion?: string;
  id_moneda: number;
  id_factura: number | null;
  id_usuario: number | null;
  monto: number;
  tipo_ganancia: number; // 1=venta plan
  tipo_participante: number; // 1=participante, 2=vendedor, 3=empresa
}


type ReglaRol = {
  porcentaje_primera_venta: number;
  porcentaje_venta_recurrente: number;
};

type ParticipanteInput = {
  id_usuario: number;
  porcentaje_participacion: number; // % del pool
};

type GananciaPorUsuario = {
  id_usuario: number | null; // null = empresa
  monto: number;
  tipo_participante: 1 | 2 | 3 | 4; // 1=participante, 2=vendedor, 3=empresa, 4=embajador
};

type ResultadoCalculoVenta = {
  montoVendedor: number;
  montoEmbajador: number;
  montoParticipantes: number;
  montoDistribuidoParticipantes: number;
  montoEmpresa: number;
  ganancias: GananciaPorUsuario[];
};

function calcularMontoRol(
  regla: ReglaRol | undefined,
  montoBase: number,
  primeraVenta: boolean,
  cantNumerosTruncar: number,
): number {
  if (!regla) return 0;
  const pct = primeraVenta
    ? Number(regla.porcentaje_primera_venta || 0)
    : Number(regla.porcentaje_venta_recurrente || 0);

  if (!pct) return 0;

  const bruto = (pct / 100) * montoBase;
  return truncateNumber(bruto, cantNumerosTruncar);
}

function calcularRepartoVentaPlan(params: {
  montoBaseSinIva: number;
  primeraVenta: boolean;
  cantNumerosTruncar: number;
  reglaParticipante: ReglaRol;
  reglaVendedor?: ReglaRol;
  reglaEmbajador?: ReglaRol;
  reglaEmpresa?: ReglaRol;
  participantes: ParticipanteInput[];
  idVendedor?: number | null;
  idEmbajador?: number | null;
}): ResultadoCalculoVenta {
  const {
    montoBaseSinIva,
    primeraVenta,
    cantNumerosTruncar,
    reglaParticipante,
    reglaVendedor,
    reglaEmbajador,
    reglaEmpresa,
    participantes,
    idVendedor,
    idEmbajador,
  } = params;

  const ganancias: GananciaPorUsuario[] = [];
  let montoVendedor = 0;
  let montoEmbajador = 0;

  // 1) VENDEDOR
  if (idVendedor && reglaVendedor) {
    montoVendedor = calcularMontoRol(
      reglaVendedor,
      montoBaseSinIva,
      primeraVenta,
      cantNumerosTruncar,
    );

    if (montoVendedor > 0) {
      ganancias.push({
        id_usuario: idVendedor,
        monto: montoVendedor,
        tipo_participante: 2,
      });
    }
  }

  // 2) EMBAJADOR
  if (idEmbajador && reglaEmbajador) {
    montoEmbajador = calcularMontoRol(
      reglaEmbajador,
      montoBaseSinIva,
      primeraVenta,
      cantNumerosTruncar,
    );

    if (montoEmbajador > 0) {
      ganancias.push({
        id_usuario: idEmbajador,
        monto: montoEmbajador,
        tipo_participante: 4,
      });
    }
  }

  // 3) PARTICIPANTES (pool)
  let montoRepartirseParticipantes = calcularMontoRol(
    reglaParticipante,
    montoBaseSinIva,
    primeraVenta,
    2, // aquí suele bastar 2 decimales
  );

  let montoDistribuidoEntreParticipantes = 0;

  for (const p of participantes) {
    const porcentajeParticipante = Number(p.porcentaje_participacion || 0);
    if (!porcentajeParticipante) continue;

    let gananciaParticipante =
      (montoRepartirseParticipantes * porcentajeParticipante) / 100;

    gananciaParticipante = truncateNumber(
      gananciaParticipante,
      cantNumerosTruncar,
    );

    if (gananciaParticipante <= 0) continue;

    ganancias.push({
      id_usuario: p.id_usuario,
      monto: gananciaParticipante,
      tipo_participante: 1,
    });

    montoDistribuidoEntreParticipantes += gananciaParticipante;
  }

  // Diferencia por redondeo (se va a la empresa)
  const diferenciaPool = truncateNumber(
    montoRepartirseParticipantes - montoDistribuidoEntreParticipantes,
    cantNumerosTruncar,
  );

  // 4) EMPRESA – parte porcentual explícita
  let montoEmpresaPorcentaje = calcularMontoRol(
    reglaEmpresa,
    montoBaseSinIva,
    primeraVenta,
    cantNumerosTruncar,
  );

  // 5) EMPRESA – sobrante de toda la operación

  // si no se carga el porcentaje de empresa, se le asigna todo el sobrante
  if(montoEmpresaPorcentaje <= 0) {
    montoEmpresaPorcentaje = truncateNumber(
      montoBaseSinIva - montoVendedor - montoEmbajador - montoRepartirseParticipantes,
      cantNumerosTruncar,
    );
  }

  let montoEmpresa = (diferenciaPool > 0 ? diferenciaPool : 0) + montoEmpresaPorcentaje

  if (montoEmpresa > 0) {
    ganancias.push({
      id_usuario: null, // empresa
      monto: montoEmpresa,
      tipo_participante: 3,
    });
  }

  return {
    montoVendedor,
    montoEmbajador,
    montoParticipantes: montoRepartirseParticipantes,
    montoDistribuidoParticipantes: montoDistribuidoEntreParticipantes,
    montoEmpresa,
    ganancias,
  };
}

function calcularNuevaMeta(params: {
  infoMeta: {
    total_participacion_global: number | string | null;
    total_participacion: number | string | null;
  };
  montoParticipantesNuevo: number; // lo que entra a la bolsa en esta venta
}) {
  const totalGlobalAnterior = Number(params.infoMeta.total_participacion_global || 0);
  const totalParticipacion = Number(params.infoMeta.total_participacion || 1);

  const totalGlobalNuevo = totalGlobalAnterior + Number(params.montoParticipantesNuevo || 0);
  const precioMeta = redondearDecimales(
    totalGlobalNuevo / totalParticipacion,
    6,
  );

  return {
    total_participacion_global: totalGlobalNuevo,
    precio_meta: precioMeta,
  };
}


@Injectable()
export class ParticipantesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dbService: DatabaseService,
    private readonly dbPromiseService: DatabasePromiseService,
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
  options: OpcionesRepartirParticipantesDto,
  tx?: Prisma.TransactionClient,
) {
  const { primera_venta = false } = options;
  const cant_numeros_truncar = 4;
  const idMonedaAsignarComisiones = 1;
  const tipoGanacia = 1;

  await this.prisma.runInTransaction(tx, async (client) => {
    const factura = await client.factura_suscripciones.findFirst({
      where: { id: id_factura, activo: true, estado: 2 },
      include: {
        suscripciones: { select: { id: true, id_vendedor: true, id_plan: true,id_embajador: true } },
        usuarios: { select: { id: true, id_embajador: true } },
      },
    });
    if (!factura) throw new BadRequestException('Factura no encontrada o no pagada');

    const suscripcion = factura.suscripciones;
    const planVenta = await client.planes.findFirst({
      where: { id: suscripcion.id_plan, activo: true },
    });
    if (!planVenta) throw new BadRequestException('Plan no encontrado');

    const planPorcentajes = await client.planes_porcentajes_repartir.findMany({
      where: { id_plan: planVenta.id, activo: true },
    });
    if (!planPorcentajes.length) {
      throw new BadRequestException('Plan sin porcentajes de reparto configurados');
    }

    // mapear reglas
    const reglaParticipante = planPorcentajes.find(pp => pp.id_tipo === PlanesTipoRepartir.PARTICIPANTES)!;
    const reglaEmpresa = planPorcentajes.find(pp => pp.id_tipo === PlanesTipoRepartir.EMPRESA);
    const reglaVendedor = planPorcentajes.find(pp => pp.id_tipo === PlanesTipoRepartir.VENDEDOR);
    const reglaEmbajador = planPorcentajes.find(pp => pp.id_tipo === PlanesTipoRepartir.EMBAJADOR);

    // participantes del grupo 4
    const participantesGrupo = await client.usuarios_grupos.findMany({
      where: { id_grupo: 4, usuarios: { activo: true } },
      include: { usuarios: true },
    });

    // traer % de participación de cada uno (puedes hacerlo en un solo query si quieres optimizar)
    const participantesInput: ParticipanteInput[] = [];
    for (const p of participantesGrupo) {
      const dataParticipacion = await this.dbService.query(
        `
          select porcentaje_participacion
          from compras_participantes
          where id_usuario = $1
        `,
        [p.id_usuario],
      );
      if (!dataParticipacion.rowCount) continue;
      participantesInput.push({
        id_usuario: p.id_usuario,
        porcentaje_participacion: Number(dataParticipacion.rows[0].porcentaje_participacion),
      });
    }

    const infoMeta = await client.participacion_empresa.findFirst();
    if (!infoMeta) throw new BadRequestException('Meta no configurada');

    let monto_factura_sin_iva = Number(factura.total_grav_10) || 0;
    monto_factura_sin_iva = Number(monto_factura_sin_iva.toFixed(2));

    const resultado = calcularRepartoVentaPlan({
      montoBaseSinIva: monto_factura_sin_iva,
      primeraVenta: primera_venta,
      cantNumerosTruncar: cant_numeros_truncar,
      reglaParticipante: {
        porcentaje_primera_venta: Number(reglaParticipante.porcentaje_primera_venta),
        porcentaje_venta_recurrente: Number(reglaParticipante.porcentaje_venta_recurrente),
      },
      reglaVendedor: reglaVendedor && {
        porcentaje_primera_venta: Number(reglaVendedor.porcentaje_primera_venta),
        porcentaje_venta_recurrente: Number(reglaVendedor.porcentaje_venta_recurrente),
      },
      reglaEmbajador: reglaEmbajador && {
        porcentaje_primera_venta: Number(reglaEmbajador.porcentaje_primera_venta),
        porcentaje_venta_recurrente: Number(reglaEmbajador.porcentaje_venta_recurrente),
      },
      reglaEmpresa: reglaEmpresa && {
        porcentaje_primera_venta: Number(reglaEmpresa.porcentaje_primera_venta),
        porcentaje_venta_recurrente: Number(reglaEmpresa.porcentaje_venta_recurrente),
      },
      participantes: participantesInput,
      idVendedor: suscripcion.id_vendedor ?? undefined,
      idEmbajador: suscripcion?.id_embajador ?? null,
    });

    // aquí podés transformar resultado.ganancias en tu array `ganancias`
    const ganancias = resultado.ganancias.map((g) => ({
      id_moneda: idMonedaAsignarComisiones,
      tipo_ganancia: tipoGanacia,
      id_factura: factura.id,
      id_usuario: g.id_usuario,
      monto: g.monto,
      tipo_participante: g.tipo_participante,
    }));


    const metaActualizada = calcularNuevaMeta({
      infoMeta:{
        total_participacion_global: Number(infoMeta.total_participacion_global) || 0,
        total_participacion: Number(infoMeta.total_participacion) || 0,
      },
      montoParticipantesNuevo: resultado.montoParticipantes,
    });

    // LOGS para debug
    console.log('Reparto de venta de plan/suscripción:');
    console.log(`- Factura ID: ${factura.id}`);
    console.log(`- Monto base (sin IVA): ${monto_factura_sin_iva}`);
    console.log(`- Primera venta: ${primera_venta}`);
    console.log(`- Monto a Vendedor: ${resultado.montoVendedor}`);
    console.log(`- Monto a Embajador: ${resultado.montoEmbajador}`);
    console.log(`- Monto a Participantes: ${resultado.montoParticipantes}`);
    console.log(`- Monto a Empresa: ${resultado.montoEmpresa}`);
    console.log('- Detalle de ganancias por usuario:',ganancias);
    console.log('- Nueva meta calculada:',metaActualizada);




    // 1- registrar ganancias
    await client.ganancias_futuras.createMany({ data: ganancias });

    // 2- sumar a saldos de usuarios (menos empresa, que va a bolsa)
    for (const g of ganancias) {
      if (!g.id_usuario) continue; // empresa
      await client.usuarios.update({
        where: { id: g.id_usuario },
        data: { saldo: { increment: g.monto } },
      });
    }

    // 3- actualizar META / bolsa con lo que fue a participantes

    await client.participacion_empresa.update({
      where: { id: infoMeta.id },
      data: {
        total_participacion_global: metaActualizada.total_participacion_global,
        precio_meta: metaActualizada.precio_meta,
      },
    });

    // 4- acumular ganancia de empresa
    if (resultado.montoEmpresa > 0) {
      const gananciaAcumulada =
        Number(infoMeta.ganancia_acumulada || 0) + resultado.montoEmpresa;

      await client.participacion_empresa.update({
        where: { id: infoMeta.id },
        data: {
          ganancia_acumulada: redondearDecimales(gananciaAcumulada),
        },
      });
    }
  });
}


  async getParticipacionByUsuario(id_usuario: number) {
    try {
      const result = await this.dbPromiseService.result(
        consultaParticipacionByUsuario,
        [id_usuario],
      );
      if (result.rowCount === 0) {
        throw new NotFoundException(
          'No se encontraron participaciones para el usuario',
        );
      }
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async getParticipantesQueryMany(query: any) {
    try {
      const inversionistas = await this.dbPromiseService.result(
        consultaparticipantes,
      );
      return inversionistas.rows;
    } catch (error) {
      throw error;
    }
  }
}
