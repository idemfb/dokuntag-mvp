import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Redis } from "@upstash/redis";

export type NotifyContactMethod = "phone" | "whatsapp" | "email";

export type NotifyLogItem = {
  id: string;
  tagCode: string;
  senderFingerprint: string;
  ip: string;
  createdAt: string;
  readAt?: string;
  pinnedAt?: string;
  archivedAt?: string;
  deletedAt?: string;
  senderName?: string;
  senderPhone?: string;
  senderEmail?: string;
  preferredContactMethods?: NotifyContactMethod[];
  message?: string;
};

export type RecoverRequestLogItem = {
  id: string;
  email: string;
  entryType: "my" | "recover";
  fingerprint: string;
  ip: string;
  createdAt: string;
};

const filePath = path.join(process.cwd(), "data", "notify-log.json");
const recoverFilePath = path.join(process.cwd(), "data", "recover-log.json");

const COOLDOWN_SECONDS = 300;
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const ARCHIVE_RETENTION_DAYS = 180;

const RECOVER_COOLDOWN_SECONDS = 60;
const RECOVER_MAX_ATTEMPTS = 5;
const RECOVER_WINDOW_MS = 15 * 60 * 1000;
const RECOVER_RETENTION_DAYS = 30;

const NOTIFY_REDIS_KEY = "dokuntag:notify-log";
const RECOVER_REDIS_KEY = "dokuntag:recover-log";

let redisClient: Redis | null = null;

function isRedisEnabled() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  );
}

function getRedis() {
  if (!isRedisEnabled()) {
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!.trim(),
      token: process.env.UPSTASH_REDIS_REST_TOKEN!.trim()
    });
  }

  return redisClient;
}

function ensureFile() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]", "utf-8");
  }
}

function ensureRecoverFile() {
  if (!fs.existsSync(recoverFilePath)) {
    fs.writeFileSync(recoverFilePath, "[]", "utf-8");
  }
}

function readNotifyLogFromFile(): NotifyLogItem[] {
  ensureFile();

  try {
    const file = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(file);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as NotifyLogItem[];
  } catch {
    return [];
  }
}

function writeNotifyLogToFile(items: NotifyLogItem[]) {
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf-8");
}

function readRecoverLogFromFile(): RecoverRequestLogItem[] {
  ensureRecoverFile();

  try {
    const file = fs.readFileSync(recoverFilePath, "utf-8");
    const parsed = JSON.parse(file);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as RecoverRequestLogItem[];
  } catch {
    return [];
  }
}

function writeRecoverLogToFile(items: RecoverRequestLogItem[]) {
  fs.writeFileSync(recoverFilePath, JSON.stringify(items, null, 2), "utf-8");
}

