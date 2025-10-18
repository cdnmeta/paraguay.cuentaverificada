import { Expose } from "class-transformer";

export class ResponseTicketAbiertoDto {
    @Expose()
    id: number;
}

export class ResponseTicketDto {
    @Expose()
    id: number;
    @Expose()
    asunto: string;
    @Expose()
    id_estado: number;
}