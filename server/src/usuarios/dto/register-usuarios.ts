import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNumber,
} from 'class-validator';

export class RegisterUsuariosDto {
  @IsString({ message: 'Nombre debe ser una cadena' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsString({ message: 'La contraseña debe ser una cadena' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  contrasena: string;

  @IsString({ message: 'El método de registro debe ser una cadena' })
  @IsOptional()
  apellido?: string | null;

  @IsString({ message: 'El documento debe ser una cadena' })
  @IsNotEmpty({ message: 'El documento es obligatorio' })
  documento: string;

  @IsEmail({}, { message: 'El correo debe ser un correo válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  correo: string;

  @IsString({ message: 'Sexo debe ser una cadena' })
  @IsEnum(['1', '2'], { message: 'Opcion de sexo admitida' })
  @IsOptional()
  sexo?: string | null;

  @IsDateString(
    {},
    { message: 'Fecha de nacimiento debe ser una fecha válida' },
  )
  @IsOptional()
  fechaNacimiento?: Date | null;

  @IsString({ message: 'Metodo de registro debe ser una cadena' })
  @IsOptional()
  metodoRegistro?: string | null;
}

export class CrearUsuarioDTO {
  @IsString({ message: 'Nombre debe ser una cadena' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsString({ message: 'La contraseña debe ser una cadena' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  contrasena: string;

  @IsString({ message: 'El método de registro debe ser una cadena' })
  @IsOptional()
  apellido?: string | null;

  @IsString({ message: 'El documento debe ser una cadena' })
  @IsNotEmpty({ message: 'El documento es obligatorio' })
  documento: string;

  @IsEmail({}, { message: 'El correo debe ser un correo válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  correo: string;

  @IsString({ message: 'Dial code debe ser una cadena' })
  @IsOptional()
  dial_code?: string | null;

  @IsString({ message: 'Telefono debe ser una cadena' })
  @IsOptional()
  telefono?: string | null;

  @IsString()
  @IsOptional()
  pin?: string | null;

  @IsString({ message: 'Path cedula frontal debe ser una cadena' })
  @IsOptional()
  path_cedula_frontal?: string | null;

  @IsString({ message: 'Path cedula reverso debe ser una cadena' })
  @IsOptional()
  path_cedula_reverso?: string | null;
}


export class AgregarGrupoUsuario {
  @IsNotEmpty({ message: 'El ID de usuario es obligatorio' })
  @IsNumber({}, { message: 'El ID de usuario debe ser un número' })
  id_usuario: number;

  @IsNotEmpty({ message: 'El ID de grupo es obligatorio' })
  @IsNumber({}, { message: 'El ID de grupo debe ser un número' })
  id_grupo: number;
}
