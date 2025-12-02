import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
  Res,
  Req,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { VerificacionCuentaService } from './verificacion-cuenta.service';
import { CreateVerificacionCuentaDto } from './dto/create-verificacion-cuenta.dto';
import {
  AprobarCuenta,
  RechazoCuentaDto,
  UpdateVerificacionCuentaDto,
} from './dto/update-verificacion-cuenta.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { validateImageOrThrow } from '@/pipes/ImageValiationPipe';
import { ImagenesVerificacionCuenta } from './types/imagenes-verificacion';
import { Response } from 'express';
import { AuthenticatedRequest } from '@/auth/types/AuthenticatedRequest';
import {
  SolicitudCuentaDto,
  SolicitudCuentaPayloadDto,
  ValidarCodigoSolicitudDto,
} from './dto/solicitud-cuenta.dto';
import { IsPublic } from '@/auth/decorators/public.decorator';
import { PrismaService } from '@/prisma/prisma.service';
import {
  RequireGroupIdsAll,
  RequireGroupIdsAny,
} from '@/auth/decorators/groups.decorator';
import { plainToInstance } from 'class-transformer';
import { SoliitudVerificacionCuentaResponseDto } from './dto/response-solicitud-cuenta.dto';
import {
  QueryListadoSolicitudes,
  QueryResumenSolicitudes,
} from './types/query';

