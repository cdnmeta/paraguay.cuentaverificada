import { Transform } from "class-transformer";
import { IsOptional } from "class-validator";

export class QueryForUsers {
  @Transform(({ value }) => value.split(",").map((id:any) => Number(id)))
  @IsOptional()
  estado: number[];

  @IsOptional()
  cursor: number;

  @IsOptional()
  take: number;
}
