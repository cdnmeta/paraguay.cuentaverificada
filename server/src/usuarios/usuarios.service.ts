import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SolicitudCuentaDto } from '../verificacion-cuenta/dto/solicitud-cuenta.dto';
import { crearNombreArchivoDesdeMulterFile } from '@/utils/funciones';
import { FIREBASE_STORAGE_FOLDERS } from '@/firebase/constantsFirebase';
import { FirebaseService } from '@/firebase/firebase.service';
import { ArchivosSolicitudCuenta } from './types/archivos-solicitud';
import { DatabaseService } from '@/database/database.service';
import { userInfoSql } from './sql/consultas';
import { AgregarGrupoUsuario, CrearUsuarioDTO, RegisterUsuariosDto } from './dto/register-usuarios';
import { encrypt, generarUUIDHASH } from '@/utils/security';
import { UserByQuery } from './types/usuarios-query';

interface UsuariosArchivos {
  cedulaFrente: Express.Multer.File;
  cedulaReverso: Express.Multer.File;
}

@Injectable()
export class UsuariosService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly firebaseService: FirebaseService,
    private readonly dbservice: DatabaseService,
  ) {}
  async getUserInfoJwt(id: number) {
    try {
      const user = await this.prismaService.usuarios.findFirst({
        select: {
          id: true,
          nombre: true,
          apellido: true,
          email: true,
          documento: true,
          is_super_admin: true,
        },
        where: { id: id },
      });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserinfo(id: number) {
    try {
      const userInfoSqlResult = await this.dbservice.query(userInfoSql, [id]);
      if (userInfoSqlResult.rowCount === 0) {
        throw new NotFoundException('Usuario no encontrado');
      }
      return userInfoSqlResult.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async getGruposByUsuario(id: number) {
    try {
      const userInfoSqlResult = await this.dbservice.query(userInfoSql, [id]);
      if (userInfoSqlResult.rowCount === 0) {
        throw new NotFoundException('Usuario no encontrado');
      }
      return userInfoSqlResult.rows[0];
    } catch (error) {
      throw error;
    }
  }

  

  async crearUsuario(dto: CrearUsuarioDTO, files?: UsuariosArchivos | any) {
    try {
      // verificar que el usuario no exista
      const userExists = await this.prismaService.usuarios.findFirst({
        where: {
          OR: [{ email: dto.correo }, { documento: dto.documento }],
        },
      });
      if (userExists) {
        throw new BadRequestException('El usuario ya existe');
      }

      // guardar ususario en firebase para autenticación

      const { cedulaFrente, cedulaReverso } = files || {};
      const firebaseUser = await this.firebaseService.createUser({
        email: dto.correo,
        password: dto.contrasena,
        displayName: `${dto.nombre} ${dto.apellido}`,
      });

      // guardar la cedula del ususarios

      const nombre_cedula_frontal =
        cedulaFrente && crearNombreArchivoDesdeMulterFile(cedulaFrente);
      const nombre_cedula_reverso =
        cedulaReverso && crearNombreArchivoDesdeMulterFile(cedulaReverso);
      let rutaArchivoFrontal: string | null = null;
      let rutaArchivoReverso: string | null = null;

      if (cedulaFrente) {
        const filePath = `${FIREBASE_STORAGE_FOLDERS.cedulasUsuarios}/${nombre_cedula_frontal}`;
        rutaArchivoFrontal = await this.firebaseService.subirArchivoPrivado(
          cedulaFrente.buffer,
          filePath,
          cedulaFrente.mimetype,
        );
      }

      if (cedulaReverso) {
        const filePath = `${FIREBASE_STORAGE_FOLDERS.cedulasUsuarios}/${nombre_cedula_reverso}`;
        rutaArchivoReverso = await this.firebaseService.subirArchivoPrivado(
          cedulaReverso.buffer,
          filePath,
          cedulaReverso.mimetype,
        );
      }

      // encriptar contraseña
      const contrasenaEncryptada = await encrypt(dto.contrasena);
      const pinHash = dto.pin ? await encrypt(dto.pin) : null;

      const newUser = await this.prismaService.usuarios.create({
        data: {
          nombre: dto.nombre,
          apellido: dto.apellido,
          documento: dto.documento,
          email: dto.correo,
          password: contrasenaEncryptada,
          uid_firebase: firebaseUser.uid,
          cedula_frente: rutaArchivoFrontal || dto.path_cedula_frontal,
          cedula_reverso: rutaArchivoReverso || dto.path_cedula_reverso,
          pin: pinHash,
        },
      });

      return newUser;
    } catch (error) {
      throw error;
    }
  }


  async getUserByQuery(query: UserByQuery) {
    const whereClause: any = {activo:true,is_super_admin:false};

    if (query.id) {
      whereClause.id = Number(query.id);
    }

    if (query.documento) {
      whereClause.documento = query.documento.trim();
    }

    if (query.email) {
      whereClause.email = query.email.trim();
    }

    const user = await this.prismaService.usuarios.findFirst({
      include: {
        usuarios_grupos: {
          select:{
            id_grupo:true
          }
        },
      },
      where: whereClause,
    });

    console.log(user)

    if (!user) throw new NotFoundException('Usuario no encontrado');
    

    return user;
  }

  async agregarUsuarioGrupo(body: AgregarGrupoUsuario) {
    try {
      const usuarioExiste = await this.prismaService.usuarios.findFirst({
        where: { id: body.id_usuario, activo: true },
      });

      if (!usuarioExiste) throw new NotFoundException('Usuario no encontrado');

      // verificar si ya esta asignado al grupo
      const grupoAsignado = await this.prismaService.usuarios_grupos.findFirst({
        where: { id_usuario: body.id_usuario, id_grupo: body.id_grupo },
      });

      if (grupoAsignado) throw new BadRequestException('Usuario ya está asignado a este grupo');

      const { id_usuario, id_grupo } = body;
      await this.prismaService.usuarios.update({
        where: { id: id_usuario },
        data: {
          usuarios_grupos: {
            create: { id_grupo },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }
}

