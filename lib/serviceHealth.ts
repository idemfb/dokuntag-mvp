export type ServiceHealthItem = {
  key: string;
  name: string;
  purpose: string;
  plan: string;
  usage: number;
  limit: number | null;
  unit: string;
  status: "active" | "passive" | "manual";
};

export function getServiceHealth(input: {
  mailConfigured: boolean;
  notifyCount: number;
}): ServiceHealthItem[] {
  return [
    {
      key: "resend",
      name: "E-posta servisi",
      purpose: "Sahibe mesaj bildirimi gönderir.",
      plan: "Ücretsiz plan / manuel takip",
      usage: input.notifyCount,
      limit: 3000,
      unit: "e-posta / ay",
      status: input.mailConfigured ? "active" : "passive"
    },
    {
      key: "vercel",
      name: "Yayın altyapısı",
      purpose: "Site, admin panel ve API sistemini çalıştırır.",
      plan: "Hobby plan / manuel takip",
      usage: 0,
      limit: null,
      unit: "kullanım",
      status: "manual"
    },
    {
      key: "sms",
      name: "SMS altyapısı",
      purpose: "Kritik durumlarda yedek bildirim kanalıdır.",
      plan: "Hazırlık aşamasında",
      usage: 0,
      limit: null,
      unit: "SMS",
      status: "passive"
    },
    {
      key: "push",
      name: "Anlık bildirim altyapısı",
      purpose: "İleride ek bildirim kanalı olarak kullanılacak.",
      plan: "Hazırlık aşamasında",
      usage: 0,
      limit: null,
      unit: "abonelik",
      status: "passive"
    }
  ];
}