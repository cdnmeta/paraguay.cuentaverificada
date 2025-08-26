import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MinLength, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';
import { PartialType, OmitType } from '@nestjs/mapped-types';
export class SolicitarVerificacionComercioDto {
  @IsString({ message: 'razon social debe ser string' })
  @IsNotEmpty({ message: 'La razón social es obligatoria' })
  razonSocial: string;

  @IsString({ message: 'ruc debe ser string' })
  @IsNotEmpty({ message: 'El R.U.C. es obligatorio' })
  ruc: string;

  @IsString({ message: 'telefono debe ser string' })
  @MinLength(7, { message: 'El teléfono debe tener al menos 7 dígitos' })
  @Matches(/^0?(\d{2,3})\d{6,7}$/, { message: 'Formato de teléfono inválido' })
  telefono: string;

  @IsOptional()
  @IsString({ message: 'El código de vendedor debe ser una cadena de texto' })
  codigoVendedor?: string;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'Debe aceptar los términos y condiciones' })
  @ValidateIf((o) => o.aceptaTerminos === true)
  aceptaTerminos: boolean;

  @IsString({ message: 'Debe seleccionar un país' })
  @MinLength(1, { message: 'Debe seleccionar un país' })
  prefijoTelefono: string;

  @IsString({ message: 'Debe seleccionar un país' })
  @MinLength(2, { message: 'Debe seleccionar un país' })
  codigoPais: string;
}

export class SolicitudVerificacionRegistrarComercioDto extends SolicitarVerificacionComercioDto {
    @Transform(({ value }) => Number(value))
    @IsNumber({}, { message: 'El ID de usuario debe ser un número' })
  @IsNotEmpty({ message: 'El ID de usuario no puede estar vacío' })
  id_usuario: number;

  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'El ID de usuario de creación debe ser un número' })
  @IsNotEmpty({ message: 'El ID de usuario de creación no puede estar vacío' })
  id_usuario_creacion: number;
}

export class UpdateSolicitudComercioDto extends OmitType(SolicitarVerificacionComercioDto, ['aceptaTerminos',"codigoVendedor"]) {
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'El ID de usuario debe ser un número' })
  @IsOptional()
  id_estado: number;

  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'El ID de usuario debe ser un número' })
  @IsOptional()
  id_usuario_actualizacion: number;

}


export class UpdateSeguimientoAprobacionComercioDto {
  @IsNumber({}, { message: 'El estado debe ser un número' })
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  estado: number;

  @IsNumber({}, { message: 'El ID del comercio debe ser un número' })
  @IsOptional()
  id_usuario_seguimiento: number;

  @IsOptional()
  @IsString()
  motivo?: string;
}