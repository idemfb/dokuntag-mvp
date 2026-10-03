import { readDBAsync } from "@/lib/db";
import { readNotifyLog, readRecoverLog } from "@/lib/notify";
import { readAdminActionLogAsync } from "@/lib/adminActionLog";
import { readScanLog } from "@/lib/scan";
import { readScanSettings } from "@/lib/scanSettings";
import { readAbuseLogAsync } from "@/lib/security/abuseLog";
import { readSmsAnalyticsLogAsync } from "@/lib/smsAnalytics";

export const BACKUP_FILE_MAP = {
  db: "db.json",
  tags: "tags.json",
  notify: "notify-log.json",
  recover: "recover-log.json",
  adminActions: "admin-actions.json",
  abuse: "abuse-log.json",
  smsAnalytics: "sms-analytics.json",
  scan: "scan-log.json",
  scanSettings: "scan-settings.json"
} as const;

export type BackupFileKey = keyof typeof BACKUP_FILE_MAP;

const MAX_EXPORT_ITEMS = 5000;

function trimArray<T>(items: T[]) {
  return items.slice(-MAX_EXPORT_ITEMS);
}

export async function readBackupFile(key: BackupFileKey) {
  if (key === "db") {
    return readDBAsync();
  }

  if (key === "tags") {
    const db = await readDBAsync();
    return Array.isArray((db as { products?: unknown[] })?.products)
      ? (db as { products: unknown[] }).products
      : [];
  }

  if (key === "notify") return trimArray(await readNotifyLog());
  if (key === "recover") return trimArray(await readRecoverLog());
  if (key === "adminActions") return trimArray(await readAdminActionLogAsync());
  if (key === "abuse") return trimArray(await readAbuseLogAsync());
  if (key === "smsAnalytics") return trimArray(await readSmsAnalyticsLogAsync());
  if (key === "scan") return trimArray(await readScanLog());
  if (key === "scanSettings") return readScanSettings();

  return null;
}

export async function readFullBackupFiles() {
  const db = await readDBAsync();
  const products = Array.isArray((db as { products?: unknown[] })?.products)
    ? (db as { products: unknown[] }).products
    : [];

  const [
    notify,
    recover,
    adminActions,
    abuse,
    smsAnalytics,
    scan,
    scanSettings
  ] = await Promise.all([
    readNotifyLog(),
    readRecoverLog(),
    readAdminActionLogAsync(),
    readAbuseLogAsync(),
    readSmsAnalyticsLogAsync(),
    readScanLog(),
    readScanSettings()
  ]);

  const contentByKey: Record<BackupFileKey, unknown> = {
    db,
    tags: products,
    notify: trimArray(notify),
    recover: trimArray(recover),
    adminActions: trimArray(adminActions),
    abuse: trimArray(abuse),
    smsAnalytics: trimArray(smsAnalytics),
    scan: trimArray(scan),
    scanSettings
  };

  return (Object.keys(BACKUP_FILE_MAP) as BackupFileKey[]).map((key) => ({
    key,
    fileName: BACKUP_FILE_MAP[key],
    exists: true,
    content: contentByKey[key]
  }));
}

export function getBackupStorageMode() {
  const redisConfigured = Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  );

  return {
    mode: redisConfigured ? "redis" : "local-file",
    redisConfigured
  } as const;
}
