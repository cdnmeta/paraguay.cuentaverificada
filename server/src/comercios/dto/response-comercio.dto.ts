import { Expose } from 'class-transformer';

export class ResponseComercioDto {
  @Expose()
  id: string;

  @Expose()
  razon_social: string;

  @Expose()
  codigo_pais: string;

  @Expose()
  ruc: string;

  @Expose()
  telefono: string;

  @Expose()
  dial_code: string;

  @Expose()
  id_usuario: string;

  @Expose()
  slug: string;
  @Expose()
  url_comprobante_pago: string;

  @Expose()
  estado: number;

  @Expose()
  urlmaps: string;

  @Expose()
  correo_empresa: string;

  @Expose()
  direccion: string;
}
