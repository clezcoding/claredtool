/** Fail-closed PDF render — generic German message, never interpolate PII (D-26). */
export class RenderFailedError extends Error {
  constructor() {
    super("Render fehlgeschlagen");
    this.name = "RenderFailedError";
  }
}
