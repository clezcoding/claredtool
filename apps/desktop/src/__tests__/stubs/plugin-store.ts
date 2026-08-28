/** Vitest resolver stub — real package installed in Plan 02+. setup.ts vi.mock overrides. */
export const load = async () => ({
  get: async () => undefined,
  set: async () => undefined,
  save: async () => undefined,
  delete: async () => undefined,
});
