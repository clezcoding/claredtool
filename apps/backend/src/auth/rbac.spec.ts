import { projectRbac } from "./rbac";

const TENANT_PERMISSIONS = [
  "entity.read",
  "entity.create",
  "entity.update",
  "entity.delete",
  "kunde.read",
  "kunde.write",
  "kunde.delete",
  "invoice.read",
  "invoice.write",
  "invoice.issue",
  "invoice.export",
  "invoice.delete",
  "tax.evaluate",
  "tax.override",
  "tax.rules.write",
  "pdf.generate",
  "pdf.download",
  "audit.read",
  "org.settings",
] as const;

const PLATFORM_PERMISSIONS = [
  "platform.tenants.read",
  "platform.tenants.write",
  "platform.billing",
  "platform.support",
] as const;

const TENANT_GROUPS_WITHOUT_ENTITY_CREATE = [
  "clared-admin",
  "clared-accountant",
  "clared-tax",
  "clared-clerk",
  "clared-auditor",
  "clared-viewer",
] as const;

describe("projectRbac", () => {
  it("unions permissions and sets primaryRole to owner for clared-owner + clared-viewer", () => {
    const result = projectRbac(["clared-owner", "clared-viewer"]);
    expect(result.primaryRole).toBe("owner");
    expect(result.permissions).toEqual(expect.arrayContaining([...TENANT_PERMISSIONS]));
    expect(result.permissions).toHaveLength(TENANT_PERMISSIONS.length);
  });

  it("gives clared-platform every tenant permission plus platform.*", () => {
    const result = projectRbac(["clared-platform"]);
    expect(result.primaryRole).toBe("platform");
    expect(result.permissions).toEqual(
      expect.arrayContaining([...TENANT_PERMISSIONS, ...PLATFORM_PERMISSIONS]),
    );
    expect(result.permissions).toHaveLength(
      TENANT_PERMISSIONS.length + PLATFORM_PERMISSIONS.length,
    );
  });

  it("returns empty permissions and empty primaryRole for empty groups", () => {
    const result = projectRbac([]);
    expect(result.permissions).toEqual([]);
    expect(result.primaryRole).toBe("");
  });

  it("gives clared-accountant invoice.export and not entity.create", () => {
    const result = projectRbac(["clared-accountant"]);
    expect(result.primaryRole).toBe("accountant");
    expect(result.permissions).toContain("invoice.export");
    expect(result.permissions).not.toContain("entity.create");
  });

  it("ignores unknown group names", () => {
    const known = projectRbac(["clared-viewer"]);
    const mixed = projectRbac(["not-a-clared-group", "clared-viewer"]);
    expect(mixed.primaryRole).toBe(known.primaryRole);
    expect(mixed.permissions).toEqual(known.permissions);
  });

  it("gives entity.create only to clared-owner among tenant groups", () => {
    expect(projectRbac(["clared-owner"]).permissions).toContain("entity.create");
    for (const group of TENANT_GROUPS_WITHOUT_ENTITY_CREATE) {
      expect(projectRbac([group]).permissions).not.toContain("entity.create");
    }
  });

  it("omits audit.read for clared-viewer", () => {
    expect(projectRbac(["clared-viewer"]).permissions).not.toContain("audit.read");
  });

  it("prefers platform over owner for primaryRole", () => {
    const result = projectRbac(["clared-owner", "clared-platform"]);
    expect(result.primaryRole).toBe("platform");
  });
});
