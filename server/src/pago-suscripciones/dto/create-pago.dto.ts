import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class RegistrarPagoSuscripcionDTO {
    // campos requeridos para registrar un pago de suscripción

    @IsDateString()
    @IsNotEmpty({ message: 'Fecha de pago es requerida' })
    fecha_pago: string;

    @IsNumber({}, { message: 'ID de factura debe ser un número' })
    @IsNotEmpty({ message: 'ID de factura es requerido' })
    id_factura: number;

    @IsNumber({}, { message: 'Monto debe ser un número' })
    @IsNotEmpty({ message: 'Monto es requerido' })
    monto: number;

    @IsNumber({}, { message: 'El metodo de pago debe ser un número' })
    @IsNotEmpty({ message: 'ID de metodo de pago es requerido' })
    id_metodo_pago: number;

    @IsNumber({}, { message: 'ID de moneda debe ser un número' })
    @IsNotEmpty({ message: 'ID de moneda es requerido' })
    id_moneda: number;


    @IsNumber({},{message:"ID de cotización es requerido"})
    @IsOptional()
    id_cotizacion: number;

    // campos no requeridos
    @IsString({ message: 'Número de comprobante debe ser una cadena' })
    @IsOptional()
    numero_comprobante?: string;

    @IsNumber({}, { message: 'La entidad financiera debe ser numerica' })
    @IsOptional()
    id_entidad_financiera?: number;

}