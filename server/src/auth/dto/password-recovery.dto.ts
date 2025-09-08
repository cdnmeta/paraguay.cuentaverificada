import { IsNotEmpty, IsString } from 'class-validator';

export class InicializarPasswordPinByToken {
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