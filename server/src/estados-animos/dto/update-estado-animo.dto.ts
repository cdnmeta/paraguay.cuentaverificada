import { PartialType } from "@nestjs/mapped-types";
import { CreateEstadosAnimosDtoPayload } from "./create-estados-animos.dto";


export class UpdateEstadoAnimoDtoPayload extends PartialType(CreateEstadosAnimosDtoPayload) {}

export class UpdateEstadoAnimoDto extends UpdateEstadoAnimoDtoPayload {
    id_usuario: number;
}