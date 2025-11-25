import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsObject,
  IsNotEmpty,
} from 'class-validator';
import { NotificationCode } from '../enums/notification-code.enum';
import { NotificationPriority } from '../enums/notification.enums';


export class NotificationRequestPaylodDto {
    @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(NotificationCode)
  code: NotificationCode;

  @IsObject()
  @IsOptional()
  data?: Record<string, any>;

  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority = NotificationPriority.NORMAL;

  @IsNumber()
  @IsNotEmpty({ message: 'El tipo de notificación no puede estar vacío' })
  tipo_notificacion: number;
}

export class NotificationRequestDto extends NotificationRequestPaylodDto {
  @IsNumber()
  userId: number;
}
