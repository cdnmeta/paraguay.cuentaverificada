import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { PagoSuscripcionesService } from './pago-suscripciones.service';
import { RegistrarPagoSuscripcionDTO } from './dto/create-pago.dto';
import { IsPublic } from '@/auth/decorators/public.decorator';
import { Response } from 'express';

@Controller('pago-suscripciones')
export class PagoSuscripcionesController {
  constructor(
    private readonly pagoSuscripcionesService: PagoSuscripcionesService,
  ) {}
  
  @Post('registrar-pago')
  async registrarPago(@Req() req:any ,@Body() crearPagoDto: RegistrarPagoSuscripcionDTO, @Res() res:Response) {
    const pagoCreado = await this.pagoSuscripcionesService.registrarPago(crearPagoDto,req.user.userId);
    return res.status(200).json({message:"Pago registrado exitosamente"});
  }
}
