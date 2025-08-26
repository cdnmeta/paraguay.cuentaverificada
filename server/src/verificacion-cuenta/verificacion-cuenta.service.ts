import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateVerificacionCuentaDto } from './dto/create-verificacion-cuenta.dto';
import { AprobarCuenta, RechazoCuentaDto, UpdateVerificacionCuentaDto } from './dto/update-verificacion-cuenta.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { ImagenesVerificacionCuenta } from './types/imagenes-verificacion';
import { crearNombreArchivoDesdeMulterFile } from '@/utils/funciones';
import * as path from 'path';
import { FirebaseService } from '@/firebase/firebase.service';
import { FIREBASE_STORAGE_FOLDERS } from '@/firebase/constantsFirebase';
import { AuthService } from '@/auth/auth.service';
@Injectable()
export class VerificacionCuentaService {
  constructor(
    private prismaService: PrismaService,
    private firebaseService: FirebaseService,
    private authService: AuthService
  ) {}

  async listadoUsuariosVerificacion(query: any) {
    try {
      const clasulaWhere = {
        id_estado: 1,
      };

      if (query.estado) {
        clasulaWhere.id_estado = Number(query.estado);
      }
      const usuarios =
        await this.prismaService.usuarios_solicitudes_cuenta.findMany({
          select: {
            id: true,
            correo: true,
            nombre: true,
            id_estado: true,
            apellido: true,
            dial_code: true,
            telefono: true,
            documento: true,
          },
          where: clasulaWhere,
        });
      return usuarios;
    } catch (error) {
      throw error;
    }
  }

  async actualizarUsuarioVerificacion(
    id: number,
    updateVerificacionCuentaDto: UpdateVerificacionCuentaDto,
    files: ImagenesVerificacionCuenta,
  ) {
    try {
      // guardar las cedulas en firebase
      const user =
        await this.prismaService.usuarios_solicitudes_cuenta.findFirst({
          where: {
            id: id,
          },
        });

      if (!user) throw new NotFoundException('Usuario no encontrado');

      const nombre_cedula_frontal = user?.cedula_frontal
        ? path.basename(user?.cedula_frontal)
        : crearNombreArchivoDesdeMulterFile(files.cedula_frontal[0]);
      const nombre_cedula_reverso = user?.cedula_reverso
        ? path.basename(user?.cedula_reverso)
        : crearNombreArchivoDesdeMulterFile(files.cedula_reverso[0]);

      let url_cedula_frontal = `${FIREBASE_STORAGE_FOLDERS.cedulasUsuarios}/${nombre_cedula_frontal}`;
      let url_cedula_reverso = `${FIREBASE_STORAGE_FOLDERS.cedulasUsuarios}/${nombre_cedula_reverso}`;

      if (files.cedula_frontal[0]) {
        await this.firebaseService.subirArchivoPrivado(
          files.cedula_frontal[0].buffer,
          url_cedula_frontal,
          files.cedula_frontal[0].mimetype
        );
      }

      if (files.cedula_reverso[0]) {
        await this.firebaseService.subirArchivoPrivado(
          files.cedula_reverso[0].buffer,
          url_cedula_reverso,
          files.cedula_reverso[0].mimetype
        );
      }

      await this.prismaService.usuarios_solicitudes_cuenta.update({
        where: {
          id: id,
        },
        data: {
          ...updateVerificacionCuentaDto,
          cedula_frontal: url_cedula_frontal,
          cedula_reverso: url_cedula_reverso,
          id_usuario_actualizacion: updateVerificacionCuentaDto.id_usuario_actualizacion,
          fecha_actualizacion: new Date(),
          id_estado:2 // colocar en pendiente
        },
      });

    } catch (error) {
      throw error;
    }
  }


  async rechazarCuenta(dto: RechazoCuentaDto) {
    try {
      const id_estado_asignar = 4
      const cuenta =
        await this.prismaService.usuarios_solicitudes_cuenta.findFirst({
          where: {
            id: dto.id_usuario_rechazo,
          },
        });

      if (!cuenta) throw new NotFoundException('Cuenta no encontrada');

      if(cuenta.id_estado === id_estado_asignar) throw new BadRequestException('La cuenta ya se encuentra en estado rechazado');

      await this.prismaService.usuarios_solicitudes_cuenta.update({
        where: {
          id: dto.id_usuario_rechazo,
        },
        data: {
          id_estado: 4, // estado 4 es "rechazado"
          observacion: dto.motivo,
          id_usuario_actualizacion: dto.id_usuario_actualizacion,
          fecha_actualizacion: new Date(),
        },
      });


    } catch (error) {
      throw error;
    }
  }

  async aprobarCuenta(dto: AprobarCuenta, opciones?: any) {
    try {
      const { crear_token = false } = opciones || {};
      const id_estado_asignar = 3;
      const cuenta_aprobar_solicitud =
        await this.prismaService.usuarios_solicitudes_cuenta.findFirst({
          where: {
            id: dto.id_usuario_aprobacion,
            id_estado: 2, // estado 2 es "pendiente"
          },
        });

      if (!cuenta_aprobar_solicitud) throw new NotFoundException('Solicitud no encontrada');

      if (cuenta_aprobar_solicitud.id_estado === id_estado_asignar) throw new BadRequestException('La cuenta ya se encuentra en estado aprobado');

      // Actualizar el estado de la solicitud a aprobado
      await this.prismaService.usuarios_solicitudes_cuenta.update({
        where: {
          id: dto.id_usuario_aprobacion,
        },
        data: {
          id_estado: id_estado_asignar, // estado 3 es "aprobado"
          id_usuario_actualizacion: dto.id_usuario_actualizacion,
          fecha_actualizacion: new Date(),
        },
      });

      // registrar en usuarios los datos de la cuenta aprobada
     const usuario_creado = await this.prismaService.usuarios.create({
        data: {
          nombre: cuenta_aprobar_solicitud.nombre,
          apellido: cuenta_aprobar_solicitud.apellido,
          email: cuenta_aprobar_solicitud.correo,
          documento: cuenta_aprobar_solicitud.documento,
          cedula_frente: cuenta_aprobar_solicitud.cedula_frontal,
          cedula_reverso: cuenta_aprobar_solicitud.cedula_reverso,
          telefono: cuenta_aprobar_solicitud.telefono,
          dial_code: cuenta_aprobar_solicitud.dial_code,
        },
      });

      if (crear_token) {
        const {url_verificacion} = await this.authService.generarTokenForUser(usuario_creado.id);
        return { cuenta: cuenta_aprobar_solicitud, url_verificacion };
      }

      return { cuenta: cuenta_aprobar_solicitud };
    } catch (error) {
      throw error;
    }
  }
}