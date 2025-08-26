import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @IsString()
    @IsNotEmpty({ message: 'El documento es obligatorio' })
    readonly documento: string;

    @IsString()
    @MinLength(6)
    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    readonly password: string;
}