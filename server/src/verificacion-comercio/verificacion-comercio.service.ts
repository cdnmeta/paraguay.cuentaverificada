import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  RechazarComercioDto,
  RechazoSolicitudComercioDto,
  SolicitudVerificacionRegistrarComercioDto,
  UpdateSeguimientoAprobacionComercioDto,
  UpdateSolicitudComercioDto,
  UpdateVerificarInformacionDto,
  VerificarComercioDto,
  VerificarInformacionDto,
} from './dto/solicitud-verficacion.dto';
import {
  calcularFechaVencimiento,
  crearNombreArchivoDesdeMulterFile,
  crearSlug,
  getIvasFacturaTotales,
} from '@/utils/funciones';
import { FirebaseService } from '@/firebase/firebase.service';
import { PrismaService } from '@/prisma/prisma.service';
import * as path from 'path';
import { DatabaseService } from '@/database/database.service';
import { FIREBASE_STORAGE_FOLDERS } from '@/firebase/constantsFirebase';
import { sqlLisatdoComerciosAprobar } from './sql/consultas';
import { QueryComercios } from './types/query-comercios';
import { DatabasePromiseService } from '@/database/database-promise.service';
import { info } from 'console';
import { ParticipantesService } from '@/participantes/participantes.service';
import { OpcionesRepartirParticipantesDto } from '@/participantes/dto/repartir-participantes';

interface FileSolicitudVerificacion {
  comprobantePago: Express.Multer.File;
}

interface DataAprobacion {
  id_usuario: number;
  fecha_aprobacion: Date;
}

interface FilesVerificacionComercio {
  foto_interior: Express.Multer.File;
  foto_exterior: Express.Multer.File;
  imagen_factura_servicio: Express.Multer.File;
}

