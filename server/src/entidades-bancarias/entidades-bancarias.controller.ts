import { Controller, Get } from '@nestjs/common';
import { EntidadesBancariasService } from './entidades-bancarias.service';

@Controller('entidades-bancarias')
export class EntidadesBancariasController {
  constructor(private readonly entidadesBancariasService: EntidadesBancariasService) {}

  @Get()
  async getEntidadBancaria() {
    return this.entidadesBancariasService.getEntidadesBancarias();
  }
}
