import { Controller, Get, Query } from '@nestjs/common';
import { UsersForQueryManyDto } from '../dto/usuarios-query.dto';
import { VendedoresForQueryManyDto } from './dto/query-vededores-empresa.dto';

@Controller('vendedores')
export class VendedoresController {

    @Get("query-many")
    async getVendedoresForQueryMany(@Query() query: VendedoresForQueryManyDto) {
        
    }
}
