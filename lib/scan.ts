import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Redis } from "@upstash/redis";

export type ScanSource = "public_profile";

export type ScanLogItem = {
  id: string;
  tagCode: string;
  source: ScanSource;
  fingerprint: string;
  ipHash: string;
  userAgentHash: string;
  createdAt: string;
};

const filePath = path.join(process.cwd(), "data", "scan-log.json");
const SCAN_REDIS_KEY = "dokuntag:scan-log";
const RETENTION_DAYS = 90;
const DEDUPE_SECONDS = 300;
const MAX_ITEMS = 5000;

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

function normalizeCode(value: string) {
  return String(value || "").trim().toUpperCase();
}

function hashValue(value: string) {
  return crypto
    .createHash("sha256")
    .update(String(value || "").trim().toLowerCase())
    .digest("hex");
}

function cleanup(items: ScanLogItem[]) {
  const now = Date.now();
  const retentionMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;

  return items
    .filter((item) => {
      const createdAt = new Date(item.createdAt).getTime();
      return !Number.isNaN(createdAt) && now - createdAt < retentionMs;
    })
    .slice(-MAX_ITEMS);
}

async function readFromRedis(): Promise<ScanLogItem[]> {
  const redis = getRedis();
  if (!redis) return [];

  try {
    const items = await redis.get<ScanLogItem[]>(SCAN_REDIS_KEY);
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

async function writeToRedis(items: ScanLogItem[]) {
  const redis = getRedis();
  if (!redis) return;

  await redis.set(SCAN_REDIS_KEY, items);
}

export async function readScanLog(): Promise<ScanLogItem[]> {
  if (isRedisEnabled()) {
    return readFromRedis();
  }

  if (shouldUseFileStorage()) {
    try {
      ensureFile();
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

export async function writeScanLog(items: ScanLogItem[]) {
  const safeItems = cleanup(items);

  if (isRedisEnabled()) {
    await writeToRedis(safeItems);
    return;
  }

  if (shouldUseFileStorage()) {
    ensureFile();
    fs.writeFileSync(filePath, JSON.stringify(safeItems, null, 2), "utf-8");
    return;
  }

  console.warn("SCAN_LOG_WRITE_SKIPPED_NO_REDIS");
}

export function createScanFingerprint(input: {
  tagCode: string;
  ip: string;
  userAgent: string;
}) {
  return hashValue(`${input.tagCode}|${input.ip}|${input.userAgent}`);
}

export async function addScanLog(input: {
  tagCode: string;
  ip: string;
  userAgent: string;
  source?: ScanSource;
}) {
  const tagCode = normalizeCode(input.tagCode);
  if (!tagCode) return { added: false, reason: "missing_code" };

  const items = cleanup(await readScanLog());
  const now = Date.now();
  const fingerprint = createScanFingerprint({
    tagCode,
    ip: input.ip,
    userAgent: input.userAgent
  });

  const recentDuplicate = items.find((item) => {
    const createdAt = new Date(item.createdAt).getTime();

    return (
      item.tagCode === tagCode &&
      item.fingerprint === fingerprint &&
      !Number.isNaN(createdAt) &&
      now - createdAt < DEDUPE_SECONDS * 1000
    );
  });

  if (recentDuplicate) {
    return { added: false, reason: "deduped" };
  }

  items.push({
    id: crypto.randomUUID(),
    tagCode,
    source: input.source || "public_profile",
    fingerprint,
    ipHash: hashValue(input.ip),
    userAgentHash: hashValue(input.userAgent),
    createdAt: new Date().toISOString()
  });

  await writeScanLog(items);

  return { added: true };
}

export async function getRecentScanLogsByTagCode(tagCode: string, limit = 10) {
  const normalizedCode = normalizeCode(tagCode);

  return (await readScanLog())
    .filter((item) => item.tagCode === normalizedCode)
    .sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, limit);
}
export async function getScanSummaryByTagCode(tagCode: string) {
  const normalizedCode = normalizeCode(tagCode);
  const logs = await getRecentScanLogsByTagCode(normalizedCode, 10);

  const totalCount = (await readScanLog()).filter(
    (item) => item.tagCode === normalizedCode
  ).length;

  return {
    totalCount,
    lastSeenAt: logs[0]?.createdAt || "",
    recent: logs
  };
}

export async function clearScanLogsByTagCode(tagCode: string) {
  const normalizedCode = normalizeCode(tagCode);

  if (!normalizedCode) {
    return { deletedCount: 0 };
  }

  const items = await readScanLog();
  const remaining = items.filter((item) => item.tagCode !== normalizedCode);
  const deletedCount = items.length - remaining.length;

  if (deletedCount > 0) {
    await writeScanLog(remaining);
  }

  return { deletedCount };
}