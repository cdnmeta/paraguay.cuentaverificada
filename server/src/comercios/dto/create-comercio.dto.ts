import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
export class CreateComercioPayloadDto {
  @IsString({ message: 'razon social debe ser string' })
  @IsNotEmpty({ message: 'La razón social es obligatoria' })
  razonSocial: string;

  @IsString({ message: 'ruc debe ser string' })
  @IsNotEmpty({ message: 'El R.U.C. es obligatorio' })
  ruc: string;

  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @IsString({ message: 'direccion debe ser string' })
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  direccion: string;

  @IsOptional()
  @IsString({ message: 'url_maps debe ser string' })
  url_maps?: string;

  @IsString({ message: 'telefono debe ser string' })
  @MinLength(7, { message: 'El teléfono debe tener al menos 7 dígitos' })
  @Matches(/^0?(\d{2,3})\d{6,7}$/, { message: 'Formato de teléfono inválido' })
  telefono: string;

  @IsString({ message: 'Debe seleccionar un país' })
  @MinLength(1, { message: 'Debe seleccionar un país' })
  prefijoTelefono: string;

  @IsString({ message: 'Debe seleccionar un país' })
  @MinLength(2, { message: 'Debe seleccionar un país' })
  codigoPais: string;

  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber({}, { message: 'direccion debe ser un número' })
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  id_usuario_propietario: number;

  @Transform(({ value }) => (value  ? Number(value) : undefined))
  @IsNumber({}, { message: 'id_estado debe ser un número' })
  @IsOptional()
  id_estado?: number;
}

export class CreateComercioDto extends CreateComercioPayloadDto {
  id_usuario_creacion: number;
}
