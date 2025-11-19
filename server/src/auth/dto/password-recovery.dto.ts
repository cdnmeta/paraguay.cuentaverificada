import { IsNotEmpty, IsOptional, IsString, Max, Min, Length } from 'class-validator';

export class InicializarPasswordPinPayloadByToken {
    @IsNotEmpty({ message: 'El token no puede estar vacío.' })
    @IsString({ message: 'El token debe ser una cadena de texto.' })
    token: string;

    @IsNotEmpty({ message: 'La contraseña no puede estar vacía.' })
    @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
    password: string;

    @IsNotEmpty({ message: 'El PIN no puede estar vacío.' })
    @IsString({ message: 'El PIN debe ser una cadena de texto.' })
    pin: string;

    @IsNotEmpty({ message: 'La cédula no puede estar vacía.' })
    @IsString({ message: 'La cédula debe ser una cadena de texto.' })
    cedula: string;
}


export class InicializarPasswordPinByToken extends InicializarPasswordPinPayloadByToken {
    ip_origen?: string;
    dispositivo_origen?: string;
}

export class CambiarContrasenaDto {
    @IsNotEmpty({ message: 'La nueva contraseña no puede estar vacía.' })
    @IsString({ message: 'La nueva contraseña debe ser una cadena de texto.' })
    password: string;

    @IsNotEmpty({ message: 'El PIN no puede estar vacío.' })
    @IsString({ message: 'El PIN debe ser una cadena de texto.' })
    pin: string;

    @IsNotEmpty({ message: 'La cédula no puede estar vacía.' })
    @IsString({ message: 'La cédula debe ser una cadena de texto.' })
    cedula: string;

    @IsOptional()
    @IsString({ message: 'El token debe ser una cadena de texto.' })
    token?: string;
    
}

export class RecoveryPinDto {
    @IsNotEmpty({ message: 'El token no puede estar vacío.' })
    @IsString({ message: 'El token debe ser una cadena de texto.' })
    token: string;
    @IsNotEmpty({ message: 'La cédula no puede estar vacía.' })
    @IsString({ message: 'La cédula debe ser una cadena de texto.' })
    cedula: string;

    @IsNotEmpty({ message: 'El PIN no puede estar vacío.' })
    @IsString({ message: 'El PIN debe ser una cadena de texto.' })
    @Length(4, 4, { message: 'El PIN debe tener exactamente 4 caracteres.' })
    pin: string;
}


export class SolicitudRecoveryPinPayloadDto {
     @IsNotEmpty({ message: 'La cédula no puede estar vacía.' })
    @IsString({ message: 'La cédula debe ser una cadena de texto.' })
    cedula: string;

    @IsNotEmpty({ message: 'El correo no puede estar vacío.' })
    @IsString({ message: 'El correo debe ser una cadena de texto.' })
    correo: string;
}

export class SolicitudRecoveryPinDto extends SolicitudRecoveryPinPayloadDto {
    url_origen: string;
}

export class ValidacionTokenDto {
    @IsNotEmpty({ message: 'El token no puede estar vacío.' })
    @IsString({ message: 'El token debe ser una cadena de texto.' })
    token: string;

    @IsNotEmpty({ message: 'La cédula no puede estar vacía.' })
    @IsString({ message: 'La cédula debe ser una cadena de texto.' })
    cedula: string;
}