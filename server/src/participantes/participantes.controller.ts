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
  Req,
} from '@nestjs/common';
import { ParticipantesService } from './participantes.service';
import { CreateParticipanteDto } from './dto/create-participante.dto';
import { UpdateParticipanteDto } from './dto/update-participante.dto';
import { IsPublic } from '@/auth/decorators/public.decorator';
import { Response } from 'express';
import { AuthenticatedRequest } from '@/auth/types/AuthenticatedRequest';

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

  @Get('mis-participaciones')
    async getParticipaciones(
      @Req() req: AuthenticatedRequest,
    ) {
      try {
        const userId = req.user.userId;

        return await this.participantesService.getParticipacionByUsuario(userId);
      } catch (error) {
        throw error;
      }
    }

}
