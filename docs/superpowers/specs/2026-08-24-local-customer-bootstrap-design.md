# Local Customer Bootstrap Design

## Goal

Make local customer registration work against the existing Docker MySQL instance, provide three demo customer accounts, and allow a simple six-character password only in development.

## Root cause

The frontend is configured to call the commerce API at `localhost:4000`, but no API process is running. When started without `backend/.env`, it attempts MySQL on port `3306`; Docker exposes that service on host port `3307`, so TypeORM retries with `ECONNREFUSED`.

## Local runtime

- An ignored `backend/.env` points the API at MySQL `127.0.0.1:3307`, Redis `127.0.0.1:6380`, and permits the local Next.js origins on port `3000`.
- Package scripts that use TypeORM load `backend/.env` before constructing `appDataSource`.
- Migrations run before local seed scripts.

## Customer accounts and passwords

- `seed:customers` creates idempotent customer-only local accounts: `customer1@droneviet.vn`, `customer2@droneviet.vn`, and `customer3@droneviet.vn`.
- Their local demo password is configured as `SEED_DEMO_CUSTOMER_PASSWORD=123456`.
- In development, registration accepts six or more characters. Production keeps a server-enforced twelve-character minimum even though the DTO permits six for development.
- The demo seeder refuses to run in production.

## Verification

- Unit tests prove the development/production password boundary and idempotent demo seed behavior.
- Run migrations, seed customers, start the API and frontend, then register a six-character password and log in with a seeded customer through the browser.
