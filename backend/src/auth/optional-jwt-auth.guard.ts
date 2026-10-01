import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AccessTokenPayload } from "./jwt-auth.guard";

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
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
      return true;
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
