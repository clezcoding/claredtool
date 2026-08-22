export type OidcClaims = {
  sub: string;
  email: string;
  name: string;
  groups: string[];
};

const TEST_CLAIMS: OidcClaims = {
  sub: "auth0|owner",
  email: "owner@clared.test",
  name: "Ada Owner",
  groups: ["clared-owner"],
};

export async function buildAuthorizationUrl(params: {
  redirectUri: string;
  state: string;
  codeChallenge: string;
}): Promise<URL> {
  if (process.env.AUTH_TEST_MODE === "1") {
    const backend = process.env.BACKEND_URL ?? "http://localhost:3000";
    const url = new URL("/auth/callback", backend);
    url.searchParams.set("code", "test");
    url.searchParams.set("state", params.state);
    return url;
  }
  const client = await import("openid-client");
  const issuer = new URL(
    "/application/o/clared/",
    process.env.AUTHENTIK_URL ?? "http://localhost:9000",
  );
  const config = await client.discovery(
    issuer,
    process.env.CLIENT_ID ?? "clared",
    undefined,
    client.ClientSecretPost(process.env.SECRET ?? ""),
  );
  return client.buildAuthorizationUrl(config, {
    redirect_uri: params.redirectUri,
    scope: "openid profile email groups",
    code_challenge: params.codeChallenge,
    code_challenge_method: "S256",
    state: params.state,
  });
}

export async function authorizationCodeGrant(
  currentUrl: URL,
  expectedState: string,
  codeVerifier: string,
): Promise<OidcClaims> {
  if (process.env.AUTH_TEST_MODE === "1") {
    return TEST_CLAIMS;
  }
  const client = await import("openid-client");
  const issuer = new URL(
    "/application/o/clared/",
    process.env.AUTHENTIK_URL ?? "http://localhost:9000",
  );
  const config = await client.discovery(
    issuer,
    process.env.CLIENT_ID ?? "clared",
    undefined,
    client.ClientSecretPost(process.env.SECRET ?? ""),
  );
  const tokens = await client.authorizationCodeGrant(config, currentUrl, {
    pkceCodeVerifier: codeVerifier,
    expectedState,
  });
  const claims = tokens.claims();
  const groups = Array.isArray(claims?.groups)
    ? claims.groups.filter((g): g is string => typeof g === "string")
    : [];
  return {
    sub: String(claims?.sub ?? ""),
    email: String(claims?.email ?? ""),
    name: String(claims?.name ?? ""),
    groups,
  };
}
