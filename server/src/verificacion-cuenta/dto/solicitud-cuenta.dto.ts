import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class SolicitudCuentaPayloadDto  {
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


export class SolicitudCuentaDto extends SolicitudCuentaPayloadDto {
    id_estado?: number; // Opcional para que el cliente no lo envíe
    ip_origen?: string;
    dispositivo?: string;
}





export class ValidarCodigoSolicitudDto {
    @IsString({ message: 'Código de verificación debe ser una cadena' })
    @IsNotEmpty({ message: 'Código de verificación es requerido' })
    @MinLength(6, { message: 'Código de verificación debe tener al menos 6 caracteres' })
    codigo_verificacion: string;

    @IsNotEmpty({ message: 'ID de usuario es requerido' })
    @IsNumber({}, { message: 'ID de usuario debe ser un número' })
    id_usuario: number;
}


