import { Type } from "class-transformer";
import { IsDateString, IsNumber, IsOptional } from "class-validator";

export class QueryMisRecordatoriosDto {
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    tipo_recordatorio?: number;

    @IsDateString()
    @IsOptional()
    fecha_recordatorio?: string;
}