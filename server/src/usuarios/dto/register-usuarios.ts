import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNumber,
  IsArray,
  ValidateIf,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';


export class RegisterUsuariosPayloadDto {
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
  @IsNotEmpty({ message: 'El dial code es obligatorio' })
  dial_code: string;

  @IsString({ message: 'Telefono debe ser una cadena' })
  @IsNotEmpty({ message: 'El telefono es obligatorio' })
  telefono: string;

  @IsString({ message: 'Pin debe ser una cadena' })
  @IsNotEmpty({ message: 'El pin es obligatorio' })
  pin: string;

  @IsDateString({}, { message: 'La fecha de nacimiento debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
  fecha_nacimiento: string;
}

export class RegisterUsuariosDto extends RegisterUsuariosPayloadDto {
  dispositivo_origen?: string | null;
  ip_origen?: string | null;
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

  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map(Number);
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(Number) : [];
    } catch {
      return [];
    }
  })
  @IsArray({ message: 'Grupos debe ser un arreglo de números' })
  @IsNumber({}, { each: true, message: 'Cada grupo debe ser un número' })
  @IsOptional()
  grupos?: number[] | null;

/*   @Type(() => Number)
  @IsNumber({}, { message: 'El porcentaje de primera venta debe ser un número' })
  @Min(0, { message: 'El porcentaje de primera venta debe ser mayor o igual a 0' })
  @Max(100, { message: 'El porcentaje de primera venta debe ser menor o igual a 100' })
  @IsOptional()
  porcentaje_vendedor_primera_venta?: number | null;
  
  @Type(() => Number)
  @IsNumber({}, { message: 'El porcentaje de venta recurrente debe ser un número' })
  @Min(0, { message: 'El porcentaje de venta recurrente debe ser mayor o igual a 0' })
  @Max(100, { message: 'El porcentaje de venta recurrente debe ser menor o igual a 100' })
  @IsOptional()
  porcentaje_vendedor_venta_recurrente?: number | null; */

  @IsDateString({}, { message: 'La fecha de nacimiento debe ser una fecha válida' })
  @IsOptional()
  fecha_nacimiento?: string | null;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'Es verificado debe ser un valor booleano' })
  @IsOptional()
  verificado?: boolean | null;

  @Type(() => Number)
  @IsNumber({},{message: "el id del broker debe ser un número"})
  @IsOptional()
  id_usuario_embajador?: number | null;

  @IsNumber({}, { message: 'El ID del usuario de registro debe ser un número' })
  @IsOptional()
  id_usuario_registro?: number | null;

  id_estado?: number | null;

  dispositivo_origen?: string | null;
  ip_origen?: string | null;
}

export class AgregarGrupoUsuario {
  @IsNotEmpty({ message: 'El ID de usuario es obligatorio' })
  @IsNumber({}, { message: 'El ID de usuario debe ser un número' })
  id_usuario: number;

  @IsNotEmpty({ message: 'El ID de grupo es obligatorio' })
  @IsNumber({}, { message: 'El ID de grupo debe ser un número' })
  id_grupo: number;
}
