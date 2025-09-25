import { IsString, IsNotEmpty } from 'class-validator';

export class CrearDireccionUsuarioPayloadDTO {
    @IsString({ message: 'El título debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El título no puede estar vacío.' })
    titulo: string;

    @IsString({ message: 'La dirección debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'La dirección no puede estar vacía.' })
    direccion: string;

    @IsString({ message: 'La URL de Maps debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'La URL de Maps no puede estar vacía.' })
    url_maps: string;

    @IsString({ message: 'La referencia debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'La referencia no puede estar vacía.' })
    referencia: string;
}

export class CrearDireccionUsuarioDTO extends CrearDireccionUsuarioPayloadDTO {
    id_usuario: number;
}

export class ActualizarDireccionUsuarioDTO extends CrearDireccionUsuarioDTO {}