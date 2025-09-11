// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import {  PrismaClient,Prisma } from '@prisma/client'; // Adjust the import path based on your project structure

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Ejecuta una función en el contexto de una transacción si se provee `tx`.
   * Si no, crea una transacción propia.
   */
  async runInTransaction<T>(
    tx: Prisma.TransactionClient | undefined,
    fn: (client: Prisma.TransactionClient) => Promise<T>
  ): Promise<T> {
    return tx ? fn(tx) : this.$transaction(fn);
  }
}