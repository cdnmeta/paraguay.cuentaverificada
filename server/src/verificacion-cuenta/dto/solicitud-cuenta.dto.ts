import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class SolicitudCuentaDto {
    @IsString({ message: 'Nombre debe ser una cadena' })
    @IsNotEmpty({ message: 'Nombre es requerido' })
    nombre: string;

    @IsString({ message: 'Apellido debe ser una cadena' })
    @IsNotEmpty({ message: 'Apellido es requerido' })
    apellido: string

    @IsString({ message: 'Documento debe ser una cadena' })
    @IsNotEmpty({ message: 'Documento es requerido' })
    documento: string;

    @IsString({ message: 'Correo debe ser una cadena' })
    @IsEmail({}, { message: 'Correo inválido' })
    @IsNotEmpty({ message: 'Correo es requerido' })
    correo: string;

    @IsString({ message: 'Teléfono debe ser una cadena' })
    @IsNotEmpty({ message: 'Teléfono inválido' })
    telefono: string;

    @IsString({ message: 'Código de marcación debe ser una cadena' })
    @IsNotEmpty({ message: 'Código de marcación es requerido' })
    dial_code: string;
}


