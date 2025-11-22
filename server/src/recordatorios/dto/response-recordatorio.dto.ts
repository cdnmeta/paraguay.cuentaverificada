import { Expose } from "class-transformer";

export class ResponseRecordatorioDto {
    @Expose()
    id: number;

    @Expose()
    descripcion: string;

    @Expose()
    titulo: string;

    @Expose()
    id_estado: number;

    @Expose()
    id_usuario: number;

    @Expose()
    url_imagen: string[];

    @Expose()
    fecha_creacion: Date;

    @Expose()
    fecha_actualizacion: Date;

    @Expose()
    fecha_recordatorio: Date;
}