const TOKEN_PATHS = [
  "authorization",
  "access_token",
  "accessToken",
  "refresh_token",
  "password",
  "secret",
  "token",
  "apiKey",
  "api_key",
  "session",
  "bearer",
  "keychain",
  "req.headers.authorization",
  "req.headers.cookie",
] as const;

const NAME_IBAN_LINE_PATHS = [
  "iban",
  "IBAN",
  "customerName",
  "customer_name",
  "invoiceName",
  "recipient",
  "kunde",
  "lineItems",
  "invoiceLines",
  "positions",
  "html",
  "*.iban",
  "*.customerName",
  "*.lineItems",
  "*.invoiceLines",
  "lineItems[*].description",
  "lineItems[*].name",
  "invoiceLines[*].description",
] as const;

/** D-23: token / name / IBAN / invoice-line keys (same classes as sentry.ts). */
export const PINO_REDACT_PATHS: string[] = [
  ...TOKEN_PATHS,
  ...NAME_IBAN_LINE_PATHS,
];

export function pinoTransport() {
  const targets: Array<{
    target: string;
    options: Record<string, unknown>;
  }> = [{ target: "pino/file", options: { destination: 1 } }];

  if ((process.env.OTEL_LOGS_EXPORTER ?? "").trim().toLowerCase() === "otlp") {
    targets.push({
      target: "pino-opentelemetry-transport",
      options: {
        resourceAttributes: {
          "service.name":
            process.env.OTEL_SERVICE_NAME?.trim() || "clared-api",
        },
      },
    });
  }

  return { targets };
}

export function pinoBaseOptions(serviceName: string) {
  return {
    name: serviceName,
    redact: PINO_REDACT_PATHS,
    transport: pinoTransport(),
  };
}
