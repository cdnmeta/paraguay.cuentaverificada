import { PrismaService } from '@/prisma/prisma.service';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RequireUserVerificadoGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}
 async canActivate(
    context: ExecutionContext,
  ):  Promise<boolean> {
    
    try {
      const request = context.switchToHttp().getRequest();
      const user = request.user;

      console.log(user)

      const usuarioEnconrado = await this.prismaService.usuarios.findFirst({
        where: {
          id: user.userId,
          activo: true,
        }
      })

      
      if(!usuarioEnconrado)  throw new ForbiddenException('Usuario no encontrado o inactivo');

      if(usuarioEnconrado?.verificado !== true) {
        throw new ForbiddenException('Usuario no admitido para esta accion');
      }

      return true;
    } catch (error) {
      throw error
    }
  }
}
