import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { User, UserRole } from "./entities/user.entity";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  displayName: string;
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(input: LoginInput) {
    const email = input.email.trim().toLowerCase();
    const user = await this.userRepository.findOneBy({ email });

    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return this.issueSession(user);
  }

  async register(input: RegisterInput) {
    const email = input.email.trim().toLowerCase();
    const existing = await this.userRepository.findOneBy({ email });

    if (existing) {
      throw new ConflictException("Email is already registered");
    }

    const user = await this.userRepository.save(
      this.userRepository.create({
        displayName: input.displayName.trim(),
        email,
        passwordHash: await bcrypt.hash(input.password, 12),
        roles: [UserRole.CUSTOMER],
      }),
    );

    return this.issueSession(user);
  }

  private async issueSession(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
      },
    };
  }
}
