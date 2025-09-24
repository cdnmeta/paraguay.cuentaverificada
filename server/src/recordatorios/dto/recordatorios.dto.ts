import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, isNotEmpty, IsNotEmpty } from 'class-validator';
import { Transform, Type } from 'class-transformer';

// DTO para el payload del cliente (sin id_usuario)
export class CreateRecordatorioPayloadDto {
  @IsString()
  @IsNotEmpty({ message: 'El título es requerido' })
  @Type(() => String)
  @Transform(({ value }) => value.trim())
  titulo: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id_estado?: number;
}

// DTO interno con id_usuario inyectado desde el token
export class CreateRecordatorioDto extends CreateRecordatorioPayloadDto {
  id_usuario: number; // Se asigna desde el token JWT
}

export class UpdateRecordatorioPayloadDto {
  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  @Transform(({ value }) => value.trim())
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id_estado?: number;
}

export class UpdateRecordatorioDto extends UpdateRecordatorioPayloadDto {
  id_usuario: number; // Se asigna desde el token JWT
}

export class EliminarImagenesDto {
  @IsArray()
  @IsString({ each: true })
  urlsAEliminar: string[];
}

export class UpdateEstadoPayloadDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  id_estado: number;
}

export class UpdateEstadoDto extends UpdateEstadoPayloadDto {
  id_usuario: number; // Se asigna desde el token JWT

}