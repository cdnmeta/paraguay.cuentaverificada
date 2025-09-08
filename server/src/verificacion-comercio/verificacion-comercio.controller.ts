import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Put,
  UploadedFiles,
  Res,
  Query,
} from '@nestjs/common';
import {
  RechazarComercioDto,
  RechazoSolicitudComercioDto,
  SolicitarVerificacionComercioDto,
  UpdateSeguimientoAprobacionComercioDto,
  UpdateSolicitudComercioDto,
  UpdateVerificarInformacionDto,
  VerificarComercioDto,
  VerificarInformacionDto,
} from './dto/solicitud-verficacion.dto';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { IsPublic } from '@/auth/decorators/public.decorator';
import { plainToInstance } from 'class-transformer';
import { ResponseComercioDto } from './dto/response-comercio.dto';
import { VerificacionComercioService } from './verificacion-comercio.service';
import {
  ParseFilesPipe,
  validateImageOrThrow,
} from '@/pipes/ImageValiationPipe';
import { Response } from 'express';
import { QueryComercios } from './types/query-comercios';
@Controller('verificacion-comercio')
export class VerificacionComercioController {
  constructor(
    private readonly verificacionComercioService: VerificacionComercioService,
  ) {}

  @Post('solicitar-verificacion')
  @UseInterceptors(FileInterceptor('comprobantePago'))
  async solicitarVerificacion(
    @Req() request,
    @Body() solicitarVerificacionComercioDto: SolicitarVerificacionComercioDto,
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
      }),
    )
    comprobantePago: Express.Multer.File,
  ) {
    try {
      // Aquí puedes agregar lógica adicional si es necesario
      const id_usuario = request.user.userId;

      const dataEnviar = {
        ...solicitarVerificacionComercioDto,
        id_usuario: id_usuario,
        id_usuario_creacion: id_usuario,
      };
      const archivosProcesar = {
        comprobantePago: comprobantePago,
      };

      const comercio_creado =
        await this.verificacionComercioService.solicitarVerificacion(
          dataEnviar,
          archivosProcesar,
        );
      console.log(comercio_creado);
      const comercioResponse = plainToInstance(
        ResponseComercioDto,
        comercio_creado,
      );
      return comercioResponse;
    } catch (error) {
      console.error('Error al solicitar verificación:', error);
      throw error;
    }
  }

  @Post('rechazo-pago-verificacion')
  async rechazarPagoVerificacion(
    @Req() request: any,
    @Body() rechazoPagoVerificacionDto: RechazoSolicitudComercioDto,
  ) {
    try {
      const { motivo, id_comercio } = rechazoPagoVerificacionDto;
      rechazoPagoVerificacionDto.id_usuario_seguimiento = request.user.userId;

      const resultado =
        await this.verificacionComercioService.rechazarPagoDeSolicitud(
          rechazoPagoVerificacionDto,
        );

      return resultado;
    } catch (error) {
      console.error('Error al rechazar pago de verificación:', error);
      throw error;
    }
  }

  @Put('solicitar-verificacion/:id')
  @UseInterceptors(FileInterceptor('comprobantePago'))
  async updateSolicitudVerificacion(
    @Param('id') id: string,
    @Req() request,
    @Body() updateSolicitudComercioDto: UpdateSolicitudComercioDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 2 * 1024 * 1024,
            message: 'El archivo es demasiado grande. Máximo 2MB.',
          }), // 2MB
          new FileTypeValidator({ fileType: 'image/(jpeg|png|jpg)' }), // acepta JPG, PNG, JPG
        ],
        fileIsRequired: false, // opcional, true por defecto
      }),
    )
    comprobantePago: Express.Multer.File,
  ) {
    try {
      const dataEnviar = {
        ...updateSolicitudComercioDto,
        id_usuario_actualizacion: request.user.userId,
      };
      const archivosProcesar = {
        comprobantePago: comprobantePago,
      };

      const comercio_actualizado =
        await this.verificacionComercioService.updateSolicitudVerificacion(
          +id,
          dataEnviar,
          archivosProcesar,
        );
      const comercioResponse = plainToInstance(
        ResponseComercioDto,
        comercio_actualizado,
      );
      return comercioResponse;
    } catch (error) {
      console.error('Error al actualizar solicitud de verificación:', error);
      throw error;
    }
  }

  @Post('verificar-informacion')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'foto_interior', maxCount: 1 },
        { name: 'foto_exterior', maxCount: 1 },
        { name: 'cedula_frontal', maxCount: 1 },
        { name: 'cedula_reverso', maxCount: 1 },
        { name: 'imagen_factura_servicio', maxCount: 1 },
      ],
      {
        limits: { fileSize: 2 * 1024 * 1024 }, // refuerzo Multer (por archivo)
      },
    ),
  )
  async verificarInformacion(
    @Req() req: any,
    @Res() res: Response,
    @Body() verificarInformacionDto: VerificarInformacionDto,
    @UploadedFiles()
    files: {
      foto_interior?: Express.Multer.File[];
      foto_exterior?: Express.Multer.File[];
      cedula_frontal?: Express.Multer.File[];
      cedula_reverso?: Express.Multer.File[];
      imagen_factura_servicio?: Express.Multer.File[];
    },
  ) {
    const interior = files.foto_interior?.[0];
    const exterior = files.foto_exterior?.[0];
    const frontal = files.cedula_frontal?.[0];
    const reverso = files.cedula_reverso?.[0];
    const factura = files.imagen_factura_servicio?.[0];

    validateImageOrThrow(interior, {
      required: true,
      maxSizeMB: 2,
      requiredErrorMessage: 'Imagen del el interior del local requerido',
    });
    validateImageOrThrow(exterior, {
      required: true,
      maxSizeMB: 2,
      requiredErrorMessage: 'Imagen del el exterior del local requerido',
    });
    validateImageOrThrow(frontal, {
      required: true,
      maxSizeMB: 2,
      requiredErrorMessage: 'Imagen de la cédula frontal requerida',
    });
    validateImageOrThrow(reverso, {
      required: true,
      maxSizeMB: 2,
      requiredErrorMessage: 'Imagen de la cédula reverso requerida',
    });
    validateImageOrThrow(factura, {
      required: true,
      maxSizeMB: 2,
      requiredErrorMessage: 'Imagen de la factura de servicio requerida',
    });

    // All files are validated as present, so we can safely assert their types
    const archivosinfo = {
      foto_interior: interior as Express.Multer.File,
      foto_exterior: exterior as Express.Multer.File,
      cedula_frontal: frontal as Express.Multer.File,
      cedula_reverso: reverso as Express.Multer.File,
      imagen_factura_servicio: factura as Express.Multer.File,
    };
    const id_usuario = req.user.userId;
    await this.verificacionComercioService.registrarInfoVerificacion(
      archivosinfo,
      id_usuario,
      verificarInformacionDto,
    );
    return res
      .status(200)
      .json({ message: 'Información enviada correctamente' });
  }

  @Get('listado-comercios-aprobar')
  async getComerciosAprobar(@Res() res: Response,@Query() query: QueryComercios) {
    try {

      const comercios =
        await this.verificacionComercioService.getComerciosAprobar(query);
      return res.status(200).json(comercios);
    } catch (error) {
      console.error('Error al obtener listado de comercios a aprobar:', error);
      throw error;
    }
  }

  @Post('rechazar-comercio')
  async rechazarComercio(
    @Req() req: any,
    @Body() rechazarComercioDto: RechazarComercioDto,
    @Res() res: Response,
  ) {
    try {
      const id_usuario = req.user.userId;
      rechazarComercioDto.id_usuario_seguimiento = id_usuario;
      await this.verificacionComercioService.rechazarComercio(
        rechazarComercioDto,
      );
      return res
        .status(200)
        .json({ message: 'Comercio rechazado correctamente' });
    } catch (error) {
      console.error('Error al rechazar comercio:', error);
      throw error;
    }
  }

  @Put('verificar-informacion/:id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'foto_interior', maxCount: 1 },
        { name: 'foto_exterior', maxCount: 1 },
        { name: 'cedula_frontal', maxCount: 1 },
        { name: 'cedula_reverso', maxCount: 1 },
        { name: 'imagen_factura_servicio', maxCount: 1 },
      ],
      {
        limits: { fileSize: 2 * 1024 * 1024 }, // refuerzo Multer (por archivo)
      },
    ),
  )
  async actualizarComercio(
    @Req() req: any,
    @Body() actualizarComercioDto: UpdateVerificarInformacionDto,
    @Res() res: Response,
    @Param('id') id: string,
    @UploadedFiles()
    files: {
      foto_interior?: Express.Multer.File[] | undefined;
      foto_exterior?: Express.Multer.File[] | undefined;
      cedula_frontal?: Express.Multer.File[] | undefined;
      cedula_reverso?: Express.Multer.File[] | undefined;
      imagen_factura_servicio?: Express.Multer.File[] | undefined;
    },
  ) {
    try {
      const interior = files.foto_interior?.[0];
      const exterior = files.foto_exterior?.[0];
      const frontal = files.cedula_frontal?.[0];
      const reverso = files.cedula_reverso?.[0];
      const factura = files.imagen_factura_servicio?.[0];
      // All files are validated as present, so we can safely assert their types
      const archivosinfo = {
        foto_interior: interior as Express.Multer.File,
        foto_exterior: exterior as Express.Multer.File,
        cedula_frontal: frontal as Express.Multer.File,
        cedula_reverso: reverso as Express.Multer.File,
        imagen_factura_servicio: factura as Express.Multer.File,
      };
      const id_usuario = req.user.userId;
      await this.verificacionComercioService.actualizarlaInfoVerificacion(
        +id,
        archivosinfo,
        id_usuario,
        actualizarComercioDto,
      );
      return res
        .status(200)
        .json({ message: 'Comercio actualizado correctamente' });
    } catch (error) {
      console.error('Error al actualizar comercio:', error);
      throw error;
    }
  }

  @Post('verificar-comercio')
  async verificarComercio(
    @Req() req: any,
    @Body() verificarComercioDto: VerificarComercioDto,
    @Res() res: Response,
  ) {
    try {
      const id_usuario = req.user.userId;
      verificarComercioDto.id_usuario_seguimiento = id_usuario;
      await this.verificacionComercioService.verificarComercio(
        verificarComercioDto,
      );
      return res
        .status(200)
        .json({ message: 'Comercio verificado correctamente' });
    } catch (error) {
      console.error('Error al verificar comercio:', error);
      throw error;
    }
  }
}
