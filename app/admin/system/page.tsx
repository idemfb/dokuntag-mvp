"use client";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminBackButton from "../components/AdminBackButton";
import { useEffect, useState } from "react";

type Channel = "sms" | "push" | "mail";

type HealthResponse = {
  push: {
  enabled: boolean;
  provider: "none" | "onesignal" | "web_push";
  configured: boolean;
  status: "disabled" | "not_configured" | "ready";
  priority: number;
  strategyText: string;
  lastCheckedAt: string;
  safeFallbackText: string;
};
  smsAnalytics: {
  total: number;
  recent24h: number;
  uniqueProducts: number;
  recentItems: Array<{
    tagCode: string;
    phone: string;
    createdAt: string;
  }>;
};
  sms: {
  dailyLimitPerProduct: number;
  cooldownMinutes: number;
  enabled: boolean;
  provider: "mock" | "brevo" | "twilio";
  configured: boolean;
  status: "ready" | "disabled" | "not_configured" | "degraded";
  lastCheckedAt: string;
  safeFallbackText: string;
};
  flags: {
  maintenanceMode: boolean;
  notifyDisabled: boolean;
  smsDisabled: boolean;
  pushDisabled: boolean;
};
  adminActions: {
    total: number;
    info: number;
    warning: number;
    critical: number;
    recentItems: Array<{
    type: string;
    message: string;
    metadata?: Record<string, string | number | boolean | null>;
    createdAt: string;
  }>;
};
  analytics: {
  notifyToday: number;
  notifyLast7Days: number;
  notifyLast30Days: number;
  unreadToday?: number;
  topProducts?: Array<{
    code: string;
    count: number;
  }>;
};
  abuse: {
    recentItems: Array<{
  reason: string;
  code?: string;
  ip?: string;
  senderName?: string;
  message?: string;
  createdAt: string;
}>;
  total: number;
  blockedContent: number;
  rateLimit: number;
  cooldown: number;
  lastItem: {
    reason: string;
    code?: string;
    ip?: string;
    senderName?: string;
    message?: string;
    createdAt: string;
  } | null;
};
  success: boolean;
  generatedAt: string;
  services: ServiceCardItem[];
  channels: Array<{
    channel: Channel;
    enabled: boolean;
    priority: number;
    label: string;
    safeFallbackText: string;
  }>;
  mail: { configured: boolean };
  notify: {
    totalLogs: number;
    recent24h: number;
    unreadCount: number;
    errorCount: number;
  };
  tags: {
    total: number;
    active: number;
    unclaimed: number;
  };
  alerts: string[];
};

type ServiceCardItem = {
  key: string;
  name: string;
  purpose: string;
  plan: string;
  usage: number;
  limit: number | null;
  unit: string;
  status: "active" | "passive" | "manual";
};

export default function AdminSystemPage() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [selectedChannel, setSelectedChannel] =
    useState<HealthResponse["channels"][number] | null>(null);
