import { Expose } from "class-transformer";

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