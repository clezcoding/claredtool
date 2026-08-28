export type LinkAction = "opener" | "in-app" | "block";

/** D-34 scheme policy — implemented in Plan 03. */
export function decideLinkAction(href: string): LinkAction {
  void href;
  return "block";
}

export function installLinkGuard(): void {
  // Wave 0 stub
}
