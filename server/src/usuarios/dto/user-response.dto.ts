import { Decimal } from "@prisma/client/runtime/library";
import { Expose, Transform } from "class-transformer";

export class UserResponseDto {
@Expose()
  id: number;
  @Expose()
  documento: string;
  @Expose()
  email: string;

  @Expose()
  nombre: string;
  @Expose()
  apellido: string;
  @Expose({ name: "usuarios_grupos" })
  grupos: { id_grupo: number }[];
}

export class UserResponseViewData {
  @Expose()
  id: number;

  @Expose()
  documento: string;

  @Expose()
  email: string;

  @Expose()
  nombre: string;

  @Expose()
  apellido: string;

  @Expose({ name: "usuarios_grupos" })
  grupos: { id_grupo: number }[];

  @Expose()
  cedula_frente: string;

  @Expose()
  cedula_reverso: string;

  @Expose()
  selfie: string;

  @Expose()
  telefono: string;

  @Expose()
  dial_code: string;

  @Expose()
  porcentaje_comision_primera_venta?: number;

  @Expose()
  porcentaje_comision_recurrente?: number;
}


export class MisDatosResponseDto {
  id: number;
  @Expose()
  documento: string;
  @Expose()
  email: string;

  @Expose()
  nombre: string;

  @Expose()
  apellido: string;

  @Expose()
  dial_code: string;

  @Expose()
  telefono: string;

  @Expose()
  direccion: string;

}