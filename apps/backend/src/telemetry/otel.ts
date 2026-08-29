import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { NodeSDK } from "@opentelemetry/sdk-node";

const TOKEN_KEY_RE =
  /token|authorization|password|secret|keychain|session|bearer|api[_-]?key/i;
const NAME_KEY_RE =
  /customername|customer[_-]?name|invoice.*name|recipient|kunde|rechnungsempf/i;
const IBAN_LINE_KEY_RE =
  /iban|lineitems|invoicelines|invoice[_-]?lines|positions|positionen|rechnungszeile/i;

const DEFAULT_OTLP_ENDPOINT = "http://clared-otel-collector:4318";

/** D-54: German internal span names. */
export const SPAN_HTTP_ANFRAGE = "HTTP-Anfrage";
export const SPAN_PDF_WARTESCHLANGE = "PDF-Warteschlange";

let initialized = false;

export function isAllowedSpanAttribute(key: string): boolean {
  if (TOKEN_KEY_RE.test(key)) return false;
  if (NAME_KEY_RE.test(key)) return false;
  if (IBAN_LINE_KEY_RE.test(key)) return false;
  return true;
}

function tracesExporter(): string {
  return (process.env.OTEL_TRACES_EXPORTER ?? "none").trim().toLowerCase();
}

function logsExporter(): string {
  return (process.env.OTEL_LOGS_EXPORTER ?? "none").trim().toLowerCase();
}

/**
 * Start NodeSDK before NestFactory. Local `OTEL_*_EXPORTER=none` constructs
 * the SDK without OTLP (D-24) — env default is otlp, so we pass empty
 * processors instead of falling through to getSpanProcessorsFromEnv.
 * Logs ride Pino (D-30); NodeSDK log pipeline stays off.
 */
export function initOtel(options?: { serviceName?: string }): void {
  if (initialized) return;
  initialized = true;

  const traces = tracesExporter();
  void logsExporter();

  const serviceName =
    options?.serviceName?.trim() ||
    process.env.OTEL_SERVICE_NAME?.trim() ||
    "clared-api";

  const sdkOptions: ConstructorParameters<typeof NodeSDK>[0] = {
    serviceName,
    instrumentations: [getNodeAutoInstrumentations()],
    logRecordProcessors: [],
  };

  if (traces === "otlp") {
    if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim()) {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = DEFAULT_OTLP_ENDPOINT;
    }
    sdkOptions.traceExporter = new OTLPTraceExporter();
  } else {
    sdkOptions.spanProcessors = [];
  }

  new NodeSDK(sdkOptions).start();
}
