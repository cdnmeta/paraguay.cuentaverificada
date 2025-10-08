import { IsNotEmpty, IsNumber } from "class-validator";

export class UsuarioAgregarFavoritoDto {
    @IsNumber()
    @IsNotEmpty()
    id_comercio: number;
}