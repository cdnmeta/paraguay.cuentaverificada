import { Transform, Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateTicketPayloadDto {
    @IsString()
    @IsOptional()
    titulo: string;

    @Type(() => Number)
    @IsNumber({},{message:'El id del tipo de ticket debe ser un número'})
    @IsOptional({message:'El id del tipo de ticket no puede estar vacio'})
    id_tipo_ticket: number;

    @Type(() => Number)
    @IsNumber({},{message:'El id del estado del ticket debe ser un número'})
    @IsOptional()
    id_estado_ticket: number;


}

export class UpdateTicketDto extends UpdateTicketPayloadDto  {
    id_usuario: number;
}

export class UpdateEstadoTicketPayloadDto {
    @Type(() => Number)
    @IsNumber({},{message:'El id del estado del ticket debe ser un número'})
    @IsNotEmpty({message:'El id del estado del ticket no puede estar vacio'})
    id_estado_ticket: number;
}



export class UpdateEstadoTicketDto extends UpdateEstadoTicketPayloadDto  {
    id_usuario: number;
}

export class CerrarTicketPayloadDto {
    @IsString()
    @IsNotEmpty({message:'El motivo de cierre no puede estar vacio'})
    motivo_cierre: string;
}

export class CerrarTicketDto extends CerrarTicketPayloadDto  {
    id_usuario: number;
}

export class CompletarTicketDto {
    id_usuario: number;
}