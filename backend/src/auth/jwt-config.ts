export function resolveJwtSecret(environment: NodeJS.ProcessEnv): string {
  const configured = environment.JWT_ACCESS_SECRET?.trim();

  if (configured) {
    return configured;
  }

  if (environment.NODE_ENV === "production") {
    throw new Error("JWT_ACCESS_SECRET must be configured in production");
  }

  return "local-development-secret-not-for-production";
}
