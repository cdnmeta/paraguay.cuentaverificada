import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service'; // ajusta la ruta según tu estructura de proyecto
import { encrypt } from './utils/security';
import { FirebaseService } from './firebase/firebase.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly db: DatabaseService, private firebaseService: FirebaseService, private configService: ConfigService) {}
  private readonly logger = new Logger(AppService.name);


  async onModuleInit() {
    if (this.configService.get<string>('SEED_SUPERADMIN_ON_BOOT') !== 'true') {
      this.logger.log('Seed de SUPER_ADMIN desactivado por SEED_SUPERADMIN_ON_BOOT=false');
      return;
    }

    const email = this.configService.get<string>('SUPERADMIN_EMAIL');
    const password = this.configService.get<string>('SUPERADMIN_PASSWORD');
    const nombre = this.configService.get<string>('SUPERADMIN_NOMBRE') ?? 'Super';
    const apellido = this.configService.get<string>('SUPERADMIN_APELLIDO') ?? 'Admin';
    const documento = this.configService.get<string>('SUPERADMIN_DOCUMENTO') ?? '12345678';

    if (!email || !password) {
      this.logger.warn('Faltan SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD');
      return;
    }

    let firebaseUserId = ""

    try {
      // 1) ¿Ya existe un superadmin activo?
      const existing = await this.db.query(
        `SELECT id FROM usuarios WHERE is_super_admin = true AND activo = true LIMIT 1`
      );

      if (existing.rowCount && existing.rowCount > 0) {
        this.logger.log('Ya existe un superusuario activo. No se insertará otro.');
        return;
      }

      // verificar si user ya existe
      const userExists = await this.db.query(
        `SELECT id FROM usuarios WHERE email = $1 or documento = $2 LIMIT 1`,
        [email, documento]
      );

      if (userExists.rowCount && userExists.rowCount > 0) {
        this.logger.error(`Ya existe un usuario con email ${email} o documento ${documento}. No se insertará otro.`);
        return;
      }

      const hash = await encrypt(password);
      
      // 2) Inserta en firebase primero
      const firebaseUser = await this.firebaseService.auth.createUser({
        email: email,
        emailVerified: true,
        password: password,
        displayName: `${nombre} ${apellido}`,
      });

      firebaseUserId = firebaseUser.uid;

      this.logger.log(`Usuario Firebase creado con UID: ${firebaseUser.uid}`);

      // 3) Inserta en la base de datos
      await this.db.query(
        `
        INSERT INTO usuarios (nombre, apellido, email, password, activo, estado, is_super_admin, documento, uid_firebase, fecha_creacion)
        VALUES ($1, $2, $3, $4, true, 1, true, $5, $6, NOW())
        `,
        [nombre, apellido, email, hash, documento, firebaseUser.uid]
      );

      this.logger.log(`Superusuario creado con email: ${email}`);
    } catch (err) {
      await this.firebaseService.auth.deleteUser(firebaseUserId)
      this.logger.error('Error creando superusuario:', err as any);
    }
  }
}
