import { DatabasePromiseService } from '@/database/database-promise.service';
import { Injectable } from '@nestjs/common';
import { VendedoresForQueryManyDto } from './dto/query-vededores-empresa.dto';

@Injectable()
export class VendedoresEmpresaService {
    constructor(
        private readonly dbPromiseService: DatabasePromiseService,
    ) {}

    async getVendedoresForQueryMany(query: VendedoresForQueryManyDto) {
        try {
            
        } catch (error) {
            throw error
        }
    }

}
