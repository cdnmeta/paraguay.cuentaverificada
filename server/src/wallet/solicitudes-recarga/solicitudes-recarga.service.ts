import { PrismaService } from '@/prisma/prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RegistrarSolicitudRecargaDto, ReHabilitarSolicitudRecargaDto } from '@/wallet/dto/registrar-movimiento.dto';
import { wallet } from '@prisma/client';
import { TipoMovimientoWallet } from '@/wallet/types/tipo-movimeinto';
import { FirebaseService } from '@/firebase/firebase.service';
import { FIREBASE_STORAGE_FOLDERS } from '@/firebase/constantsFirebase';
import { crearNombreArchivoDesdeMulterFile } from '@/utils/funciones';
import { EstadosMovimientoWallet } from '@/wallet/types/estados-mivimeintos-wallet';
import { RechazarMovimientoDto } from '@/wallet/dto/rechazar-movimiento.dto';
import { VerificacionSolicitudRecargaDto } from '../dto/verificacion-solicitud-recarga';
@Injectable()
export class SolicitudesRecargaService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async registrarSolicitudRecarga(
    data: RegistrarSolicitudRecargaDto,
    comprobantePago: Express.Multer.File,
  ) {
    let rutaFirebase: string | null = null;
    let idMovimientoCreado: number | null = null;
    try {
      // crear firebase path

      const nombreArchivo = crearNombreArchivoDesdeMulterFile(comprobantePago);
      const pathArchivo = `${FIREBASE_STORAGE_FOLDERS.comprobantes}/${nombreArchivo}`;

      // subir el archivo a firebase
      rutaFirebase = await this.firebaseService.subirArchivoPrivado(
        comprobantePago.buffer,
        pathArchivo,
        comprobantePago.mimetype,
      );

      const solicitudNueva = await this.prismaService.$transaction(
        async (tx) => {
          let wallet: wallet | null = null;
          wallet = await tx.wallet.findFirst({
            where: {
              id_usuario: data.id_usuario,
              id_moneda: data.id_moneda,
              activo: true,
              id_estado: 1, // estado activo
            },
          });
          // sino existe la wallet, crearla
          if (!wallet) {
            wallet = await tx.wallet.create({
              data: {
                id_usuario: data.id_usuario,
                id_moneda: data.id_moneda,
                activo: true,
                id_estado: 1, // estado activo
                fecha_creacion: new Date(),
              },
            });
          }
          // crear la solicitud de recarga
          const solicitudCreada = await tx.wallet_movimientos.create({
            data: {
              id_wallet: wallet.id,
              id_tipo_movimiento: TipoMovimientoWallet.RECARGA,
              id_estado: 1, // pendiente
              activo: true,
              fecha_creacion: new Date(),
              url_imagen: rutaFirebase,
              observacion: data.descripcion || null,
            },
          });
          return solicitudCreada;
        },
      );
    } catch (error) {
      if (rutaFirebase) {
        // eliminar el archivo subido en firebase en caso de error
        await this.firebaseService.eliminarArchivo(rutaFirebase);
      }
      throw error;
    }
  }

  async rechazarSolicitudRecarga(
    idMovimiento: number,
    data: RechazarMovimientoDto,
  ) {
    try {
      const movExistente =
        await this.prismaService.wallet_movimientos.findFirst({
          where: {
            id: idMovimiento,
            activo: true,
          },
        });

      if (!movExistente)
        throw new NotFoundException('Movimiento no encontrado');

      if (
        movExistente.id_estado !==
        EstadosMovimientoWallet.PENDIENTE_VERIFICACION
      ) {
        throw new BadRequestException(
          'Solo se pueden rechazar movimientos pendientes',
        );
      }

      await this.prismaService.wallet_movimientos.update({
        where: {
          id: idMovimiento,
        },
        data: {
          id_estado: EstadosMovimientoWallet.RECHAZADO, // estado rechazado
          observacion: data.motivo_rechazo,
          id_usuario_rechazo: data.id_usuario_rechazo,
          fecha_actualizacion: new Date(),
          fecha_rechazo: new Date(),
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async aprobarSolicitudRecarga(
    idMovimiento: number,
    data: VerificacionSolicitudRecargaDto,
  ) {
    try {
      const movExistente =
        await this.prismaService.wallet_movimientos.findFirst({
          where: {
            id: idMovimiento,
            activo: true,
          },
        });
      if (!movExistente)
        throw new NotFoundException('Movimiento no encontrado');

      if (
        movExistente.id_estado !==
        EstadosMovimientoWallet.PENDIENTE_VERIFICACION
      ) {
        throw new BadRequestException(
          'Solo se pueden aprobar movimientos pendientes',
        );
      }
      await this.prismaService.$transaction(async (tx) => {
        // actualizar el movimiento
        await tx.wallet_movimientos.update({
          where: {
            id: idMovimiento,
          },
          data: {
            id_estado: EstadosMovimientoWallet.VERIFICADO, // estado verificado
            id_usuario_verificador: data.id_usuario_verificador,
            fecha_actualizacion: new Date(),
            fecha_verificacion: new Date(),
            monto: data.monto,
          },
        });
        // actualizar saldo de la wallet
        await tx.wallet.update({
          where: {
            id: movExistente.id_wallet,
          },
          data: {
            saldo: {
              increment: data.monto ?? 0,
            },
          },
        });
      });
    } catch (error) {
      throw error;
    }
  }


  /*usuario re habilota su movimineto de recarga*/ 
  async reHabilitarSolicitudRecarga(idMovimiento: number, data:ReHabilitarSolicitudRecargaDto ,comprobantePago: Express.Multer.File,) {
    try {
        const movimientoExistente = await this.prismaService.wallet_movimientos.findFirst({
            where: {
                id: idMovimiento,
                activo: true,
                id_estado: EstadosMovimientoWallet.RECHAZADO,
            }
        })

        const walletUsuario = await this.prismaService.wallet.findFirst({
            where: {
                id_usuario: movimientoExistente?.id_wallet,
                activo: true,
            }
        });

        if(!walletUsuario)  throw new NotFoundException('Wallet del usuario no encontrada');

        if(walletUsuario.id_usuario !== data.id_usuario_rehabilitacion)  throw new ForbiddenException('No tiene permisos para re habilitar este movimiento');

        if(!movimientoExistente)  throw new NotFoundException('Movimiento no encontrado');

        // crear firebase path
        const pathArchivo = movimientoExistente.url_imagen;

        // subir el archivo a firebase
        const rutaFirebase = await this.firebaseService.subirArchivoPrivado(
            comprobantePago.buffer,
            pathArchivo!,
            comprobantePago.mimetype,
        );
        await this.prismaService.wallet_movimientos.update({
            where: {
                id: idMovimiento,
            },
            data:{
                id_estado: EstadosMovimientoWallet.PENDIENTE_VERIFICACION,
                fecha_actualizacion: new Date(),
                observacion: data.descripcion || null,
                url_imagen: rutaFirebase
            }
        })

    } catch (error) {
        throw error;
    }
  }

}