@Controller('verificacion-cuenta')
export class VerificacionCuentaController {
  constructor(
    private readonly verificacionCuentaService: VerificacionCuentaService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 📊 OBTENER RESUMEN DE SOLICITUDES DE CUENTA
   *
   * Genera un resumen estadístico de las solicitudes de verificación de cuenta
   * incluyendo contadores por estado (pendientes, aprobadas, rechazadas, etc.)
   *
   * @param query - Filtros opcionales para el resumen
   * @returns Objeto con estadísticas de solicitudes por estado
   */
  @Get('resumen-solicitudes-cuenta')
  @RequireGroupIdsAll(1)
  resumenSolicitudesCuenta(@Query() query: QueryResumenSolicitudes) {
    return this.verificacionCuentaService.resumenSolicitudesCuenta(query);
  }

  @Get('resumen-solicitudes-verificador')
  @RequireGroupIdsAll(2)
  resumenSolicitudesCuentaByVerificador(@Req() req: AuthenticatedRequest) {
    try {
      const id_verificador = req.user.userId;
      return this.verificacionCuentaService.resumenSolicitudesCuenta({
        id_verificador,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 📋 LISTADO DE SOLICITUDES PARA VERIFICADOR
   *
   * Obtiene el listado de solicitudes de verificación asignadas a un verificador específico.
   * Solo accesible para usuarios con rol de verificador (group_id: 2)
   *
   * @param req - Request autenticado con información del usuario verificador
   * @param query - Parámetros de paginación y filtros
   * @returns Lista paginada de solicitudes asignadas al verificador
   */
  @Get('listado-solicitudes-verificador')
  @RequireGroupIdsAll(2)
  listadoUsuariosVerificacionByVerificador(
    @Req() req: AuthenticatedRequest,
    @Query() query: QueryListadoSolicitudes,
  ) {
    const id_verificador = req.user.userId;
    return this.verificacionCuentaService.listadoUsuariosSolicitudesByVerificador(
      id_verificador,
      query,
    );
  }

  /**
   * 📄 LISTADO GENERAL DE SOLICITUDES
   *
   * Obtiene el listado completo de todas las solicitudes de verificación de cuenta.
   * Solo accesible para administradores (group_id: 1)
   *
   * @param query - Parámetros de paginación, filtros y ordenamiento
   * @returns Lista paginada de todas las solicitudes del sistema
   */
  @Get('listado-solitudes')
  @RequireGroupIdsAll(1)
  listadoUsuariosSolicitudes(@Query() query: QueryListadoSolicitudes) {
    return this.verificacionCuentaService.listadoUsuariosSolicitudes(query);
  }

  /**
   * 🔑 GENERAR TOKEN DE SOLICITUD
   *
   * Genera un token único para una solicitud específica que será usado
   * para procesos de verificación adicionales o acceso a recursos protegidos.
   * Solo accesible para administradores (group_id: 1)
   *
   * @param id - ID de la solicitud para generar el token
   * @param res - Response object para enviar la respuesta
   * @returns Token generado junto con documento e ID de solicitud
   */
  @Get('generar-token-solicitud/:id')
  @RequireGroupIdsAll(1)
  async generarToken(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    try {
      const { token, documento, id_usuario_solicitud } =
        await this.verificacionCuentaService.generarTokenSolicitudById(id);
      return res.status(200).json({ token, documento, id_usuario_solicitud });
    } catch (error) {
      throw error;
    }
  }

  @Post('usuario/solicitud')
  async solicitarVerificacionUsuario(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    try {
      const userId = req.user.userId;
      const {verificador} =
        await this.verificacionCuentaService.solicitarVerificacionUsuario(
          userId,
          { notificar_por_correo: true },
        );
      return res
        .status(200)
        .json({ message: 'Solicitud de verificación enviada correctamente', verificador });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 📝 REGISTRAR SOLICITUD DE CUENTA (ENDPOINT COMENTADO)
   *
   * Registra una nueva solicitud de verificación de cuenta en el sistema.
   * Incluye validación de datos, asignación de estado inicial y envío de notificaciones.
   *
   * ⚠️ ENDPOINT ACTUALMENTE DESHABILITADO
   * - Decoradores @IsPublic() y @Post() están comentados
   * - Función mantiene la lógica pero no está expuesta como endpoint
   *
   * @param req - Request con información de IP y dispositivo
   * @param dto - Datos de la solicitud (nombre, apellido, documento, etc.)
   * @param res - Response object para enviar la respuesta
   * @returns Confirmación de solicitud registrada con datos del usuario
   */
  /* @IsPublic()
  @Post('solicitud-cuenta') */
  async registrarSolicitudCuenta(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SolicitudCuentaPayloadDto,
    @Res() res: Response,
  ) {
    try {
      const dataGuardar: SolicitudCuentaDto = {
        ...dto,
        ip_origen: req.ip,
        dispositivo: req.headers['user-agent'] || 'desconocido',
        id_estado: 5, // estado 5 es "pendiente verificar solicitud"
      };
      const userSolicitud =
        await this.verificacionCuentaService.registrarSolicitudCuenta(
          dataGuardar,
        );
      const userResponse = plainToInstance(
        SoliitudVerificacionCuentaResponseDto,
        userSolicitud,
        { excludeExtraneousValues: true },
      );
      return res.status(200).json({
        message: 'Solicitud Recibida Correctamente',
        data: userResponse,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * ✅ VALIDAR CÓDIGO DE SOLICITUD (ENDPOINT COMENTADO)
   *
   * Valida el código de verificación enviado por email al usuario
   * para confirmar su identidad y activar la solicitud de cuenta.
   *
   * ⚠️ ENDPOINT ACTUALMENTE DESHABILITADO
   * - Decoradores @IsPublic() y @Post() están comentados
   * - Función mantiene la lógica de validación de códigos OTP
   *
   * @param dto - Objeto con ID de usuario y código de verificación
   * @param res - Response object para enviar la respuesta
   * @returns Confirmación de código válido y datos de la solicitud
   */
  /* @IsPublic()
  @Post('validar-codigo-solicitud') */
  async validarCodigoSolicitud(
    @Body() dto: ValidarCodigoSolicitudDto,
    @Res() res: Response,
  ) {
    try {
      const solicitud =
        await this.verificacionCuentaService.validarSolicitudCuenta(dto);
      const solicitudResponse = plainToInstance(
        SoliitudVerificacionCuentaResponseDto,
        solicitud,
        { excludeExtraneousValues: true },
      );
      return res.status(200).json({
        message: 'Código verificación correcto',
        data: solicitudResponse,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 📨 REENVIAR CÓDIGO DE VERIFICACIÓN (ENDPOINT COMENTADO)
   *
   * Regenera y reenvía un nuevo código de verificación por email
   * cuando el usuario no recibió el código original o expiró.
   *
   * ⚠️ ENDPOINT ACTUALMENTE DESHABILITADO
   * - Decoradores @IsPublic() y @Post() están comentados
   * - Función permite regenerar códigos de verificación
   *
   * @param body - Objeto con ID del usuario para regenerar código
   * @param res - Response object para enviar la respuesta
   * @returns Confirmación de código regenerado correctamente
   */
  /* @IsPublic()
  @Post('enviar-codigo-verificacion') */
  async obtenerNuevoCodigoVerificacion(
    @Body() body: { id_usuario: number },
    @Res() res: Response,
  ) {
    try {
      await this.verificacionCuentaService.obtenerCodigoVerificacion(
        body.id_usuario,
      );
      return res
        .status(200)
        .json({ message: 'Código de verificación regenerado correctamente' });
    } catch (error) {
      throw error;
    }
  }

  /**
   * ❌ RECHAZAR SOLICITUD DE CUENTA (ENDPOINT COMENTADO)
   *
   * Rechaza una solicitud de verificación de cuenta especificando
   * los motivos del rechazo y notificando al usuario.
   *
   * ⚠️ ENDPOINT ACTUALMENTE DESHABILITADO
   * - Decorador @Post() está comentado
   * - Función permite rechazar solicitudes con motivos detallados
   *
   * @param res - Response object para enviar la respuesta
   * @param body - Datos del rechazo (ID solicitud, motivos, etc.)
   * @returns Confirmación de solicitud rechazada correctamente
   */
  @Post('rechazar')
  async rechazarCuenta(@Res() res: Response, @Body() body: RechazoCuentaDto) {
    await this.verificacionCuentaService.rechazarCuenta(body);
    return res
      .status(200)
      .json({ message: 'Solicitud rechazada correctamente' });
  }

  /**
   * ✅ APROBAR SOLICITUD DE CUENTA (ENDPOINT COMENTADO)
   *
   * Aprueba una solicitud de verificación de cuenta, genera las credenciales
   * necesarias y notifica al usuario sobre la aprobación.
   *
   * ⚠️ ENDPOINT ACTUALMENTE DESHABILITADO
   * - Decorador @Post() está comentado
   * - Función permite aprobar solicitudes y generar tokens de acceso
   *
   * @param req - Request autenticado con información del usuario que aprueba
   * @param res - Response object para enviar la respuesta
   * @param body - Datos de aprobación (ID solicitud, configuraciones, etc.)
   * @returns Confirmación de aprobación con documento y token generado
   */
  @Post('aprobar')
  async aprobarCuenta(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Body() body: AprobarCuenta,
  ) {
    body.id_usuario_actualizacion = req.user.userId;
    await this.verificacionCuentaService.aprobarCuenta(body);
    return res.status(200).json({
      message: 'Solicitud aprobada correctamente',
    });
  }

  /**
   * 🔄 REGENERAR TOKEN DE VERIFICACIÓN (ENDPOINT COMENTADO)
   *
   * Regenera un token de verificación existente usando el token anterior
   * y la cédula como validación de seguridad.
   *
   * ⚠️ ENDPOINT ACTUALMENTE DESHABILITADO
   * - Decoradores @IsPublic() y @Post() están comentados
   * - Función permite renovar tokens expirados o comprometidos
   *
   * @param body - Objeto con token actual y cédula para validación
   * @returns Nuevo token generado junto con el documento asociado
   */
  /* @IsPublic()
  @Post('regenerar-token') */
  async generarTokenVerificacion(
    @Body() body: { token: string; cedula: string },
  ) {
    try {
      if (!body?.token) {
        throw new BadRequestException('El token es requerido');
      }

      if (!body?.cedula) {
        throw new BadRequestException('La cédula es requerida');
      }

      const { token, documento } =
        await this.verificacionCuentaService.regenerarTokenVerificacion({
          token: body.token,
          cedula: body.cedula,
        });
      return { token: token, documento: documento };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 🔍 VERIFICAR TOKEN DE ACCESO (ENDPOINT COMENTADO)
   *
   * Verifica la validez de un token de verificación junto con la cédula
   * para confirmar que el usuario tiene permisos de acceso.
   *
   * ⚠️ ENDPOINT ACTUALMENTE DESHABILITADO
   * - Decoradores @IsPublic() y @Post() están comentados
   * - Función valida tokens y permisos de usuarios aprobados
   *
   * @param body - Objeto con token y cédula para verificación
   * @param res - Response object para enviar la respuesta
   * @returns Confirmación de token válido si la verificación es exitosa
   */
  /*  @IsPublic()
  @Post('verificar-token') */
  async verificarToken(
    @Body() body: { token: string; cedula: string },
    @Res() res: Response,
  ) {
    try {
      if (!body?.token) {
        throw new BadRequestException('El token es requerido');
      }
      if (!body?.cedula) {
        throw new BadRequestException('La cédula es requerida');
      }

      const usuarioSolicitud =
        await this.prisma.usuarios_solicitudes_cuenta.findFirst({
          where: {
            documento: body.cedula,
            id_estado: 3, // estado 3 es "aprobado"
          },
        });

      if (!usuarioSolicitud) {
        throw new NotFoundException('Solicitud no encontrada');
      }

      await this.verificacionCuentaService.verificarTokenSolicitud({
        token: body.token,
        id_usuario_solicitud: usuarioSolicitud.id,
      });
      return res.status(200).json({ message: 'Token válido' });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 📝 ACTUALIZAR SOLICITUD DE VERIFICACIÓN (ENDPOINT COMENTADO)
   *
   * Actualiza una solicitud de verificación existente incluyendo
   * la carga de nuevos documentos (cédula frontal, reverso, selfie).
   *
   * ⚠️ ENDPOINT ACTUALMENTE DESHABILITADO
   * - Decorador @Put(':id') está comentado
   * - Función permite actualizar datos y documentos de solicitudes
   * - Incluye validación y procesamiento de imágenes subidas
   *
   * @param req - Request autenticado con información del usuario
   * @param id - ID de la solicitud a actualizar
   * @param updateVerificacionCuentaDto - Datos actualizados de la solicitud
   * @param files - Archivos de imagen (cédula frontal, reverso, selfie)
   * @param res - Response object para enviar la respuesta
   * @returns Confirmación de solicitud actualizada correctamente
   */
  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'cedula_frontal', maxCount: 1 },
      { name: 'cedula_reverso', maxCount: 1 },
      { name: 'selfie_user', maxCount: 1 },
    ]),
  )
  async actualizarUsuarioVerificacion(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVerificacionCuentaDto: UpdateVerificacionCuentaDto,
    @UploadedFiles()
    files: ImagenesVerificacionCuenta,
    @Res() res: Response,
  ) {
    console.log('file', files);
    const frontal = files.cedula_frontal?.[0];
    const reverso = files.cedula_reverso?.[0];
    const selfie_user = files.selfie_user?.[0];

    console.log('file', files);

    try {
      updateVerificacionCuentaDto.id_usuario_actualizacion = req.user.userId;

      await this.verificacionCuentaService.actualizarUsuarioVerificacion(
        id,
        updateVerificacionCuentaDto,
        files,
      );

      return res
        .status(200)
        .json({ message: 'Solicitud actualizada correctamente' });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 🔍 OBTENER SOLICITUD POR ID (ENDPOINT COMENTADO)
   *
   * Obtiene los detalles completos de una solicitud específica por su ID.
   * Accesible para administradores (group_id: 1) y verificadores (group_id: 2).
   *
   * ⚠️ ENDPOINT ACTUALMENTE DESHABILITADO
   * - Decorador @Get(':id') está comentado
   * - Función permite consultar detalles de solicitudes específicas
   * - Ruta dinámica debe ir al final para evitar conflictos
   *
   * @param id - ID de la solicitud a consultar
   * @returns Detalles completos de la solicitud incluyendo documentos y estado
   */
  // ⚠️ IMPORTANTE: Esta ruta dinámica debe ir AL FINAL
  @Get(':id')
  @RequireGroupIdsAny(1, 2)
  async getSolicitudById(@Param('id', ParseIntPipe) id: number) {
    return this.verificacionCuentaService.getSolicitudById(id);
  }
}
