import { IsDateString, IsNotEmpty, IsNumber, IsOptional } from "class-validator";


export class GuardarMensajeDiaPayloadDto {
    @IsNumber({},{message: 'El id_mesaje debe ser un número'})
    @IsNotEmpty({message: 'El id_mesaje no debe estar vacío'})
    id_mesaje: number;
    
    @IsDateString()
    @IsOptional()
    fecha?: Date;
}

export class GuardarMensajeDiaDto extends GuardarMensajeDiaPayloadDto {
    id_usuario: number;
}