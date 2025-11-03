import { Expose } from "class-transformer";

export class TiposEstadosResponseDto {
    @Expose()
    id: number;
    @Expose()
    descripcion: string;

}