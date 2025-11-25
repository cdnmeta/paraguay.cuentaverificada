import { IsIn, isIn, IsNotEmpty, IsString } from 'class-validator';

export class SuscribeNotificacionPayloadDto {
  @IsString({ message: 'El token debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El token no puede estar vacío' })
  token: string;

  @IsString({ message: 'El canal debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El canal no puede estar vacío' })
  @IsIn(['fcm'], { message: 'Canal inválido. Valores permitidos: fcm' })
  proveedor: string;
}

export class SuscribeNotificacionDto extends SuscribeNotificacionPayloadDto {
  id_usuario: number;
  user_agent?: string;
  plataforma?: string;
  modelo_dispositivo?: string;
  so_version?: string;
  app_version?: string;
  idioma?: string;
  region?: string;
  ip_origen?: string;
}