async function loadHealth(showRefreshing = false) {
  try {
    if (showRefreshing) {
      setRefreshing(true);
    }

    setLoadError("");

    const res = await fetch("/api/admin/health", {
      cache: "no-store"
    });

    if (!res.ok) {
      throw new Error("Sistem verileri alınamadı.");
    }

    const json = await res.json();

    setData(json);
  } catch (error) {
    console.error("ADMIN_SYSTEM_LOAD_ERROR", error);

    setLoadError(
      error instanceof Error
        ? error.message
        : "Sistem verileri alınamadı."
    );
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}
useEffect(() => {
  void loadHealth();

  const interval = setInterval(() => {
    void loadHealth();
  }, 30000);

  return () => {
    clearInterval(interval);
  };
}, []);

      
if (loading) {
  return <div className="p-6">Sistem durumu yükleniyor...</div>;
}

if (loadError) {
  return (
    <div className="p-6">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {loadError}
      </div>
    </div>
  );
}

if (!data?.success) {
  return <div className="p-6 text-red-500">Sistem durumu alınamadı.</div>;
}
  const serviceAlerts = data.services
    .filter((item) => getUsagePercent(item) >= 80)
    .map((item) => `${item.name} limiti %80 seviyesine yaklaştı.`);

  const abuseAlerts =
  data.abuse.total > 0
    ? [`${data.abuse.total} güvenlik/abuse kaydı var.`]
    : [];

const allAlerts = [...data.alerts, ...serviceAlerts, ...abuseAlerts];

  return (
    <div className="space-y-6 p-4 md:p-6">
      
      <AdminPageHeader
  title="Sistem Durumu"
  description="Üretim ve bildirim sistemlerini tek yerden takip edin."
  actions={
    <>
      <button
        type="button"
        onClick={() => loadHealth(true)}
        disabled={refreshing}
        className="rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-center text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {refreshing ? "Yenileniyor..." : "Yenile"}
      </button>

      <a
        href="/admin/backup"
        className="rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-center text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
      >
        Backup Merkezi
      </a>

      <AdminBackButton />
    </>
  }
/>
  <div className="flex flex-wrap gap-2">
  <StatusBadge
    ok={data.mail.configured}
    label={data.mail.configured ? "Mail sistemi aktif" : "Mail sistemi pasif"}
  />

  <StatusBadge
    ok={!data.flags.notifyDisabled}
    label={data.flags.notifyDisabled ? "Mesaj alımı kapalı" : "Mesaj alımı açık"}
  />

  <StatusBadge
    ok={!data.flags.smsDisabled}
    label={data.flags.smsDisabled ? "SMS kapalı" : "SMS hazır"}
  />

  <StatusBadge
    ok={!data.flags.pushDisabled}
    label={data.flags.pushDisabled ? "Push kapalı" : "Push hazır"}
  />

  <StatusBadge
    ok={data.notify.recent24h > 0}
    label={
      data.notify.recent24h > 0
        ? "Mesaj bildirimi aktif"
        : "Mesaj hareketi yok"
    }
  />

  <StatusBadge
    ok={data.abuse.total === 0}
    label={
      data.abuse.total === 0
        ? "Kötü kullanım kaydı yok"
        : `${data.abuse.total} güvenlik kaydı var`
    }
  />

  <StatusBadge
    ok={data.services.length > 0}
    label="Backup sistemi hazır"
  />

  <StatusBadge
    ok={!data.flags.maintenanceMode}
    label={
      data.flags.maintenanceMode
        ? "Bakım modu aktif"
        : "Sistem normal çalışıyor"
    }
  />
</div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Mail" value={data.mail.configured ? "Aktif" : "Pasif"} />
        <Card title="Bildirim" value={String(data.notify.totalLogs)} />
        <Card title="Aktif Ürün" value={String(data.tags.active)} />
        <Card title="Kurulum Bekleyen" value={String(data.tags.unclaimed)} />
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-lg font-medium">Servisler ve Limitler</h2>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[...data.services]
  .sort((a, b) => {
    const aPercent = getUsagePercent(a);
    const bPercent = getUsagePercent(b);

    return bPercent - aPercent;
  })
  .map((item) => (
            <ServiceCard key={item.key} item={item} />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-lg font-medium">Bildirim Kanalları</h2>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {data.channels.map((item) => (
            <button
              key={item.channel}
              type="button"
              onClick={() => setSelectedChannel(item)}
              className="rounded-xl border border-neutral-200 p-4 text-left transition hover:border-neutral-400 hover:bg-neutral-50"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-neutral-900">
                    {item.label}
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">
                    Öncelik: {item.priority}
                  </div>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    item.enabled
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {item.enabled ? "Aktif" : "Pasif"}
                </span>
              </div>

              <p className="mt-3 text-xs leading-5 text-neutral-500">
                {item.safeFallbackText}
              </p>
            </button>
          ))}
        </div>

        {selectedChannel ? (
          <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-neutral-900">
                  {selectedChannel.label} Detayı
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Kanal önceliği: {selectedChannel.priority}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedChannel(null)}
                className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700"
              >
                Kapat
              </button>
            </div>

            <div className="mt-4 grid gap-3 text-sm">
              <DetailBox
                label="Durum"
                value={selectedChannel.enabled ? "Aktif" : "Pasif"}
              />
              <DetailBox
                label="Güvenli yedek mesaj"
                value={selectedChannel.safeFallbackText}
              />
              <DetailBox
                label="Üretim notu"
                value={
                  selectedChannel.channel === "sms"
                    ? "SMS açılmadan önce servis, kredi, limit ve güvenli içerik kuralları tanımlanmalı."
                    : selectedChannel.channel === "push"
                      ? "Anlık bildirim için kullanıcı izinleri ve kayıt altyapısı ayrıca eklenecek."
                      : "Mail şu an ana çalışan bildirim kanalıdır."
                }
              />
            </div>
          </div>
        ) : null}
      </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
  <div className="flex items-start justify-between gap-4">
    <div>
      <h2 className="text-lg font-medium">SMS Altyapısı</h2>
      <p className="mt-1 text-sm text-neutral-500">
        SMS altyapısı güvenli fallback için hazırlanıyor.
      </p>
    </div>
        
    <span
  className={`rounded-full px-3 py-1 text-xs font-semibold ${
    data.sms.status === "disabled"
      ? "bg-red-50 text-red-700"
      : data.sms.status === "ready"
        ? "bg-emerald-50 text-emerald-700"
        : data.sms.status === "degraded"
          ? "bg-orange-50 text-orange-700"
          : "bg-amber-50 text-amber-700"
  }`}
