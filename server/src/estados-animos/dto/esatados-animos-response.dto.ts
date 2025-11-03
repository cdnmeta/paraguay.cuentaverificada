import { Expose } from "class-transformer";

export class EstadosAnimosResponseDto {
    @Expose()
    id: number;
    @Expose()
    mensaje: string;
    @Expose()
    id_tipo_animo: number;
}