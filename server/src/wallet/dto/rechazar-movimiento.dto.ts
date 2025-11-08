import { IsNotEmpty, IsString } from "class-validator";

export class RechazarMovimientoDtoPayload {
    @IsString({message: 'el motivo de rechazo debe ser un string'})
    @IsNotEmpty({message: 'el motivo de rechazo no debe estar vacío'})
    motivo_rechazo: string;
}


export class RechazarMovimientoDto extends RechazarMovimientoDtoPayload {
    id_usuario_rechazo: number;
}