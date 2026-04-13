import fs from "fs";
import path from "path";
import crypto from "crypto";

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

const filePath = path.join(process.cwd(), "data", "notify-log.json");

const COOLDOWN_SECONDS = 300;
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const ARCHIVE_RETENTION_DAYS = 180;

function ensureFile() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]", "utf-8");
  }
}

export function readNotifyLog(): NotifyLogItem[] {
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

export function writeNotifyLog(items: NotifyLogItem[]) {
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf-8");
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

function getArchiveRetentionMs() {
  return ARCHIVE_RETENTION_DAYS * 24 * 60 * 60 * 1000;
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

export function checkNotifyCooldown(input: {
  tagCode: string;
  senderFingerprint: string;
  ip: string;
}) {
  const items = readNotifyLog();
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

export function addNotifyLog(input: {
  tagCode: string;
  senderFingerprint: string;
  ip: string;
  senderName?: string;
  senderPhone?: string;
  senderEmail?: string;
  preferredContactMethods?: string[];
  message?: string;
}) {
  const items = readNotifyLog();
  const cleaned = cleanupExpiredLogs(items);

  cleaned.push({
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

  writeNotifyLog(cleaned);
}

export function markNotifyLogsAsRead(tagCode: string) {
  const normalizedTagCode = normalizeTagCode(tagCode);

  if (!normalizedTagCode) {
    return { updatedCount: 0 };
  }

  const items = readNotifyLog();
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
    writeNotifyLog(updatedItems);
  }

  return { updatedCount };
}

export function markSingleNotifyLogAsRead(input: {
  tagCode: string;
  logId: string;
}) {
  const normalizedTagCode = normalizeTagCode(input.tagCode);
  const normalizedLogId = String(input.logId || "").trim();

  if (!normalizedTagCode || !normalizedLogId) {
    return { updated: false };
  }

  const items = readNotifyLog();
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
    writeNotifyLog(updatedItems);
  }

  return { updated };
}

export function toggleNotifyLogPinned(input: {
  tagCode: string;
  logId: string;
}) {
  const normalizedTagCode = normalizeTagCode(input.tagCode);
  const normalizedLogId = String(input.logId || "").trim();

  if (!normalizedTagCode || !normalizedLogId) {
    return { updated: false, pinned: false };
  }

  const items = readNotifyLog();
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
    writeNotifyLog(updatedItems);
  }

  return { updated, pinned };
}

export function toggleNotifyLogArchived(input: {
  tagCode: string;
  logId: string;
}) {
  const normalizedTagCode = normalizeTagCode(input.tagCode);
  const normalizedLogId = String(input.logId || "").trim();

  if (!normalizedTagCode || !normalizedLogId) {
    return { updated: false, archived: false };
  }

  const items = readNotifyLog();
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
    writeNotifyLog(updatedItems);
  }

  return { updated, archived };
}

export function deleteNotifyLog(input: {
  tagCode: string;
  logId: string;
}) {
  const normalizedTagCode = normalizeTagCode(input.tagCode);
  const normalizedLogId = String(input.logId || "").trim();

  if (!normalizedTagCode || !normalizedLogId) {
    return { deleted: false };
  }

  const items = readNotifyLog();
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
    writeNotifyLog(updatedItems);
  }

  return { deleted };
}

export function getUnreadNotifyCount(tagCode: string) {
  const normalizedTagCode = normalizeTagCode(tagCode);

  if (!normalizedTagCode) {
    return 0;
  }

  return readNotifyLog().filter((item) => {
    return (
      normalizeTagCode(item.tagCode) === normalizedTagCode &&
      !item.readAt &&
      !item.deletedAt &&
      !item.archivedAt
    );
  }).length;
}