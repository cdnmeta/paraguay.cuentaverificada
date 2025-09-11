// src/common/guards/onlyAdmin.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_ONLY_ADMIN_KEY } from '../decorators/onlyAdmin.decorator';

@Injectable()
export class OnlyAdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isOnlyAdmin = this.reflector.getAllAndOverride<boolean>(IS_ONLY_ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log("verificando si es admin");

    if (!isOnlyAdmin) return true; // si la ruta no está decorada, permitir acceso

    const request = context.switchToHttp().getRequest();
    const user = request.user;


    return user?.isa === true;
  }
}
