import { Controller, Get } from '@nestjs/common';
import { MonedasService } from './monedas.service';
import { IsPublic } from '@/auth/decorators/public.decorator';

@Controller('monedas')
export class MonedasController {
  constructor(private readonly monedasService: MonedasService) {}

  @IsPublic()
  @Get()
  async getMonedas() {
    return this.monedasService.getMonedas();
  }
}
