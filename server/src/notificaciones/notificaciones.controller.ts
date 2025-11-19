import { AuthenticatedRequest } from '@/auth/types/AuthenticatedRequest';
import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { SuscribeNotificacionDto, SuscribeNotificacionPayloadDto } from './dto/suscribe-notificacion.dto';
import { Response } from 'express';
import { NotificacionesService } from './notificaciones.service';
import { NotificationRequest } from './types/notification.types';
import { QueryMisNotificacionesDto } from './dto/query-mis-notificaiones.dto';

@Controller('notificaciones')
export class NotificacionesController {
    constructor(private readonly notificacionesService: NotificacionesService) {}

    @Post('suscribe-notificacion')
    async suscribeNotificacion(
        @Req() req:AuthenticatedRequest,
        @Res() res: Response,
        @Body() body:SuscribeNotificacionPayloadDto,
    ) {
       try {
        const dataProcesar : SuscribeNotificacionDto = {
            ...body,
            id_usuario: req.user.userId,
            user_agent: req.headers['user-agent'] || '',
            ip_origen: req.ip,
        };
        console.log("data procesar suscripcion notificacion",dataProcesar);
            await this.notificacionesService.suscribeToNotifications(dataProcesar);
         return res.status(200).json({message: 'Suscripción recibida'});
       } catch (error) {
        throw error;
       }
    }

    @Get('mis-notificaciones')
    async getNotificacionesByusuario(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response,
        @Query() query: QueryMisNotificacionesDto,
    ) {
        try {
            const id_usuario = req.user.userId;
            const notificaciones = await this.notificacionesService.getNotificaiconesByUserId(id_usuario, query);
            return res.status(200).json(notificaciones);
        } catch (error) {
            throw error;
        }
    }

}