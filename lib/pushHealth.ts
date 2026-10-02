import { isPushDisabled } from "@/lib/productionFlags";
import {
  PUSH_CHANNEL_PRIORITY,
  PUSH_PROVIDER_NAME,
  PUSH_STRATEGY_TEXT
} from "@/lib/pushConfig";
export type PushHealth = {
  enabled: boolean;
  provider: "none" | "onesignal" | "web_push";
  configured: boolean;
  status: "disabled" | "not_configured" | "ready";
  priority: number;
  strategyText: string;
  lastCheckedAt: string;
  safeFallbackText: string;
};

export function getPushHealth(): PushHealth {
  const disabled = isPushDisabled();

  if (disabled) {
    return {
      enabled: false,
      provider: "none",
      configured: false,
      status: "disabled",
      priority: PUSH_CHANNEL_PRIORITY,
  strategyText: PUSH_STRATEGY_TEXT,
      lastCheckedAt: new Date().toISOString(),
      safeFallbackText: "Anlık bildirim sistemi geçici olarak kapalı."
    };
  }

  return {
    enabled: true,
    provider: "none",
    configured: false,
    status: "not_configured",
    priority: PUSH_CHANNEL_PRIORITY,
    strategyText: PUSH_STRATEGY_TEXT,
    lastCheckedAt: new Date().toISOString(),
    safeFallbackText:
      "Anlık bildirim altyapısı hazırlandı. Gerçek servis daha sonra bağlanacak."
  };
}