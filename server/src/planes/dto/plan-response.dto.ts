import { Expose } from "class-transformer";

export class PlanResponseDto {
  @Expose()
    id: number;
  @Expose()
  nombre: string;
  @Expose()
  precio: number;
  @Expose()
  renovacion_plan: string;
  @Expose()
  renovacion_valor: number;
  @Expose()
  tipo_iva: number;
  @Expose()
  descripcion: string;
}
