import { IsInt, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateParticipanteDto {
    @IsInt({ message: 'El id_usuario debe ser un número entero.' })
    @IsNotEmpty({ message: 'El id_usuario es obligatorio.' })
    id_usuario: number;

    @IsNumber({}, { message: 'El monto_meta debe ser un número.' })
    @Min(0, { message: 'El monto_meta no puede ser negativo.' })
    @IsNotEmpty({ message: 'El monto_meta es obligatorio.' })
    monto_meta: number;

    @IsNumber({}, { message: 'El precio_meta debe ser un número.' })
    @Min(0, { message: 'El precio_meta no puede ser negativo.' })
    @IsNotEmpty({ message: 'El precio_meta es obligatorio.' })
    precio_meta: number;

    @IsOptional()
    @IsInt({ message: 'El id_usuario_creacion debe ser un número entero.' })
    id_usuario_creacion?: number;
}
