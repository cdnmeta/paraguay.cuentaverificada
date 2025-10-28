import { PartialType } from '@nestjs/mapped-types';
import { CreateSemaforoFinancieroDto } from './create-semaforo_financiero.dto';

export class UpdateSemaforoFinancieroDto extends CreateSemaforoFinancieroDto {}


export class BorrarAbonoSemaforoFinancieroDto {
    id_usuario: number;
}
