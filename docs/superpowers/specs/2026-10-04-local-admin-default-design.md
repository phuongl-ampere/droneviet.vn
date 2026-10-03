# Local Admin Default Design

## Goal

Make local initialization reliably create or reset the development administrator with a documented default credential.

## Credential policy

- Local and development seed fallback: `admin@droneviet.vn` / `admin123`.
- `backend/.env.example` documents these exact values so a newly copied local `.env` remains consistent with seed behavior.
- In production, `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` remain mandatory. The development fallback is not accepted.

## Behavior

- `seed:admin` normalizes the email, hashes the selected password, and upserts the `SUPER_ADMIN` account as it does today.
- When invoked locally after this change, `seed:admin` resets the existing `admin@droneviet.vn` account password to `admin123`.
- Tests prove both fallback behavior in development and the production configuration failure.

## Validation

- Run focused admin-seed tests.
- Run the local seed command, then verify `bcrypt.compare("admin123", storedHash)` succeeds without printing the hash.
