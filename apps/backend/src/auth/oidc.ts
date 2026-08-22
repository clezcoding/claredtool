import { randomBytes } from "node:crypto";

export const OIDC_SCOPES = "openid profile email groups";

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

function asStringGroups(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((g): g is string => typeof g === "string")
    : [];
}

export function pickGroups(
  idToken: { groups?: unknown; [key: string]: unknown } | undefined,
  userinfo?: { groups?: unknown; [key: string]: unknown },
): string[] {
  const fromToken = asStringGroups(idToken?.groups);
  if (fromToken.length > 0) {
    return fromToken;
  }
  return asStringGroups(userinfo?.groups);
}

export function authentikIssuer(): URL {
  return new URL(
    "/application/o/clared/",
    process.env.AUTHENTIK_URL ?? "http://localhost:9000",
  );
}

export function endSessionUrl(): string {
  const authentik = (process.env.AUTHENTIK_URL ?? "http://localhost:9000").replace(
    /\/$/,
    "",
  );
  return `${authentik}/application/o/clared/end-session/`;
}

function testModeEnabled(): boolean {
  if (process.env.AUTH_TEST_MODE !== "1") return false;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_TEST_MODE=1 is forbidden when NODE_ENV=production");
  }
  if (process.env.NODE_ENV !== "test") {
    if (process.env.SECRET) {
      throw new Error("AUTH_TEST_MODE=1 is forbidden when SECRET is set");
    }
    throw new Error("AUTH_TEST_MODE=1 is only allowed when NODE_ENV=test");
  }
  return true;
}

function clientSecret(): string {
  const secret = process.env.SECRET;
  if (!secret) {
    throw new Error("SECRET is required");
  }
  return secret;
}

export async function beginAuthorization(redirectUri: string): Promise<{
  url: URL;
  state: string;
  codeVerifier: string;
}> {
  if (testModeEnabled()) {
    const state = randomBytes(16).toString("base64url");
    const codeVerifier = randomBytes(32).toString("base64url");
    const backend = process.env.BACKEND_URL ?? "http://localhost:3000";
    const url = new URL("/auth/callback", backend);
    url.searchParams.set("code", "test");
    url.searchParams.set("state", state);
    return { url, state, codeVerifier };
  }
  const client = await import("openid-client");
  const codeVerifier = client.randomPKCECodeVerifier();
  const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
  const state = client.randomState();
  const config = await client.discovery(
    authentikIssuer(),
    process.env.CLIENT_ID ?? "clared",
    undefined,
    client.ClientSecretPost(clientSecret()),
  );
  const url = client.buildAuthorizationUrl(config, {
    redirect_uri: redirectUri,
    scope: OIDC_SCOPES,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state,
  });
  return { url, state, codeVerifier };
}

export async function authorizationCodeGrant(
  currentUrl: URL,
  expectedState: string,
  codeVerifier: string,
): Promise<OidcClaims> {
  if (testModeEnabled()) {
    return TEST_CLAIMS;
  }
  const client = await import("openid-client");
  const config = await client.discovery(
    authentikIssuer(),
    process.env.CLIENT_ID ?? "clared",
    undefined,
    client.ClientSecretPost(clientSecret()),
  );
  const tokens = await client.authorizationCodeGrant(config, currentUrl, {
    pkceCodeVerifier: codeVerifier,
    expectedState,
  });
  const claims = tokens.claims();
  let groups = pickGroups(claims);
  if (groups.length === 0 && tokens.access_token && claims?.sub) {
    const info = await client.fetchUserInfo(
      config,
      tokens.access_token,
      claims.sub,
    );
    groups = pickGroups(claims, info);
  }
  return {
    sub: String(claims?.sub ?? ""),
    email: String(claims?.email ?? ""),
    name: String(claims?.name ?? ""),
    groups,
  };
}
