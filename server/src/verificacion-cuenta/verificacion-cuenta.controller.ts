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
import { AprobarCuenta, RechazoCuentaDto, UpdateVerificacionCuentaDto } from './dto/update-verificacion-cuenta.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { validateImageOrThrow } from '@/pipes/ImageValiationPipe';
import { ImagenesVerificacionCuenta } from './types/imagenes-verificacion';
import { Response } from 'express';
import { AuthenticatedRequest } from '@/auth/types/AuthenticatedRequest';
import { SolicitudCuentaDto } from './dto/solicitud-cuenta.dto';
import { IsPublic } from '@/auth/decorators/public.decorator';
import { PrismaService } from '@/prisma/prisma.service';
import { RequireGroupIdsAll, RequireGroupIdsAny } from '@/auth/decorators/groups.decorator';

@Controller('verificacion-cuenta')
export class VerificacionCuentaController {
  constructor(
    private readonly verificacionCuentaService: VerificacionCuentaService,
    private readonly prisma: PrismaService
  ) {}

  @Get('listado-solicitudes-verificador')
  @RequireGroupIdsAll(2)
  listadoUsuariosVerificacionByVerificador(
    @Req() req: AuthenticatedRequest,
  ) {
    const id_verificador = req.user.userId;
    return this.verificacionCuentaService.listadoUsuariosSolicitudesByVerificador(id_verificador);
  }


  @Get('listado-solitudes')
  @RequireGroupIdsAll(1)
  listadoUsuariosSolicitudes() {
    return this.verificacionCuentaService.listadoUsuariosSolicitudes();
  }

  @IsPublic()
  @Post('solicitud-cuenta')
  async registrarSolicitudCuenta(
    @Body() dto: SolicitudCuentaDto,
    @Res() res: Response,
  ) {
    try {
      const userSolicitud =
        await this.verificacionCuentaService.registrarSolicitudCuenta(dto);
      return res
        .status(200)
        .json({ message: 'Solicitud Recibida Correctamente' });
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'cedula_frontal', maxCount: 1 },
        { name: 'cedula_reverso', maxCount: 1 },
        { name: 'selfie_user', maxCount: 1 },
        
      ],
      {
        limits: { fileSize: 2 * 1024 * 1024 }, // refuerzo Multer (por archivo)
      },
    ),
  )
  async actualizarUsuarioVerificacion(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVerificacionCuentaDto: UpdateVerificacionCuentaDto,
    @UploadedFiles()
    files: ImagenesVerificacionCuenta,
    @Res() res: Response,
  ) {

    
    const frontal = files.cedula_frontal?.[0];
    const reverso = files.cedula_reverso?.[0];
    const selfie_user = files.selfie_user?.[0];

    updateVerificacionCuentaDto.id_usuario_actualizacion = req.user.userId;

    await this.verificacionCuentaService.actualizarUsuarioVerificacion(
      id,
      updateVerificacionCuentaDto,
      files
    );

    return res.status(200).json({ message: 'Solicitud actualizada correctamente' });
  }

  @Post('rechazar')
  async rechazarCuenta(
    @Res() res: Response,
    @Body() body: RechazoCuentaDto
  ) {
    await this.verificacionCuentaService.rechazarCuenta(body);
    return res.status(200).json({ message: 'Solicitud rechazada correctamente' });
  }

  @Post('aprobar')
  async aprobarCuenta(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Body() body: AprobarCuenta
  ) {

    body.id_usuario_actualizacion = req.user.userId;
    const {cuenta,token} = await this.verificacionCuentaService.aprobarCuenta(body);
    return res.status(200).json({ message: 'Solicitud aprobada correctamente', documento: cuenta.documento, token });
  }

  @IsPublic()
  @Post('regenerar-token')
  async generarTokenVerificacion(@Body() body:{token:string,cedula:string}){
   try {
      if(!body?.token){
        throw new BadRequestException('El token es requerido');
      }

      if(!body?.cedula){
        throw new BadRequestException('La cédula es requerida');
      }

      const {token,documento} = await this.verificacionCuentaService.regenerarTokenVerificacion({ token: body.token, cedula: body.cedula });
      return {token:token,documento: documento};
   } catch (error) {
    throw error;
   }
  }

  @IsPublic()
  @Post('verificar-token')
  async verificarToken(@Body() body: { token: string, cedula: string },
  @Res() res: Response
) {
    try {
      if (!body?.token) {
        throw new BadRequestException('El token es requerido');
      }
      if (!body?.cedula) {
        throw new BadRequestException('La cédula es requerida');
      }

      const usuarioSolicitud = await this.prisma.usuarios_solicitudes_cuenta.findFirst({
        where: {
          documento: body.cedula,
          id_estado: 3, // estado 3 es "aprobado"
        },
      });

      if (!usuarioSolicitud) {
        throw new NotFoundException('Solicitud no encontrada');
      }

      await this.verificacionCuentaService.verificarTokenSolicitud({ token: body.token, id_usuario_solicitud: usuarioSolicitud.id });
      return res.status(200).json({ message: 'Token válido' });
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @RequireGroupIdsAny(1,2)
  async getSolicitudById(@Param('id', ParseIntPipe) id: number) {
    return this.verificacionCuentaService.getSolicitudById(id);
  }

  @Get('generar-token-solicitud/:id')
  @RequireGroupIdsAll(1)
  async generarToken(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    try {
      const {token,documento,id_usuario_solicitud} = await this.verificacionCuentaService.generarTokenSolicitudById(id);
      return res.status(200).json({token,documento,id_usuario_solicitud});
    } catch (error) {
      throw error;
    }
  }

}
