export function projectRbac(groups: string[]): {
  permissions: string[];
  primaryRole: string;
} {
  if (groups.length === 0) {
    return { permissions: [], primaryRole: "" };
  }
  const known = groups
    .filter((group) => group.startsWith("clared-"))
    .map((group) => group.slice("clared-".length));
  return { permissions: [], primaryRole: known[0] ?? "" };
}
