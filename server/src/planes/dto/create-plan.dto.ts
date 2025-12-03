import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  IsOptional,
} from 'class-validator';

class PlanPorcentajeRepartirDto {
  @IsNumber({}, { message: 'El tipo de reparto debe ser un número' })
  @IsNotEmpty({ message: 'El tipo de reparto es obligatorio' })
  id_tipo: number;

  @IsNumber({}, { message: 'El porcentaje debe ser un número' })
  @IsNotEmpty({ message: 'El porcentaje es obligatorio' })
  @Min(0, { message: 'El porcentaje debe ser al menos 0' })
  @Max(100, { message: 'El porcentaje no puede ser mayor a 100' })
  porcentaje_primera_venta: number = 0;

  @IsNumber({}, { message: 'El porcentaje debe ser un número' })
  @IsNotEmpty({ message: 'El porcentaje es obligatorio' })
  @Min(0, { message: 'El porcentaje debe ser al menos 0' })
  @Max(100, { message: 'El porcentaje no puede ser mayor a 100' })
  porcentaje_venta_recurrente: number = 0;
}

export class CreatePlanPayloadDto {
  @IsString()
  @IsNotEmpty({ message: 'El precio del plan es obligatorio' })
  descripcion: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre del plan es obligatorio' })
  nombre: string;

  @IsNumber({}, { message: 'El precio del plan debe ser un número' })
  @IsNotEmpty({ message: 'El precio del plan es obligatorio' })
  precio: number;

  @IsNumber({}, { message: 'El precio sin IVA del plan debe ser un número' })
  @IsNotEmpty({ message: 'El precio sin IVA del plan es obligatorio' })
  precio_sin_iva: number;

  @IsString()
  @IsNotEmpty({ message: 'La renovación del plan es obligatoria' })
  @IsIn(['mes', 'anio', 'dia'], {
    message: 'La renovación del plan debe ser mensual, anual o diario',
  })
  renovacion_plan: string;

  @IsNumber({}, { message: 'El valor de la renovación debe ser un número' })
  @IsNotEmpty({ message: 'El valor de la renovación es obligatorio' })
  renovacion_valor: number;

  @IsNumber({}, { message: 'El tipo de IVA debe ser un número' })
  @IsNotEmpty({ message: 'El tipo de IVA es obligatorio' })
  tipo_iva: number;

  @IsNumber({}, { message: 'El precio de oferta debe ser un número' })
  @IsOptional()
  precio_oferta: number | null;

  @Transform(({ value }) => value == 'true' || value === true)
  @IsOptional()
  esta_en_oferta?: boolean;

  @IsArray({ message: 'Los porcentajes de reparto deben ser un arreglo' })
  @ArrayNotEmpty({
    message: 'Los porcentajes de reparto no pueden estar vacíos',
  })
  @ValidateNested({ each: true })
  @Type(() => PlanPorcentajeRepartirDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        // Deja el string para que falle @IsArray con mensaje correcto
        return value;
      }
    }
    return value;
  })
  porcentajes_repartir: PlanPorcentajeRepartirDto[];
}

export class CreatePlanDto extends CreatePlanPayloadDto {
  id_usuario: number;
}
