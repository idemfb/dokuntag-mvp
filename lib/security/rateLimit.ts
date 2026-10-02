type Entry = {
  count: number;
  firstRequestAt: number;
  lockedUntil?: number;
};

const memoryStore = new Map<string, Entry>();

const WINDOW_MS = 1000 * 60 * 10;
const MAX_REQUEST = 5;
const LOCK_MS = 1000 * 60 * 15;

export function checkRateLimit(key: string) {
  const now = Date.now();

  const current = memoryStore.get(key);

  if (!current) {
    memoryStore.set(key, {
      count: 1,
      firstRequestAt: now
    });

    return {
      allowed: true
    };
  }

  if (current.lockedUntil && current.lockedUntil > now) {
    return {
      allowed: false,
      retryAfter:
        Math.ceil(
          (current.lockedUntil - now) / 1000
        )
    };
  }

  if (
    now - current.firstRequestAt >
    WINDOW_MS
  ) {
    memoryStore.set(key, {
      count: 1,
      firstRequestAt: now
    });

    return {
      allowed: true
    };
  }

  current.count += 1;

  if (current.count > MAX_REQUEST) {
    current.lockedUntil =
      now + LOCK_MS;

    memoryStore.set(key, current);

    return {
      allowed: false,
      retryAfter:
        Math.ceil(LOCK_MS / 1000)
    };
  }

  memoryStore.set(key, current);

  return {
    allowed: true
  };
}