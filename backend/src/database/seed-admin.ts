import * as bcrypt from "bcrypt";
import { EntityManager } from "typeorm";
import { User, UserRole } from "../auth/entities/user.entity";
import { appDataSource } from "./data-source";

export async function seedAdmin(
  manager: EntityManager,
  environment: NodeJS.ProcessEnv,
): Promise<void> {
  const email = environment.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = environment.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be configured before seeding an admin",
    );
  }

  const repository = manager.getRepository(User);
  const existing = await repository.findOneBy({ email });

  if (existing) {
    if (environment.FORCE_RESET_ADMIN_PASSWORD !== "true") {
      return;
    }

    existing.passwordHash = await bcrypt.hash(password, 12);
    await repository.save(existing);
    return;
  }

  await repository.save(
    repository.create({
      displayName: "Drone Viet Administrator",
      email,
      passwordHash: await bcrypt.hash(password, 12),
      roles: [UserRole.SUPER_ADMIN],
    }),
  );
}

async function main(): Promise<void> {
  await appDataSource.initialize();
  await appDataSource.transaction((manager) => seedAdmin(manager, process.env));
  await appDataSource.destroy();
}

if (require.main === module) {
  void main();
}
