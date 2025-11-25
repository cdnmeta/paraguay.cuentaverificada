import { Expose } from "class-transformer";

export class UserResponseMovimientoWalletDto {
    
    @Expose()
    id: number;
    @Expose()
    id_wallet: number
    id_moneda: number;
    id_tipo_movimiento: number
}