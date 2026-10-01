import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { User, UserRole } from "./entities/user.entity";
import { minimumRegistrationPasswordLength } from "./password-policy";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  displayName: string;
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  displayName?: string;
  phone?: string;
}

type SafeUser = {
  displayName: string | null;
  email: string;
  id: string;
  phone: string | null;
  roles: UserRole[];
};

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
    const minimumPasswordLength = minimumRegistrationPasswordLength(process.env);

    if (input.password.length < minimumPasswordLength) {
      throw new BadRequestException(
        `Password must be at least ${minimumPasswordLength} characters long`,
      );
    }

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

  async profile(userId: string): Promise<SafeUser> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return this.safeUser(user);
  }

  async updateProfile(
    userId: string,
    input: UpdateProfileInput,
  ): Promise<SafeUser> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (input.displayName !== undefined) {
      user.displayName = input.displayName.trim();
    }
    if (input.phone !== undefined) {
      user.phone = input.phone.trim() || null;
    }

    return this.safeUser(await this.userRepository.save(user));
  }

  private async issueSession(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: this.safeUser(user),
    };
  }

  private safeUser(user: User): SafeUser {
    return {
      displayName: user.displayName ?? null,
      email: user.email,
      id: user.id,
      phone: user.phone ?? null,
      roles: user.roles,
    };
  }
}
