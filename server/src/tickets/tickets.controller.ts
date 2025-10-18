import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, Req, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, CreateTicketPayloadDto } from './dto/create-ticket.dto';
import { AuthenticatedRequest } from '@/auth/types/AuthenticatedRequest';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ClienteMensajeTicketPayloadDto, MensajeTicketDto, MensajeTicketPayloadDto, SoporteMensajeTicketPayloadDto } from './dto/mensajeTicket.dto';
import { RequireGroupIdsAll } from '@/auth/decorators/groups.decorator';
import { PrismaService } from '@/prisma/prisma.service';
import { RolUsuario } from './types/enums';
import { TipoTicketService } from './tipo-ticket/tipo-ticket.service';
import { plainToInstance } from 'class-transformer';
import { ResponseListDto } from './tipo-ticket/dto/response-list.dto';
import { GruposSistema } from '@/utils/constants';
import { AbrirTicketDto, GetTicketHiloDto } from './dto/acciones-ticket.dto';
import { ResponseTicketAbiertoDto, ResponseTicketDto } from './dto/response-ticket.dto';
import { CerrarTicketDto, CerrarTicketPayloadDto, CompletarTicketDto, UpdateEstadoTicketDto } from './dto/update-ticket.dto';
import { QueryTicketsSoporteDto } from './dto/query-tickets.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService, private readonly prismaService: PrismaService, private readonly tipoTicketService: TipoTicketService) {}

  @Get('tipos')
  async getTiposTickets(@Res() res: Response) {
    try {
      const tipos = await this.tipoTicketService.getTiposTickets();
      const tiposResponse = plainToInstance(ResponseListDto, tipos, { excludeExtraneousValues: true });
      return res.status(200).json(tiposResponse);
    } catch (error) {
      throw error;
    }
  }


  @Get('resumen-mis-tickets')
  @RequireGroupIdsAll(5)
  async getResumenMisTickets(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    try {
      const resumen = await this.ticketsService.getResumenMisTickets(req.user.userId);
      return res.status(200).json(resumen);
    } catch (error) {
      throw error;
    }
  }


  @Get('soporte/listado')
  @RequireGroupIdsAll(5) // Requiere pertenecer al grupo de soporte (ID 5)
  async listadoTicketsSoporte(@Req() req: AuthenticatedRequest, @Res() res: Response,
  @Query() query: QueryTicketsSoporteDto
  ) {
  try {
    const idSoporte = req.user.userId;
    const tickets = await this.ticketsService.listadoTicketsSoporteByIdSoporte(idSoporte, query);
    return res.status(200).json(tickets);
  } catch (error) {
    throw error;
  }
  }

  @Post('nuevo')
  @UseInterceptors(FilesInterceptor('archivos',5))
  async createTicket(
    @Req() req: AuthenticatedRequest,
    @Body() createTicketDto: CreateTicketPayloadDto,
    @Res() res:Response,
    @UploadedFiles() archivos: Array<Express.Multer.File>
  ) {
    try {
      const dataProcesar:CreateTicketDto = {
        ...createTicketDto,
        id_usuario: req.user.userId,
        id_rol: 1 // Asignar el rol del usuario que crea el ticket
      }
      
      const ticket = await this.ticketsService.createTicket(dataProcesar, archivos);
      return res.status(200).json({message: 'Ticket creado con éxito'});
    } catch (error) {
      throw error;
    }
  }

  @Post('mensaje')
  @UseInterceptors(FilesInterceptor('archivos',5))
  async clienteAgregarMensaje(
    @Body() mensajeTicketDto: ClienteMensajeTicketPayloadDto,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @UploadedFiles() archivos: Array<Express.Multer.File>
  ) {
    try {
      const dataProcesar: MensajeTicketDto = {
        ...mensajeTicketDto,
        id_usuario: req.user.userId,
        rol_usuario: RolUsuario.CLIENTE // Asignar el rol del usuario que crea el mensaje
      }


      const mensaje = await this.ticketsService.agregarMensaje(dataProcesar, archivos,{ validateReportante: true, validateEstadoResolucion: true, validateEstadosTickets: true });
      return res.status(200).json({ message: 'Mensaje agregado con éxito' });
    } catch (error) {
      throw error;
    }
  }

  @Post('soporte/mensaje')
  @RequireGroupIdsAll(5) // Requiere pertenecer al grupo de soporte (ID 5)
  @UseInterceptors(FilesInterceptor('archivos',5))
  async soporteAgregarMensaje(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Body() mensajeTicketDto: SoporteMensajeTicketPayloadDto,
    @UploadedFiles() archivos: Array<Express.Multer.File>
  ) {
    try {
      const dataProcesar: MensajeTicketDto = {
        ...mensajeTicketDto,
        id_usuario: req.user.userId,
        rol_usuario: RolUsuario.SOPORTE // Asignar el rol del usuario que crea el mensaje
      }

      const mensaje = await this.ticketsService.agregarMensaje(dataProcesar, archivos,{ validateAsignado: true, validateEstadoResolucion: true, validateEstadosTickets: true });
      return res.status(200).json({ message: 'Mensaje agregado con éxito' });
    } catch (error) {
      throw error;
    }
  }

  @Get('mis-tickets')
  async getMisTickets(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    try {
      const tickets = await this.ticketsService.getMisTickets(req.user.userId);
      return res.status(200).json(tickets);
    } catch (error) {
      throw error;
    }
  }

  /*Rutas dinamicas*/

  @Put(':id/abrir')
  @RequireGroupIdsAll(GruposSistema.AGENTE_SOPORTE) // Requiere pertenecer al grupo de soporte (ID 5)
  async abrirTicket(@Param('id',ParseIntPipe) id: number, @Req() req: AuthenticatedRequest, @Res() res: Response) {
    try {
      const dataEnviar : AbrirTicketDto = {
        id_usuario_asignado: req.user.userId
      }
      const ticketAbierto = await this.ticketsService.abrirTicket(id, dataEnviar);
      const responseTicket = plainToInstance(ResponseTicketAbiertoDto, ticketAbierto, { excludeExtraneousValues: true });
      return res.status(200).json({ message: 'Ticket abierto con éxito', ticket: responseTicket });
    } catch (error) {
      throw error;
    }
  }

  @Get(':id/hilo')
  async getTicketHilo(
    @Param('id',ParseIntPipe) id: number, 
    @Req() req: AuthenticatedRequest, 
    @Res() res: Response,
    @Query() queryParams: any
  ) {
    try {
      const data: GetTicketHiloDto = {
        id_usuario: req.user.userId,
        lastMessageId: queryParams.lastMessageId ? parseInt(queryParams.lastMessageId) : undefined,
        firstMessageId: queryParams.firstMessageId ? parseInt(queryParams.firstMessageId) : undefined,
        limit: queryParams.limit ? parseInt(queryParams.limit) : 15,
        includeInternal: queryParams.includeInternal === 'true'
      }
      console.log('parmas hilo',data)
      const result = await this.ticketsService.getTicketHilo(id, data);
      return res.status(200).json(result);
    } catch (error) {
      throw error;
    }
  }

  @Get(':id/info')
  async getTicketInfoById(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest, @Res() res: Response) {
    try {
      const ticketInfo = await this.ticketsService.getTicketInfoById(id);
      const responseTicket = plainToInstance(ResponseTicketDto, ticketInfo, { excludeExtraneousValues: true });
      return res.status(200).json(responseTicket);
    } catch (error) {
      throw error;
    }
  }

  @Put(':id/cerrar')
  @RequireGroupIdsAll(GruposSistema.AGENTE_SOPORTE) // Requiere pertenecer al grupo de soporte (ID 5)
  async cerrarTicket(@Param('id',ParseIntPipe) id: number, @Req() req: AuthenticatedRequest, @Res() res: Response, @Body() cerrarTicketDto: CerrarTicketPayloadDto) {
    try {
      const dataEnviar: CerrarTicketDto = {
        ...cerrarTicketDto,
        id_usuario: req.user.userId
      }
      const ticketCerrado = await this.ticketsService.cerrarTicket(id, dataEnviar);
      return res.status(200).json({ message: 'Ticket cerrado con éxito' });
    } catch (error) {
      throw error;
    }
  }

  @Put(':id/completar')
  @RequireGroupIdsAll(GruposSistema.AGENTE_SOPORTE) // Requiere pertenecer al grupo de soporte (ID 5)
  async marcarTicketComoCerrado(@Param('id',ParseIntPipe) id: number, @Req() req: AuthenticatedRequest, @Res() res: Response) {
    try {
      
      const dataEnviar:CompletarTicketDto = {
        id_usuario: req.user.userId
      }
      const ticketCerrado = await this.ticketsService.completarTicket(id, dataEnviar);
      return res.status(200).json({ message: 'Ticket completado con éxito' });
    } catch (error) {
      throw error;
    }

  }

  
}
