import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

export type ScanNotificationSetting = {
  enabled: boolean;
  lastNotifiedAt?: string;
  dailyCount?: number;
  dailyCountDate?: string;
};

type ScanSettingsMap = Record<string, ScanNotificationSetting>;

const filePath = path.join(process.cwd(), "data", "scan-settings.json");
const REDIS_KEY = "dokuntag:scan-settings";

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

function normalizeCode(code: string) {
  return String(code || "").trim().toUpperCase();
}

function ensureFile() {
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "{}", "utf-8");
  }
}

export async function readScanSettings(): Promise<ScanSettingsMap> {
  if (isRedisEnabled()) {
    const redis = getRedis();
    if (!redis) return {};

    const data = await redis.get<ScanSettingsMap>(REDIS_KEY);
    return data && typeof data === "object" ? data : {};
  }

  if (shouldUseFileStorage()) {
    try {
      ensureFile();
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed
        : {};
    } catch {
      return {};
    }
  }

  return {};
}

export async function writeScanSettings(settings: ScanSettingsMap) {
  if (isRedisEnabled()) {
    const redis = getRedis();
    if (redis) {
      await redis.set(REDIS_KEY, settings);
    }
    return;
  }

  if (shouldUseFileStorage()) {
    ensureFile();
    fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), "utf-8");
    return;
  }

  console.warn("SCAN_SETTINGS_WRITE_SKIPPED_NO_REDIS");
}

export async function getScanNotificationSetting(tagCode: string) {
  const code = normalizeCode(tagCode);
  const settings = await readScanSettings();

  return (
    settings[code] || {
      enabled: false,
      lastNotifiedAt: "",
      dailyCount: 0,
      dailyCountDate: ""
    }
  );
}

export async function updateScanNotificationSetting(
  tagCode: string,
  nextSetting: Partial<ScanNotificationSetting>
) {
  const code = normalizeCode(tagCode);

  if (!code) {
    return null;
  }

  const settings = await readScanSettings();
  const current = await getScanNotificationSetting(code);

  settings[code] = {
    ...current,
    ...nextSetting,
    enabled: Boolean(nextSetting.enabled ?? current.enabled)
  };

  await writeScanSettings(settings);

  return settings[code];
}
function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function canSendScanNotification(tagCode: string) {
  const setting = await getScanNotificationSetting(tagCode);

  if (!setting.enabled) {
    return { allowed: false, reason: "disabled" };
  }

  const now = Date.now();
  const lastNotifiedAt = setting.lastNotifiedAt
    ? new Date(setting.lastNotifiedAt).getTime()
    : 0;

  if (lastNotifiedAt && now - lastNotifiedAt < 60 * 60 * 1000) {
    return { allowed: false, reason: "hourly_limit" };
  }

  const todayKey = getTodayKey();
  const dailyCount =
    setting.dailyCountDate === todayKey ? Number(setting.dailyCount || 0) : 0;

  if (dailyCount >= 2) {
    return { allowed: false, reason: "daily_limit" };
  }

  return { allowed: true, dailyCount, todayKey };
}

export async function markScanNotificationSent(tagCode: string) {
  const check = await canSendScanNotification(tagCode);

  if (!check.allowed) {
    return null;
  }

  return updateScanNotificationSetting(tagCode, {
    lastNotifiedAt: new Date().toISOString(),
    dailyCount: Number(check.dailyCount || 0) + 1,
    dailyCountDate: check.todayKey || getTodayKey()
  });
}

export async function resetScanNotificationLimits(tagCode: string) {
  return updateScanNotificationSetting(tagCode, {
    lastNotifiedAt: "",
    dailyCount: 0,
    dailyCountDate: ""
  });
}