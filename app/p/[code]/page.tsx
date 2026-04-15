"use client";

import { use, useEffect, useMemo, useState } from "react";

type ProductType = "pet" | "item" | "key" | "person";
type TagStatus = "unclaimed" | "active" | "inactive";

type Visibility = {
  showName?: boolean;
  showPhone?: boolean;
  showEmail?: boolean;
  showCity?: boolean;
  showAddressDetail?: boolean;
  showPetName?: boolean;
  showNote?: boolean;
};

type PublicProfile = {
  publicCode: string;
  oldCode?: string;
  productType?: ProductType;
  name: string;
  ownerName: string;
  phone: string;
  city?: string;
  addressDetail?: string;
  distinctiveFeature?: string;
  petName?: string;
  note: string;
  alerts: string[];
  allowDirectCall?: boolean;
  allowDirectWhatsapp?: boolean;
  contactOptions?: {
    allowDirectCall?: boolean;
    allowDirectWhatsapp?: boolean;
  };
  status?: TagStatus;
  visibility?: Visibility;
  showName?: boolean;
  showPhone?: boolean;
  showEmail?: boolean;
  showCity?: boolean;
  showAddressDetail?: boolean;
  showPetName?: boolean;
  showNote?: boolean;
};

type PublicApiResponse = {
  success: boolean;
  data: PublicProfile;
  message?: string;
};

function getTitle(productType?: ProductType) {
  if (productType === "pet") return "Bu evcil hayvan size ulaşmış olabilir";
  if (productType === "key") return "Bu anahtar size ulaşmış olabilir";
  if (productType === "person") return "Bu kişiyle ilgili bilgi paylaşabilirsiniz";
  return "Bu eşya size ulaşmış olabilir";
}

function getSubtitle(productType?: ProductType) {
  if (productType === "pet") {
    return "Sahibine güvenli şekilde ulaşmasına yardımcı olabilirsiniz.";
  }

  if (productType === "person") {
    return "Yakınlarına veya ilgili kişilere güvenli şekilde ulaşılmasına yardımcı olabilirsiniz.";
  }

  if (productType === "key") {
    return "Anahtarın sahibine güvenli şekilde ulaşmasına yardımcı olun.";
  }

  return "Eşyanın sahibine güvenli şekilde ulaşmasına yardımcı olabilirsiniz.";
}

function getBadgeLabel(productType?: ProductType) {
  if (productType === "pet") return "Evcil Hayvan";
  if (productType === "key") return "Anahtar";
  if (productType === "person") return "Birey";
  return "Eşya";
}

function getProductIcon(productType?: ProductType) {
  if (productType === "pet") return "🐾";
  if (productType === "key") return "🔑";
  if (productType === "person") return "🧍";
  return "🎒";
}

function getHelpText(productType?: ProductType) {
  if (productType === "pet") {
    return "Bu sayfa, bu evcil hayvanın sahibine güvenli şekilde ulaşılmasına yardımcı olmak için oluşturulmuştur.";
  }

  if (productType === "person") {
    return "Bu sayfa, bu bireyin yakınlarına veya ilgilenen kişilere güvenli şekilde ulaşılmasına yardımcı olmak için oluşturulmuştur.";
  }

  if (productType === "key") {
    return "Bu sayfa, bu anahtarın sahibine güvenli şekilde ulaşmasına yardımcı olmak için oluşturulmuştur.";
  }

  return "Bu sayfa, bu eşyanın sahibine güvenli şekilde ulaşmasına yardımcı olmak için oluşturulmuştur.";
}

function getPrimaryNameLabel(productType?: ProductType) {
  if (productType === "pet") return "Evcil hayvan adı";
  if (productType === "person") return "Kişi adı";
  if (productType === "key") return "Anahtar adı";
  return "Ürün adı";
}

function getOwnerLabel(productType?: ProductType) {
  if (productType === "person") return "Yakını / sorumlusu";
  return "Sahibi";
}

function normalizePhoneForLink(phone: string) {
  return phone.replace(/\D/g, "");
}

function getVisibleFlag(data: PublicProfile, key: keyof Visibility) {
  if (typeof data.visibility?.[key] === "boolean") {
    return Boolean(data.visibility[key]);
  }

  if (typeof data[key] === "boolean") {
    return Boolean(data[key]);
  }

  return true;
}

