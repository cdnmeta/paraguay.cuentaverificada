import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
    @IsString()
    @IsNotEmpty({ message: 'El token es obligatorio' })
    readonly token: string;

    @IsString()
    @IsNotEmpty({ message: 'La cédula es obligatoria' })
    readonly cedula: string;
}

export class RefreshTokenResponseDto {
    readonly token: string;
    readonly cedula: string;
    readonly usuario?: any; // Información adicional del usuario si necesitas
}