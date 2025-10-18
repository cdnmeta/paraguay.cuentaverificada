import { Transform, Type } from "class-transformer";
import { IsNumber, IsOptional, IsBoolean, Min, Max } from "class-validator";

export class AbrirTicketDto{
    id_usuario_asignado: number;
}

export class GetTicketHiloDto {
    id_usuario: number;
    
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    lastMessageId?: number;

    @IsOptional()
    @IsNumber() 
    @Type(() => Number)
    firstMessageId?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    @Max(50)
    limit?: number = 15;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    includeInternal?: boolean;
}