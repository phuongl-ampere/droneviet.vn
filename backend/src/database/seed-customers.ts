import * as bcrypt from "bcrypt";
import { EntityManager } from "typeorm";
import { User, UserRole } from "../auth/entities/user.entity";
import { appDataSource } from "./data-source";

const demoCustomers = [
  { displayName: "Demo Customer 1", email: "customer1@droneviet.vn" },
  { displayName: "Demo Customer 2", email: "customer2@droneviet.vn" },
  { displayName: "Demo Customer 3", email: "customer3@droneviet.vn" },
];

export async function seedDemoCustomers(
  manager: EntityManager,
  environment: NodeJS.ProcessEnv,
): Promise<void> {
  if (environment.NODE_ENV !== "development") {
    throw new Error("DEMO_CUSTOMER_SEED_FORBIDDEN");
  }

  const password = environment.SEED_DEMO_CUSTOMER_PASSWORD;

  if (!password) {
    throw new Error("SEED_DEMO_CUSTOMER_PASSWORD must be configured");
  }

  const repository = manager.getRepository(User);
  const passwordHash = await bcrypt.hash(password, 12);

  for (const customer of demoCustomers) {
    const existing = await repository.findOneBy({ email: customer.email });

    if (existing) {
      continue;
    }

    await repository.save(
      repository.create({
        ...customer,
        passwordHash,
        roles: [UserRole.CUSTOMER],
      }),
    );
  }
}

async function main(): Promise<void> {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("DEMO_CUSTOMER_SEED_FORBIDDEN");
  }

  await appDataSource.initialize();
  await appDataSource.transaction((manager) =>
    seedDemoCustomers(manager, process.env),
  );
  await appDataSource.destroy();
}

if (require.main === module) {
  void main();
}
