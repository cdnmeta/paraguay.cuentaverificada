// src/database/database.service.ts
import { PRODUCCION } from '@/utils/constants';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, QueryResult,QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private pool: Pool;
  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const connectionString = `postgresql://${this.config.get('DB_USER')}:${this.config.get('DB_PASSWORD')}@${this.config.get('DB_HOST')}:${this.config.get('DB_PORT')}/${this.config.get('DB_NAME')}`;

    this.pool = new Pool({
      connectionString: connectionString,
      ssl: PRODUCCION ? { rejectUnauthorized: false } : undefined,
    });

    const { types } = require('pg');
    types.setTypeParser(20, (val: string) => parseInt(val)); // BIGINT a number
  }

  async query<T = any>(
    sql: string,
    params: any[] = [],
  ): Promise<QueryResult<QueryResultRow>> {
    const client = await this.pool.connect();
    try {
      return await client.query<QueryResultRow>(sql, params); // Retorna result completo
    } finally {
      client.release();
    }
  }
  async transaction<T>(callback: (client: import('pg').PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
