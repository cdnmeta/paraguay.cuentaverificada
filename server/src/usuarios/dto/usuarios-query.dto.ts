// src/usuarios/dto/usuarios-query.dto.ts

import { IsOptional } from "class-validator";

/**
 * DTO para consultar un usuario específico
 * Usado en el endpoint GET /usuarios/query-one
 */
export class UserByQueryDto {
  @IsOptional()
  id?: string; // Se convertirá a number en el servicio si es necesario
  @IsOptional()
  documento?: string;
  @IsOptional()
  email?: string;
}

/**
 * DTO para consultar múltiples usuarios con filtros
 * Usado en el endpoint GET /usuarios/query-many
 * 
 * NOTA: Simplificado para evitar conflictos con ValidationPipe
 */
export class UsersForQueryManyDto {
  @IsOptional()
  estado?: string;
  @IsOptional()
  is_super_admin?: string;
  @IsOptional()
  activo?: string;
  @IsOptional()
  nombre?: string;
  @IsOptional()
  documento?: string;
  @IsOptional()
  email?: string;
}