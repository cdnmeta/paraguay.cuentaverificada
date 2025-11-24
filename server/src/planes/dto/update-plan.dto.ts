import { PartialType } from "@nestjs/mapped-types";
import { CreatePlanPayloadDto } from "./create-plan.dto";

export class UpdatePlanPayloadDto extends PartialType(CreatePlanPayloadDto) {}

export class UpdatePlanDto  extends UpdatePlanPayloadDto {
    id_usuario_actualizacion: number;
}