import { Expose } from "class-transformer";

export class ResponseListDto {
    @Expose()
    id: number;
    @Expose()
    descripcion: string;
}