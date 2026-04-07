import fs from "fs";
import path from "path";
import crypto from "crypto";

export type NotifyLogItem = {
  id: string;
  tagCode: string;
  senderFingerprint: string;
  ip: string;
  createdAt: string;
};

const filePath = path.join(process.cwd(), "data", "notify-log.json");

const COOLDOWN_SECONDS = 300;
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function ensureFile() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]", "utf-8");
  }
}

export function readNotifyLog(): NotifyLogItem[] {
  ensureFile();
  const file = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(file) as NotifyLogItem[];
}

export function writeNotifyLog(items: NotifyLogItem[]) {
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf-8");
}

function hashValue(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
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

  return hashValue(raw);
}

export function checkNotifyCooldown(input: {
  tagCode: string;
  senderFingerprint: string;
  ip: string;
}) {
  const items = readNotifyLog();
  const now = Date.now();

  const recentItem = items.find((item) => {
    const sameTag = item.tagCode === input.tagCode;
    const sameSender = item.senderFingerprint === input.senderFingerprint;
    const createdAt = new Date(item.createdAt).getTime();

    return sameTag && sameSender && now - createdAt < COOLDOWN_SECONDS * 1000;
  });

  if (recentItem) {
    return {
      allowed: false,
      error: "Bu etiket için kısa süre içinde tekrar mesaj gönderemezsiniz."
    };
  }

  const attemptsFromIp = items.filter((item) => {
    const createdAt = new Date(item.createdAt).getTime();
    return item.ip === input.ip && now - createdAt < WINDOW_MS;
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
}) {
  const items = readNotifyLog();
  const now = Date.now();

  const cleaned = items.filter((item) => {
    const createdAt = new Date(item.createdAt).getTime();
    return now - createdAt < WINDOW_MS;
  });

  cleaned.push({
    id: crypto.randomUUID(),
    tagCode: input.tagCode,
    senderFingerprint: input.senderFingerprint,
    ip: input.ip,
    createdAt: new Date().toISOString()
  });

  writeNotifyLog(cleaned);
}