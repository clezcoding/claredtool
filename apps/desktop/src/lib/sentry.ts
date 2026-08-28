import * as Sentry from "@sentry/browser";

const REDACTED = "[redacted]";
const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
const TOKEN_KEY_RE =
  /token|authorization|password|secret|keychain|session|bearer|api[_-]?key/i;
const NAME_KEY_RE =
  /customername|customer[_-]?name|invoice.*name|recipient|kunde|rechnungsempf/i;

export type SentryEvent = {
  request?: { headers?: Record<string, string> };
  extra?: Record<string, unknown>;
  user?: Record<string, unknown>;
  breadcrumbs?: Array<{ message?: string; data?: Record<string, unknown> }>;
};

function redactString(value: string, key?: string): string {
  if (key && TOKEN_KEY_RE.test(key)) return REDACTED;
  if (EMAIL_RE.test(value)) return value.replace(EMAIL_RE, REDACTED);
  if (/bearer\s+\S+/i.test(value)) return REDACTED;
  if (key && NAME_KEY_RE.test(key)) return REDACTED;
  return value;
}

function scrubRecord(
  record: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!record) return record;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (key.toLowerCase() === "authorization") continue;
    if (TOKEN_KEY_RE.test(key)) {
      out[key] = REDACTED;
      continue;
    }
    if (typeof value === "string") {
      out[key] = redactString(value, key);
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      out[key] = scrubRecord(value as Record<string, unknown>);
    } else {
      out[key] = value;
    }
  }
  return out;
}

/** D-40 beforeSend scrub — tokens, PII, invoice/customer names. */
export function scrubSentryEvent(event: SentryEvent): SentryEvent {
  const headers = event.request?.headers
    ? { ...event.request.headers }
    : undefined;
  if (headers) {
    for (const key of Object.keys(headers)) {
      if (key.toLowerCase() === "authorization") {
        delete headers[key];
      }
    }
  }

  return {
    ...event,
    request: headers ? { ...event.request, headers } : event.request,
    extra: scrubRecord(event.extra),
    user: scrubRecord(event.user),
    breadcrumbs: event.breadcrumbs?.map((crumb) => ({
      ...crumb,
      message: crumb.message
        ? redactString(crumb.message)
        : crumb.message,
      data: scrubRecord(crumb.data),
    })),
  };
}

export function sentryDsn(): string {
  return (import.meta.env.VITE_SENTRY_DSN as string | undefined)?.trim() ?? "";
}

export function sentryEnvironment(): "dev" | "staging" | "prod" {
  const explicit = (
    import.meta.env.VITE_SENTRY_ENVIRONMENT as string | undefined
  )?.trim();
  if (explicit === "dev" || explicit === "staging" || explicit === "prod") {
    return explicit;
  }
  const mode = import.meta.env.MODE;
  if (mode === "production") return "prod";
  if (mode === "staging") return "staging";
  return "dev";
}

let initialized = false;

/** D-37/D-38/D-41: env-gated EU Sentry; no-op when DSN empty. */
export function initDesktopSentry(): void {
  if (initialized) return;
  const dsn = sentryDsn();
  if (!dsn) return;
  initialized = true;

  const environment = sentryEnvironment();
  Sentry.init({
    dsn,
    release: `clared@${import.meta.env.VITE_APP_VERSION ?? "0.1.0"}`,
    environment,
    sendDefaultPii: false,
    sampleRate: 1,
    tracesSampleRate: environment === "staging" ? 0.1 : 0,
    beforeSend(event) {
      return scrubSentryEvent(event as SentryEvent) as Sentry.ErrorEvent;
    },
  });
}

/** D-54: German internal test message for debug panel (Plan 07). */
export function captureSentryTestEvent(): void {
  if (!initialized) return;
  Sentry.captureMessage("Clared Sentry-Testereignis (intern)");
}
