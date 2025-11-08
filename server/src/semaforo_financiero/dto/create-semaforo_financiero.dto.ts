import { sanitizeTexto } from '@/utils/sanitizeText';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsInt, IsNumber, IsOptional, Min, Max, IsEnum, IsDateString } from 'class-validator';

export class SemaforoMovimientoDtoBase {

    @IsNotEmpty({ message: 'El campo título es obligatorio.' })
    @IsString({ message: 'El campo título debe ser una cadena de texto.' })
    @Transform(({ value }) => sanitizeTexto(value))
    titulo: string;

    @IsDateString({},{ message: 'El campo fecha debe ser una fecha válida en formato ISO 8601.' })
    @IsOptional()
    fecha?: Date;

    @IsDateString({},{ message: 'El campo fecha_vencimiento debe ser una fecha válida en formato ISO 8601.' })
    @IsOptional()
    fecha_vencimiento?: Date;

    @IsNotEmpty({ message: 'El campo tipo_movimiento es obligatorio.' })
    @IsInt({ message: 'El campo tipo_movimiento debe ser un número entero.' })
    @Min(1, { message: 'El campo tipo_movimiento debe ser al menos 1.' })
    @Max(6, { message: 'El campo tipo_movimiento no puede ser mayor a 6.' })
    tipo_movimiento: number; // 1 = Ingreso fijo 2= Ingreso Extra 3 = Gasto Fijo 4 = Gasto Extra 5= Cuentas Por pagar 6= Cuentas Por Cobrar

    @IsNotEmpty({ message: 'El campo monto es obligatorio.' })
    @IsNumber({}, { message: 'El campo monto debe ser un número.' })
    monto: number;

    @IsNotEmpty({ message: 'El campo id_moneda es obligatorio.' })
    @IsInt({ message: 'El campo id_moneda debe ser un número entero.' })
    @Min(1, { message: 'El campo id_moneda debe ser al menos 1.' })
    id_moneda: number;

    @IsOptional()
    @IsString({ message: 'El campo observación debe ser una cadena de texto.' })
    observacion?: string;

}

export class CreateSemaforoFinancieroDto extends SemaforoMovimientoDtoBase {
    id_usuario: number;
}


export class RegistrarAbonoMovimientoPayloadDto {
    @IsNotEmpty({ message: 'El campo monto es obligatorio.' })
    @IsNumber({}, { message: 'El campo monto debe ser un número.' })
    monto: number;

    @IsDateString({},{ message: 'El campo fecha_abono debe ser una fecha válida en formato ISO 8601.' })
    @IsOptional()
    fecha_abono: Date;
    
    @IsNotEmpty({ message: 'El campo id_movimiento es obligatorio.' })
    @IsInt({ message: 'El campo id_movimiento debe ser un número entero.' })
    @Min(1, { message: 'El campo id_movimiento debe ser al menos 1.' })
    id_movimiento: number;
}

export class RegistrarAbonoMovimientoDto extends RegistrarAbonoMovimientoPayloadDto {
    id_usuario: number;
}
