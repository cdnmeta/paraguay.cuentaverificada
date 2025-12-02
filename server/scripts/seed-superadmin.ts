/*
  Seed Super Admin from .env
  - Reads env: SEED_SUPERADMIN_ON_BOOT, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD, SUPERADMIN_NAME, SUPERADMIN_DOCUMENTO
  - Creates user in Postgres (usuarios) and their wallet
  - Usage:
    npm run seed:superadmin           # respects SEED_SUPERADMIN_ON_BOOT=true
    npm run seed:superadmin:force     # ignores SEED_SUPERADMIN_ON_BOOT
*/

import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { encrypt } from '../src/utils/security';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { EstadosUsuarios } from '@/usuarios/types/EstadosUsuarios';
import { WalletService } from '@/wallet/wallet.service';

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
  const walletService = app.get(WalletService);

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

  try {
    // Verificar configuración de empresa primero
    const config = await prisma.empresa_config.findFirst();
    if (!config) {
      throw new Error('No se encontró la configuración de la empresa (empresa_config)');
    }
    if (!config.id_moneda_wallet) {
      throw new Error('La configuración de empresa no tiene id_moneda_wallet configurado');
    }

    // Buscar usuario existente por email o documento
    const existing = await prisma.usuarios.findFirst({
      where: { OR: [{ email }, { documento }] },
    });

    if (existing) {
      logger.log(`[seed-superadmin] Usuario ya existe con ID: ${existing.id}`);
      
      // Asegurar que sea super admin
      if (!existing.is_super_admin) {
        await prisma.usuarios.update({
          where: { id: existing.id },
          data: { is_super_admin: true }
        });
        logger.log('[seed-superadmin] Usuario actualizado como super admin.');
      }
      
      // Verificar si ya tiene wallet
      const existingWallet = await prisma.wallet.findFirst({
        where: { id_usuario: existing.id }
      });
      
      if (!existingWallet) {
        await walletService.crearWalletParaUsuario({
          id_moneda: config.id_moneda_wallet!,
          id_usuario: existing.id,
        });
        logger.log('[seed-superadmin] Wallet creado para usuario existente.');
      } else {
        logger.log('[seed-superadmin] Usuario ya tiene wallet asignado.');
      }
    } else {
      // Crear usuario nuevo dentro de transacción
      logger.log('[seed-superadmin] Creando nuevo super admin...');
      const encryptedPassword = await encrypt(password);
      
      await prisma.$transaction(async (tx) => {
        const userNew = await tx.usuarios.create({
          data: {
            nombre,
            apellido,
            documento,
            email,
            password: encryptedPassword,
            is_super_admin: true,
            activo: true,
            verificado: true,
            estado: EstadosUsuarios.ACTIVO
          },
        });
        
        await walletService.crearWalletParaUsuario({
          id_moneda: config.id_moneda_wallet!,
          id_usuario: userNew.id,
        });
        
        logger.log(`[seed-superadmin] Super admin creado con ID: ${userNew.id}`);
      });
      
      logger.log('[seed-superadmin] Super admin y wallet creados exitosamente.');
    }

    logger.log('[seed-superadmin] Proceso completado exitosamente.');
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
