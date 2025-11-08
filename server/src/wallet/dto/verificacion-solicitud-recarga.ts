import { IsNotEmpty, IsNumber } from "class-validator";

export class VerificacionSolicitudRecargaDtoPayload {
    @IsNumber({}, {message: 'El monto debe ser un número'})
    @IsNotEmpty({message: 'El monto no debe estar vacío'})
    monto: number;
}

export class VerificacionSolicitudRecargaDto extends VerificacionSolicitudRecargaDtoPayload {
    id_usuario_verificador: number;
}