import { Controller, Get } from '@nestjs/common';
import { PlanesService } from './planes.service';
import { PlanResponseDto } from './dto/plan-response.dto';
import { plainToInstance } from 'class-transformer';
import { IsPublic } from '@/auth/decorators/public.decorator';

@Controller('planes')
export class PlanesController {
  constructor(private readonly planesService: PlanesService) {}

  @Get()
  async findAll() {
    const planes = await this.planesService.findAll();
    const planesResponse = planes.map(plane => plainToInstance(PlanResponseDto, plane,{excludeExtraneousValues: true}));
    return planesResponse;
  }
}
