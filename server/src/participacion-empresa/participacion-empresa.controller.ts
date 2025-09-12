import { Controller, Get, Param, ParseIntPipe, Req } from '@nestjs/common';
import { ParticipacionEmpresaService } from './participacion-empresa.service';
import { plainToClass } from 'class-transformer';
import { ResponsePrecioMetaDto } from './dto/response-precio-meta.dto';
import { IsPublic } from '@/auth/decorators/public.decorator';
import { AuthenticatedRequest } from '@/auth/types/AuthenticatedRequest';

@Controller('participacion-empresa')
export class ParticipacionEmpresaController {
  constructor(private readonly participacionEmpresaService: ParticipacionEmpresaService) {}
  
  @Get('consultar-precio')
  async getPrecioMeta() {
    try {
      const infoMeta = await this.participacionEmpresaService.getMetaInformation();
    const response = plainToClass(ResponsePrecioMetaDto, infoMeta,{excludeExtraneousValues: true});

    return response;
    } catch (error) {
      throw error;
    }
  }
}
