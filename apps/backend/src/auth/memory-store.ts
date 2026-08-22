import { SESSION_TTL_SECONDS, TICKET_TTL_SECONDS } from "./ttl";

type Entry = { value: string; expiresAt: number };

export type KeyValueStore = {
  set(
    key: string,
    val: string,
    ...args: Array<string | number>
  ): Promise<"OK" | null>;
  get(key: string): Promise<string | null>;
  del(key: string): Promise<number>;
  getdel(key: string): Promise<string | null>;
};

export class MemoryStore implements KeyValueStore {
  readonly ticketTtlSeconds = TICKET_TTL_SECONDS;
  readonly sessionTtlSeconds = SESSION_TTL_SECONDS;
  private readonly map = new Map<string, Entry>();

  async set(
    key: string,
    val: string,
    ...args: Array<string | number>
  ): Promise<"OK" | null> {
    let ttlSeconds: number | undefined;
    let nx = false;
    for (let i = 0; i < args.length; i++) {
      const flag = args[i];
      if (flag === "EX") {
        ttlSeconds = Number(args[++i]);
      } else if (flag === "NX") {
        nx = true;
      }
    }
    this.purge(key);
    if (nx && this.map.has(key)) {
      return null;
    }
    const expiresAt =
      ttlSeconds === undefined
        ? Number.POSITIVE_INFINITY
        : Date.now() + ttlSeconds * 1000;
    this.map.set(key, { value: val, expiresAt });
    return "OK";
  }

  async get(key: string): Promise<string | null> {
    this.purge(key);
    return this.map.get(key)?.value ?? null;
  }

  async del(key: string): Promise<number> {
    this.purge(key);
    return this.map.delete(key) ? 1 : 0;
  }

  async getdel(key: string): Promise<string | null> {
    this.purge(key);
    const entry = this.map.get(key);
    if (!entry) {
      return null;
    }
    this.map.delete(key);
    return entry.value;
  }

  private purge(key: string): void {
    const entry = this.map.get(key);
    if (entry && entry.expiresAt <= Date.now()) {
      this.map.delete(key);
    }
  }
}
