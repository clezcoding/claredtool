import type { StagedTaxDecision } from "./data/sample-invoice";

type Listener = () => void;

type TaxLiveSnapshot = {
  taxDecision: StagedTaxDecision | null;
  taxError: string | null;
};

let taxDecision: StagedTaxDecision | null = null;
let taxError: string | null = null;
let snapshot: TaxLiveSnapshot = { taxDecision, taxError };
const listeners = new Set<Listener>();

export function getTaxLiveState(): TaxLiveSnapshot {
  return snapshot;
}

export function setTaxLiveState(
  next: StagedTaxDecision | null,
  error: string | null = null,
) {
  taxDecision = next;
  taxError = error;
  snapshot = { taxDecision, taxError };
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeTaxLive(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function resetTaxLiveState() {
  setTaxLiveState(null, null);
}
