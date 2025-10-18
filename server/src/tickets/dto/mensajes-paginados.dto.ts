import { Transform, Type } from "class-transformer";
import { IsNumber, IsOptional, IsBoolean, Min, Max } from "class-validator";

export class GetMensajesQueryDto {
  @IsNumber()
  ticketId: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lastMessageId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  firstMessageId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(50)
  limit?: number = 15;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeInternal?: boolean;
}

export class MensajePaginadoDto {
  id: number;
  mensaje: string;
  url_archivo: string[];
  rol_autor: number;
  es_interno: boolean;
  fecha_creacion: Date;
  id_autor: number;
  autor_nombre: string;
  autor_apellido: string;
  autor_email: string;
}

export class PaginationInfoDto {
  hasMore: boolean;
  hasPrevious: boolean;
  firstMessageId?: number;
  lastMessageId?: number;
  count: number;
  limit: number;
}

export class MensajesPaginadosResponseDto {
  mensajes: MensajePaginadoDto[];
  pagination: PaginationInfoDto;
}

export class TicketInfoDto {
  id: number;
  asunto: string;
  id_reportante: number;
  id_asignado: number;
  id_tipo_ticket: number;
  prioridad: number;
  id_estado: number;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  ultimo_mensaje_at: Date;
  tipo_descripcion?: string;
}

export class TicketHiloCompleteDto extends MensajesPaginadosResponseDto {
  ticket: TicketInfoDto;
}