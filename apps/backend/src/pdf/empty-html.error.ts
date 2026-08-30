export class EmptyHtmlError extends Error {
  constructor() {
    super("html must be non-empty");
    this.name = "EmptyHtmlError";
  }
}
