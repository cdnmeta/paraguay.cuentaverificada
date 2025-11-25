import {
  BadRequestException,
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { RequireUserVerificadoGuard } from '@/auth/guards/require-user-verificado.guard';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '@/auth/types/AuthenticatedRequest';
import { IsPublic } from '@/auth/decorators/public.decorator';
import {
  RegistrarRecargaDto,
  RegistrarSolicitudRecargaDto,
  RegistrarSolicitudRecargaPayloadDto,
  ReHabilitarSolicitudRecargaDto,
  ReHabilitarSolicitudRecargaPayloadDto,
} from './dto/registrar-movimiento.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { TipoMovimientoWallet } from './types/tipo-movimeinto';
import {
  RechazarMovimientoDto,
  RechazarMovimientoDtoPayload,
} from './dto/rechazar-movimiento.dto';
import { SolicitudesRecargaService } from './solicitudes-recarga/solicitudes-recarga.service';
import {
  VerificacionSolicitudRecargaDto,
  VerificacionSolicitudRecargaDtoPayload,
} from './dto/verificacion-solicitud-recarga';
import { IsOnlyAdmin } from '@/auth/decorators/onlyAdmin.decorator';
import { OnlyAdminGuard } from '@/auth/guards/onlyAdmin.guard';
import { PrismaService } from '@/prisma/prisma.service';
import { WalleMovimientosByUsuarioDto } from './dto/wallet-movimientos.dto';
import { DatabasePromiseService } from '@/database/database-promise.service';

@UseGuards(RequireUserVerificadoGuard, OnlyAdminGuard)
@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly solicitudesRecargaService: SolicitudesRecargaService,
    private readonly prismaService: PrismaService,
    private readonly dbPromiseService: DatabasePromiseService,
  ) {}

  @Get('mis-wallets')
  async obtenerWalletsDelUsuario(@Req() req: AuthenticatedRequest) {
    try {
      const userId = req.user.userId;
      const wallets = await this.walletService.getWalletsByUserId(userId);
      return wallets;
    } catch (error) {
      throw error;
    }
  }

  @IsOnlyAdmin()
  @Get('listado-solicitudes-recargas')
  async obtenerListadoSolicitudesRecargas() {
    try {
      const sql = `
        SELECT
          WM.ID AS ID_MOVIMIENTO,
          WM.ID_WALLET,
          W.ID_USUARIO AS ID_SOLICITANTE,
          CONCAT_WS(' ', U.NOMBRE, U.APELLIDO) AS SOLICITANTE,
          U.EMAIL AS EMAIL_SOLICITANTE,
          TM.ID AS ID_TIPO_MOVIMIENTO,
          TM.DESCRIPCION AS TIPO_MOVIMIENTO_DESC,
          WM.MONTO,
          W.ID_MONEDA,
          WM.URL_IMAGEN AS COMPROBANTE_URL,
          WM.OBSERVACION,
          WM.MOTIVO_RECHAZO,
          WM.ID_ESTADO,
          CASE WM.ID_ESTADO
            WHEN 1 THEN 'pendiente'
            WHEN 2 THEN 'verificado'
            WHEN 3 THEN 'rechazado'
            WHEN 4 THEN 'anulado'
            ELSE 'desconocido'
          END AS ESTADO_DESC,
          WM.ID_USUARIO_VERIFICADOR,
          CONCAT_WS(' ', UV.NOMBRE, UV.APELLIDO) AS VERIFICADOR_ASIGNADO, -- si existe
          WM.FECHA_CREACION,
          WM.FECHA_ACTUALIZACION
        FROM
          WALLET_MOVIMIENTOS WM
          JOIN WALLET W ON W.ID = WM.ID_WALLET
          JOIN USUARIOS U ON U.ID = W.ID_USUARIO -- solicitante = dueño de la wallet
          LEFT JOIN TIPO_MOVIMIENTO_WALLET TM ON TM.ID = WM.ID_TIPO_MOVIMIENTO
          LEFT JOIN USUARIOS UV ON UV.ID = WM.ID_USUARIO_VERIFICADOR
        WHERE
          WM.ACTIVO = TRUE
          AND W.ACTIVO = TRUE
          AND COALESCE(WM.ID_ESTADO, 1) = 1 -- pendientes
        ORDER BY
          WM.FECHA_CREACION DESC;`;
      const resultado = await this.dbPromiseService.result(sql);
      return resultado.rows;
    } catch (error) {
      throw error;
    }
  }

  @Post('solicitar-recarga')
  @UseInterceptors(FileInterceptor('comprobanteRecarga'))
  async registrarRecarga(
    @Req() req: AuthenticatedRequest,
    @Body() data: RegistrarSolicitudRecargaPayloadDto,
    @Res() res: Response,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 5 * 1024 * 1024,
            message: 'El archivo es demasiado grande. Máximo 5MB.',
          }), // 2MB
          new FileTypeValidator({ fileType: 'image/(jpeg|png|jpg)' }), // acepta JPG, PNG, JPG
        ],
        fileIsRequired: true, // opcional, true por defecto
        exceptionFactory(error) {
          if (error === 'File is required')
            throw new BadRequestException(
              'El archivo de comprobante de recarga es obligatorio',
            );
        },
      }),
    )
    comprobantePago: Express.Multer.File,
  ) {
    try {
      const userId = req.user.userId;
      const dataEnviar: RegistrarSolicitudRecargaDto = {
        ...data,
        id_moneda: 2, // moneda PYG
        id_tipo_movimiento: TipoMovimientoWallet.RECARGA, // tipo movimiento recarga
        id_usuario: userId,
      };
      await this.solicitudesRecargaService.registrarSolicitudRecarga(
        dataEnviar,
        comprobantePago,
      );
      return res
        .status(200)
        .json({ message: 'Solicitud de recarga registrada correctamente' });
    } catch (error) {
      console.log(error)
      throw error;
    }
  }

  /*Rutas dinamicas*/

  @Get('mi-movimiento/:id')
  async obtenerMovimientoPorIdUsuarioYIdMovimiento(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    try {
      const movimiento = await this.prismaService.wallet_movimientos.findFirst({
        where: {
          AND: [
            { id: id, activo: true },
            {
              wallet: {
                id_usuario: req.user.userId,
              },
            },
          ],
        },
      });
      if (!movimiento)
        throw new BadRequestException('Movimiento no encontrado');
      return movimiento;
    } catch (error) {
      throw error;
    }
  }

  @IsOnlyAdmin()
  @Put('rechazo-solicitud-recarga/:id')
  async rechazarSolicitudRecarga(
    @Req() req: AuthenticatedRequest,
    @Body() data: RechazarMovimientoDtoPayload,
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
  ) {
    try {
      const dataEnviar: RechazarMovimientoDto = {
        ...data,
        id_usuario_rechazo: req.user.userId,
      };
      await this.solicitudesRecargaService.rechazarSolicitudRecarga(
        id,
        dataEnviar,
      );
      return res.status(200).json({ message: 'Solicitud rechazada correctamente' });
    } catch (error) {
      throw error;
    }
  }

  @IsOnlyAdmin()
  @Put('aprobar-solicitud-recarga/:id')
  async aprobarSolicitudRecarga(
    @Req() req: AuthenticatedRequest,
    @Body() data: VerificacionSolicitudRecargaDtoPayload,
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    try {
      const dataEnviar: VerificacionSolicitudRecargaDto = {
        ...data,
        id_usuario_verificador: req.user.userId,
      };
      await this.solicitudesRecargaService.aprobarSolicitudRecarga(
        id,
        dataEnviar,
      );
      return res
        .status(200)
        .json({ message: 'Solicitud aprobada correctamente' });
    } catch (error) {
      throw error;
    }
  }

  /* Funcion que el usuario puede llamar para habilitar una solicitud de recarga */
  @Put('habilitar-solicitud-recarga/:id')
  @UseInterceptors(FileInterceptor('comprobanteRecarga'))
  async reHabilitarSolicitudRecarga(
    @Req() req: AuthenticatedRequest,
    @Body() data: ReHabilitarSolicitudRecargaPayloadDto,
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 2 * 1024 * 1024,
            message: 'El archivo es demasiado grande. Máximo 2MB.',
          }), // 2MB
          new FileTypeValidator({ fileType: 'image/(jpeg|png|jpg)' }), // acepta JPG, PNG, JPG
        ],
        fileIsRequired: true, // opcional, true por defecto
        exceptionFactory(error) {
          if (error === 'File is required')
            throw new BadRequestException(
              'El archivo de comprobante de recarga es obligatorio',
            );
        },
      }),
    )
    comprobantePago: Express.Multer.File,
  ) {
    try {
      const userId = req.user.userId;
      const dataEnviar: ReHabilitarSolicitudRecargaDto = {
        ...data,
        id_usuario_propietario: userId,
      };
      await this.solicitudesRecargaService.reHabilitarSolicitudRecarga(
        id,
        dataEnviar,
        comprobantePago,
      );
      return res
        .status(200)
        .json({ message: 'Movimiento de recarga re habilitado correctamente' });
    } catch (error) {
      throw error;
    }
  }

  /*Listado de movimientos por usuario y wallet*/
  @Get('mis-wallets/:id')
  async obtenerMovimientosPorUsuarioYWallet(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      const dataEnviar: WalleMovimientosByUsuarioDto = {
        id_usuario: req.user.userId,
      };
      const result = await this.walletService.getWalletMovimientosByUsuario(
        id,
        dataEnviar,
      );
      return result;
    } catch (error) {
      throw error;
    }
  }
}
