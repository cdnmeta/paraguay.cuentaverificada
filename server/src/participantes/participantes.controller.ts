import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Query,
} from '@nestjs/common';
import { ParticipantesService } from './participantes.service';
import { CreateParticipanteDto } from './dto/create-participante.dto';
import { UpdateParticipanteDto } from './dto/update-participante.dto';
import { IsPublic } from '@/auth/decorators/public.decorator';
import { Response } from 'express';

@Controller('participantes')
export class ParticipantesController {
  constructor(private readonly participantesService: ParticipantesService) {}

  @Post('registrar-participacion')
  async create(
    @Body() createParticipanteDto: CreateParticipanteDto,
    @Res() res: Response,
  ) {
    createParticipanteDto.id_usuario_creacion = 1; // Asignar el ID del usuario que crea la participación
    await this.participantesService.create(createParticipanteDto);
    return res.status(200).json({ message: 'Participación registrada exitosamente' });
  }

}
