import { Expose } from 'class-transformer';

export class ResponseSemaforoFinancieroDto {
    @Expose()
    id: number;

    @Expose()
    titulo: string;

    @Expose()
    tipo_movimiento: number;

    @Expose()
    monto: number;

    @Expose()
    id_moneda: number; // o el tipo específico de moneda que uses

    @Expose()
    observacion: string;

    @Expose()
    fecha_vencimiento: Date;
}