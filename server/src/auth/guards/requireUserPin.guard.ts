import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { UsuariosService } from '@/usuarios/usuarios.service';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';
import { verify } from '@/utils/security';

@Injectable()
export class RequireUserPinGuard implements CanActivate {
    constructor(private readonly usuariosService: UsuariosService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const user = request.user;
        const {body} = request;

        if (!user) {
            throw new UnauthorizedException('Usuario no autenticado');
        }

        if (!body.pin) {
            throw new UnauthorizedException('Pin no fue proporcionado');
        }

        const {pin} = body;


        // Busca el usuario y verifica el PIN
        const dbUser = await this.usuariosService.getUsuarioById(user.userId);
        if (!dbUser) throw new NotFoundException('Usuario no encontrado');
        if (!dbUser.pin) throw new UnauthorizedException('Usuario no tiene un pin configurado');

        const pinMatches = await verify(pin, dbUser.pin);
        if (!pinMatches) throw new UnauthorizedException('Pin incorrecto');

        return true;
    }
}