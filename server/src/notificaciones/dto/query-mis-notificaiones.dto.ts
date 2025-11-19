import { Type } from "class-transformer";
import { IsDateString, IsOptional } from "class-validator";

export class QueryMisNotificacionesDto {
    @Type(() => Number)
    @IsOptional()
    tipo_notificacion?: number;
    
    @Type(() => Number)
    @IsOptional()
    id_estado?: number

    @IsDateString({},{message: 'La fecha_desde debe ser una fecha válida'})
    @IsOptional()
    fecha_desde?: Date;

    @IsDateString({},{message: 'La fecha_hasta debe ser una fecha válida'})
    @IsOptional()
    fecha_hasta?: Date;
}