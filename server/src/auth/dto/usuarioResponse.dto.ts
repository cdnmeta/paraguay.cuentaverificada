import { Expose } from 'class-transformer';

export class UsuarioRegisterResponseDto {
  @Expose({ name: 'id' })
  id: number;
  @Expose({ name: 'nombre' })
  nombre: string;
  @Expose({ name: 'apellido' })
  apellido: string;
  @Expose({ name: 'email' })
  email: string;
  @Expose({ name: 'documento' })
  documento: string;
}