>
  {data.sms.status === "disabled"
    ? "Kapalı"
    : data.sms.status === "ready"
      ? "Hazır"
      : data.sms.status === "degraded"
        ? "Yavaşladı"
        : "Servis bekliyor"}
</span>
  </div>
        
  <div className="mt-4 grid gap-3 md:grid-cols-4">
  <MiniCard
    label="Servis"
    value={data.sms.provider === "mock" ? "Test modu" : data.sms.provider}
  />

  <MiniCard
    label="Durum"
    value={data.sms.enabled ? "Aktif" : "Kapalı"}
  />

  <MiniCard
    label="Bağlantı"
    value={data.sms.configured ? "Hazır" : "Henüz bağlanmadı"}
  />

  <MiniCard
    label="Koruma"
    value={`${data.sms.cooldownMinutes} dk / ${data.sms.dailyLimitPerProduct} SMS`}
  />
</div>

  <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm leading-6 text-neutral-600">
    {data.sms.safeFallbackText}
  </div>
  <p className="mt-3 text-xs text-neutral-400">
  Son kontrol:{" "}
  {new Date(data.sms.lastCheckedAt).toLocaleString("tr-TR")}
</p>
</div>
<div className="rounded-2xl border border-neutral-200 bg-white p-5">
  <div className="flex items-center justify-between gap-3">
    <h2 className="text-lg font-medium">SMS Aktivitesi</h2>

    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
      Test modu
    </span>
  </div>

  <div className="mt-4 grid gap-3 md:grid-cols-3">
    <MiniCard
      label="Toplam kayıt"
      value={String(data.smsAnalytics.total)}
    />

    <MiniCard
      label="Son 24 saat"
      value={String(data.smsAnalytics.recent24h)}
    />

    <MiniCard
      label="Ürün sayısı"
      value={String(data.smsAnalytics.uniqueProducts)}
    />
  </div>

  <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm leading-6 text-neutral-600">
    Gerçek SMS servisi bağlandığında burada son SMS hareketleri ve yoğunluk bilgileri takip edilecek.
  </div>
