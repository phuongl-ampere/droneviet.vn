import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { AccessTokenPayload, JwtAuthGuard } from "./jwt-auth.guard";
import { OptionalJwtAuthGuard } from "./optional-jwt-auth.guard";

type AuthenticatedRequest = Request & { user: AccessTokenPayload };
type OptionalAuthenticatedRequest = Request & { user?: AccessTokenPayload };

const accessCookieOptions = {
  httpOnly: true,
  maxAge: 60 * 60 * 1000,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(
    @Body() input: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.authService.login(input);
    response.cookie(
      "droneviet_access",
      session.accessToken,
      accessCookieOptions,
    );
    return session;
  }

  @Post("register")
  async register(
    @Body() input: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.authService.register(input);
    response.cookie(
      "droneviet_access",
      session.accessToken,
      accessCookieOptions,
    );
    return session;
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  profile(@Req() request: AuthenticatedRequest) {
    return this.authService.profile(request.user.sub);
  }

  @Get("session")
  @UseGuards(OptionalJwtAuthGuard)
  async session(@Req() request: OptionalAuthenticatedRequest) {
    return {
      user: request.user
        ? await this.authService.profile(request.user.sub)
        : null,
    };
  }

  @Patch("profile")
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Body() input: UpdateProfileDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.authService.updateProfile(request.user.sub, input);
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie("droneviet_access", { path: "/" });
  }
}
