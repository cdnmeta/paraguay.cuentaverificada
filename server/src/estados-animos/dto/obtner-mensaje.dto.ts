import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class ObtenerMensajeDelDiaDto {
    @Type(() => Number)
    @IsNumber({},{ message: 'El id_mensaje_ant debe ser un número' })
    @IsOptional()
    id_mensaje_ant?: number;

    @Type(() => Number)
    @IsNumber({}, { message: 'El tipo mensaje debe ser un número' })
    @IsNotEmpty({ message: 'El tipo mensaje no debe estar vacío' })
    id_tipo_mensaje: number;

}