</div>
<div className="rounded-2xl border border-neutral-200 bg-white p-5">
  <div className="flex items-start justify-between gap-4">
    <div>
      <h2 className="text-lg font-medium">Anlık Bildirim Altyapısı</h2>
      <p className="mt-1 text-sm text-neutral-500">
        Push bildirimi ileride yedek kanal olarak kullanılacak.
      </p>
    </div>

    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        data.push.status === "disabled"
          ? "bg-red-50 text-red-700"
          : data.push.status === "ready"
            ? "bg-emerald-50 text-emerald-700"
            : "bg-amber-50 text-amber-700"
      }`}
    >
      {data.push.status === "disabled"
        ? "Kapalı"
        : data.push.status === "ready"
          ? "Hazır"
          : "Servis bekliyor"}
    </span>
  </div>

  <div className="mt-4 grid gap-3 md:grid-cols-4">
    <MiniCard
      label="Servis"
      value={
        data.push.provider === "none"
          ? "Henüz bağlanmadı"
          : data.push.provider === "onesignal"
            ? "OneSignal"
            : "Web Push"
      }
    />

    <MiniCard
      label="Durum"
      value={data.push.enabled ? "Aktif" : "Kapalı"}
    />

    <MiniCard
      label="Bağlantı"
      value={data.push.configured ? "Hazır" : "Henüz bağlanmadı"}
    />
    <MiniCard
  label="Öncelik"
  value={`${data.push.priority}. kanal`}
/>
  </div>

  <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm leading-6 text-neutral-600">
    {data.push.safeFallbackText}
<br />
{data.push.strategyText}
  </div>

  <p className="mt-3 text-xs text-neutral-400">
    Son kontrol:{" "}
    {new Date(data.push.lastCheckedAt).toLocaleString("tr-TR")}
  </p>
</div>
      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
  <h2 className="text-lg font-medium">Bildirim Durumu</h2>
      <p className="mt-1 text-sm text-neutral-500">
      Son bildirim hareketleri ve okunma durumu.
    </p>
  <div className="mt-4 grid gap-3 md:grid-cols-3">
    <MiniCard label="24 Saat" value={String(data.notify.recent24h)} />
    <MiniCard label="Okunmamış" value={String(data.notify.unreadCount)} />
    <MiniCard label="Hata" value={String(data.notify.errorCount)} />
  </div>

  <div className="mt-4 grid gap-3 md:grid-cols-3">
    <MiniCard label="Bugün" value={String(data.analytics.notifyToday)} />
    <MiniCard label="7 Gün" value={String(data.analytics.notifyLast7Days)} />
    <MiniCard label="30 Gün" value={String(data.analytics.notifyLast30Days)} />
  </div>
</div>
<div className="rounded-2xl border border-neutral-200 bg-white p-5">
  <div className="flex items-center justify-between gap-3">
    <h2 className="text-lg font-medium">En Aktif Ürünler</h2>
      <p className="mt-1 text-sm text-neutral-500">
      Bildirim yoğunluğu en yüksek ürünler.
    </p>
    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
      Son kayıtlar
    </span>
  </div>

  <div className="mt-4 space-y-2">
    {(data.analytics.topProducts || []).length === 0 ? (
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500">
        Henüz yeterli bildirim verisi yok.
      </div>
    ) : (
      (data.analytics.topProducts || []).map((item) => (
        <div
          key={item.code}
          className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3"
        >
          <div>
            <div className="text-sm font-semibold text-neutral-900">
              {item.code}
            </div>
            <div className="mt-1 text-xs text-neutral-500">
              Ürün bildirim yoğunluğu
            </div>
          </div>

          <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-neutral-800">
            {item.count}
          </div>
        </div>
      ))
    )}
  </div>
</div>
<div className="rounded-2xl border border-neutral-200 bg-white p-5">
  <h2 className="text-lg font-medium">Güvenlik / Kötü Kullanım</h2>
        
  <div className="mt-4 grid gap-3 md:grid-cols-4">
    <MiniCard label="Toplam" value={String(data.abuse.total)} />
    <MiniCard label="Engellenen içerik" value={String(data.abuse.blockedContent)} />
    <MiniCard label="Gönderim sınırı" value={String(data.abuse.rateLimit)} />
    <MiniCard label="Bekleme koruması" value={String(data.abuse.cooldown)} />
  </div>

  {data.abuse.lastItem ? (
    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm">
      <div className="font-medium text-neutral-900">Son güvenlik kaydı</div>
      
      <div className="mt-2 text-neutral-600">
        Sebep: {data.abuse.lastItem.reason}
        
      </div>
      
      <div className="text-neutral-600">
        Kod: {data.abuse.lastItem.code || "-"}
      </div>
      <div className="text-neutral-600">
        Tarih: {new Date(data.abuse.lastItem.createdAt).toLocaleString("tr-TR")}
      </div>
    </div>
  ) : null}
</div>
<div className="rounded-2xl border border-neutral-200 bg-white p-5">
  <div className="flex items-center justify-between gap-3">
    <h2 className="text-lg font-medium">
      Son Admin İşlemleri
    </h2>
  
    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
      Son işlemler
    </span>
    
  </div>
  <div className="mt-4 grid gap-3 md:grid-cols-4">
  <MiniCard
    label="Toplam"
    value={String(data.adminActions.total)}
  />

  <MiniCard
    label="Bilgi"
    value={String(data.adminActions.info)}
  />

  <MiniCard
    label="Uyarı"
    value={String(data.adminActions.warning)}
  />

  <MiniCard
    label="Kritik"
    value={String(data.adminActions.critical)}
  />
</div>
  <div className="mt-5 divide-y divide-neutral-100">
    {data.adminActions.recentItems.length === 0 ? (
      <div className="py-3 text-sm text-neutral-500">
        Henüz işlem kaydı yok.
      </div>
    ) : (
      data.adminActions.recentItems.slice(0, 5).map((item) => (
        <div
          key={`${item.type}-${item.createdAt}`}
          className="flex items-center justify-between gap-4 py-3"
        >
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-neutral-900">
              {item.message}
            </div>

            {item.metadata?.file ? (
              <div className="mt-1 text-xs text-neutral-500">
                {String(item.metadata.file)}
              </div>
            ) : null}
          </div>

          <div className="shrink-0 text-xs text-neutral-500">
            {new Date(item.createdAt).toLocaleString("tr-TR")}
          </div>
        </div>
      ))
    )}
  </div>
</div>
{data.abuse.recentItems.length > 0 ? (
  <div className="mt-4 space-y-2">
    <div className="text-sm font-medium text-neutral-900">
      Yakın güvenlik kayıtları
    </div>

    {data.abuse.recentItems.map((item) => (
      <div
        key={`${item.reason}-${item.createdAt}`}
        className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600"
      >
        <div className="font-medium text-neutral-900">
          {item.reason}
        </div>
        <div>Kod: {item.code || "-"}</div>
        <div>Tarih: {new Date(item.createdAt).toLocaleString("tr-TR")}</div>
      </div>
    ))}
  </div>
) : null}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="text-lg font-medium">Üretim Uyarıları</h2>

        <div className="mt-4 space-y-2">
          {allAlerts.length === 0 ? (
            <div className="text-sm text-neutral-500">Aktif uyarı yok.</div>
          ) : (
            allAlerts.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
              >
                {item}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function getUsagePercent(item: ServiceCardItem) {
  if (!item.limit || item.limit <= 0) return 0;
  return Math.round((item.usage / item.limit) * 100);
}

function ServiceCard({ item }: { item: ServiceCardItem }) {
  const percent = getUsagePercent(item);
  const danger = percent >= 80;

  return (
    <div
      className={`rounded-2xl border p-5 ${
        danger
          ? "border-red-300 bg-red-50"
          : "border-neutral-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-neutral-900">
            {item.name}
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            {item.purpose}
          </div>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            item.status === "active"
              ? "bg-emerald-50 text-emerald-700"
              : item.status === "manual"
                ? "bg-blue-50 text-blue-700"
                : "bg-neutral-100 text-neutral-500"
          }`}
        >
          {item.status === "active"
            ? "Aktif"
            : item.status === "manual"
              ? "Manuel"
              : "Pasif"}
        </span>
      </div>

      <div className="mt-4 text-xs text-neutral-500">{item.plan}</div>

      {item.limit ? (
        <>
          <div className="mt-3 flex items-end justify-between">
            <div className="text-2xl font-semibold text-neutral-900">
              %{percent}
            </div>
            <div className="text-xs text-neutral-500">
              {item.usage} / {item.limit} {item.unit}
            </div>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100">
            <div
              className={`h-full rounded-full ${
                danger ? "bg-red-500" : "bg-neutral-900"
              }`}
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
        </>
      ) : (
        <p className="mt-3 text-xs leading-5 text-neutral-500">
          Bu servis için otomatik limit takibi henüz bağlı değil. Manuel kontrol gerekir.
        </p>
      )}
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="text-sm text-neutral-500">{title}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
    </div>
  );
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 p-4">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-3">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 leading-6 text-neutral-800">{value}</p>
    </div>
  );
}
function StatusBadge({
  ok,
  label
}: {
  ok: boolean;
  label: string;
}) {
  return (
    <div
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        ok
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      {label}
    </div>
  );
}