import { IsIn, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreatePlanPayloadDto {
    @IsString()
    @IsNotEmpty({ message: 'El precio del plan es obligatorio' })
    descripcion: string;

    @IsString()
    @IsNotEmpty({ message: 'El nombre del plan es obligatorio' })
    nombre: string;

    @IsNumber({},{ message: 'El precio del plan debe ser un número' })
    @IsNotEmpty({ message: 'El precio del plan es obligatorio' })
    precio: number;

    @IsNumber({},{ message: 'El precio sin IVA del plan debe ser un número' })
    @IsNotEmpty({ message: 'El precio sin IVA del plan es obligatorio' })
    precio_sin_iva: number;

    @IsString()
    @IsNotEmpty({ message: 'La renovación del plan es obligatoria' })
    @IsIn(['mes', 'anio', 'dia'], { message: 'La renovación del plan debe ser mensual, anual o diario' })
    renovacion_plan: string;

    @IsNumber({}, { message: 'El valor de la renovación debe ser un número' })
    @IsNotEmpty({ message: 'El valor de la renovación es obligatorio' })
    renovacion_valor: number;

    @IsNumber({}, { message: 'El tipo de IVA debe ser un número' })
    @IsNotEmpty({ message: 'El tipo de IVA es obligatorio' })
    tipo_iva: number;


}

export class CreatePlanDto  extends CreatePlanPayloadDto {
    id_usuario: number;
}