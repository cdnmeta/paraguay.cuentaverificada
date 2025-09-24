type TasaAplicada = {
    idCotizacion: number;
    idMonedaOrigen: number;
    idMonedaDestino: number;
    tasaAplicada:{compra:number, venta:number};
    montoOrigen: number;
    montoConvertido: {compra:number, venta:number};
    ruta: string;
    detalle: string;

}