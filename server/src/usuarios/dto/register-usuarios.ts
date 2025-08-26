import { IsString, IsNotEmpty, IsEmail, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class RegisterUsuariosDto {
    @IsString({ message: 'Nombre debe ser una cadena' })
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    nombre: string;

    @IsString({ message: 'La contraseña debe ser una cadena' })
    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    contrasena: string;

    @IsString({ message: 'El método de registro debe ser una cadena' })
    @IsOptional()
    apellido?: string | null;

    @IsString({ message: 'El documento debe ser una cadena' })
    @IsNotEmpty({ message: 'El documento es obligatorio' })
    documento: string;

    @IsEmail({}, { message: 'El correo debe ser un correo válido' } )
    @IsNotEmpty({ message: 'El correo es obligatorio' })
    correo: string;

    @IsString({ message: 'Sexo debe ser una cadena' })
    @IsEnum(['1', '2'], { message: 'Opcion de sexo admitida' })
    @IsOptional()
    sexo?: string | null;
    
    @IsDateString({}, { message: 'Fecha de nacimiento debe ser una fecha válida' })
    @IsOptional()
    fechaNacimiento?: Date | null;

    @IsString({ message: 'Metodo de registro debe ser una cadena' })
    @IsOptional()
    metodoRegistro?: string | null;
}