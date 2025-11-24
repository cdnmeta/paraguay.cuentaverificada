/*
  Seed Super Admin from .env
  - Reads env: SEED_SUPERADMIN_ON_BOOT, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD, SUPERADMIN_NAME, SUPERADMIN_DOCUMENTO
  - Creates/synchronizes user in Firebase and Postgres (usuarios)
  - Usage:
    npm run seed:superadmin           # respects SEED_SUPERADMIN_ON_BOOT=true
    npm run seed:superadmin:force     # ignores SEED_SUPERADMIN_ON_BOOT
*/

import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { FirebaseService } from '../src/firebase/firebase.service';
import { encrypt } from '../src/utils/security';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

function splitName(fullName: string | undefined): { nombre: string; apellido: string | null } {
  const name = (fullName || '').trim();
  if (!name) return { nombre: 'Admin', apellido: null };
  const parts = name.split(/\s+/);
  if (parts.length === 1) return { nombre: parts[0], apellido: null };
  const nombre = parts[0];
  const apellido = parts.slice(1).join(' ');
  return { nombre, apellido };
}

async function main() {
  const force = process.argv.includes('--force');

  // Crear contexto para usar el logger de la app (Winston)
  const app = await NestFactory.createApplicationContext(AppModule, { bufferLogs: true });
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  const allowByEnv = String(process.env.SEED_SUPERADMIN_ON_BOOT || '').toLowerCase() === 'true';

  if (!force && !allowByEnv) {
    logger.log('[seed-superadmin] SEED_SUPERADMIN_ON_BOOT != true. Usa --force para forzar.');
    await app.close();
    return;
  }

  const email = process.env.SUPERADMIN_EMAIL?.trim();
  const password = process.env.SUPERADMIN_PASSWORD?.trim();
  const fullName = process.env.SUPERADMIN_NAME?.trim();
  const documento = process.env.SUPERADMIN_DOCUMENTO?.trim();

  if (!email || !password || !fullName || !documento) {
    logger.error('[seed-superadmin] Faltan variables de entorno: SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD, SUPERADMIN_NAME, SUPERADMIN_DOCUMENTO');
    await app.close();
    process.exitCode = 1;
    return;
  }

  const { nombre, apellido } = splitName(fullName);

  const prisma = app.get(PrismaService);
  const firebase = app.get(FirebaseService);

  try {
    // Find existing user by email or documento
    const existing = await prisma.usuarios.findFirst({
      where: { OR: [{ email }, { documento }] },
    });

    // Ensure Firebase user exists (create if needed)
    

      // Crear usuario nuevo dentro de transacción
      const encryptedPassword = await encrypt(password);
      await prisma.$transaction(async (tx) => {
        await tx.usuarios.create({
          data: {
            nombre,
            apellido,
            documento,
            email,
            password: encryptedPassword,
            is_super_admin: true,
            activo: true,
            verificado: true,
            estado:4 // Verificado
          },
        });
      });
      logger.log('[seed-superadmin] Super admin creado en la base de datos.');
    

    logger.log('[seed-superadmin] Listo.');
  } catch (error) {
    const appLogger = app.get(WINSTON_MODULE_NEST_PROVIDER);
    appLogger.error('[seed-superadmin] Error:', error);
    process.exitCode = 1;
  } finally {
    // cleanup
    try { await prisma.$disconnect(); } catch {}
    await app.close();
  }
}

main();
