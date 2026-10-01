import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserRole } from "./entities/user.entity";

export interface AccessTokenPayload {
  sub: string;
  email: string;
  roles: UserRole[];
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      cookies?: { droneviet_access?: string };
      headers: { authorization?: string };
      user?: AccessTokenPayload;
    }>();
    const authorization = request.headers.authorization;
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length)
      : request.cookies?.droneviet_access;

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      request.user = await this.jwtService.verifyAsync<AccessTokenPayload>(
        token,
      );
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