function getMainSiteUrl() {
  const value =
    process.env.NEXT_PUBLIC_MAIN_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://dokuntag.com";

  return value.replace(/\/+$/, "");
}

function getHowItWorksUrl() {
  const value =
    process.env.NEXT_PUBLIC_HOW_IT_WORKS_URL?.trim() ||
    `${getMainSiteUrl()}/how-it-works`;

  return value.replace(/\/+$/, "");
}

function InfoRow({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-neutral-200 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
        {label}
      </p>
      <p className="mt-1 text-sm leading-6 text-neutral-900">{value}</p>
    </div>
  );
}

function ContactOptionCard({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
        checked
          ? "border-neutral-800 bg-neutral-800 text-white shadow-sm"
          : "border-neutral-300 bg-white text-neutral-800 hover:border-neutral-400 hover:bg-neutral-50"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4"
      />
      <span>{label}</span>
    </label>
  );
}

function FeatureCard({
  title,
  text
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[22px] border border-neutral-200 bg-white px-4 py-4">
      <p className="text-sm font-semibold text-neutral-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-neutral-600">{text}</p>
    </div>
  );
}

function StepCard({
  step,
  title,
  text
}: {
  step: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[24px] border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="inline-flex rounded-full border border-neutral-300 bg-neutral-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
        {step}
      </div>
      <h3 className="mt-3 text-base font-semibold text-neutral-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-neutral-600">{text}</p>
    </div>
  );
}

