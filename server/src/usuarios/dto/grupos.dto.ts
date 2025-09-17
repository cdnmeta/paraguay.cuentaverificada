import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from "class-validator";

export class VendedorDataDto{
    @Type(() => Number)
    @IsNumber({}, { message: 'El porcentaje de primera venta debe ser un número' })
    @IsNotEmpty({ message: 'El porcentaje de primera venta no puede estar vacío' })
    @Min(0, { message: 'El porcentaje de primera venta debe ser mayor o igual a 0' })
    @Max(100, { message: 'El porcentaje de primera venta debe ser menor o igual a 100' })
    porcentaje_vendedor_primera_venta?: number;
      
    @Type(() => Number)
    @IsNumber({}, { message: 'El porcentaje de venta recurrente debe ser un número' })
    @IsNotEmpty({ message: 'El porcentaje de venta recurrente no puede estar vacío' })
    @Min(0, { message: 'El porcentaje de venta recurrente debe ser mayor o igual a 0' })
    @Max(100, { message: 'El porcentaje de venta recurrente debe ser menor o igual a 100' })
    porcentaje_vendedor_venta_recurrente?: number;

    @IsNumber({}, { message: 'El codigo del vendedor debe ser un número' })
    @IsNotEmpty({ message: 'El codigo del vendedor no puede estar vacío' })
    codigo_vendedor?: number;
}


export class AsignarGruposDto {
    @IsNotEmpty({ message: 'El ID de usuario es obligatorio' })
    @IsNumber({}, { message: 'El ID de usuario debe ser un número' })
    id_usuario: number;

    @IsNotEmpty({ message: 'Los grupos son obligatorios' })
    @IsNumber({}, { each: true, message: 'Cada grupo debe ser un número' })
    grupos: number[];

    @IsOptional()
    @Type(() => VendedorDataDto)
    vendedorData?: VendedorDataDto | null;
}