import { Expose } from 'class-transformer';

export class SoliitudVerificacionCuentaResponseDto {
    @Expose()
    id: number;

    @Expose()
    nombre: string;

    @Expose()
    apellido: string;

    @Expose()
    documento: string;

    @Expose()
    correo: string;

    @Expose()
    telefono: string;
}