// src/usuarios/dto/actualizar-usuario.dto.ts
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
} from 'class-validator';
import { VendedorDataDto } from './grupos.dto';

export class ActualizarUsuarioDTO {
  @IsString({ message: 'Nombre debe ser una cadena' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre?: string;

  @IsString({ message: 'El apellido debe ser una cadena' })
  @IsOptional()
  apellido?: string;

  @IsString({ message: 'El documento debe ser una cadena' })
  @IsNotEmpty({ message: 'El documento es obligatorio' })
  documento?: string;

  @IsEmail({}, { message: 'El correo debe ser un correo válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  correo?: string;

  @IsString({ message: 'Sexo debe ser una cadena' })
  @IsEnum(['1', '2'], { message: 'Opción de sexo no válida' })
  @IsOptional()
  sexo?: string;

  @IsDateString({}, { message: 'Fecha de nacimiento debe ser una fecha válida' })
  @IsOptional()
  fechaNacimiento?: Date;

  @IsString({ message: 'Dial code debe ser una cadena' })
  @IsOptional()
  dial_code?: string;

  @IsString({ message: 'Teléfono debe ser una cadena' })
  @IsOptional()
  telefono?: string;

  @IsString({ message: 'Dirección debe ser una cadena' })
  @IsOptional()
  direccion?: string;

  @IsString({ message: 'PIN debe ser una cadena' })
  @IsOptional()
  pin?: string;

  @IsString({ message: 'La nueva contraseña debe ser una cadena' })
  @IsOptional()
  contrasena?: string;

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

  // Datos específicos para vendedor
  @IsOptional()
  @Type(() => VendedorDataDto)
  vendedorData?: VendedorDataDto;

  // Campos adicionales para el sistema
  @IsNumber({}, { message: 'ID del usuario que actualiza debe ser un número' })
  @IsOptional()
  id_usuario_actualizacion?: number;

  // Porcentajes de comisión (para vendedores)
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Porcentaje primera venta debe ser un número' })
  @Min(0, { message: 'El porcentaje no puede ser negativo' })
  @Max(100, { message: 'El porcentaje no puede ser mayor a 100' })
  porcentaje_vendedor_primera_venta?: number | null  ;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Porcentaje venta recurrente debe ser un número' })
  @Min(0, { message: 'El porcentaje no puede ser negativo' })
  @Max(100, { message: 'El porcentaje no puede ser mayor a 100' })
  porcentaje_vendedor_venta_recurrente?: number | null;
}


export class CambiarContrasenaPayloadDTO {
  @IsString({ message: 'La contraseña actual debe ser una cadena' })
  @IsNotEmpty({ message: 'La contraseña actual es obligatoria' })
  contrasena: string;

  @IsString({message:"El pin es obligatorio"})
  @IsNotEmpty({message:"El pin es obligatorio"})
  pin: string;

  
}

export class ActualizarMisDatos {
  @Transform(({ value }) => {
    if (value === null || value === undefined) return undefined;
    if (typeof value !== 'string') return value;
    const v = value.trim();
    return v === '' ? undefined : v;
  })
  @IsEmail({}, { message: 'Email debe ser un correo válido' })
  @IsOptional()
  correo?: string;

  @IsString({ message: 'Teléfono debe ser una cadena' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return undefined;
    if (typeof value !== 'string') return value;
    const v = value.trim();
    return v === '' ? undefined : v;
  })
  telefono?: string;

  @IsString({ message: 'Dial code debe ser una cadena' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return undefined;
    if (typeof value !== 'string') return value;
    const v = value.trim();
    return v === '' ? undefined : v;
  })
  dial_code?: string;


  @IsString({ message: 'Dirección debe ser una cadena' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return undefined;
    if (typeof value !== 'string') return value;
    const v = value.trim();
    return v === '' ? undefined : v;
  })
  direccion?: string
}
