import { generarUUIDHASH } from "./security";

interface ICrearSlugOpciones {
  separador?: string;
  agregarDigito?: boolean;
}

export function crearSlug(texto: string, opciones: ICrearSlugOpciones = {}) {
  const { separador = "-", agregarDigito } = opciones;
  let base = texto
    .toString()
    .toLowerCase()
    .normalize("NFD") // Separa letras de acentos
    .replace(/[\u0300-\u036f]/g, "") // Elimina acentos
    .replace(/[^a-z0-9\s-]/g, "") // Elimina caracteres especiales
    .trim()
    .replace(/\s+/g, separador)
    .replace(/-+/g, separador);

  if (agregarDigito) {
    const ultimos_digitos = generarUUIDHASH().slice(-6);
    base = `${base}${separador}${ultimos_digitos}`;
  }

  return base;
}

export function crearNombreArchivoDesdeMulterFile(file: Express.Multer.File): string {
  const nombreOriginal = file.originalname;
  const extension = nombreOriginal.split('.').pop();
  const idHashNombre = `${generarUUIDHASH()}`;
  return `${idHashNombre}.${extension}`;
}
interface IvasFacturaTotales {
  total_factura: number;
  total_grav_5: number | null;
  total_grav_10: number | null;
  total_iva_5: number | null;
  total_iva_10: number | null;
}
export const  getIvasFacturaTotales = (total:number,id_iva:number) => {
  const result: any = {total_factura: total}
  switch (id_iva) {
    case 1:
      result.total_grav_5 = null
      result.total_grav_10 = null
      result.total_iva_5 = null
      result.total_iva_10 = null
      break;
    case 2:
      result.total_grav_5 =  total - (total / 21)
      result.total_grav_10 = null
      result.total_iva_5 = total / 21
      result.total_iva_10 = null
      break;
    case 3:
      result.total_grav_5 = null
      result.total_grav_10 = total - (total / 11) 
      result.total_iva_5 = null
      result.total_iva_10 = total / 11
      break;
    default:
      throw new Error("No se pudo ver el tipo de iva")
    
  }
  
  return result
  
}

interface IFechaVencimiento {
  fecha: Date;
  tipoRenovacion: 'dia' | 'anio' | 'mes';
  valor: number;
}

export const calcularFechaVencimiento = (data: IFechaVencimiento): Date | null => {
  try {
    const { fecha, tipoRenovacion, valor } = data;
  const nuevaFecha = new Date(fecha);
  if (isNaN(nuevaFecha.getTime())) {
    throw new Error("Fecha inválida");
  }
  switch (tipoRenovacion) {
    case 'dia':
      nuevaFecha.setDate(nuevaFecha.getDate() + valor);
      break;
    case 'mes':
      nuevaFecha.setMonth(nuevaFecha.getMonth() + valor);
      break;
    case 'anio':
      nuevaFecha.setFullYear(nuevaFecha.getFullYear() + valor);
      break;
  }
  return nuevaFecha;
  } catch (error) {
    return null
  }
};


export const redondearDecimales = (n: number,decimales:number = 2) => Number(n.toFixed(decimales));