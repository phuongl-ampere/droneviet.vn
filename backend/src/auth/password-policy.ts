export function minimumRegistrationPasswordLength(
  environment: NodeJS.ProcessEnv,
): 6 | 12 {
  return environment.NODE_ENV === "development" ? 6 : 12;
}
