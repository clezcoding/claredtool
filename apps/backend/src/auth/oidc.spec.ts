import { beginAuthorization, OIDC_SCOPES, pickGroups } from "./oidc";

describe("pickGroups", () => {
  it("reads groups from the ID token when present", () => {
    expect(pickGroups({ groups: ["clared-owner"] })).toEqual(["clared-owner"]);
  });

  it("falls back to userinfo groups when the ID token omits groups", () => {
    expect(pickGroups({ sub: "u1" }, { groups: ["clared-viewer"] })).toEqual([
      "clared-viewer",
    ]);
  });

  it("returns empty when neither token nor userinfo has groups", () => {
    expect(pickGroups({ sub: "u1" }, { sub: "u1" })).toEqual([]);
  });
});

describe("OIDC_SCOPES", () => {
  it("requests groups in addition to openid profile email", () => {
    expect(OIDC_SCOPES.split(" ").sort()).toEqual(
      ["email", "groups", "openid", "profile"].sort(),
    );
  });
});

describe("AUTH_TEST_MODE", () => {
  const origMode = process.env.AUTH_TEST_MODE;
  const origNode = process.env.NODE_ENV;

  afterEach(() => {
    process.env.AUTH_TEST_MODE = origMode;
    process.env.NODE_ENV = origNode;
  });

  it("throws when AUTH_TEST_MODE=1 and NODE_ENV=production", async () => {
    process.env.AUTH_TEST_MODE = "1";
    process.env.NODE_ENV = "production";
    await expect(
      beginAuthorization("http://localhost:3000/auth/callback"),
    ).rejects.toThrow("AUTH_TEST_MODE=1 is forbidden when NODE_ENV=production");
  });
});
