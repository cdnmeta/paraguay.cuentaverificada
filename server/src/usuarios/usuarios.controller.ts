import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { SolicitudCuentaDto } from '../verificacion-cuenta/dto/solicitud-cuenta.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UsuariosService } from './usuarios.service';
import {
  ArchivosSolicitudCuenta,
  UsuariosArchivos,
} from './types/archivos-solicitud';
import { validateImageOrThrow } from '@/pipes/ImageValiationPipe';
import { Response } from 'express';
import { IsPublic } from '@/auth/decorators/public.decorator';
import { UserByQuery, UsersForQueryMany } from './types/usuarios-query';
import { UserResponseDto } from './dto/user-response.dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { AgregarGrupoUsuario, CrearUsuarioDTO } from './dto/register-usuarios';
import { AuthenticatedRequest } from '@/auth/types/AuthenticatedRequest';
import { OnlyAdminGuard } from '@/auth/guards/onlyAdmin.guard';
import { IsOnlyAdmin } from '@/auth/decorators/onlyAdmin.decorator';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('grupos')
  async getGruposByUsuarioSession(@Req() req: any) {
    try {
      const id_usuario = req.user.userId;
      const grupos = await this.usuariosService.getGruposByUsuario(id_usuario);
      return grupos;
    } catch (error) {
      throw error;
    }
  }

  @Get('grupos/:id_usuario')
  async getGruposByUsuarioId(
    @Param('id_usuario', ParseIntPipe) id_usuario: number,
  ) {
    try {
      const grupos = await this.usuariosService.getGruposByUsuario(id_usuario);
      return grupos;
    } catch (error) {
      throw error;
    }
  }

  @Post('agregar-grupo')
  async agregarUsuarioGrupo(
    @Body() body: AgregarGrupoUsuario,
    @Res() res: Response,
  ) {
    try {
      await this.usuariosService.agregarUsuarioGrupo(body);
      return res
        .status(200)
        .json({ message: 'Usuario agregado al grupo exitosamente' });
    } catch (error) {
      throw error;
    }
  }

  @Get('query-one')
  async getUserByQuery(@Query() query: UserByQuery) {
    try {
      if (Object.keys(query).length === 0) {
        throw new BadRequestException('No query parameters provided');
      }
      const user = await this.usuariosService.getUserByQuery(query);
      const userResponse = plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
      });
      return userResponse;
    } catch (error) {
      throw error;
    }
  }

  @Get('query-many')
  async getUserByQueryMany(@Query() query: UsersForQueryMany) {
    try {
      const users = await this.usuariosService.getUsersByQuery(query);
      return users;
    } catch (error) {
      throw error;
    }
  }

  @Post('asignar-grupos')
  async asignarGrupos(@Body() body: { id_usuario: number; grupos: number[] }) {
    try {
      await this.usuariosService.asignarGrupos(body);
      return { message: 'Grupos asignados exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  @Post('crear-usuario')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'cedula_frontal', maxCount: 1 },
      { name: 'cedula_reverso', maxCount: 1 },
      { name: 'selfie', maxCount: 1 },
    ]),
  )
  @IsOnlyAdmin()
  async crearUsuario(
    @Req() req: AuthenticatedRequest,
    @Body() body: CrearUsuarioDTO,
    @Res() res: Response,
    @UploadedFiles()
    files: {
      cedula_frontal: Express.Multer.File[];
      cedula_reverso: Express.Multer.File[];
      selfie: Express.Multer.File[];
    },
  ) {
    try {
      const frontal = files.cedula_frontal?.[0];
      const reverso = files.cedula_reverso?.[0];
      const selfie = files.selfie?.[0];
      validateImageOrThrow(frontal, {
        required: true,
        maxSizeMB: 2,
        requiredErrorMessage: 'Imagen de la cedula frontal es requerida',
      });
      validateImageOrThrow(reverso, {
        required: true,
        maxSizeMB: 2,
        requiredErrorMessage: 'Imagen de la cedula reverso es requerida',
      });
      validateImageOrThrow(selfie, {
        required: true,
        maxSizeMB: 2,
        requiredErrorMessage: 'Imagen de la selfie es requerida',
      });

      const filesUser:UsuariosArchivos = {
        cedulaFrente: frontal,
        cedulaReverso: reverso,
        selfie: selfie
      }
      body.id_usuario_registro = req.user.userId;
      const newUser = await this.usuariosService.crearUsuario(body, filesUser);
      return res.status(200).json({
        message: 'Usuario creado exitosamente',
      });
    } catch (error) {
      throw error;
    }
  }
}
