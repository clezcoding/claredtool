import { api, NodeSDK, tracing } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

const { BatchSpanProcessor } = tracing;

const TOKEN_KEY_RE =
  /token|authorization|password|secret|keychain|session|bearer|api[_-]?key/i;
const NAME_KEY_RE =
  /customername|customer[_-]?name|invoice.*name|recipient|kunde|rechnungsempf/i;
const IBAN_LINE_KEY_RE =
  /iban|lineitems|invoicelines|invoice[_-]?lines|positions|positionen|rechnungszeile/i;
const URL_KEY_RE =
  /^(http\.(url|target|route|path)|url\.(full|path|query))$/i;
const DB_STATEMENT_KEY_RE = /^db\.statement$/i;

const DEFAULT_OTLP_ENDPOINT = "http://clared-otel-collector:4318";

let initialized = false;

export function isAllowedSpanAttribute(key: string): boolean {
  if (URL_KEY_RE.test(key)) return false;
  if (DB_STATEMENT_KEY_RE.test(key)) return false;
  if (TOKEN_KEY_RE.test(key)) return false;
  if (NAME_KEY_RE.test(key)) return false;
  if (IBAN_LINE_KEY_RE.test(key)) return false;
  return true;
}

class AllowlistSpanProcessor implements tracing.SpanProcessor {
  constructor(private readonly inner: tracing.SpanProcessor) {}

  onStart(span: tracing.Span, parent: api.Context) {
    this.inner.onStart(span, parent);
  }

  onEnd(span: tracing.ReadableSpan) {
    const attrs = span.attributes;
    for (const key of Object.keys(attrs)) {
      if (!isAllowedSpanAttribute(key)) {
        delete attrs[key];
      }
    }
    this.inner.onEnd(span);
  }

  shutdown() {
    return this.inner.shutdown();
  }

  forceFlush() {
    return this.inner.forceFlush();
  }
}

function tracesExporter(): string {
  return (process.env.OTEL_TRACES_EXPORTER ?? "none").trim().toLowerCase();
}

function logsExporter(): string {
  return (process.env.OTEL_LOGS_EXPORTER ?? "none").trim().toLowerCase();
}

function autoInstrumentations() {
  return getNodeAutoInstrumentations({
    "@opentelemetry/instrumentation-ioredis": {
      dbStatementSerializer: () => "",
    },
    "@opentelemetry/instrumentation-redis": {
      dbStatementSerializer: () => "",
    },
    "@opentelemetry/instrumentation-pg": {
      requireParentSpan: true,
      enhancedDatabaseReporting: false,
    },
  });
}

/** Test-only: reset init guard so initOtel can run again. */
export function resetOtelForTests(): void {
  initialized = false;
}

/**
 * Start NodeSDK before NestFactory. Local `OTEL_*_EXPORTER=none` constructs
 * the SDK without OTLP (D-24) — env default is otlp, so we pass empty
 * processors instead of falling through to getSpanProcessorsFromEnv.
 * Logs ride Pino (D-30); NodeSDK log pipeline stays off.
 */
export function initOtel(options?: { serviceName?: string }): void {
  if (initialized) return;

  const traces = tracesExporter();
  void logsExporter();

  const serviceName =
    options?.serviceName?.trim() ||
    process.env.OTEL_SERVICE_NAME?.trim() ||
    "clared-api";

  const sdkOptions: ConstructorParameters<typeof NodeSDK>[0] = {
    serviceName,
    instrumentations: [autoInstrumentations()],
    logRecordProcessors: [],
  };

  if (traces === "otlp") {
    if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim()) {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = DEFAULT_OTLP_ENDPOINT;
    }
    sdkOptions.spanProcessors = [
      new AllowlistSpanProcessor(
        new BatchSpanProcessor(new OTLPTraceExporter()),
      ),
    ];
  } else {
    sdkOptions.spanProcessors = [];
  }

  new NodeSDK(sdkOptions).start();
  initialized = true;
}
