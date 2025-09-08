import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { DatabasePromiseService } from './database-promise.service';

@Module({
  providers: [DatabaseService, DatabasePromiseService],
  exports: [DatabaseService, DatabasePromiseService],
})
export class DatabaseModule {}
