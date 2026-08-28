export const UPDATE_CHECK_INTERVAL_MS = 0;
export const UPDATE_CHECK_ON_STARTUP = false;

export type UpdateDialogState =
  | "idle"
  | "available"
  | "later"
  | "installing"
  | "relaunch";

export function getUpdateDialogState(): UpdateDialogState {
  return "idle";
}

export async function checkForUpdates(options?: {
  manual?: boolean;
}): Promise<unknown> {
  void options;
  return null;
}

/** D-23: silent background check failures must not toast. */
export function shouldToastOnSilentCheckFailure(): boolean {
  return true;
}