@Injectable()
export class VerificacionComercioService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly prismaService: PrismaService,
    private readonly dbService: DatabaseService,
    private readonly dbPromiseService: DatabasePromiseService,
    private readonly participantesService: ParticipantesService,
  ) {}
  // Registro de la solicitud de la verificacion
  async solicitarVerificacion(
    createComercioDto: SolicitudVerificacionRegistrarComercioDto,
    files: FileSolicitudVerificacion,
  ) {
    try {
      // Aquí puedes agregar la lógica para solicitar la verificación del comercio
      const { comprobantePago } = files;

      // Aquí puedes realizar las operaciones de base de datos necesarias

      // Verificar si el comercio ya existe por RUC
      const comercioExistente = await this.dbService.query(
        `SELECT * FROM comercio WHERE ruc = $1 AND activo = true`,
        [createComercioDto.ruc.trim()],
      );

      if (comercioExistente?.rowCount && comercioExistente.rowCount > 0) {
        throw new BadRequestException(
          'Ya existe un comercio registrado con este RUC',
        );
      }

      // almacenar el comprobante de pago
      let urlPathComprobante: string | null = null;

      // Aquí puedes agregar la lógica para almacenar el comprobante de pago
      const nombreArchivoComprobante =
        crearNombreArchivoDesdeMulterFile(comprobantePago);
      const rutaArchivo = `${FIREBASE_STORAGE_FOLDERS.comprobantes}/${nombreArchivoComprobante}`;
      urlPathComprobante = await this.firebaseService.subirArchivoPrivado(
        comprobantePago.buffer,
        rutaArchivo,
        comprobantePago.mimetype,
      );

      // crear transacion de creacion de comercio y generacion de su suscripcion
      const comercio_creado = await this.prismaService.$transaction(
        async (prisma) => {
          let id_vendedor: number | null = null;

          // Buscar el vendedor por código
          if (createComercioDto.codigoVendedor) {
            const vendedor = await prisma.usuarios.findFirst({
              where: {
                codigo_vendedor: createComercioDto.codigoVendedor,
                activo: true,
              },
            });
            if (!vendedor) {
              throw new BadRequestException(
                'El código de vendedor no es válido',
              );
            }
            id_vendedor = vendedor.id;
          }

          let slugComercio = crearSlug(createComercioDto.razonSocial);

          /// consultar si el slug existe
          const slugExistente = await prisma.comercio.findFirst({
            where: {
              slug: slugComercio,
            },
          });

          if (slugExistente) {
            slugComercio = crearSlug(createComercioDto.razonSocial,{
              agregarDigito: true,
            });
          }

          const fechaSolicitud = new Date();
          const comercioCreado = await prisma.comercio.create({
            data: {
              razon_social: createComercioDto.razonSocial,
              codigo_pais: createComercioDto.codigoPais,
              ruc: createComercioDto.ruc,
              telefono: createComercioDto.telefono,
              dial_code: createComercioDto.prefijoTelefono,
              id_usuario: createComercioDto.id_usuario,
              id_usuario_creacion: createComercioDto.id_usuario_creacion,
              slug: slugComercio,
              url_comprobante_pago: urlPathComprobante,
              estado: 1,
            },
          });

          // Agregar al seguimiento de verificacion
          await prisma.seguimiento_verificacion.create({
            data: {
              id_comercio: comercioCreado.id,
              id_estado: 1,
              fecha_creacion: fechaSolicitud,
              id_usuario: createComercioDto.id_usuario,
            },
          });

          // crear una suscripcion del plan de verificacion y primera factura

          // obtener cual es el id plan de la verificacion
          const planVerificacionSql = `select id, precio, renovacion_plan,renovacion_valor,tipo_iva from planes where id = (select id_plan_verificacion from empresa_config )`;

          const planVerificacion =
            await this.dbService.query(planVerificacionSql);

          if (planVerificacion.rowCount === 0) {
            throw new BadRequestException(
              'El plan de verificación no está disponible',
            );
          }

          const planVerificacionData = planVerificacion.rows[0];

          // generar la fecha de vencimiento

          // Crear la 1era suscripción y vincular a una factura pendiente
          const suscripcionCreada = await prisma.suscripciones.create({
            data: {
              id_comercio: comercioCreado.id,
              fecha_creacion: fechaSolicitud,
              id_vendedor: id_vendedor,
              id_plan: planVerificacionData.id, // ID del plan de verificación
              monto: planVerificacionData.precio,
              estado: 1, // pendiente
              activo: true,
            },
          });

          // crear factura

          const monedaBase = await prisma.empresa_config.findFirst({
            select: { id_moneda_base: true },
            where: { id: 1 },
          });

          const totalesFactura = getIvasFacturaTotales(
            planVerificacionData.precio,
            planVerificacionData.tipo_iva,
          );
          await prisma.factura_suscripciones.create({
            data: {
              monto: planVerificacionData.precio,
              estado: 1, // pendiente
              id_suscripcion: suscripcionCreada.id,
              id_moneda: monedaBase?.id_moneda_base,
              total_factura: totalesFactura.total_factura, 
              total_grav_5: totalesFactura.total_grav_5,
              total_grav_10: totalesFactura.total_grav_10,
              total_iva_5: totalesFactura.total_iva_5,
              total_iva_10: totalesFactura.total_iva_10,
            },
          });

          return comercioCreado;
        },
      );

      return comercio_creado;
    } catch (error) {
      console.error('Error al solicitar verificación del comercio:', error);
      throw error;
    }
  }

  // Rechazar solicitud de verificación del comercio
  async rechazarSolicitud(
    id: number,
    updateSeguimiento: UpdateSeguimientoAprobacionComercioDto,
  ) {
    try {
      const id_estado_rechazo = 5;
      const fecha = new Date();
      await this.prismaService.comercio.update({
        where: { id },
        data: {
          estado: id_estado_rechazo,
          fecha_actualizacion_estado: fecha,
          motivo_rechazo: updateSeguimiento.motivo,
        },
      });
      await this.prismaService.seguimiento_verificacion.create({
        data: {
          id_comercio: id,
          id_estado: id_estado_rechazo,
          observacion: updateSeguimiento.motivo,
          fecha_creacion: fecha,
          id_usuario: updateSeguimiento.id_usuario_seguimiento,
        },
      });
      return { message: 'Solicitud rechazada correctamente' };
    } catch (error) {
      throw error;
    }
  }

  // rechazar Pago de la solicitud de verificación
  async rechazarPagoDeSolicitud(
    rechazoSeguimiento: RechazoSolicitudComercioDto,
  ) {
    try {
      const comercioExistente = await this.prismaService.comercio.findFirst({
        where: { id: rechazoSeguimiento.id_comercio, activo: true },
      });

      if (!comercioExistente) {
        throw new NotFoundException('Comercio no encontrado');
      }

      const id_estado_rechazo = 6; // id del estado de rechazo de pago
      const fecha = new Date();

      await this.prismaService.$transaction(async (prisma) => {
        await prisma.comercio.update({
          where: { id: rechazoSeguimiento.id_comercio },
          data: {
            estado: id_estado_rechazo,
            fecha_actualizacion_estado: fecha,
            motivo_rechazo: rechazoSeguimiento.motivo,
            id_usuario_actualizacion: rechazoSeguimiento.id_usuario_seguimiento,
          },
        });
        await prisma.seguimiento_verificacion.create({
          data: {
            id_comercio: rechazoSeguimiento.id_comercio,
            id_estado: id_estado_rechazo,
            observacion: rechazoSeguimiento.motivo,
            fecha_creacion: fecha,
            id_usuario: rechazoSeguimiento.id_usuario_seguimiento,
          },
        });
      });
      return { message: 'Solicitud rechazada correctamente' };
    } catch (error) {
      throw error;
    }
  }

  async aprobarPagosolicitudVerificacion(
    id: number,
    dataAprobacion: DataAprobacion,
  ) {
    try {
      const comercio = await this.prismaService.comercio.findFirst({
        where: { id },
      });


      if (!comercio) throw new NotFoundException('Comercio no encontrado');

      await this.prismaService.comercio.update({
        where: { id },
        data: { estado: 2 },
      });
      await this.prismaService.seguimiento_verificacion.create({
        data: {
          id_comercio: id,
          id_estado: 2, // Estado de pago aprobado
          fecha_creacion: dataAprobacion.fecha_aprobacion,
          id_usuario: dataAprobacion.id_usuario,
        },
      });

      return { message: 'Solicitud aprobada correctamente' };
    } catch (error) {
      console.error('Error al aprobar solicitud de verificación:', error);
      throw error;
    }
  }

  async updateSolicitudVerificacion(
    id: number,
    data: UpdateSolicitudComercioDto,
    archivos: { comprobantePago?: Express.Multer.File },
  ) {
    try {
      const comercio = await this.prismaService.comercio.findUnique({
        where: { id },
      });

      if (!comercio) throw new NotFoundException('Comercio no encontrado');

      let urlPathComprobante: string | undefined;
      if (archivos.comprobantePago) {
        const nombreArchivoExistente = path.basename(
          comercio?.url_comprobante_pago || '',
        );

        const rutaArchivo = `comprobantes/${nombreArchivoExistente}`;
        urlPathComprobante = await this.firebaseService.subirArchivoPrivado(
          archivos.comprobantePago.buffer,
          rutaArchivo,
          archivos.comprobantePago.mimetype,
        );
      }

      const estado_actual = comercio.estado;
      let estado_asignar = 1;

      // Determinar el nuevo estado cuando el usuario actualiza la solicitud
      switch (estado_actual) {
        case 2: // pago aprobado
          // Si el estado actual es 2, se actualiza a 3 (pendiente verificacion de comercio)
          estado_asignar = 3;
          break;
        case 6: // pago rechazado
          // Si el estado actual es 6, se actualiza a 1 (pendiente verificación de pago)
          estado_asignar = 1;
          break;
      }

      const updatedComercio = await this.prismaService.$transaction(
        async (prisma) => {
          const fecha = new Date();
          const comercioActualizado = await prisma.comercio.update({
            where: { id },
            data: {
              razon_social: data.razonSocial,
              ruc: data.ruc,
              telefono: data.telefono,
              dial_code: data.prefijoTelefono,
              codigo_pais: data.codigoPais,
              url_comprobante_pago: urlPathComprobante,
              estado: estado_asignar,
              fecha_actualizacion_estado: fecha,
              fecha_actualizacion: fecha,
            },
          });

          await prisma.seguimiento_verificacion.create({
            data: {
              id_comercio: id,
              id_estado: estado_asignar,
              observacion: '',
              fecha_creacion: new Date(),
              id_usuario: data.id_usuario_actualizacion,
            },
          });

          return comercioActualizado;
        },
      );

      return updatedComercio;
    } catch (error) {
      console.error('Error al actualizar solicitud de verificación:', error);
      throw error;
    }
  }

  async registrarInfoVerificacion(
    files: FilesVerificacionComercio,
    id_usuario: number,
    data: VerificarInformacionDto,
  ) {
    try {
      const comercio = await this.prismaService.comercio.findFirst({
        where: { id: data.id_comercio, activo: true },
      });

      if (!comercio) throw new NotFoundException('Comercio no encontrado');

      if (comercio.estado !== 2)
        throw new BadRequestException(
          'El comercio no está en estado de pago aprobado',
        );

      // subir imagenes a firebase
      const pathImagenes: Record<string, string> = {};

      await Promise.all(
        Object.entries(files).map(async ([key, file]) => {
          const nombreArchivoComprobante =
            crearNombreArchivoDesdeMulterFile(file);
          const rutaArchivo = `${FIREBASE_STORAGE_FOLDERS.comprobantes}/${nombreArchivoComprobante}`;
          const urlPathComprobante =
            await this.firebaseService.subirArchivoPrivado(
              file.buffer,
              rutaArchivo,
              file.mimetype,
            );
          pathImagenes[key] = rutaArchivo;
        }),
      );

      const updatedComercio = await this.prismaService.$transaction(
        async (prisma) => {
          const fecha = new Date();

          const estado_asignar = 3;
          await prisma.comercio.update({
            where: { id: data.id_comercio },
            data: {
              estado: estado_asignar,
              foto_interior: pathImagenes.foto_interior,
              foto_exterior: pathImagenes.foto_exterior,
              imagen_factura_servicio: pathImagenes.imagen_factura_servicio,
              id_usuario_actualizacion: id_usuario,
              fecha_actualizacion: fecha,
              fecha_actualizacion_estado: fecha,
              urlmaps: data.url_maps,
              correo_empresa: data.correo_empresa,
              direccion: data.direccion,
            },
          });
          // registrar en seguimiento comercio
          await prisma.seguimiento_verificacion.create({
            data: {
              id_comercio: data.id_comercio,
              id_estado: estado_asignar, // Estado de Pendiente Verificacion de Comercio
              fecha_creacion: fecha,
              id_usuario,
            },
          });

          return comercio;
        },
      );

      return pathImagenes;
    } catch (error) {
      console.error('Error al registrar información de verificación:', error);
      throw error;
    }
  }

  async actualizarlaInfoVerificacion(
    id: number,
    files: FilesVerificacionComercio,
    id_usuario: number,
    data: UpdateVerificarInformacionDto,
  ) {
    try {
      const id_estado_asignar = 3;
      const comercio = await this.prismaService.comercio.findFirst({
        where: {
          AND: [
            { id: id },
            { activo: true },
          ],
        },
      });

      if (!comercio) throw new NotFoundException('Comercio no encontrado');

      if (comercio.estado !== 5)
        throw new BadRequestException(
          'El comercio no está en estado de Comercio Rechazado',
        );

      // subir imagenes a firebase
      const pathImagenes: Record<string, string> = {};
      const nombreFotoInterior = path.basename(comercio.foto_interior || '');
      const nombreFotoExterior = path.basename(comercio.foto_exterior || '');
      const nombrefacturaServicio = path.basename(comercio.imagen_factura_servicio || '');
      const nombreCedulaFrontal = path.basename(comercio.cedula_frontal || '');
      const nombreCedulaReverso = path.basename(comercio.cedula_reverso || '');

      await Promise.all(
        Object.entries(files).map(async ([key, file]) => {
          let nombreArchivoComprobante = '';

          // obtener nombre del archivo o generar uno nuevo
          switch (key) {
            case 'foto_interior':
              nombreArchivoComprobante =
                nombreFotoInterior || crearNombreArchivoDesdeMulterFile(file);
              break;
            case 'foto_exterior':
              nombreArchivoComprobante =
                nombreFotoExterior || crearNombreArchivoDesdeMulterFile(file);
              break;
            case 'imagen_factura_servicio':
              nombreArchivoComprobante =
                nombrefacturaServicio ||
                crearNombreArchivoDesdeMulterFile(file);
              break;
            case 'cedula_frontal':
              nombreArchivoComprobante =
                nombreCedulaFrontal || crearNombreArchivoDesdeMulterFile(file);
              break;
            case 'cedula_reverso':
              nombreArchivoComprobante =
                nombreCedulaReverso || crearNombreArchivoDesdeMulterFile(file);
              break;
          }

          if (file) {
            const rutaArchivo = `${FIREBASE_STORAGE_FOLDERS.comprobantes}/${nombreArchivoComprobante}`;
            const urlPathComprobante =
              await this.firebaseService.subirArchivoPrivado(
                file.buffer,
                rutaArchivo,
                file.mimetype,
              );
            pathImagenes[key] = rutaArchivo;
          }
        }),
      );

      const fecha = new Date();

      const updatedComercio = await this.prismaService.$transaction(
        async (prisma) => {
          const comercioActualizado = await prisma.comercio.update({
            where: { id },
            data: {
              estado: id_estado_asignar,
              cedula_frontal: pathImagenes.cedula_frontal,
              cedula_reverso: pathImagenes.cedula_reverso,
              foto_interior: pathImagenes.foto_interior,
              foto_exterior: pathImagenes.foto_exterior,
              imagen_factura_servicio: pathImagenes.imagen_factura_servicio,
              id_usuario_actualizacion: id_usuario,
              fecha_actualizacion: fecha,
              fecha_actualizacion_estado: fecha,
              urlmaps: data.url_maps,
              correo_empresa: data.correo_empresa,
            },
          });

          // registrar en seguimiento comercio
          await prisma.seguimiento_verificacion.create({
            data: {
              id_comercio: id,
              id_estado: id_estado_asignar, // Estado de Pendiente Verificacion de Comercio
              fecha_creacion: fecha,
              id_usuario,
            },
          });

          return comercioActualizado;
        },
      );

      return updatedComercio;
    } catch (error) {
      console.error('Error al actualizar información de comercio:', error);
      throw error;
    }
  }

  async getComerciosAprobar(query: QueryComercios) {
    try {
      let sql = sqlLisatdoComerciosAprobar;
      let parametros: any = {};
      console.log("query es",query)
      if (query.estado) {
        sql += ` and com.estado = $(estado)`;
        parametros.estado = query.estado;
      }

      if (query.ruc) {
        sql += ` and com.ruc = $(ruc)`;
        parametros.ruc = query.ruc;
      }

      const comerciosAprobar = await this.dbPromiseService.result(sql, parametros);
      return comerciosAprobar.rows;
    } catch (error) {
      console.error('Error al obtener comercios a aprobar:', error);
      throw error;
    }
  }

  async rechazarComercio(rechazarComercioDto: RechazarComercioDto) {
    try {
      const id_estado_asignar = 5;
      const { id_comercio, motivo, id_usuario_seguimiento } =
        rechazarComercioDto;

      const comercio = await this.prismaService.comercio.findFirst({
        where: { id: id_comercio, activo: true },
      });

      if (comercio?.estado == id_estado_asignar) {
        throw new BadRequestException(
          'El comercio ya está en estado de rechazo',
        );
      }

      if (!comercio) throw new NotFoundException('Comercio no encontrado');

      const comercioActualizado = await this.prismaService.$transaction(
        async (prisma) => {
          const fecha_actualizacion = new Date();
          const comercio = await prisma.comercio.update({
            where: { id: id_comercio },
            data: {
              estado: id_estado_asignar,
              motivo_rechazo: motivo,
              id_usuario_actualizacion: id_usuario_seguimiento,
              fecha_actualizacion_estado: fecha_actualizacion,
              fecha_actualizacion: fecha_actualizacion,
              verificado:false,
            },
          });

          await prisma.seguimiento_verificacion.create({
            data: {
              id_comercio,
              id_estado: id_estado_asignar,
              observacion: motivo,
              fecha_creacion: fecha_actualizacion,
              id_usuario: id_usuario_seguimiento,
            },
          });

          return comercio;
        },
      );

      return comercioActualizado;
    } catch (error) {
      console.error('Error al rechazar comercio:', error);
      throw error;
    }
  }


  async verificarComercio(data:VerificarComercioDto) {
    try {
      const { id_comercio, id_usuario_seguimiento } = data;
      const id_estado_asignar = 4;
      const comercio = await this.prismaService.comercio.findFirst({
        where: { id: id_comercio, activo: true },
      });

      if (!comercio) throw new NotFoundException('Comercio no encontrado');

      if(comercio.verificado) throw new BadRequestException('El comercio ya ha sido verificado');

      if(comercio.estado != 3) throw new BadRequestException('El comercio no está en estado de pendiente de verificación');

      const comercioActualizado = await this.prismaService.$transaction(
        async (prisma) => {
          const fecha_actualizacion = new Date();
          const numero_nuv_actual =  await prisma.empresa_config.findFirst({
            select: { nuv_actual: true,nuv_fin:true },
            where: { id: 1 },
          });

          if (!numero_nuv_actual?.nuv_actual) throw new BadRequestException('No se ha configurado el número NUV en la empresa');

          if(numero_nuv_actual?.nuv_fin ==  numero_nuv_actual?.nuv_actual) throw new BadRequestException('No hay más NUV disponibles, contactar con el administrador');

          const comercio = await prisma.comercio.update({
            where: { id: id_comercio },
            data: {
              estado: id_estado_asignar, // Estado de Aprobado
              id_usuario_actualizacion: id_usuario_seguimiento,
              fecha_actualizacion: fecha_actualizacion,
              fecha_actualizacion_estado: fecha_actualizacion,
              verificado:true,
              codigo_nuv: String(numero_nuv_actual!.nuv_actual),
            },
          });

          // actualizar el numero NUV en la empresa config
          await prisma.empresa_config.update({
            where: { id: 1 },
            data: {
              nuv_actual: numero_nuv_actual!.nuv_actual + 1,
            },
          });

          // registrar seguimiento de verificacion
          await prisma.seguimiento_verificacion.create({
            data: {
              id_comercio,
              id_estado: id_estado_asignar,
              fecha_creacion: fecha_actualizacion,
              id_usuario: id_usuario_seguimiento,
            },
          });

          // activar suscripcion de comercio
          // Obtener el ID del plan de verificación desde la configuración

          const sqlplanVerificacion = `select id as id_plan_verificacion, renovacion_plan, renovacion_valor from planes where activo = true and id = (select id_plan_verificacion from empresa_config where id = 1)`
          const resultPlanVerificacion = await this.dbService.query(sqlplanVerificacion);

          if(resultPlanVerificacion.rowCount === 0) throw new BadRequestException('Plan de verificación no encontrado');

          const planVerificacionConfig = resultPlanVerificacion.rows[0];

          if (!planVerificacionConfig?.id_plan_verificacion) {
            throw new BadRequestException('Plan de verificación no configurado');
          }

          // activar y actualizar la fecha de vecimiento
          const fechaVencimiento = calcularFechaVencimiento({
            fecha: new Date(),
            tipoRenovacion: planVerificacionConfig.renovacion_plan,
            valor: planVerificacionConfig.renovacion_valor,
          });

          const suscripcionActualizada = await prisma.suscripciones.updateManyAndReturn({
            data: { estado: 2, fecha_vencimiento: fechaVencimiento, fecha_actualizacion: new Date() }, // activo
            where: {
              AND: [
                { id_comercio: id_comercio },
                { id_plan: planVerificacionConfig.id_plan_verificacion }, // Plan de verificación dinámico
                { activo: true },
                { estado: 1 },
              ]
            },
          });

          if (suscripcionActualizada.length === 0) {
            throw new BadRequestException('No se encontró suscripción para activar');
          }

          // obtener factura pagada de la suscripcion
          const facturaPagada = await prisma.factura_suscripciones.findFirst({
            where: { id_suscripcion: suscripcionActualizada[0].id, estado: 2 },
          });

          
          
          
          if (!facturaPagada) {
            throw new BadRequestException('No se encontró factura pagada para registrar ganancias');
          }
          

          await this.participantesService.repartirGananciasDeVentaPlan(
            facturaPagada.id,
            {primera_venta:true} as OpcionesRepartirParticipantesDto,
            prisma
          );
          


          return comercio;
        },
      );

      return comercioActualizado;
    } catch (error) {
      console.error('Error al verificar comercio:', error);
      throw error;
    }
  }

  
}
