const PRECEDENCE = [
  "platform",
  "owner",
  "admin",
  "accountant",
  "tax",
  "clerk",
  "auditor",
  "viewer",
] as const;

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

const CATALOG: Record<(typeof PRECEDENCE)[number], readonly string[]> = {
  viewer: [
    "entity.read",
    "kunde.read",
    "invoice.read",
    "tax.evaluate",
    "pdf.download",
  ],
  auditor: [
    "entity.read",
    "kunde.read",
    "invoice.read",
    "tax.evaluate",
    "pdf.download",
    "audit.read",
  ],
  clerk: [
    "entity.read",
    "kunde.read",
    "kunde.write",
    "invoice.read",
    "invoice.write",
    "tax.evaluate",
    "pdf.generate",
    "pdf.download",
  ],
  tax: [
    "entity.read",
    "kunde.read",
    "invoice.read",
    "tax.evaluate",
    "tax.override",
    "tax.rules.write",
    "pdf.download",
    "audit.read",
  ],
  accountant: [
    "entity.read",
    "kunde.read",
    "kunde.write",
    "invoice.read",
    "invoice.write",
    "invoice.issue",
    "invoice.export",
    "invoice.delete",
    "tax.evaluate",
    "pdf.generate",
    "pdf.download",
    "audit.read",
  ],
  admin: [
    "entity.read",
    "entity.update",
    "kunde.read",
    "kunde.write",
    "kunde.delete",
    "invoice.read",
    "tax.evaluate",
    "tax.rules.write",
    "pdf.download",
    "audit.read",
    "org.settings",
  ],
  owner: TENANT_PERMISSIONS,
  platform: [...TENANT_PERMISSIONS, ...PLATFORM_PERMISSIONS],
};

export function projectRbac(groups: string[]): {
  permissions: string[];
  primaryRole: string;
} {
  const roles = new Set<(typeof PRECEDENCE)[number]>();
  for (const group of groups) {
    if (!group.startsWith("clared-")) {
      continue;
    }
    const suffix = group.slice("clared-".length);
    if (suffix in CATALOG) {
      roles.add(suffix as (typeof PRECEDENCE)[number]);
    }
  }
  const permissions = [...new Set([...roles].flatMap((role) => [...CATALOG[role]]))];
  const primaryRole = PRECEDENCE.find((role) => roles.has(role)) ?? "";
  return { permissions, primaryRole };
}
