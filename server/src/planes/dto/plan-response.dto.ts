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

export class PlanesResponseAdminDto extends PlanResponseDto {
  @Expose()
    activo: boolean;
  @Expose()
    fecha_creacion: Date
  @Expose()
    fecha_actualizacion: Date
  @Expose()
    nombre_usuario_creacion: string
    
}
