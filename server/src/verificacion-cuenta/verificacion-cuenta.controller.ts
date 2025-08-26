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
} from '@nestjs/common';
import { VerificacionCuentaService } from './verificacion-cuenta.service';
import { CreateVerificacionCuentaDto } from './dto/create-verificacion-cuenta.dto';
import { AprobarCuenta, RechazoCuentaDto, UpdateVerificacionCuentaDto } from './dto/update-verificacion-cuenta.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { validateImageOrThrow } from '@/pipes/ImageValiationPipe';
import { ImagenesVerificacionCuenta } from './types/imagenes-verificacion';
import { Response } from 'express';
import { AuthenticatedRequest } from '@/auth/types/AuthenticatedRequest';

@Controller('verificacion-cuenta')
export class VerificacionCuentaController {
  constructor(
    private readonly verificacionCuentaService: VerificacionCuentaService,
  ) {}

  @Get()
  listadoUsuariosVerificacionPedientes(@Query() query: any) {
    return this.verificacionCuentaService.listadoUsuariosVerificacion(query);
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'cedula_frontal', maxCount: 1 },
        { name: 'cedula_reverso', maxCount: 1 },
      ],
      {
        limits: { fileSize: 2 * 1024 * 1024 }, // refuerzo Multer (por archivo)
      },
    ),
  )
  async actualizarUsuarioVerificacion(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
    @Body() updateVerificacionCuentaDto: UpdateVerificacionCuentaDto,
    @UploadedFiles()
    files: {
      cedula_frontal?: Express.Multer.File[];
      cedula_reverso?: Express.Multer.File[];
    },
  ) {
    const frontal = files.cedula_frontal?.[0];
    const reverso = files.cedula_reverso?.[0];
    validateImageOrThrow(frontal, {
      required: true,
      maxSizeMB: 2,
      requiredErrorMessage: 'Imagen del el frontal de la cédula requerido',
    });
    validateImageOrThrow(reverso, {
      required: true,
      maxSizeMB: 2,
      requiredErrorMessage: 'Imagen del el reverso de la cédula requerido',
    });

    await this.verificacionCuentaService.actualizarUsuarioVerificacion(
      id,
      updateVerificacionCuentaDto,
      files as ImagenesVerificacionCuenta
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
    const { url_verificacion } = await this.verificacionCuentaService.aprobarCuenta(body);
    return res.status(200).json({ message: 'Solicitud aprobada correctamente', url_verificacion });
  }
}
