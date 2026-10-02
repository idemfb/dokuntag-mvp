import { isSmsDisabled } from "@/lib/productionFlags";
import {
  SMS_COOLDOWN_MINUTES,
  SMS_DAILY_LIMIT_PER_PRODUCT
} from "@/lib/smsConfig";
export type SmsHealth = {
  enabled: boolean;
  provider: "mock" | "brevo" | "twilio";
  configured: boolean;
  status:
  | "ready"
  | "disabled"
  | "not_configured"
  | "degraded";
  dailyLimitPerProduct: number;
  cooldownMinutes: number;
  lastCheckedAt: string;
  safeFallbackText: string;
};

export function getSmsHealth(): SmsHealth {
  const disabled = isSmsDisabled();

  if (disabled) {
    return {
      dailyLimitPerProduct: SMS_DAILY_LIMIT_PER_PRODUCT,
      cooldownMinutes: SMS_COOLDOWN_MINUTES,
      enabled: false,
      provider: "mock",
      configured: false,
      status: "disabled",
      lastCheckedAt: new Date().toISOString(),
      safeFallbackText: "SMS sistemi geçici olarak durduruldu."
    };
  }

  return {
    dailyLimitPerProduct: SMS_DAILY_LIMIT_PER_PRODUCT,
    cooldownMinutes: SMS_COOLDOWN_MINUTES,
    enabled: true,
    provider: "mock",
    configured: false,
    status: "not_configured",
    lastCheckedAt: new Date().toISOString(),
    safeFallbackText:
      "SMS altyapısı hazır, gerçek sağlayıcı henüz bağlanmadı."
  };
}