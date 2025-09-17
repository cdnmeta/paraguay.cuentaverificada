import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CotizacionDto {


  @IsNumber({}, { message: 'El id de la moneda debe ser un número' })
  @IsNotEmpty({ message: 'El id de la moneda es obligatorio' })
  id_moneda_origen: number;

  @IsNumber({}, { message: 'El id de la moneda debe ser un número' })
  @IsNotEmpty({ message: 'El id de la moneda es obligatorio' })
  id_moneda_destino: number;

  @IsNumber({}, { message: 'El monto debe ser un número' })
  @IsNotEmpty({ message: 'El monto venta es obligatorio' })
  monto_venta: number;

  @IsNumber({}, { message: 'El monto debe ser un número' })
  @IsNotEmpty({ message: 'El monto pagos es obligatorio' })
  monto_pagos: number;



  @IsNumber({}, { message: 'El id de la moneda debe ser un número' })
  @IsOptional()
  id_usuario_registro: number;
}
