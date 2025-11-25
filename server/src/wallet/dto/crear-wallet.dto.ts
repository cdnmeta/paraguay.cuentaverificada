import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class CrearWalletDto {
    @Type(() => Number)
    @IsNumber({},{message: 'El ID de usuario debe ser un número'})
    @IsNotEmpty({message: 'El ID de usuario es obligatorio'})
    id_usuario: number;

    @Type(() => Number)
    @IsNumber({},{message: 'El ID de moneda debe ser un número'})
    @IsNotEmpty({message: 'El ID de moneda es obligatorio'})
    id_moneda: number;

    @Type(() => Number)
    @IsNumber({},{message: 'El monto inicial debe ser un número'})
    @IsOptional()
    monto_inicial?: number = 0;
}