export default function PublicPage({
  params
}: {
  params: Promise<{ code: string }>;
}) {
  const resolvedParams = use(params);
  const code = resolvedParams.code;

  const [data, setData] = useState<PublicProfile | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");
  const [contactPhone, setContactPhone] = useState(true);
  const [contactWhatsapp, setContactWhatsapp] = useState(false);
  const [contactEmail, setContactEmail] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");

  const dokuntagHref = getMainSiteUrl();
  const howItWorksHref = getHowItWorksUrl();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/public/${code}`, {
          cache: "no-store"
        });

        const json: PublicApiResponse = await res.json();

        if (!res.ok || !json.success || !json.data) {
          throw new Error(json?.message || "Sayfa yüklenemedi.");
        }

        if (!cancelled) {
          setData(json.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Bir hata oluştu.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [code]);

  const callHref = useMemo(() => {
    if (!data?.phone) return "";
    return `tel:${normalizePhoneForLink(data.phone)}`;
  }, [data]);

  const whatsappHref = useMemo(() => {
    if (!data?.phone) return "";
    const phone = normalizePhoneForLink(data.phone);
    const normalizedForWa = phone.startsWith("0") ? `90${phone.slice(1)}` : phone;
    const text = "Merhaba, Dokuntag profiliniz üzerinden size ulaşıyorum.";
    return `https://wa.me/${normalizedForWa}?text=${encodeURIComponent(text)}`;
  }, [data]);

  const allowDirectCall = Boolean(
    data?.allowDirectCall ?? data?.contactOptions?.allowDirectCall
  );
  const allowDirectWhatsapp = Boolean(
    data?.allowDirectWhatsapp ?? data?.contactOptions?.allowDirectWhatsapp
  );

  async function handleSendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (data?.status === "inactive") {
      setSendError("Bu ürün şu an aktif değil. İletişim geçici olarak kapatılmıştır.");
      setSendSuccess("");
      return;
    }

    try {
      setSending(true);
      setSendError("");
      setSendSuccess("");

      const preferredContactMethods = [
        contactPhone ? "phone" : null,
        contactWhatsapp ? "whatsapp" : null,
        contactEmail ? "email" : null
      ].filter(Boolean);

      const res = await fetch("/api/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code,
          senderName,
          senderPhone,
          senderEmail,
          preferredContactMethods,
          message,
          website: ""
        })
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Mesaj gönderilemedi.");
      }

      setSendSuccess(
        json?.message ||
          "Mesaj iletildi. Profil sahibi uygun görürse sizinle iletişime geçecektir. Lütfen iletişim bilgilerinizi doğru girdiğinizden emin olun."
      );
      setSenderName("");
      setSenderPhone("");
      setSenderEmail("");
      setMessage("");
      setContactPhone(true);
      setContactWhatsapp(false);
      setContactEmail(false);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-100 px-4 py-8 text-neutral-900 sm:px-5 sm:py-10">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-[30px] border border-neutral-200 bg-white px-6 py-7 shadow-sm sm:px-8">
            <div className="space-y-3">
              <div className="h-3 w-20 animate-pulse rounded-full bg-neutral-200" />
              <div className="h-8 w-2/3 animate-pulse rounded-full bg-neutral-200" />
              <div className="h-4 w-full animate-pulse rounded-full bg-neutral-200" />
              <div className="h-4 w-5/6 animate-pulse rounded-full bg-neutral-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-neutral-100 px-4 py-8 text-neutral-900 sm:px-5 sm:py-10">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-[30px] border border-red-200 bg-white px-6 py-7 shadow-sm sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-500">
              Dokuntag
            </p>
            <h1 className="mt-3 text-xl font-semibold text-red-800">
              Sayfa açılamadı
            </h1>
            <p className="mt-3 text-sm leading-6 text-red-700">
              {error || "Bu ürün için profil bulunamadı."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (data.status === "inactive") {
    return (
      <main className="min-h-screen bg-neutral-100 px-4 py-8 text-neutral-900 sm:px-5 sm:py-10">
        <div className="mx-auto max-w-2xl space-y-5 sm:space-y-6">
          <section className="overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-neutral-100/80 px-6 py-7 sm:px-8 sm:py-9">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <a
                  href={dokuntagHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50"
                >
                  Dokuntag
                </a>

                <div className="inline-flex items-center gap-2 rounded-full bg-neutral-800 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-sm">
                  <span aria-hidden="true">{getProductIcon(data.productType)}</span>
                  <span>{getBadgeLabel(data.productType)}</span>
                </div>
              </div>

              <div className="mt-6 flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] border border-neutral-200 bg-neutral-50 text-2xl shadow-sm">
                  {getProductIcon(data.productType)}
                </div>

                <div className="min-w-0">
                  <h1 className="text-2xl font-semibold leading-tight sm:text-[32px]">
                    Bu ürün şu an aktif değil
                  </h1>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-600 sm:text-[15px]">
                    Bu ürüne ait public profil ve iletişim seçenekleri geçici olarak kapatılmıştır.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 sm:px-8">
              <div className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
                Profil sahibi bu ürünü pasif duruma almıştır. Bu nedenle iletişim formu ve hızlı iletişim seçenekleri şu an kullanılamaz.
              </div>

              <div className="mt-4 rounded-[22px] border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm leading-6 text-neutral-700">
                Etiket yanlışlıkla bulunduysa veya ürün artık kullanımda değilse bu ekran normaldir.
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[30px] border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-neutral-100/80 px-6 py-6 sm:px-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                    Dokuntag
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-neutral-900">
                    Kayıp olanı sahibine ulaştıran güvenli köprü
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-600">
                    Dokuntag, fiziksel ürün ile dijital profil arasında bağlantı kurar. Profil sahibi ürünü aktif ettiğinde public bilgiler ve iletişim seçenekleri yeniden açılabilir.
                  </p>
                </div>

                <div className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
                  NFC / QR destekli
                </div>
              </div>
            </div>

            <div className="px-6 py-6 sm:px-7">
              <div className="grid gap-3 sm:grid-cols-3">
                <StepCard
                  step="1. Adım"
                  title="Etikete dokun veya kodu tara"
                  text="Ürün üzerindeki Dokuntag etiketi okutulur ve güvenli profil sayfası açılır."
                />
                <StepCard
                  step="2. Adım"
                  title="Public durum kontrol edilir"
                  text="Ürün pasifse yalnızca kısıtlı bilgilendirme ekranı gösterilir."
                />
                <StepCard
                  step="3. Adım"
                  title="Aktif olduğunda iletişim açılır"
                  text="Profil sahibi ürünü yeniden aktive ettiğinde iletişim ve paylaşılan bilgiler geri gelir."
                />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <FeatureCard
                  title="Neden bu ekran görünüyor?"
                  text="Profil sahibi ürünü tamamen silmeden geçici olarak devre dışı bırakmış olabilir."
                />
                <FeatureCard
                  title="Ne işe yarar?"
                  text="Kullanılmayan, kaybolmayan ya da geçici olarak kapatılmak istenen ürünlerde public erişimi durdurur."
                />
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm leading-6 text-neutral-600">
                  Dokuntag hakkında daha fazla bilgi almak veya sistemin nasıl çalıştığını görmek için aşağıdaki bağlantıları kullanabilirsiniz.
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={dokuntagHref}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl bg-neutral-800 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-700"
                  >
                    Dokuntag’ı incele
                  </a>
                  <a
                    href={howItWorksHref}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
                  >
                    Nasıl çalışır
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const showName = getVisibleFlag(data, "showName");
  const showPhone = getVisibleFlag(data, "showPhone");
  const showCity = getVisibleFlag(data, "showCity");
  const showAddressDetail = getVisibleFlag(data, "showAddressDetail");
  const showPetName = getVisibleFlag(data, "showPetName");
  const showNote = getVisibleFlag(data, "showNote");

  const primaryPetName = data.petName?.trim() || "";
  const secondaryName = data.name?.trim() || "";

  const showSecondaryNameSeparately =
   Boolean(secondaryName) &&
    Boolean(primaryPetName) &&
    secondaryName.toLocaleLowerCase("tr-TR") !==
    primaryPetName.toLocaleLowerCase("tr-TR");

  const hasVisibleProfileInfo =
    (showPetName && Boolean(data.petName)) ||
    (showName && Boolean(data.ownerName)) ||
    showSecondaryNameSeparately ||
    (showPhone && Boolean(data.phone)) ||
    (showCity && Boolean(data.city)) ||
    (showAddressDetail && Boolean(data.addressDetail)) ||
    Boolean(data.distinctiveFeature) ||
    (showNote && Boolean(data.note));

  const hasQuickActions =
    (allowDirectCall && Boolean(data.phone)) ||
    (allowDirectWhatsapp && Boolean(data.phone));

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-8 text-neutral-900 sm:px-5 sm:py-10">
      <div className="mx-auto max-w-2xl space-y-5 sm:space-y-6">
        <section className="overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-neutral-100/80 px-6 py-7 sm:px-8 sm:py-9">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <a
                href={dokuntagHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50"
              >
                Dokuntag
              </a>

              <div className="inline-flex items-center gap-2 rounded-full bg-neutral-800 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-sm">
                <span aria-hidden="true">{getProductIcon(data.productType)}</span>
                <span>{getBadgeLabel(data.productType)}</span>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] border border-neutral-200 bg-neutral-50 text-2xl shadow-sm">
                {getProductIcon(data.productType)}
              </div>

              <div className="min-w-0">
                <h1 className="text-2xl font-semibold leading-tight sm:text-[32px]">
                  {getTitle(data.productType)}
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-600 sm:text-[15px]">
                  {getSubtitle(data.productType)}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 sm:px-8">
            <div className="rounded-[22px] border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm leading-6 text-neutral-700">
              {getHelpText(data.productType)}
            </div>

            <div className="mt-4 rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-900">
              Bu bilgiler profil sahibi tarafından paylaşılmıştır. Yalnızca gerçekten yardımcı olabiliyorsanız iletişime geçin.
            </div>
          </div>
        </section>

        {data.alerts.length > 0 ? (
          <section className="rounded-[30px] border border-amber-200 bg-white p-6 shadow-sm sm:p-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-600">
                Dikkat
              </p>
              <h2 className="mt-2 text-lg font-semibold text-neutral-900">
                Önemli uyarılar
              </h2>
            </div>

            <div className="mt-4 flex flex-wrap gap-2.5">
              {data.alerts.map((alert) => (
                <span
                  key={alert}
                  className="rounded-full border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-medium text-amber-900"
                >
                  {alert}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {hasVisibleProfileInfo ? (
          <section className="rounded-[30px] border border-neutral-200 bg-white p-6 shadow-sm sm:p-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Profil bilgileri
              </p>
              <h2 className="mt-2 text-lg font-semibold text-neutral-900">
                Paylaşılan bilgiler
              </h2>
            </div>

            <div className="mt-5 space-y-3">
              {showPetName && data.petName ? (
                <InfoRow
                  label={getPrimaryNameLabel(data.productType)}
                  value={data.petName}
                />
              ) : null}

              {showSecondaryNameSeparately ? (
                <InfoRow label="Etiket başlığı" value={data.name} />
              ) : null}

              {showName && data.ownerName ? (
                <InfoRow
                  label={getOwnerLabel(data.productType)}
                  value={data.ownerName}
                />
              ) : null}

              {showPhone && data.phone ? (
                <InfoRow label="Telefon" value={data.phone} />
              ) : null}

              {showCity && data.city ? (
                <InfoRow label="Şehir" value={data.city} />
              ) : null}

              {showAddressDetail && data.addressDetail ? (
                <InfoRow label="Konum detayı" value={data.addressDetail} />
              ) : null}

              {data.distinctiveFeature ? (
                <div className="rounded-[22px] border border-neutral-800 bg-neutral-800 px-4 py-4 text-white shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-300">
                    Ayırt edici özellik
                  </p>
                  <p className="mt-2 text-sm leading-6">{data.distinctiveFeature}</p>
                </div>
              ) : null}

              {showNote && data.note ? (
                <InfoRow label="Not" value={data.note} />
              ) : null}
            </div>
          </section>
        ) : null}

        {hasQuickActions ? (
          <section className="rounded-[30px] border border-neutral-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="max-w-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Hızlı iletişim
              </p>
              <h2 className="mt-2 text-lg font-semibold text-neutral-900">
                Doğrudan ulaşın
              </h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                Uygun iletişim seçenekleri açıksa aşağıdan hızlıca bağlantı kurabilirsiniz.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {allowDirectCall && data.phone ? (
                <a
                  href={callHref}
                  className="inline-flex min-h-[58px] items-center justify-center rounded-2xl bg-neutral-800 px-5 py-4 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-700"
                >
                  Ara
                </a>
              ) : null}

              {allowDirectWhatsapp && data.phone ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[58px] items-center justify-center rounded-2xl border border-neutral-300 bg-white px-5 py-4 text-center text-sm font-semibold text-neutral-900 transition hover:border-neutral-400 hover:bg-neutral-50"
                >
                  WhatsApp ile yaz
                </a>
              ) : null}
            </div>
          </section>
        ) : null}

        <section className="rounded-[30px] border border-neutral-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              İletişim formu
            </p>
            <h2 className="mt-2 text-lg font-semibold text-neutral-900">
              Profil sahibine mesaj gönderin
            </h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Uygun görülürse profil sahibi sizinle iletişime geçer.
            </p>
          </div>

          {sendError ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
              {sendError}
            </div>
          ) : null}

          {sendSuccess ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 shadow-sm">
              <p className="text-sm font-semibold text-emerald-900">
                Mesaj iletildi
              </p>
              <p className="mt-1 text-sm leading-6 text-emerald-700">
                {sendSuccess}
              </p>
            </div>
          ) : null}

          <form onSubmit={handleSendMessage} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-900">
                  Adınız
                </label>
                <input
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                  placeholder="Adınızı yazın"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-900">
                  Telefon numaranız
                </label>
                <input
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                  placeholder="+90 5xx xxx xx xx"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-900">
                E-posta adresiniz
              </label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                placeholder="ornek@mail.com"
              />
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-neutral-900">
                Size nasıl ulaşılmasını istersiniz?
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                <ContactOptionCard
                  label="Telefon"
                  checked={contactPhone}
                  onChange={setContactPhone}
                />
                <ContactOptionCard
                  label="WhatsApp"
                  checked={contactWhatsapp}
                  onChange={setContactWhatsapp}
                />
                <ContactOptionCard
                  label="E-posta"
                  checked={contactEmail}
                  onChange={setContactEmail}
                />
              </div>
              <p className="mt-3 text-xs leading-5 text-neutral-500">
                İsterseniz birden fazla seçenek işaretleyebilirsiniz.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-900">
                Mesaj
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="min-h-[140px] w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                placeholder="Örn: Etiketi güvenli şekilde buldum. Uygunsanız bana ulaşabilirsiniz."
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-2xl bg-neutral-900 px-5 py-4 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
            >
              {sending ? "Gönderiliyor..." : "Mesaj gönder"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}