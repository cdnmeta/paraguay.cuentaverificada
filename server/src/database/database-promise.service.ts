import { PRODUCCION } from '@/utils/constants';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as pgPromise from 'pg-promise';
import { IDatabase, IMain, ITask } from 'pg-promise';

type AnyParams = any[] | Record<string, any>;

@Injectable()
export class DatabasePromiseService implements OnModuleInit, OnModuleDestroy {
  private pgp!: IMain;
  private db!: IDatabase<any>;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.pgp = pgPromise({
      capSQL: true, // estandariza mayúsculas en SQL para logs
      // query: (e) => console.log('SQL:', e.query, 'PARAMS:', e.params), // opcional: logging
    });

    this.db = this.pgp({
      host: this.config.get<string>('DB_HOST'),
      port: Number(this.config.get('DB_PORT')),
      database: this.config.get<string>('DB_NAME'),
      user: this.config.get<string>('DB_USER'),
      password: this.config.get<string>('DB_PASSWORD'),
      ssl: PRODUCCION ? { rejectUnauthorized: false } : undefined,
    } as any);

    // Parsers útiles (BIGINT, NUMERIC → number)
    const { types } = require('pg');
    types.setTypeParser(20,   (v: string) => parseInt(v));     // BIGINT
    types.setTypeParser(1700, (v: string) => parseFloat(v));   // NUMERIC
  }

  async onModuleDestroy() {
    await this.pgp?.end?.();
  }

  // === Métodos idiomáticos de pg-promise ===

  /** 0..N filas */
  any<T = any>(sql: string, params?: AnyParams): Promise<T[]> {
    return this.db.any<T>(sql, params as any);
  }

  /** 1 fila exacta (lanza si 0 o >1) */
  one<T = any>(sql: string, params?: AnyParams): Promise<T> {
    return this.db.one<T>(sql, params as any);
  }

  /** 0..1 fila (null si no hay) */
  oneOrNone<T = any>(sql: string, params?: AnyParams): Promise<T | null> {
    return this.db.oneOrNone<T>(sql, params as any);
  }

  /**
   * Resultado extendido (rowCount, rows si usás RETURNING, etc.)
   * Útil para saber cuántas filas afectó un UPDATE/DELETE.
   */
  result(sql: string, params?: AnyParams) {
    return this.db.result(sql, params as any);
  }

  /** Contexto sin transacción (reúso de conexión) */
  task<T>(fn: (t: ITask<unknown>) => Promise<T>): Promise<T> {
    return this.db.task<T>(fn);
  }

  /** Transacción (BEGIN/COMMIT/ROLLBACK automáticos) */
  tx<T>(fn: (t: ITask<unknown>) => Promise<T>): Promise<T> {
    return this.db.tx<T>(fn);
  }

  // === Helpers opcionales de conveniencia ===

  /**
   * INSERT masivo/limpio con helpers.
   * Ej: insertMany('comercios', [{ruc:'1',estado:1},{...}], ['ruc','estado'])
   */
  insertMany<T extends Record<string, any>>(table: string, rows: T[], columns: (keyof T)[]) {
    const cs = new this.pgp.helpers.ColumnSet(columns as string[], { table });
    const query = this.pgp.helpers.insert(rows, cs);
    return this.result(query);
  }

  /**
   * UPDATE masivo por columnas y condición WHERE usando helpers.
   * Ej: updateMany('comercios', rows, ['estado'], 'id')
   */
  updateMany<T extends Record<string, any>>(table: string, rows: T[], columnsToUpdate: (keyof T)[], whereColumn: keyof T) {
    const cs = new this.pgp.helpers.ColumnSet(
      [...(columnsToUpdate as string[]), { name: whereColumn as string, cnd: true }],
      { table }
    );
    const query = this.pgp.helpers.update(rows, cs) + ' WHERE v.' + (whereColumn as string) + ' = t.' + (whereColumn as string);
    return this.result(query);
  }
}
