import { Transform, Type } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class QueryTicketsBaseDto {
    @IsString({message:'El título debe ser una cadena de texto'})
    @IsOptional()
    titulo?: string;

    @Type(() => Number)
    @IsNumber({}, {message:'El id del tipo de ticket debe ser un número'})
    @IsOptional()
    id_tipo_ticket?: number;
    
    @Type(() => Number)
    @IsNumber({}, {message:'El id del estado debe ser un número'})
    @IsOptional()
    id_estado?: number;

    @Type(() => Number)
    @IsNumber({}, {message:'La prioridad debe ser un número'})
    @IsOptional()
    prioridad?: number;
}

export class QueryAdminTicketsDto extends QueryTicketsBaseDto {
    @Type(() => Number)
    @IsNumber({}, {message:'El id del reportante debe ser un número'})
    @IsOptional()
    id_reportante: number;
    
    @Transform(({ value }) => value === 'true' || value === true)
    @IsOptional()
    activo?: boolean = true;

}

export class QueryTicketsSoporteDto extends QueryTicketsBaseDto {
    id_reportante: number;
    id_asignado: number;
}