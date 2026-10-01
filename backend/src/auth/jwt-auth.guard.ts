import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserRole } from "./entities/user.entity";

interface AccessTokenPayload {
  sub: string;
  email: string;
  roles: UserRole[];
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: AccessTokenPayload;
    }>();
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      return false;
    }

    try {
      request.user = await this.jwtService.verifyAsync<AccessTokenPayload>(
        authorization.slice("Bearer ".length),
      );
      return true;
    } catch {
      return false;
    }
  }
}
