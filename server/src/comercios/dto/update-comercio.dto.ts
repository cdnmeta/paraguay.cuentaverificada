import { PartialType } from '@nestjs/mapped-types';
import { CreateComercioDto, CreateComercioPayloadDto } from './create-comercio.dto';

export class UpdateComercioDto extends PartialType(CreateComercioPayloadDto) {
    id_usuario_modificacion: number;
}
