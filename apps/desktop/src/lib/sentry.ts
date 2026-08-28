import * as Sentry from "@sentry/browser";

const REDACTED = "[redacted]";
const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const EMAIL_REPLACE_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
const TOKEN_KEY_RE =
  /token|authorization|password|secret|keychain|session|bearer|api[_-]?key/i;
const NAME_KEY_RE =
  /customername|customer[_-]?name|invoice.*name|recipient|kunde|rechnungsempf/i;
const CUSTOMER_NAME_IN_TEXT_RE =
  /\b((?:Kunde|Kundin|customer|Customer|Rechnungsempfänger|recipient)\s*:?\s*)([A-ZÄÖÜ][\wäöüÄÖÜß.&-]+(?:\s+(?:GmbH|AG|KG|OHG|UG|e\.V\.))?)/gi;

export type SentryEvent = {
  message?: string;
  exception?: { values?: Array<{ value?: string }> };
  request?: { headers?: Record<string, string> };
  extra?: Record<string, unknown>;
  user?: Record<string, unknown>;
  tags?: Record<string, string>;
  breadcrumbs?: Array<{ message?: string; data?: Record<string, unknown> }>;
};

function redactString(value: string, key?: string): string {
  if (key && TOKEN_KEY_RE.test(key)) return REDACTED;
  if (EMAIL_RE.test(value)) return value.replace(EMAIL_REPLACE_RE, REDACTED);
  if (/bearer\s+\S+/i.test(value)) return REDACTED;
  if (key && NAME_KEY_RE.test(key)) return REDACTED;
  return value;
}

function redactMessage(message: string): string {
  let out = redactString(message);
  out = out.replace(CUSTOMER_NAME_IN_TEXT_RE, `$1${REDACTED}`);
  return out;
}

function scrubValue(value: unknown, key?: string): unknown {
  if (typeof value === "string") {
    return redactString(value, key);
  }
  if (Array.isArray(value)) {
    return value.map((item) => scrubValue(item, key));
  }
  if (value && typeof value === "object") {
    return scrubRecord(value as Record<string, unknown>);
  }
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
    } else {
      out[key] = scrubValue(value, key);
    }
  }
  return out;
}

/** D-40 beforeSend scrub — tokens, PII, invoice/customer names. */
export function scrubSentryEvent(event: SentryEvent): SentryEvent {
  const scrubbed: SentryEvent = { ...event };
  const headers = scrubbed.request?.headers
    ? { ...scrubbed.request.headers }
    : undefined;
  if (headers) {
    for (const key of Object.keys(headers)) {
      if (key.toLowerCase() === "authorization") {
        delete headers[key];
        continue;
      }
      headers[key] = redactString(headers[key], key);
    }
  }

  if (headers) {
    scrubbed.request = { ...scrubbed.request, headers };
  }
  scrubbed.extra = scrubRecord(scrubbed.extra);
  scrubbed.user = scrubRecord(scrubbed.user);
  if (scrubbed.tags) {
    scrubbed.tags = Object.fromEntries(
      Object.entries(scrubbed.tags).map(([key, value]) => [
        key,
        typeof value === "string" ? redactString(value, key) : value,
      ]),
    );
  }
  scrubbed.breadcrumbs = scrubbed.breadcrumbs?.map((crumb) => ({
    ...crumb,
    message: crumb.message ? redactMessage(crumb.message) : crumb.message,
    data: scrubRecord(crumb.data),
  }));
  if (typeof scrubbed.message === "string") {
    scrubbed.message = redactMessage(scrubbed.message);
  }
  if (Array.isArray(scrubbed.exception?.values)) {
    scrubbed.exception = {
      ...scrubbed.exception,
      values: scrubbed.exception.values.map((value) =>
        typeof value?.value === "string"
          ? { ...value, value: redactMessage(value.value) }
          : value,
      ),
    };
  }
  return scrubbed;
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
