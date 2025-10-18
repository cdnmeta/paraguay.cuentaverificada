import { sanitizeTexto } from "@/utils/sanitizeText";
import { Transform, Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateTicketPayloadDto {
    @IsString()
    @IsNotEmpty()
    titulo: string;

    @Type(() => Number)
    @IsNumber({},{message:'El id del tipo de ticket debe ser un número'})
    @IsNotEmpty({message:'El id del tipo de ticket no puede estar vacio'})
    id_tipo_ticket: number;

    @Transform(({value}) => sanitizeTexto(value))
    @IsString({message:'la descripcion debe ser un texto'})
    @IsNotEmpty({message:'la descripcion no puede estar vacia'})
    descripcion: string;

}

export class CreateTicketDto extends CreateTicketPayloadDto  {
    id_usuario: number;
    id_estado_ticket?: number;
    id_rol: number;
}