import { isSmsDisabled } from "@/lib/productionFlags";
import { canSendSms, recordSmsSent } from "@/lib/smsRules";
export type SmsPriority = "normal" | "critical";
import { addSmsAnalyticsLog } from "@/lib/smsAnalytics";
export type SmsPayload = {
  to: string;
  message: string;
  priority?: SmsPriority;
};

export type SmsResult = {
  success: boolean;
  provider: string;
  disabled?: boolean;
  error?: string;
};

export interface SmsProvider {
  send(payload: SmsPayload): Promise<SmsResult>;
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function normalizeMessage(value: string) {
  return value
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 320);
}

export function buildSafeNotifySms() {
  return normalizeMessage(
    "Birisi Dokuntag ürününüz hakkında iletişim kurmaya çalıştı. Güvenli giriş için dokuntag.com/my adresini ziyaret edin."
  );
}

class MockSmsProvider implements SmsProvider {
  async send(payload: SmsPayload): Promise<SmsResult> {
    if (isSmsDisabled()) {
      return {
        success: false,
        provider: "mock",
        disabled: true,
        error: "SMS sistemi geçici olarak durduruldu."
      };
    }

    console.log("SMS_MOCK_SEND", {
      to: normalizePhone(payload.to),
      message: normalizeMessage(payload.message),
      priority: payload.priority || "normal"
    });

    return {
      success: true,
      provider: "mock"
    };
  }
}

const provider: SmsProvider = new MockSmsProvider();

export async function sendSms(payload: SmsPayload & { tagCode?: string }) {
  const normalizedPhone = normalizePhone(payload.to);
  const normalizedSmsMessage = normalizeMessage(payload.message);

  if (payload.tagCode) {
    const decision = canSendSms({
      tagCode: payload.tagCode,
      phone: normalizedPhone,
      smsDisabled: isSmsDisabled()
    });

    if (!decision.allowed) {
      return {
        success: false,
        provider: "rules",
        disabled: decision.reason === "sms_disabled",
        error:
          decision.reason === "missing_phone"
            ? "Telefon numarası eksik."
            : decision.reason === "cooldown"
              ? "SMS cooldown aktif."
              : decision.reason === "daily_limit"
                ? "Günlük SMS limiti doldu."
                : "SMS gönderimi durduruldu."
      };
    }
  }

  const result = await provider.send({
    ...payload,
    to: normalizedPhone,
    message: normalizedSmsMessage
  });

  if (result.success && payload.tagCode) {
  recordSmsSent({
    tagCode: payload.tagCode,
    phone: normalizedPhone
  });

  addSmsAnalyticsLog({
    tagCode: payload.tagCode,
    phone: normalizedPhone
  });
}
  return result;
}