// src/auth/guards/groups.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GROUPS_ALL_KEY, GROUPS_ANY_KEY } from '../decorators/groups.decorator';
import { UsuariosService } from '@/usuarios/usuarios.service';
import { DatabaseService } from '@/database/database.service';
import { userInfo } from 'os';

type UserLike = {
  id: number | string;          // <-- usa SIEMPRE este campo
  is_super_admin?: boolean;
  userId:number;
};

const sqlInfoUser = `with grupos_usuarios as (

select g.id, g.descripcion,usg.id_usuario from grupos g
left join usuarios_grupos usg on usg.id_grupo = g.id

)

select us.id, us.nombre, us.apellido , is_super_admin,
coalesce(
    jsonb_agg(
      jsonb_build_object('id', gus.id,'descripcion', gus.descripcion)
      ORDER BY gus.id
    ) FILTER (WHERE gus.id IS NOT NULL),
    '[]'::jsonb
  ) AS grupos 
from usuarios us
left join grupos_usuarios gus on gus.id_usuario = us.id
where us.activo = true and us.id  = $1
group by us.id, us.nombre, us.apellido , is_super_admin

`;

@Injectable()
export class GroupsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly dbServices: DatabaseService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const requiredAny =
      this.reflector.getAllAndOverride<number[]>(GROUPS_ANY_KEY, [
        ctx.getHandler(),
        ctx.getClass(),
      ]) ?? [];

    const requiredAll =
      this.reflector.getAllAndOverride<number[]>(GROUPS_ALL_KEY, [
        ctx.getHandler(),
        ctx.getClass(),
      ]) ?? [];

    // Si la ruta no requiere grupos, dejar pasar
    if (requiredAny.length === 0 && requiredAll.length === 0) return true;

    const req = ctx.switchToHttp().getRequest();
    const user: UserLike | undefined = req.user;
      console.log("consutar grupos")
    console.log(user);

    if (!user) {
      throw new ForbiddenException('No autenticado.');
    }

    
    const id_usuario = Number(user.userId); // <-- unifica aquí

    if (!Number.isFinite(id_usuario)) {
        throw new ForbiddenException('Usuario inválido.');
    }
    const userInfoDta = await this.dbServices.query(sqlInfoUser, [id_usuario]);

    if(userInfoDta.rowCount===0) {
      throw new ForbiddenException('Usuario no encontrado.');
    }

    const userInfo = userInfoDta.rows[0];

    if (userInfo.is_super_admin) return true;


    // 🔎 Consulta grupos del usuario
    // Ideal: que el service ya devuelva number[], pero normalizamos por si retorna objetos.
    const gruposDelUsuario = userInfo?.grupos || [];

    
    const userGroupIds = new Set<number>(
      Array.isArray(gruposDelUsuario)
        ? gruposDelUsuario.map((g: any) => {
            // Si ya es number -> úsalo; si es objeto, intenta leer campos comunes
            if (typeof g === 'number') return g;
            if (g?.id) return Number(g.id);
            if (g?.id_grupo) return Number(g.id_grupo);
            if (g?.grupo_id) return Number(g.grupo_id);
            return NaN; // descartaremos NaN abajo
          }).filter((n) => Number.isFinite(n))
        : [],
    );

    // Reglas ANY / ALL
    const anyOk =
      requiredAny.length === 0 ||
      requiredAny.some((id) => userGroupIds.has(Number(id)));

    const allOk =
      requiredAll.length === 0 ||
      requiredAll.every((id) => userGroupIds.has(Number(id)));

    if (!anyOk || !allOk) {
      throw new ForbiddenException('No pertenece a los grupos requeridos.');
    }

    return true;
  }
}
