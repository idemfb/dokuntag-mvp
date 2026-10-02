import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Redis } from "@upstash/redis";

export type AbuseReason = "blocked_content" | "rate_limit" | "cooldown";

export type AbuseSeverity = "info" | "warning" | "critical";

export type AbuseLogItem = {
  id: string;
  reason: AbuseReason;
  severity: AbuseSeverity;
  code?: string;
  ip?: string;
  senderName?: string;
  message?: string;
  createdAt: string;
};

type AbuseSummary = {
  total: number;
  blockedContent: number;
  rateLimit: number;
  cooldown: number;
  lastItem: AbuseLogItem | null;
  recentItems: AbuseLogItem[];
};

const filePath = path.join(process.cwd(), "data", "abuse-log.json");
const REDIS_KEY = "dokuntag:abuse-log";
const MAX_ITEMS = 500;

const memoryLogs: AbuseLogItem[] = [];
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

function ensureFile() {
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]", "utf-8");
  }
}

function safeReadFileLogs(): AbuseLogItem[] {
  try {
    ensureFile();

    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isValidAbuseLogItem).slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

function safeWriteFileLogs(items: AbuseLogItem[]) {
  try {
    ensureFile();
    fs.writeFileSync(
      filePath,
      JSON.stringify(items.slice(0, MAX_ITEMS), null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error("ABUSE_LOG_FILE_WRITE_ERROR", error);
  }
}

function isValidAbuseLogItem(value: unknown): value is AbuseLogItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<AbuseLogItem>;

  return Boolean(
    typeof item.id === "string" &&
      typeof item.reason === "string" &&
      typeof item.severity === "string" &&
      typeof item.createdAt === "string"
  );
}

function getSeverity(reason: AbuseReason): AbuseSeverity {
  if (reason === "blocked_content") return "warning";
  if (reason === "rate_limit") return "critical";
  if (reason === "cooldown") return "warning";

  return "info";
}

function normalizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";

  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function remember(item: AbuseLogItem) {
  memoryLogs.unshift(item);

  if (memoryLogs.length > MAX_ITEMS) {
    memoryLogs.length = MAX_ITEMS;
  }
}

async function persistToRedis(item: AbuseLogItem) {
  const redis = getRedis();
  if (!redis) return;

  const current = await redis.get<AbuseLogItem[]>(REDIS_KEY);
  const items = Array.isArray(current) ? current.filter(isValidAbuseLogItem) : [];

  await redis.set(REDIS_KEY, [item, ...items].slice(0, MAX_ITEMS));
}

function persistToFile(item: AbuseLogItem) {
  const items = safeReadFileLogs();
  safeWriteFileLogs([item, ...items].slice(0, MAX_ITEMS));
}

export function addAbuseLog(input: {
  reason: AbuseReason;
  code?: string;
  ip?: string;
  senderName?: string;
  message?: string;
}) {
  const item: AbuseLogItem = {
    id: crypto.randomUUID(),
    reason: input.reason,
    severity: getSeverity(input.reason),
    code: normalizeText(input.code, 32),
    ip: normalizeText(input.ip, 80),
    senderName: normalizeText(input.senderName, 80),
    message: normalizeText(input.message, 240),
    createdAt: new Date().toISOString()
  };

  remember(item);

  if (shouldUseFileStorage()) {
    persistToFile(item);
    return;
  }

  if (isRedisEnabled()) {
    void persistToRedis(item).catch((error) => {
      console.error("ABUSE_LOG_REDIS_WRITE_ERROR", error);
    });
  }
}

function buildSummary(items: AbuseLogItem[]): AbuseSummary {
  const normalized = items.filter(isValidAbuseLogItem).slice(0, MAX_ITEMS);

  return {
    total: normalized.length,
    blockedContent: normalized.filter((item) => item.reason === "blocked_content")
      .length,
    rateLimit: normalized.filter((item) => item.reason === "rate_limit").length,
    cooldown: normalized.filter((item) => item.reason === "cooldown").length,
    lastItem: normalized[0] || null,
    recentItems: normalized.slice(0, 10)
  };
}

export function getAbuseSummary(): AbuseSummary {
  if (memoryLogs.length > 0) {
    return buildSummary(memoryLogs);
  }

  if (shouldUseFileStorage()) {
    return buildSummary(safeReadFileLogs());
  }

  return buildSummary([]);
}

export async function getAbuseSummaryAsync(): Promise<AbuseSummary> {
  const redis = getRedis();

  if (redis) {
    const current = await redis.get<AbuseLogItem[]>(REDIS_KEY);
    const items = Array.isArray(current) ? current : [];

    return buildSummary(items);
  }

  return getAbuseSummary();
}