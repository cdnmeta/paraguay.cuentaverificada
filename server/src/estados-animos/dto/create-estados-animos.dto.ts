import { IsNotEmpty, IsString } from "class-validator";

export class CreateEstadosAnimosDtoPayload {
    @IsString({message: 'El mensaje debe ser una cadena de texto'})
    @IsNotEmpty({message: 'El mensaje no debe estar vacío'})
    mensaje: string;

    @IsNotEmpty({message: 'El ID del estado de ánimo no debe estar vacío'})
    id_estado_animo: number;
}

export class CreateEstadosAnimosDto extends CreateEstadosAnimosDtoPayload {
    id_usuario: number;
}