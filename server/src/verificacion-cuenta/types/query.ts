import { Transform } from "class-transformer";
import { IsNumber, IsNumberString, IsOptional } from "class-validator";

export class QueryResumenSolicitudes {
    @Transform(({ value }) => Number(value))
    @IsOptional()
    id_verificador: number;
    
}

export class QueryListadoSolicitudes {
    @Transform(({ value }) => Number(value))
    @IsOptional()
    id_estado: number;
}