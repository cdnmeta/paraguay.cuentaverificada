import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SolicitudCuentaDto } from './dto/solicitud-cuenta.dto';
import { crearNombreArchivoDesdeMulterFile } from '@/utils/funciones';
import { FIREBASE_STORAGE_FOLDERS } from '@/firebase/constantsFirebase';
import { FirebaseService } from '@/firebase/firebase.service';
import { ArchivosSolicitudCuenta } from './types/archivos-solicitud';
import { DatabaseService } from '@/database/database.service';
import { userInfoSql } from './sql/consultas';



@Injectable()
export class UsuariosService {
  constructor(private readonly prismaService: PrismaService, private readonly firebaseService: FirebaseService, private readonly dbservice: DatabaseService) {}
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

  async registrarSolicitudCuenta(dto: SolicitudCuentaDto) {
    try {
      const userExisteCorreo = await this.prismaService.usuarios_solicitudes_cuenta.findFirst({
        where: {
          OR: [{ correo: dto.correo }, { documento: dto.documento }],
        },
      });

      if (userExisteCorreo) {
        throw new BadRequestException('El usuario ya existe');
      }
      // guardar cedula en firebase
      const userSolicitud = await this.prismaService.usuarios_solicitudes_cuenta.create({
        data: {
          nombre: dto.nombre,
          apellido: dto.apellido,
          correo: dto.correo,
          dial_code: dto.dial_code,
          telefono: dto.telefono,
          documento: dto.documento,
        },
      });
      return userSolicitud;
    } catch (error) {
      throw error;
    }
  }
}
