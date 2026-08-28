export type SentryEvent = {
  request?: { headers?: Record<string, string> };
  extra?: Record<string, unknown>;
  breadcrumbs?: Array<{ message?: string; data?: Record<string, unknown> }>;
};

/** D-40 beforeSend scrub — implemented in Plan 04. */
export function scrubSentryEvent(event: SentryEvent): SentryEvent {
  return event;
}
