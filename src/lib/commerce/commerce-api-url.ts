const loopbackHosts = new Set(["127.0.0.1", "::1", "localhost"]);

export function resolveCommerceApiOrigin(
  configuredOrigin: string,
  browserHostname?: string,
): string {
  const origin = new URL(configuredOrigin);

  if (
    browserHostname &&
    loopbackHosts.has(origin.hostname) &&
    loopbackHosts.has(browserHostname)
  ) {
    origin.hostname = browserHostname;
  }

  return origin.origin;
}

export function commerceApiUrl(path: string): string {
  const configuredOrigin = process.env.NEXT_PUBLIC_COMMERCE_API_URL?.replace(
    /\/$/,
    "",
  );

  if (!configuredOrigin) {
    throw new Error("COMMERCE_API_NOT_CONFIGURED");
  }

  const browserHostname =
    typeof window === "undefined" ? undefined : window.location.hostname;

  return `${resolveCommerceApiOrigin(configuredOrigin, browserHostname)}${path}`;
}
