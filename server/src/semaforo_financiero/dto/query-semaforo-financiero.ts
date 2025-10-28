import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional } from "class-validator";

export class QuerySemaforoFinancieroByUsuarioDto {
    @Type(() => Number)
    @IsEnum([1,2,3,4,5,6,7,8,9,10,11,12], { message: 'El campo mes debe ser un número válido de mes (1-12).' })
    @IsOptional()
    mes:number


    @Type(() => Number)
    @IsNumber({}, { message: 'El campo año debe ser un número.' })
    @IsOptional()
    anio:number

    @Type(() => Number)
    @IsNumber({}, { message: 'El campo día debe ser un número.' })
    @IsOptional()
    dia:number
}