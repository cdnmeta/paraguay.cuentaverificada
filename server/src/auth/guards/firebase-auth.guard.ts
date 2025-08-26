import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '@/firebase/firebase.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Reflector } from '@nestjs/core';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly firebaseService: FirebaseService, private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      // 💡 See this condition
      return true;
    }

    console.log("hay auth firebase")


    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token found');
    }
    const token = authHeader.split(' ')[1];
    try {
      const decodedToken = await this.firebaseService.verifyIdToken(token);
      console.log(decodedToken)
      request.user = decodedToken; // Opcional, puedes inyectar info extra aquí
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
