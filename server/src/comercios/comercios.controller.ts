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
  Query,
  Put,
  UploadedFiles,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { ComerciosService } from './comercios.service';
import {
  CreateComercioDto,
  CreateComercioPayloadDto,
} from './dto/create-comercio.dto';
import { UpdateComercioDto } from './dto/update-comercio.dto';
import {
  SolicitarVerificacionComercioDto,
  UpdateSeguimientoAprobacionComercioDto,
  UpdateSolicitudComercioDto,
} from './dto/solicitud-verficacion.dto';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { IsPublic } from '@/auth/decorators/public.decorator';
import { plainToInstance } from 'class-transformer';
import { ResponseComercioDto, ResponseComercioInfoPublic } from './dto/response-comercio.dto';
import {
  QueryForUsers,
  QueryManyComercios,
} from './dto/query-comercios-users.dto';
import { AuthenticatedRequest } from '@/auth/types/AuthenticatedRequest';
import { validateImageOrThrow } from '@/pipes/ImageValiationPipe';
import { FilesVerificacionComercio } from './types/archivos-comercios';
import { Response } from 'express';
import { FirebaseService } from '@/firebase/firebase.service';

@Controller('comercios')
export class ComerciosController {
  constructor(private readonly comerciosService: ComerciosService, private readonly firebaseService: FirebaseService) {}

  

  @Get('opciones-filtro')
  async getOpcionesFiltroComercios() {
    return this.comerciosService.getOpcionesFiltroComercios();
  }

  @IsPublic()
  @Get('buscar')
  async buscarComercios(@Query() query: any) {
    return this.comerciosService.buscarComercios(query);
  }

  @Get('aprobacion-pagos')
  async getComerciosAprovacionPagos() {
    return this.comerciosService.getComerciosAprovacionPagos();
  }

  @Get('query-many')
  async getComerciosByMany(@Query() query: QueryManyComercios) {
    try {
      return this.comerciosService.getComerciosByMany(query);
    } catch (error) {
      throw error;
    }
  }

  /*Rutas dinamicas*/

  @Get(':id')
  async findOneUser(@Req() req: any, @Param('id') id: string) {
    const comercio = await this.comerciosService.findOneUser(
      +id,
      req.user.userId,
    );
    const comercioResponse = plainToInstance(ResponseComercioDto, comercio, {
      excludeExtraneousValues: true,
    });
    console.log(comercioResponse);
    return comercioResponse;
  }

  @IsPublic()
  @Get('info/:slug')
  async findInfoBySlug(@Param('slug') slug: string,@Req() req:AuthenticatedRequest) {
    const authHeader = req.headers.authorization || '';
    let id_usuario = null;
    if(authHeader){
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const decodedToken = await this.firebaseService.verifyIdToken(token);
          console.log(decodedToken)
          id_usuario = decodedToken.userId;
        } catch (error) {
          // Token inválido, no hacemos nada y seguimos sin id_usuario
        }
      }
    }
    console.log("ip peticion",req.headers['x-forwarded-for']);
    const comercio = await this.comerciosService.findInfoBySlug(slug,id_usuario);
    console.log(comercio);
    if(comercio.estado !== 4) throw new NotFoundException('Comercio no encontrado');
    const comercioResponse = plainToInstance(ResponseComercioInfoPublic, comercio, {
      excludeExtraneousValues: true,
    });
    return comercioResponse;
  }

  @Get('user/:id')
  async findAllForUsers(
    @Param('id') id: string,
    @Query() query: QueryForUsers,
  ) {
    return this.comerciosService.findAllForUsers(+id, query);
  }

}
