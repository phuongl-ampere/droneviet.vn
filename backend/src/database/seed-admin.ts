import * as bcrypt from "bcrypt";
import { EntityManager } from "typeorm";
import { User, UserRole } from "../auth/entities/user.entity";
import { appDataSource } from "./data-source";

export const LOCAL_ADMIN_EMAIL = "admin@droneviet.vn";
export const LOCAL_ADMIN_PASSWORD = "admin123";

export async function seedAdmin(
  manager: EntityManager,
  environment: NodeJS.ProcessEnv,
): Promise<void> {
  const configuredEmail = environment.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const configuredPassword = environment.SEED_ADMIN_PASSWORD;
  const hasConfiguredCredentials = Boolean(configuredEmail && configuredPassword);
  const usesLocalDefaults =
    !hasConfiguredCredentials && environment.NODE_ENV === "development";
  const email = usesLocalDefaults ? LOCAL_ADMIN_EMAIL : configuredEmail;
  const password = usesLocalDefaults ? LOCAL_ADMIN_PASSWORD : configuredPassword;

  if (!email || !password) {
    throw new Error(
      "SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be configured before seeding an admin",
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await manager.getRepository(User).upsert(
    {
      displayName: "Drone Viet Administrator",
      email,
      passwordHash,
      roles: [UserRole.SUPER_ADMIN],
    },
    ["email"],
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
