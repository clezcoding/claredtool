import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";
import { KeyValueStore, MemoryStore } from "../auth/memory-store";

export const KEY_VALUE_STORE = "KEY_VALUE_STORE";

class RedisStore implements KeyValueStore {
  constructor(private readonly redis: Redis) {}

  async set(key: string, val: string, ...args: Array<string | number>) {
    let ttl: number | undefined;
    let nx = false;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "EX") {
        ttl = Number(args[++i]);
      } else if (args[i] === "NX") {
        nx = true;
      }
    }
    if (ttl !== undefined && nx) {
      return this.redis.set(key, val, "EX", ttl, "NX");
    }
    if (ttl !== undefined) {
      return this.redis.set(key, val, "EX", ttl);
    }
    return this.redis.set(key, val);
  }

  get(key: string) {
    return this.redis.get(key);
  }

  del(key: string) {
    return this.redis.del(key);
  }

  getdel(key: string) {
    return this.redis.getdel(key);
  }

  quit() {
    return this.redis.quit();
  }
}

export function createKeyValueStore(): KeyValueStore {
  if (process.env.NODE_ENV === "test") {
    return new MemoryStore();
  }
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("REDIS_URL is required");
  }
  return new RedisStore(new Redis(url));
}

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(
    @Inject(KEY_VALUE_STORE) private readonly store: KeyValueStore,
  ) {}

  set(key: string, val: string, ...args: Array<string | number>) {
    return this.store.set(key, val, ...args);
  }

  get(key: string) {
    return this.store.get(key);
  }

  del(key: string) {
    return this.store.del(key);
  }

  getdel(key: string) {
    return this.store.getdel(key);
  }

  async onModuleDestroy(): Promise<void> {
    const maybe = this.store as KeyValueStore & { quit?: () => Promise<unknown> };
    if (typeof maybe.quit === "function") {
      await maybe.quit();
    }
  }
}