async function readNotifyLogFromRedis(): Promise<NotifyLogItem[]> {
  const redis = getRedis();
  if (!redis) {
    return [];
  }

  try {
    const items = await redis.get<NotifyLogItem[]>(NOTIFY_REDIS_KEY);
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

async function writeNotifyLogToRedis(items: NotifyLogItem[]) {
  const redis = getRedis();
  if (!redis) {
    return;
  }

  await redis.set(NOTIFY_REDIS_KEY, items);
}

async function readRecoverLogFromRedis(): Promise<RecoverRequestLogItem[]> {
  const redis = getRedis();
  if (!redis) {
    return [];
  }

  try {
    const items = await redis.get<RecoverRequestLogItem[]>(RECOVER_REDIS_KEY);
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

async function writeRecoverLogToRedis(items: RecoverRequestLogItem[]) {
  const redis = getRedis();
  if (!redis) {
    return;
  }

  await redis.set(RECOVER_REDIS_KEY, items);
}

export async function readNotifyLog(): Promise<NotifyLogItem[]> {
  if (isRedisEnabled()) {
    return readNotifyLogFromRedis();
  }

  return readNotifyLogFromFile();
}

export async function writeNotifyLog(items: NotifyLogItem[]) {
  if (isRedisEnabled()) {
    await writeNotifyLogToRedis(items);
    return;
  }

  writeNotifyLogToFile(items);
}

export async function readRecoverLog(): Promise<RecoverRequestLogItem[]> {
  if (isRedisEnabled()) {
    return readRecoverLogFromRedis();
  }

  return readRecoverLogFromFile();
}

export async function writeRecoverLog(items: RecoverRequestLogItem[]) {
  if (isRedisEnabled()) {
    await writeRecoverLogToRedis(items);
    return;
  }

  writeRecoverLogToFile(items);
}

function normalizeMethods(value?: string[]): NotifyContactMethod[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is NotifyContactMethod =>
      item === "phone" || item === "whatsapp" || item === "email"
  );
}

function normalizeTagCode(tagCode: string) {
  return String(tagCode || "").trim().toUpperCase();
}

function normalizeEmail(value: string) {
  return String(value || "").trim().toLowerCase();
}

function getArchiveRetentionMs() {
  return ARCHIVE_RETENTION_DAYS * 24 * 60 * 60 * 1000;
}

function getRecoverRetentionMs() {
  return RECOVER_RETENTION_DAYS * 24 * 60 * 60 * 1000;
}

function cleanupExpiredLogs(items: NotifyLogItem[]) {
  const now = Date.now();
  const retentionMs = getArchiveRetentionMs();

  return items.filter((item) => {
    const createdAt = new Date(item.createdAt).getTime();

    if (Number.isNaN(createdAt)) {
      return false;
    }

    return now - createdAt < retentionMs;
  });
}

function cleanupExpiredRecoverLogs(items: RecoverRequestLogItem[]) {
  const now = Date.now();
  const retentionMs = getRecoverRetentionMs();

  return items.filter((item) => {
    const createdAt = new Date(item.createdAt).getTime();

    if (Number.isNaN(createdAt)) {
      return false;
    }

    return now - createdAt < retentionMs;
  });
}

export function createSenderFingerprint(input: {
  ip: string;
  code: string;
  senderPhone?: string;
  senderEmail?: string;
}) {
  const raw = `${input.ip}|${input.code}|${input.senderPhone || ""}|${input.senderEmail || ""}`
    .trim()
    .toLowerCase();

  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function createRecoverFingerprint(input: {
  ip: string;
  email: string;
}) {
  const raw = `${input.ip}|${normalizeEmail(input.email)}`.trim().toLowerCase();

  return crypto.createHash("sha256").update(raw).digest("hex");
}

export async function checkNotifyCooldown(input: {
  tagCode: string;
  senderFingerprint: string;
  ip: string;
}) {
  const items = await readNotifyLog();
  const now = Date.now();
  const normalizedTagCode = normalizeTagCode(input.tagCode);

  const recentItem = items.find((item) => {
    const sameTag = normalizeTagCode(item.tagCode) === normalizedTagCode;
    const sameSender = item.senderFingerprint === input.senderFingerprint;
    const createdAt = new Date(item.createdAt).getTime();

    return (
      sameTag &&
      sameSender &&
      !item.deletedAt &&
      now - createdAt < COOLDOWN_SECONDS * 1000
    );
  });

  if (recentItem) {
    return {
      allowed: false,
      error: "Bu etiket için kısa süre içinde tekrar mesaj gönderemezsiniz."
    };
  }

  const attemptsFromIp = items.filter((item) => {
    const createdAt = new Date(item.createdAt).getTime();
    return item.ip === input.ip && !item.deletedAt && now - createdAt < WINDOW_MS;
  });

  if (attemptsFromIp.length >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      error: "Çok fazla mesaj denemesi yaptınız. Lütfen daha sonra tekrar deneyin."
    };
  }

  return { allowed: true };
}

export async function checkRecoverCooldown(input: {
  email: string;
  fingerprint: string;
  ip: string;
}) {
  const items = cleanupExpiredRecoverLogs(await readRecoverLog());
  const now = Date.now();
  const normalizedEmailValue = normalizeEmail(input.email);

  const recentItem = items.find((item) => {
    const sameEmail = normalizeEmail(item.email) === normalizedEmailValue;
    const sameFingerprint = item.fingerprint === input.fingerprint;
    const createdAt = new Date(item.createdAt).getTime();

    return (
      sameEmail &&
      sameFingerprint &&
      now - createdAt < RECOVER_COOLDOWN_SECONDS * 1000
    );
  });

  if (recentItem) {
    return {
      allowed: false,
      error: "Yeni bağlantı istemeden önce kısa bir süre bekleyin."
    };
  }

  const attemptsFromIp = items.filter((item) => {
    const createdAt = new Date(item.createdAt).getTime();
    return item.ip === input.ip && now - createdAt < RECOVER_WINDOW_MS;
  });

  if (attemptsFromIp.length >= RECOVER_MAX_ATTEMPTS) {
    return {
      allowed: false,
      error: "Çok fazla doğrulama denemesi yaptınız. Lütfen daha sonra tekrar deneyin."
    };
  }

  return { allowed: true };
}

export async function addRecoverLog(input: {
  email: string;
  entryType: "my" | "recover";
  fingerprint: string;
  ip: string;
}) {
  const items = cleanupExpiredRecoverLogs(await readRecoverLog());

  items.push({
    id: crypto.randomUUID(),
    email: normalizeEmail(input.email),
    entryType: input.entryType,
    fingerprint: input.fingerprint,
    ip: input.ip,
    createdAt: new Date().toISOString()
  });

  await writeRecoverLog(items);
}

export async function addNotifyLog(input: {
  tagCode: string;
  senderFingerprint: string;
  ip: string;
  senderName?: string;
  senderPhone?: string;
  senderEmail?: string;
  preferredContactMethods?: string[];
  message?: string;
}) {
  const items = cleanupExpiredLogs(await readNotifyLog());

  items.push({
    id: crypto.randomUUID(),
    tagCode: normalizeTagCode(input.tagCode),
    senderFingerprint: input.senderFingerprint,
    ip: input.ip,
    createdAt: new Date().toISOString(),
    readAt: "",
    pinnedAt: "",
    archivedAt: "",
    deletedAt: "",
    senderName: input.senderName || "",
    senderPhone: input.senderPhone || "",
    senderEmail: input.senderEmail || "",
    preferredContactMethods: normalizeMethods(input.preferredContactMethods),
    message: input.message || ""
  });

  await writeNotifyLog(items);
}

export async function getNotifyLogsByTagCode(tagCode: string) {
  const normalizedTagCode = normalizeTagCode(tagCode);

  if (!normalizedTagCode) {
    return [];
  }

  return (await readNotifyLog())
    .filter(
      (item) => normalizeTagCode(item.tagCode) === normalizedTagCode && !item.deletedAt
    )
    .sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

export async function deleteAllNotifyLogsByTagCode(tagCode: string) {
  const normalizedTagCode = normalizeTagCode(tagCode);

  if (!normalizedTagCode) {
    return { deletedCount: 0 };
  }

  const items = await readNotifyLog();
  let deletedCount = 0;
  const deletedAt = new Date().toISOString();

  const updatedItems = items.map((item) => {
    if (normalizeTagCode(item.tagCode) !== normalizedTagCode || item.deletedAt) {
      return item;
    }

    deletedCount += 1;

    return {
      ...item,
      deletedAt,
      pinnedAt: "",
      archivedAt: ""
    };
  });

  if (deletedCount > 0) {
    await writeNotifyLog(updatedItems);
  }

  return { deletedCount };
}

export async function markNotifyLogsAsRead(tagCode: string) {
  const normalizedTagCode = normalizeTagCode(tagCode);

  if (!normalizedTagCode) {
    return { updatedCount: 0 };
  }

  const items = await readNotifyLog();
  let updatedCount = 0;
  const readAt = new Date().toISOString();

  const updatedItems = items.map((item) => {
    if (normalizeTagCode(item.tagCode) !== normalizedTagCode) {
      return item;
    }

    if (item.readAt || item.deletedAt) {
      return item;
    }

    updatedCount += 1;

    return {
      ...item,
      readAt
    };
  });

  if (updatedCount > 0) {
    await writeNotifyLog(updatedItems);
  }

  return { updatedCount };
}

export async function markSingleNotifyLogAsRead(input: {
  tagCode: string;
  logId: string;
}) {
  const normalizedTagCode = normalizeTagCode(input.tagCode);
  const normalizedLogId = String(input.logId || "").trim();

  if (!normalizedTagCode || !normalizedLogId) {
    return { updated: false };
  }

  const items = await readNotifyLog();
  let updated = false;
  const readAt = new Date().toISOString();

  const updatedItems = items.map((item) => {
    if (
      normalizeTagCode(item.tagCode) !== normalizedTagCode ||
      String(item.id || "").trim() !== normalizedLogId
    ) {
      return item;
    }

    if (item.readAt || item.deletedAt) {
      return item;
    }

    updated = true;

    return {
      ...item,
      readAt
    };
  });

  if (updated) {
    await writeNotifyLog(updatedItems);
  }

  return { updated };
}

export async function toggleNotifyLogPinned(input: {
  tagCode: string;
  logId: string;
}) {
  const normalizedTagCode = normalizeTagCode(input.tagCode);
  const normalizedLogId = String(input.logId || "").trim();

  if (!normalizedTagCode || !normalizedLogId) {
    return { updated: false, pinned: false };
  }

  const items = await readNotifyLog();
  let updated = false;
  let pinned = false;

  const updatedItems = items.map((item) => {
    if (
      normalizeTagCode(item.tagCode) !== normalizedTagCode ||
      String(item.id || "").trim() !== normalizedLogId ||
      item.deletedAt
    ) {
      return item;
    }

    updated = true;
    pinned = !item.pinnedAt;

    return {
      ...item,
      pinnedAt: item.pinnedAt ? "" : new Date().toISOString()
    };
  });

  if (updated) {
    await writeNotifyLog(updatedItems);
  }

  return { updated, pinned };
}

export async function toggleNotifyLogArchived(input: {
  tagCode: string;
  logId: string;
}) {
  const normalizedTagCode = normalizeTagCode(input.tagCode);
  const normalizedLogId = String(input.logId || "").trim();

  if (!normalizedTagCode || !normalizedLogId) {
    return { updated: false, archived: false };
  }

  const items = await readNotifyLog();
  let updated = false;
  let archived = false;

  const updatedItems = items.map((item) => {
    if (
      normalizeTagCode(item.tagCode) !== normalizedTagCode ||
      String(item.id || "").trim() !== normalizedLogId ||
      item.deletedAt
    ) {
      return item;
    }

    updated = true;
    archived = !item.archivedAt;

    return {
      ...item,
      archivedAt: item.archivedAt ? "" : new Date().toISOString(),
      pinnedAt: item.archivedAt ? item.pinnedAt || "" : ""
    };
  });

  if (updated) {
    await writeNotifyLog(updatedItems);
  }

  return { updated, archived };
}

export async function deleteNotifyLog(input: {
  tagCode: string;
  logId: string;
}) {
  const normalizedTagCode = normalizeTagCode(input.tagCode);
  const normalizedLogId = String(input.logId || "").trim();

  if (!normalizedTagCode || !normalizedLogId) {
    return { deleted: false };
  }

  const items = await readNotifyLog();
  let deleted = false;

  const updatedItems = items.map((item) => {
    if (
      normalizeTagCode(item.tagCode) !== normalizedTagCode ||
      String(item.id || "").trim() !== normalizedLogId ||
      item.deletedAt
    ) {
      return item;
    }

    deleted = true;

    return {
      ...item,
      deletedAt: new Date().toISOString(),
      pinnedAt: "",
      archivedAt: ""
    };
  });

  if (deleted) {
    await writeNotifyLog(updatedItems);
  }

  return { deleted };
}

export async function getUnreadNotifyCount(tagCode: string) {
  const normalizedTagCode = normalizeTagCode(tagCode);

  if (!normalizedTagCode) {
    return 0;
  }

  return (await readNotifyLog()).filter((item) => {
    return (
      normalizeTagCode(item.tagCode) === normalizedTagCode &&
      !item.readAt &&
      !item.deletedAt &&
      !item.archivedAt
    );
  }).length;
}