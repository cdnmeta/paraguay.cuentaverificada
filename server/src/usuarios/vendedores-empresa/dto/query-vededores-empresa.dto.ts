import { IsOptional } from "class-validator";

export class VendedoresForQueryManyDto {
    @IsOptional()
    id?: string;

    @IsOptional()
    cedula?: string;

    @IsOptional()
    nombre?: string;

    @IsOptional()
    codigo?: string;
}