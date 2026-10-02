import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

export type SmsAnalyticsItem = {
  tagCode: string;
  phone: string;
  createdAt: string;
};

export type SmsAnalyticsSummary = {
  total: number;
  recent24h: number;
  uniqueProducts: number;
  recentItems: SmsAnalyticsItem[];
};

const filePath = path.join(process.cwd(), "data", "sms-analytics.json");
const REDIS_KEY = "dokuntag:sms-analytics";
const MAX_ITEMS = 500;

const memoryLogs: SmsAnalyticsItem[] = [];
let redisClient: Redis | null = null;

function isRedisEnabled() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  );
}

function isVercelRuntime() {
  return Boolean(process.env.VERCEL);
}

function shouldUseFileStorage() {
  return !isRedisEnabled() && !isVercelRuntime();
}

function getRedis() {
  if (!isRedisEnabled()) return null;

  if (!redisClient) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!.trim(),
      token: process.env.UPSTASH_REDIS_REST_TOKEN!.trim()
    });
  }

  return redisClient;
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function ensureFile() {
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]", "utf-8");
  }
}

function isValidSmsAnalyticsItem(value: unknown): value is SmsAnalyticsItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<SmsAnalyticsItem>;

  return Boolean(
    typeof item.tagCode === "string" &&
      typeof item.phone === "string" &&
      typeof item.createdAt === "string"
  );
}

function safeReadFileLogs(): SmsAnalyticsItem[] {
  try {
    ensureFile();

    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isValidSmsAnalyticsItem).slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

function safeWriteFileLogs(items: SmsAnalyticsItem[]) {
  try {
    ensureFile();

    fs.writeFileSync(
      filePath,
      JSON.stringify(items.slice(0, MAX_ITEMS), null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error("SMS_ANALYTICS_FILE_WRITE_ERROR", error);
  }
}

function remember(item: SmsAnalyticsItem) {
  memoryLogs.unshift(item);

  if (memoryLogs.length > MAX_ITEMS) {
    memoryLogs.length = MAX_ITEMS;
  }
}

async function persistToRedis(item: SmsAnalyticsItem) {
  const redis = getRedis();
  if (!redis) return;

  const current = await redis.get<SmsAnalyticsItem[]>(REDIS_KEY);
  const items = Array.isArray(current)
    ? current.filter(isValidSmsAnalyticsItem)
    : [];

  await redis.set(REDIS_KEY, [item, ...items].slice(0, MAX_ITEMS));
}

function persistToFile(item: SmsAnalyticsItem) {
  const items = safeReadFileLogs();
  safeWriteFileLogs([item, ...items].slice(0, MAX_ITEMS));
}

export function addSmsAnalyticsLog(input: {
  tagCode: string;
  phone: string;
}) {
  const item: SmsAnalyticsItem = {
    tagCode: input.tagCode.trim().toUpperCase(),
    phone: normalizePhone(input.phone),
    createdAt: new Date().toISOString()
  };

  remember(item);

  if (shouldUseFileStorage()) {
    persistToFile(item);
    return;
  }

  if (isRedisEnabled()) {
    void persistToRedis(item).catch((error) => {
      console.error("SMS_ANALYTICS_REDIS_WRITE_ERROR", error);
    });
  }
}

function buildSummary(items: SmsAnalyticsItem[]): SmsAnalyticsSummary {
  const normalized = items
    .filter(isValidSmsAnalyticsItem)
    .slice(0, MAX_ITEMS);

  const now = Date.now();

  const last24h = normalized.filter((item) => {
    return now - new Date(item.createdAt).getTime() < 1000 * 60 * 60 * 24;
  });

  const uniqueProducts = new Set(last24h.map((item) => item.tagCode));

  return {
    total: normalized.length,
    recent24h: last24h.length,
    uniqueProducts: uniqueProducts.size,
    recentItems: last24h.slice(0, 10)
  };
}

export function getSmsAnalyticsSummary(): SmsAnalyticsSummary {
  if (memoryLogs.length > 0) {
    return buildSummary(memoryLogs);
  }

  if (shouldUseFileStorage()) {
    return buildSummary(safeReadFileLogs());
  }

  return buildSummary([]);
}

export async function getSmsAnalyticsSummaryAsync(): Promise<SmsAnalyticsSummary> {
  const redis = getRedis();

  if (redis) {
    const current = await redis.get<SmsAnalyticsItem[]>(REDIS_KEY);
    const items = Array.isArray(current) ? current : [];

    return buildSummary(items);
  }

  return getSmsAnalyticsSummary();
}