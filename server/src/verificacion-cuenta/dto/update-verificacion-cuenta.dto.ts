import { Type } from 'class-transformer';
import { IsOptional, IsEmail, IsString, IsNumber, Length, IsDateString } from 'class-validator';

export class UpdateVerificacionCuentaDto {
    @IsOptional()
    @IsEmail({}, { message: 'El correo debe ser un correo electrónico válido.' })
    correo?: string;

    @IsOptional()
    @IsString({ message: 'El nombre debe ser una cadena de texto.' })
    nombre?: string;

    @IsOptional()
    @IsString({ message: 'El apellido debe ser una cadena de texto.' })
    apellido?: string;

    @IsOptional()
    @IsString({ message: 'El código de país debe ser una cadena de texto.' })
    dial_code?: string;

    @IsOptional()
    @IsString({ message: 'El teléfono debe ser una cadena de texto.' })
    @Length(7, 15, { message: 'El teléfono debe tener entre 7 y 15 caracteres.' })
    telefono?: string;

    @IsOptional()
    @IsString({ message: 'El documento debe ser una cadena de texto.' })
    documento?: string;


    @Type(() => Number)
    @IsOptional()
    @IsNumber({}, { message: 'El ID de usuario de actualización debe ser un número.' }) 
    id_usuario_actualizacion?: number;


    @IsDateString({}, { message: 'La fecha de nacimiento debe ser una fecha válida.' })
    @IsOptional()
    fecha_nacimiento?: string | null;

}


export class RechazoCuentaDto {
    @IsString({ message: 'El motivo de rechazo debe ser una cadena de texto.' })
    motivo: string;

    @Type(() => Number)
    @IsNumber({}, { message: 'El ID de usuario de rechazo debe ser un número.' })
    id_usuario_rechazo: number;

    @Type(() => Number)
    @IsOptional()
    @IsNumber({}, { message: 'El ID de usuario de actualización debe ser un número.' }) 
    id_usuario_actualizacion?: number;
}

export class AprobarCuenta {
    @Type(() => Number)
    @IsNumber({}, { message: 'El ID de usuario de aprobación debe ser un número.' })
    id_usuario_aprobacion: number;

    @Type(() => Number)
    @IsOptional()
    @IsNumber({}, { message: 'El ID de usuario de actualización debe ser un número.' }) 
    id_usuario_actualizacion?: number;
}
