import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CotizacionDto {
  @IsNumber({}, { message: 'El id de la moneda debe ser un número' })
  @IsNotEmpty({ message: 'El id de la moneda es obligatorio' })
  id_moneda_destino: number;

  @IsNumber({}, { message: 'El monto debe ser un número' })
  @IsNotEmpty({ message: 'El monto es obligatorio' })
  monto: number;

  @IsNumber({}, { message: 'El id de la moneda debe ser un número' })
  @IsOptional()
  id_usuario_registro: number;
}
