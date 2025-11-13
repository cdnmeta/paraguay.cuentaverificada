import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class RegistrarRecargaDto {
    @IsNumber({},{message: 'la moneda debe ser un número'})
    @IsNotEmpty({message: 'la moneda no debe estar vacía'})
    id_moneda: number;
    @IsNumber({},{message: 'el tipo movimiento debe ser un número'})
    @IsNotEmpty({message: 'el tipo movimiento no debe estar vacío'})
    id_tipo_movimiento: number;
    @IsNumber({},{message: 'el monto debe ser un número'})
    @IsNotEmpty({message: 'el monto no debe estar vacío'})
    monto: number;
    @IsNumber({},{message: 'el id_usuario debe ser un número'})
    @IsNotEmpty({message: 'el id_usuario no debe estar vacío'})
    id_usuario: number;
}

export class RegistrarSolicitudRecargaPayloadDto {
    @IsString({message: 'la descripcion debe ser un string'})
    @IsOptional()
    descripcion?: string;
}

export class RegistrarSolicitudRecargaDto extends RegistrarSolicitudRecargaPayloadDto {
    @Type(() => Number)
    @IsNumber({},{message: 'la moneda debe ser un número'})
    @IsNotEmpty({message: 'la moneda no debe estar vacía'})
    id_moneda: number;

    @Type(() => Number)
    @IsNumber({},{message: 'el tipo movimiento debe ser un número'})
    @IsNotEmpty({message: 'el tipo movimiento no debe estar vacío'})
    id_tipo_movimiento: number;

    id_usuario: number;
}

export class ReHabilitarSolicitudRecargaPayloadDto {
    @IsString({message: 'la observacion debe ser un string'})
    @IsOptional()
    observacion?: string;
}

export class ReHabilitarSolicitudRecargaDto extends ReHabilitarSolicitudRecargaPayloadDto {
    id_usuario_propietario: number;
}

