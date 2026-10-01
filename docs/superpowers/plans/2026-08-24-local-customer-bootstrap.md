# Local Customer Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore local customer registration, seed demo customer accounts, and allow a short local-development password without weakening production authentication.

**Architecture:** The API reads an ignored local environment file whose host ports match Docker Compose. A development-only seed script inserts customers idempotently. Registration uses a shared minimum-length helper: six characters outside production and twelve characters in production.

**Tech Stack:** NestJS 10, TypeORM 0.3, MySQL 8, React 19, TypeScript, Vitest.

## Global Constraints

- Local API uses MySQL `127.0.0.1:3307`, Redis `127.0.0.1:6380`, and frontend origins on port `3000`.
- Demo customers must never be seeded in production.
- Demo password is `123456` only in the ignored local environment file.
- Production registration rejects passwords shorter than 12 characters; development accepts 6 or more.

---

### Task 1: Make local API configuration match Docker Compose

**Files:**
- Create: `backend/.env` (ignored local configuration)
- Modify: `backend/.env.example`
- Modify: `backend/package.json`

**Interfaces:**
- Consumes: Docker Compose MySQL/Redis host ports.
- Produces: TypeORM migration and seed commands that load `backend/.env` before importing `appDataSource`.

- [ ] **Step 1: Verify the current failure**

Run: `npm run start:dev`

Expected: TypeORM reports `ECONNREFUSED` because its default MySQL port is `3306`.

- [ ] **Step 2: Add local runtime values**

```dotenv
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://127.0.0.1:3000,http://localhost:3000
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3307
DATABASE_NAME=droneviet
DATABASE_USER=droneviet
DATABASE_PASSWORD=droneviet
REDIS_URL=redis://127.0.0.1:6380
JWT_ACCESS_SECRET=local-development-access-secret
JWT_REFRESH_SECRET=local-development-refresh-secret
SEED_DEMO_CUSTOMER_PASSWORD=123456
```

Change direct TypeORM commands to run through `node -r dotenv/config -r ts-node/register`, exactly like the existing admin seed command.

- [ ] **Step 3: Verify API connectivity**

Run: `npm run migration:run && npm run start:dev`

Expected: migrations succeed and `GET /health` returns `200` on port `4000`.

### Task 2: Add a development-only demo customer seed

**Files:**
- Create: `backend/src/database/seed-customers.ts`
- Create: `backend/src/database/seed-customers.spec.ts`
- Modify: `backend/package.json`

**Interfaces:**
- Produces: `seedDemoCustomers(manager, environment): Promise<void>` and `npm run seed:customers`.
- Demo users: `customer1@droneviet.vn`, `customer2@droneviet.vn`, `customer3@droneviet.vn`; each role is `[UserRole.CUSTOMER]`.

- [ ] **Step 1: Write failing seed tests**

```ts
await seedDemoCustomers(manager, {
  NODE_ENV: "development",
  SEED_DEMO_CUSTOMER_PASSWORD: "123456",
});

expect(repository.create).toHaveBeenCalledTimes(3);
await expect(
  seedDemoCustomers(manager, { NODE_ENV: "production" }),
).rejects.toThrow("DEMO_CUSTOMER_SEED_FORBIDDEN");
```

- [ ] **Step 2: Run red test**

Run: `npm test -- src/database/seed-customers.spec.ts`

Expected: FAIL because the seed module does not exist.

- [ ] **Step 3: Implement the idempotent seed**

```ts
if (environment.NODE_ENV === "production") {
  throw new Error("DEMO_CUSTOMER_SEED_FORBIDDEN");
}
for (const customer of demoCustomers) {
  if (!(await repository.findOneBy({ email: customer.email }))) {
    await repository.save(repository.create({
      ...customer,
      passwordHash: await bcrypt.hash(password, 12),
      roles: [UserRole.CUSTOMER],
    }));
  }
}
```

- [ ] **Step 4: Run green test**

Run: `npm test -- src/database/seed-customers.spec.ts`

Expected: PASS.

### Task 3: Apply development-only simple password policy

**Files:**
- Modify: `backend/src/auth/auth.service.ts`
- Modify: `backend/src/auth/auth.service.spec.ts`
- Modify: `backend/src/auth/dto/register.dto.ts`
- Create: `backend/src/auth/dto/register.dto.spec.ts`
- Modify: `src/components/customer/customer-gate.tsx`

**Interfaces:**
- Produces: `minimumRegistrationPasswordLength(environment): 6 | 12`.
- `RegisterDto` rejects fewer than six characters; `AuthService.register` rejects fewer than twelve when `NODE_ENV === "production"`.

- [ ] **Step 1: Write failing policy tests**

```ts
expect(minimumRegistrationPasswordLength({ NODE_ENV: "development" })).toBe(6);
expect(minimumRegistrationPasswordLength({ NODE_ENV: "production" })).toBe(12);
```

- [ ] **Step 2: Run red test**

Run: `npm test -- src/auth/auth.service.spec.ts src/auth/dto/register.dto.spec.ts`

Expected: FAIL because no policy helper exists and DTO currently requires 12 characters.

- [ ] **Step 3: Implement the boundary**

```ts
export function minimumRegistrationPasswordLength(environment = process.env) {
  return environment.NODE_ENV === "production" ? 12 : 6;
}
```

Use that helper before persistence in `AuthService.register`, set the DTO and customer registration input `minLength` to `6`.

- [ ] **Step 4: Run green test**

Run: `npm test -- src/auth/auth.service.spec.ts src/auth/dto/register.dto.spec.ts`

Expected: PASS.

### Task 4: Seed and test the full local flow

**Files:**
- Modify: none

- [ ] **Step 1: Run database initialization**

Run: `npm run migration:run && npm run seed:customers`

Expected: migrations and three-customer seed complete without duplicate rows.

- [ ] **Step 2: Start both local services**

Run: `npm run start:dev` in `backend/` and `npm run dev -- --port 3000` at the project root.

Expected: API health endpoint and frontend each respond with `200`.

- [ ] **Step 3: Exercise browser authentication**

Register a new local account using a six-character password, then sign in using `customer1@droneviet.vn` / `123456` and confirm the customer session endpoint returns the account.

- [ ] **Step 4: Run final automated verification**

Run: `npm test && npm run lint && npm run build && (cd backend && npm test && npm run build)`

Expected: all commands exit with `0`.
