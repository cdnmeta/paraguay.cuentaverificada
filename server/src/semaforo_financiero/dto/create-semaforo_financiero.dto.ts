import { IsNotEmpty, IsString, IsInt, IsNumber, IsOptional, Min, Max, IsEnum } from 'class-validator';

export class SemaforoMovimientoDtoBase {

    @IsNotEmpty({ message: 'El campo título es obligatorio.' })
    @IsString({ message: 'El campo título debe ser una cadena de texto.' })
    titulo: string;

    @IsNotEmpty({ message: 'El campo tipo_movimiento es obligatorio.' })
    @IsInt({ message: 'El campo tipo_movimiento debe ser un número entero.' })
    @Min(1, { message: 'El campo tipo_movimiento debe ser al menos 1.' })
    @Max(6, { message: 'El campo tipo_movimiento no puede ser mayor a 6.' })
    tipo_movimiento: number; // 1 = Ingreso fijo 2= Ingreso Ocasional 3 = Egreso Fijo 4 = Egreso Ocasional 5= Por pagar 6= Por Cobrar

    @IsOptional()
    @IsInt({ message: 'El campo id_estado debe ser un número entero.' })
    @IsEnum([1, 2, 3], { message: 'El campo id_estado debe ser 1 (Pendiente), 2 (Pagado) o 3 (Cobrado).' })
    id_estado?: number; // 1= Pendiente 2= Pagado 3= Cobrado

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
