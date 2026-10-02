type NotifyChannel = "sms" | "push" | "mail";

export type NotifyChannelStatus = {
  channel: NotifyChannel;
  enabled: boolean;
  priority: number;
  label: string;
  safeFallbackText: string;
};

export function getNotifyChannels(): NotifyChannelStatus[] {
  return [
    {
      channel: "sms",
      enabled: false,
      priority: 1,
      label: "SMS",
      safeFallbackText:
        "Dokuntag üzerinden yeni bir iletişim isteği var. Güvenli giriş için dokuntag.com/my adresini kullanın."
    },
    {
      channel: "push",
      enabled: false,
      priority: 2,
      label: "Push",
      safeFallbackText:
        "Dokuntag üzerinden yeni bir iletişim isteği var."
    },
    {
      channel: "mail",
      enabled: true,
      priority: 3,
      label: "Mail",
      safeFallbackText:
        "Dokuntag profiliniz için yeni bir mesaj var."
    }
  ];
}

export function getEnabledNotifyChannels() {
  return getNotifyChannels()
    .filter((item) => item.enabled)
    .sort((a, b) => a.priority - b.priority);
}