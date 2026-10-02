import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Redis } from "@upstash/redis";

export type AdminActionType =
  | "backup_download"
  | "full_backup_download"
  | "health_view"
  | "order_bind"
  | "product_status_change"
  | "batch_create"
  | "maintenance_mode";

export type AdminActionSeverity = "info" | "warning" | "critical";

export type AdminActionLogItem = {
  id: string;
  type: AdminActionType;
  message: string;
  severity: AdminActionSeverity;
  metadata?: Record<string, string | number | boolean | null>;
  createdAt: string;
};

type AdminActionSummary = {
  total: number;
  info: number;
  warning: number;
  critical: number;
  recentItems: AdminActionLogItem[];
};

const filePath = path.join(process.cwd(), "data", "admin-actions.json");
const REDIS_KEY = "dokuntag:admin-actions";
const MAX_ITEMS = 500;

const memoryLogs: AdminActionLogItem[] = [];
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

function isValidAdminActionLogItem(
  value: unknown
): value is AdminActionLogItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<AdminActionLogItem>;

  return Boolean(
    typeof item.id === "string" &&
      typeof item.type === "string" &&
      typeof item.message === "string" &&
      typeof item.severity === "string" &&
      typeof item.createdAt === "string"
  );
}

function safeReadFileLogs(): AdminActionLogItem[] {
  try {
    ensureFile();

    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isValidAdminActionLogItem).slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

function safeWriteFileLogs(items: AdminActionLogItem[]) {
  try {
    ensureFile();

    fs.writeFileSync(
      filePath,
      JSON.stringify(items.slice(0, MAX_ITEMS), null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error("ADMIN_ACTION_LOG_FILE_WRITE_ERROR", error);
  }
}

function getSeverity(type: AdminActionType): AdminActionSeverity {
  if (type === "product_status_change") return "warning";
  if (type === "full_backup_download") return "warning";
  if (type === "backup_download") return "info";
  if (type === "order_bind") return "warning";
  if (type === "batch_create") return "info";
  if (type === "health_view") return "info";
  if (type === "maintenance_mode") return "critical";
  return "info";
}

function normalizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";

  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function normalizeMetadata(
  metadata?: Record<string, string | number | boolean | null>
) {
  if (!metadata) return undefined;

  const safeMetadata: Record<string, string | number | boolean | null> = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      safeMetadata[key.slice(0, 64)] =
        typeof value === "string" ? value.slice(0, 240) : value;
    }
  }

  return safeMetadata;
}

function remember(item: AdminActionLogItem) {
  memoryLogs.unshift(item);

  if (memoryLogs.length > MAX_ITEMS) {
    memoryLogs.length = MAX_ITEMS;
  }
}

async function persistToRedis(item: AdminActionLogItem) {
  const redis = getRedis();
  if (!redis) return;

  const current = await redis.get<AdminActionLogItem[]>(REDIS_KEY);
  const items = Array.isArray(current)
    ? current.filter(isValidAdminActionLogItem)
    : [];

  await redis.set(REDIS_KEY, [item, ...items].slice(0, MAX_ITEMS));
}

function persistToFile(item: AdminActionLogItem) {
  const items = safeReadFileLogs();
  safeWriteFileLogs([item, ...items].slice(0, MAX_ITEMS));
}

export function addAdminActionLog(input: {
  type: AdminActionType;
  message: string;
  metadata?: Record<string, string | number | boolean | null>;
  severity?: AdminActionSeverity;
}) {
  const item: AdminActionLogItem = {
    id: crypto.randomUUID(),
    type: input.type,
    message: normalizeText(input.message, 240),
    severity: input.severity || getSeverity(input.type),
    metadata: normalizeMetadata(input.metadata),
    createdAt: new Date().toISOString()
  };

  remember(item);

  if (shouldUseFileStorage()) {
    persistToFile(item);
    return;
  }

  if (isRedisEnabled()) {
    void persistToRedis(item).catch((error) => {
      console.error("ADMIN_ACTION_LOG_REDIS_WRITE_ERROR", error);
    });
  }
}

function buildSummary(items: AdminActionLogItem[]): AdminActionSummary {
  const normalized = items
    .filter(isValidAdminActionLogItem)
    .slice(0, MAX_ITEMS);

  return {
  total: normalized.length,
  info: normalized.filter((item) => item.severity === "info").length,
  warning: normalized.filter((item) => item.severity === "warning").length,
  critical: normalized.filter((item) => item.severity === "critical").length,
  recentItems: normalized.slice(0, 10)
};
}

export function getAdminActionSummary(): AdminActionSummary {
  if (memoryLogs.length > 0) {
    return buildSummary(memoryLogs);
  }

  if (shouldUseFileStorage()) {
    return buildSummary(safeReadFileLogs());
  }

  return buildSummary([]);
}

export async function getAdminActionSummaryAsync(): Promise<AdminActionSummary> {
  const redis = getRedis();

  if (redis) {
    const current = await redis.get<AdminActionLogItem[]>(REDIS_KEY);
    const items = Array.isArray(current) ? current : [];

    return buildSummary(items);
  }

  return getAdminActionSummary();
}