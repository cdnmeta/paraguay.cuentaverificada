import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class ObtenerMensajeDelDiaDtoPayload  {
    @Type(() => Number)
    @IsNumber({}, { message: 'El tipo mensaje debe ser un número' })
    @IsNotEmpty({ message: 'El tipo mensaje no debe estar vacío' })
    id_tipo_mensaje: number;

}

export class ObtenerMensajeDelDiaDto  extends ObtenerMensajeDelDiaDtoPayload {
   id_usuario: number;

}