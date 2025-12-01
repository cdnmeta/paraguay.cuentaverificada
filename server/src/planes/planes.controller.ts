import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { PlanesService } from './planes.service';
import { PlanesResponseAdminDto, PlanResponseDto } from './dto/plan-response.dto';
import { plainToInstance } from 'class-transformer';
import { IsPublic } from '@/auth/decorators/public.decorator';
import { AuthenticatedRequest } from '@/auth/types/AuthenticatedRequest';
import { CreatePlanDto, CreatePlanPayloadDto } from './dto/create-plan.dto';
import { Response } from 'express';
import { OnlyAdminGuard } from '@/auth/guards/onlyAdmin.guard';
import { IsOnlyAdmin } from '@/auth/decorators/onlyAdmin.decorator';
import { UpdatePlanDto, UpdatePlanPayloadDto } from './dto/update-plan.dto';
import { DeletePlanDto } from './dto/delete-plan.dto';
import { PlanesTiposRepartirService } from './planes-tipo-repartir/planes-tipos-repartir.service';

@UseGuards(OnlyAdminGuard)
@Controller('planes')
export class PlanesController {
  constructor(private readonly planesService: PlanesService,
    private readonly planesTiposRepartirService: PlanesTiposRepartirService,
  ) {}

  @IsOnlyAdmin()
  @Get()
  async findAll(
    @Res() res: Response,
  ) {
    try {
      const planes = await this.planesService.findAll();
      return res.status(200).json(planes);
    } catch (error) {
      throw error;
    }
  }

  @IsOnlyAdmin()
  @Post()
  async crearPlanes(
    @Req() req: AuthenticatedRequest,
    @Body() createPlanDto: CreatePlanPayloadDto,
    @Res() res: Response,
  ) {
    try {
      const dataEnviar: CreatePlanDto = {
        ...createPlanDto,
        id_usuario: req.user.userId,
      };
      const nuevoPlan = await this.planesService.crearPlan(dataEnviar);
      return res.status(200).json({ message: 'Plan creado exitosamente' });
    } catch (error) {
      throw error;
    }
  }

  @Get('tipos-porcentajes-repartir')
  async obtenerPlanesTiposRepartir(
    @Res() res: Response,
  ){
    try {
      const tiposRepartir = await this.planesTiposRepartirService.getPlanesTiposRepartir();
      return res.status(200).json(tiposRepartir);
    } catch (error) {
      throw error;
    }
  }


  @Get(':id')
  async obtenerPlanPorId(
    @Param('id') id: number,
    @Res() res: Response,
  ) {
      try {
        const plan =  await this.planesService.getPlanById(id);
        return res.status(200).json(plan);

      } catch (error) {
        throw error;
      }
    }

  // crear controlador para actualizar un plan
  @IsOnlyAdmin()
  @Put(':id')
  async actualizarPlan(
    @Req() req: AuthenticatedRequest,
    @Body() updatePlanDto: UpdatePlanPayloadDto,
    @Res() res: Response,
    @Param('id') id: number,
  ) {
    try {
      const dataEnviar: UpdatePlanDto = {
        ...updatePlanDto,
        id_usuario_actualizacion: req.user.userId,
      };
      const updatedPlan = await this.planesService.actualizarPlan(
        id,
        dataEnviar,
      );
      return res.status(200).json({ message: 'Plan actualizado exitosamente' });
    } catch (error) {
      throw error;
    }
  }

  @IsOnlyAdmin()
  @Delete(':id')
  async eliminarPlan(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: number,
    @Res() res: Response,
  ) {
    try {
      const dataEnviar: DeletePlanDto = {
        id_usuario_eliminacion: req.user.userId,
      }
      await this.planesService.deletePlan(id, dataEnviar);
      return res.status(200).json({ message: 'Plan eliminado exitosamente' });
    } catch (error) {
      throw error;
    }
  }
  
}
