import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { RegistrarRecargaDto, RegistrarSolicitudRecargaDto } from './dto/registrar-movimiento.dto';
import { Prisma, PrismaClient, wallet } from '@prisma/client';
import { TipoMovimientoWallet } from './types/tipo-movimeinto';
import { FirebaseService } from '@/firebase/firebase.service';
import { FIREBASE_STORAGE_FOLDERS } from '@/firebase/constantsFirebase';
import { crearNombreArchivoDesdeMulterFile } from '@/utils/funciones';
import { EstadosMovimientoWallet } from './types/estados-mivimeintos-wallet';
import { RechazarMovimientoDto } from './dto/rechazar-movimiento.dto';

@Injectable()
export class WalletService {
    constructor(private readonly prismaService: PrismaService,
        private readonly firebaseService: FirebaseService
    ) {}


    
}
