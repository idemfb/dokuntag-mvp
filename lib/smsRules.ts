import {
  SMS_COOLDOWN_MS,
  SMS_DAILY_LIMIT_PER_PRODUCT,
  SMS_DAILY_WINDOW_MS
} from "@/lib/smsConfig";
export type SmsRuleDecision = {
  allowed: boolean;
  reason?: "sms_disabled" | "missing_phone" | "cooldown" | "daily_limit";
  retryAfterSeconds?: number;
};

type SmsRuleEntry = {
  count: number;
  firstSentAt: number;
  lastSentAt: number;
};

const memoryStore = new Map<string, SmsRuleEntry>();


function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function getKey(tagCode: string, phone: string) {
  return `${tagCode.trim().toUpperCase()}:${normalizePhone(phone)}`;
}

export function canSendSms(input: {
  tagCode: string;
  phone: string;
  smsDisabled: boolean;
}): SmsRuleDecision {
  if (input.smsDisabled) {
    return {
      allowed: false,
      reason: "sms_disabled"
    };
  }

  const phone = normalizePhone(input.phone);

  if (!phone) {
    return {
      allowed: false,
      reason: "missing_phone"
    };
  }

  const now = Date.now();
  const key = getKey(input.tagCode, phone);
  const current = memoryStore.get(key);

  if (!current) {
    return {
      allowed: true
    };
  }

  const cooldownLeft = current.lastSentAt + SMS_COOLDOWN_MS - now;

  if (cooldownLeft > 0) {
    return {
      allowed: false,
      reason: "cooldown",
      retryAfterSeconds: Math.ceil(cooldownLeft / 1000)
    };
  }

  if (now - current.firstSentAt > SMS_DAILY_WINDOW_MS) {
    return {
      allowed: true
    };
  }

  if (current.count >= SMS_DAILY_LIMIT_PER_PRODUCT) {
    return {
      allowed: false,
      reason: "daily_limit"
    };
  }

  return {
    allowed: true
  };
}

export function recordSmsSent(input: {
  tagCode: string;
  phone: string;
}) {
  const phone = normalizePhone(input.phone);
  if (!phone) return;

  const now = Date.now();
  const key = getKey(input.tagCode, phone);
  const current = memoryStore.get(key);

  if (!current || now - current.firstSentAt > SMS_DAILY_WINDOW_MS) {
    memoryStore.set(key, {
      count: 1,
      firstSentAt: now,
      lastSentAt: now
    });

    return;
  }

  memoryStore.set(key, {
    ...current,
    count: current.count + 1,
    lastSentAt: now
  });
}