import { BadRequestException, Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, ParseIntPipe, Post, Put, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { RequireUserVerificadoGuard } from '@/auth/guards/require-user-verificado.guard';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '@/auth/types/AuthenticatedRequest';
import { IsPublic } from '@/auth/decorators/public.decorator';
import { RegistrarRecargaDto, RegistrarSolicitudRecargaDto, RegistrarSolicitudRecargaPayloadDto, ReHabilitarSolicitudRecargaDto, ReHabilitarSolicitudRecargaPayloadDto } from './dto/registrar-movimiento.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { TipoMovimientoWallet } from './types/tipo-movimeinto';
import { RechazarMovimientoDto, RechazarMovimientoDtoPayload } from './dto/rechazar-movimiento.dto';
import { SolicitudesRecargaService } from './solicitudes-recarga/solicitudes-recarga.service';
import { VerificacionSolicitudRecargaDto, VerificacionSolicitudRecargaDtoPayload } from './dto/verificacion-solicitud-recarga';
import { IsOnlyAdmin } from '@/auth/decorators/onlyAdmin.decorator';
import { OnlyAdminGuard } from '@/auth/guards/onlyAdmin.guard';
import { PrismaService } from '@/prisma/prisma.service';

@UseGuards(RequireUserVerificadoGuard,OnlyAdminGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService,
    private readonly solicitudesRecargaService: SolicitudesRecargaService,
    private readonly prismaService: PrismaService
  ) {}


  @Post('solicitud-recarga')
  @UseInterceptors(FileInterceptor('comprobanteRecarga'))
  async registrarRecarga(@Req() req: AuthenticatedRequest,
  @Body() data: RegistrarSolicitudRecargaPayloadDto,
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
            if(error === 'File is required')  throw new BadRequestException('El archivo de comprobante de recarga es obligatorio');
          },
        }),
      )
      comprobantePago: Express.Multer.File,
  ) {
   try {
     const userId = req.user.userId;
    const dataEnviar:RegistrarSolicitudRecargaDto = {
      ...data,
      id_moneda: 2, // moneda PYG
      id_tipo_movimiento: TipoMovimientoWallet.RECARGA, // tipo movimiento recarga
      id_usuario: userId,
    }
    return this.solicitudesRecargaService.registrarSolicitudRecarga(dataEnviar,comprobantePago);
   } catch (error) {
    throw error;
   }
  }


  /*Rutas dinamicas*/

  @Get('mi-movimiento/:id')
  async obtenerMovimientoPorIdUsuarioYIdMovimiento(@Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number
  ) {
    try {
      const movimiento = await this.prismaService.wallet_movimientos.findFirst({
        where: {
          AND: [
            { id: id },
            {
              wallet: {
                id_usuario: req.user.userId,
              }
            }
          ]
        }
      })
    } catch (error) {
      throw error;
    }
  }





  @IsOnlyAdmin()
  @Put('rechazo-solicitud-recarga/:id')
  async rechazarSolicitudRecarga(@Req() req: AuthenticatedRequest,
    @Body() data: RechazarMovimientoDtoPayload,
    @Param('id', ParseIntPipe) id: number
  ) {
    try {
      const dataEnviar:RechazarMovimientoDto = {
        ...data,
        id_usuario_rechazo: req.user.userId,
      }
      return this.solicitudesRecargaService.rechazarSolicitudRecarga(id, dataEnviar);
    } catch (error) {
      throw error;
    }
  }

  @IsOnlyAdmin()
  @Put('aprobar-solicitud-recarga/:id')
  async aprobarSolicitudRecarga(@Req() req: AuthenticatedRequest,
    @Body() data: VerificacionSolicitudRecargaDtoPayload,
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response
  ) {
    try {
      const dataEnviar:VerificacionSolicitudRecargaDto = {
        ...data,
        id_usuario_verificador: req.user.userId,
      }
      await this.solicitudesRecargaService.aprobarSolicitudRecarga(id, dataEnviar);
      return res.status(200).json({message: 'Solicitud aprobada correctamente'});
    } catch (error) {
      throw error;
    }
  }

  @Put('habilitar-solicitud-recarga/:id')
  @UseInterceptors(FileInterceptor('comprobanteRecarga'))
  async reHabilitarSolicitudRecarga(@Req() req: AuthenticatedRequest,
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
          if (error === 'File is required') throw new BadRequestException('El archivo de comprobante de recarga es obligatorio');
        },
      }),
    )
    comprobantePago: Express.Multer.File,
  ) {
    try {
      const userId = req.user.userId;
      const dataEnviar: ReHabilitarSolicitudRecargaDto = {
        ...data,
        id_usuario_rehabilitacion: userId,
      }
      await this.solicitudesRecargaService.reHabilitarSolicitudRecarga(id, dataEnviar, comprobantePago);
      return res.status(200).json({ message: 'Movimiento de recarga re habilitado correctamente' });
    } catch (error) {
      throw error;
    }
  }



}
