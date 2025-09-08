import { Expose, Transform } from "class-transformer";

export class ResponsePrecioMetaDto {
    @Expose()
    nombre_meta: string;
    
    @Expose()
    @Transform(({ value }) => Number(value) || 0)
    precio_meta: number;
    
}
