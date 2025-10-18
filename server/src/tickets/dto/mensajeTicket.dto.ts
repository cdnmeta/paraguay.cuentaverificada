import { Transform, Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

// Base común para ambos roles
export class MensajeTicketPayloadDto {
    @IsString({ message: 'El mensaje debe ser un texto' })
    @IsNotEmpty({ message: 'El mensaje no puede estar vacío' })
    mensaje: string; // Mismo nombre que en BD

    @Type(() => Number)
    @IsNumber({}, { message: 'El id del ticket debe ser un número' })
    @IsNotEmpty({ message: 'El id del ticket no puede estar vacío' })
    id_ticket: number;
}

// DTO específico para clientes (sin campos adicionales)
export class ClienteMensajeTicketPayloadDto extends MensajeTicketPayloadDto {
    // Solo hereda los campos base
}

// DTO específico para soporte (con campos adicionales)
export class SoporteMensajeTicketPayloadDto extends MensajeTicketPayloadDto {
    @Transform(({ value }) => value === 'true' || value === true)
    @IsOptional()
    es_interno?: boolean; // Nombre más claro que 'es_privado'
    
    @IsOptional()
    @IsString()
    cambio_estado?: string; // Para cambios de estado del ticket
}

// DTO interno del servicio (con campos del servidor)
export class MensajeTicketDto extends MensajeTicketPayloadDto {
    id_usuario: number;
    rol_usuario: number;
    es_interno?: boolean;
}