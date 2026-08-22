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

const CATALOG: Record<`clared-${(typeof PRECEDENCE)[number]}`, readonly string[]> = {
  "clared-viewer": [
    "entity.read",
    "kunde.read",
    "invoice.read",
    "tax.evaluate",
    "pdf.download",
  ],
  "clared-auditor": [
    "entity.read",
    "kunde.read",
    "invoice.read",
    "tax.evaluate",
    "pdf.download",
    "audit.read",
  ],
  "clared-clerk": [
    "entity.read",
    "kunde.read",
    "kunde.write",
    "invoice.read",
    "invoice.write",
    "tax.evaluate",
    "pdf.generate",
    "pdf.download",
  ],
  "clared-tax": [
    "entity.read",
    "kunde.read",
    "invoice.read",
    "tax.evaluate",
    "tax.override",
    "tax.rules.write",
    "pdf.download",
    "audit.read",
  ],
  "clared-accountant": [
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
  "clared-admin": [
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
  "clared-owner": TENANT_PERMISSIONS,
  "clared-platform": [...TENANT_PERMISSIONS, ...PLATFORM_PERMISSIONS],
};

export function projectRbac(groups: string[]): {
  permissions: string[];
  primaryRole: string;
} {
  const roles = new Set<(typeof PRECEDENCE)[number]>();
  for (const group of groups) {
    if (!Object.hasOwn(CATALOG, group)) {
      continue;
    }
    roles.add(group.slice("clared-".length) as (typeof PRECEDENCE)[number]);
  }
  const permissions = [
    ...new Set(
      [...roles].flatMap((role) => [...CATALOG[`clared-${role}`]]),
    ),
  ];
  const primaryRole = PRECEDENCE.find((role) => roles.has(role)) ?? "";
  return { permissions, primaryRole };
}
