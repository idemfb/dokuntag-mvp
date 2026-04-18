"use client";

import { use, useEffect, useMemo, useState } from "react";

type ProductType = "pet" | "item" | "key" | "person";
type ProductSubtype =
  | "cat"
  | "dog"
  | "bird"
  | "pet_other"
  | "house_key"
  | "car_key"
  | "office_key"
  | "key_other"
  | "girl_child"
  | "boy_child"
  | "woman"
  | "man"
  | "elder"
  | "person_other"
  | "bag"
  | "wallet"
  | "luggage"
  | "phone_item"
  | "tablet"
  | "headphones"
  | "item_other";

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
  publicCode?: string;
  oldCode?: string;
  productType?: ProductType;
  productSubtype?: ProductSubtype | "";
  name: string;
  ownerName: string;
  phone: string;
  email?: string;
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

const PRODUCT_SUBTYPE_OPTIONS: Record<
  ProductType,
  Array<{ value: ProductSubtype; label: string }>
> = {
  pet: [
    { value: "cat", label: "Kedi" },
    { value: "dog", label: "Köpek" },
    { value: "bird", label: "Kuş" },
    { value: "pet_other", label: "Diğer" }
  ],
  key: [
    { value: "house_key", label: "Ev anahtarı" },
    { value: "car_key", label: "Araba anahtarı" },
    { value: "office_key", label: "Ofis anahtarı" },
    { value: "key_other", label: "Diğer" }
  ],
  person: [
    { value: "girl_child", label: "Kız çocuk" },
    { value: "boy_child", label: "Erkek çocuk" },
    { value: "woman", label: "Kadın" },
    { value: "man", label: "Erkek" },
    { value: "elder", label: "Yaşlı" },
    { value: "person_other", label: "Diğer" }
  ],
  item: [
    { value: "bag", label: "Çanta" },
    { value: "wallet", label: "Cüzdan" },
    { value: "luggage", label: "Valiz" },
    { value: "phone_item", label: "Telefon" },
    { value: "tablet", label: "Tablet" },
    { value: "headphones", label: "Kulaklık" },
    { value: "item_other", label: "Diğer" }
  ]
};

function getProductSubtypeLabel(value?: string) {
  if (!value) return "";

  for (const options of Object.values(PRODUCT_SUBTYPE_OPTIONS)) {
    const matched = options.find((item) => item.value === value);
    if (matched) return matched.label;
  }

  return "";
}

function getMainSiteUrl() {
  const value =
    process.env.NEXT_PUBLIC_MAIN_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://dokuntag.com";

  return value.replace(/\/+$/, "");
}

function normalizePhoneForLink(phone: string) {
  return String(phone || "").replace(/\D/g, "");
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

function getProductTypeLabel(productType?: ProductType) {
  if (productType === "pet") return "Evcil hayvan";
  if (productType === "key") return "Anahtar";
  if (productType === "person") return "Kişi";
  return "Eşya";
}

function getProductIcon(productType?: ProductType) {
  if (productType === "pet") return "🐾";
  if (productType === "key") return "🔑";
  if (productType === "person") return "🧍";
  return "🎒";
}

function getHeadline(productType?: ProductType) {
  if (productType === "pet") return "Bu evcil hayvanın sahibine ulaşabilirsiniz";
  if (productType === "key") return "Bu anahtarın sahibine ulaşabilirsiniz";
  if (productType === "person") return "Bu kişiyle ilgili bilgi paylaşabilirsiniz";
  return "Bu eşyanın sahibine ulaşabilirsiniz";
}

function getDescription(productType?: ProductType) {
  if (productType === "pet") {
    return "Hızlı iletişim seçeneklerinden birini kullanarak sahibine güvenli şekilde haber verebilirsiniz.";
  }

  if (productType === "key") {
    return "Düşünmeden tek aksiyonla iletişime geçin. Gereksiz bilgi paylaşmadan sahibine ulaşmasına yardımcı olun.";
  }

  if (productType === "person") {
    return "Gördüğünüz kişiyle ilgili kısa bilgi paylaşmak veya yakınına ulaşmak için aşağıdaki iletişim seçeneklerini kullanabilirsiniz.";
  }

  return "Hızlı iletişim seçeneklerinden birini kullanarak sahibine güvenli şekilde haber verebilirsiniz.";
}

function getPrimaryNameLabel(productType?: ProductType) {
  if (productType === "pet") return "Evcil hayvan";
  if (productType === "key") return "Anahtar";
  if (productType === "person") return "Kişi";
  return "Ürün";
}

function getOwnerLabel(productType?: ProductType) {
  if (productType === "person") return "Yakını / sorumlusu";
  return "Sahibi";
}

function getFallbackName(productType?: ProductType) {
  if (productType === "pet") return "Kayıp evcil hayvan";
  if (productType === "key") return "Bulunan anahtar";
  if (productType === "person") return "Bilgi paylaşımı";
  return "Bulunan eşya";
}

function buildPrimaryAction(input: {
  allowDirectCall: boolean;
  allowDirectWhatsapp: boolean;
  hasEmail: boolean;
  callHref: string;
  whatsappHref: string;
  emailHref: string;
}) {
  if (input.allowDirectCall && input.callHref) {
    return { href: input.callHref, label: "Hemen Ara" };
  }

  if (input.allowDirectWhatsapp && input.whatsappHref) {
    return { href: input.whatsappHref, label: "WhatsApp ile Ulaş" };
  }

  if (input.hasEmail && input.emailHref) {
    return { href: input.emailHref, label: "E-posta Gönder" };
  }

  return null;
}

function SecondaryAction({
  href,
  label
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-50"
    >
      {label}
    </a>
  );
}

function InfoCard({
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
          throw new Error(json.message || "Sayfa yüklenemedi.");
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

  const allowDirectCall = Boolean(
    data?.allowDirectCall ?? data?.contactOptions?.allowDirectCall
  );
  const allowDirectWhatsapp = Boolean(
    data?.allowDirectWhatsapp ?? data?.contactOptions?.allowDirectWhatsapp
  );

  const showName = data ? getVisibleFlag(data, "showName") : false;
  const showPhone = data ? getVisibleFlag(data, "showPhone") : false;
  const showEmail = data ? getVisibleFlag(data, "showEmail") : false;
  const showCity = data ? getVisibleFlag(data, "showCity") : false;
  const showPetName = data ? getVisibleFlag(data, "showPetName") : false;
  const showNote = data ? getVisibleFlag(data, "showNote") : false;

  const displayName = useMemo(() => {
    if (!data) return "";

    const primaryValue = (showName ? data.name : "").trim();
    const petValue = (showPetName ? data.petName || "" : "").trim();

    return petValue || primaryValue || getFallbackName(data.productType);
  }, [data, showName, showPetName]);

  const displayOwnerName = useMemo(() => {
    if (!data || !showName) return "";
    return String(data.ownerName || "").trim();
  }, [data, showName]);

  const displayCity = useMemo(() => {
    if (!data || !showCity) return "";
    return String(data.city || "").trim();
  }, [data, showCity]);

  const displayNote = useMemo(() => {
    if (!data || !showNote) return "";
    return String(data.note || "").trim();
  }, [data, showNote]);

  const displaySubtype = useMemo(() => {
    return getProductSubtypeLabel(data?.productSubtype);
  }, [data?.productSubtype]);

  const contactPhoneValue = useMemo(() => {
    if (!data || !showPhone) return "";
    return String(data.phone || "").trim();
  }, [data, showPhone]);

  const contactEmailValue = useMemo(() => {
    if (!data || !showEmail) return "";
    return String(data.email || "").trim();
  }, [data, showEmail]);

  const callHref = useMemo(() => {
    if (!contactPhoneValue) return "";
    const normalized = normalizePhoneForLink(contactPhoneValue);
    return normalized ? `tel:${normalized}` : "";
  }, [contactPhoneValue]);

  const whatsappHref = useMemo(() => {
    if (!contactPhoneValue) return "";

    const phone = normalizePhoneForLink(contactPhoneValue);
    if (!phone) return "";

    const normalizedForWhatsapp = phone.startsWith("0")
      ? `90${phone.slice(1)}`
      : phone;

    const text = "Merhaba, Dokuntag üzerinden size ulaşıyorum.";

    return `https://wa.me/${normalizedForWhatsapp}?text=${encodeURIComponent(text)}`;
  }, [contactPhoneValue]);

  const emailHref = useMemo(() => {
    if (!contactEmailValue) return "";
    const subject = encodeURIComponent("Dokuntag üzerinden size ulaşıyorum");
    const body = encodeURIComponent("Merhaba, Dokuntag üzerinden size ulaşıyorum.");
    return `mailto:${contactEmailValue}?subject=${subject}&body=${body}`;
  }, [contactEmailValue]);

  const primaryAction = useMemo(() => {
    return buildPrimaryAction({
      allowDirectCall,
      allowDirectWhatsapp,
      hasEmail: Boolean(contactEmailValue),
      callHref,
      whatsappHref,
      emailHref
    });
  }, [allowDirectCall, allowDirectWhatsapp, contactEmailValue, callHref, whatsappHref, emailHref]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!data) return;

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

      setSendSuccess(json?.message || "Mesaj gönderildi.");
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
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-neutral-200 bg-white px-6 py-8 shadow-sm">
          <p className="text-sm text-neutral-600">Yükleniyor...</p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-neutral-100 px-4 py-8 text-neutral-900 sm:px-5 sm:py-10">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-red-200 bg-white px-6 py-8 shadow-sm">
          <p className="text-sm font-medium text-red-700">
            {error || "Profil yüklenemedi."}
          </p>
        </div>
      </main>
    );
  }

  if (data.status === "inactive") {
    return (
      <main className="min-h-screen bg-neutral-100 px-4 py-8 text-neutral-900 sm:px-5 sm:py-10">
        <div className="mx-auto max-w-3xl space-y-5">
          <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-neutral-100/80 px-6 py-7 sm:px-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <a
                  href={dokuntagHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600"
                >
                  Dokuntag
                </a>

                <div className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                  <span aria-hidden="true">{getProductIcon(data.productType)}</span>
                  <span>{getProductTypeLabel(data.productType)}</span>
                </div>
              </div>

              <div className="mt-6 flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] border border-neutral-200 bg-neutral-50 text-2xl">
                  {getProductIcon(data.productType)}
                </div>
                <div>
                  <h1 className="text-2xl font-semibold leading-tight sm:text-[32px]">
                    Bu ürün şu an aktif değil
                  </h1>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-600 sm:text-[15px]">
                    Profil sahibi herkese açık erişimi geçici olarak kapatmıştır.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-6 sm:px-8">
              <div className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
                Hızlı iletişim ve profil bilgileri şu an görünmüyor. Ürün yeniden aktifleştirildiğinde public profil tekrar açılır.
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-8 pb-28 text-neutral-900 sm:px-5 sm:py-10 sm:pb-12">
      <div className="mx-auto max-w-3xl space-y-5 sm:space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-neutral-100/80 px-6 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <a
                href={dokuntagHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600"
              >
                Dokuntag
              </a>

              <div className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                <span aria-hidden="true">{getProductIcon(data.productType)}</span>
                <span>{getProductTypeLabel(data.productType)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  Güvenli iletişim profili
                </p>
                <h1 className="text-2xl font-semibold leading-tight sm:text-[32px]">
                  {getHeadline(data.productType)}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-neutral-600 sm:text-[15px]">
                  {getDescription(data.productType)}
                </p>
              </div>

              <div className="rounded-[22px] border border-neutral-200 bg-white px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  {getPrimaryNameLabel(data.productType)}
                </p>
                <p className="mt-2 text-xl font-semibold text-neutral-900 sm:text-2xl">
                  {displayName}
                </p>
                {displaySubtype ? (
                  <p className="mt-2 text-sm text-neutral-600">{displaySubtype}</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="px-6 py-6 sm:px-8">
            {primaryAction ? (
              <div className="rounded-[24px] border border-neutral-900 bg-neutral-900 p-4 text-white shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-300">
                  Ana aksiyon
                </p>
                <a
                  href={primaryAction.href}
                  className="mt-3 inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-base font-semibold text-neutral-900 transition hover:bg-neutral-100"
                >
                  {primaryAction.label}
                </a>
                <p className="mt-3 text-sm leading-6 text-neutral-300">
                  Sahibine en hızlı ulaşım için tek dokunuşla iletişim kurabilirsiniz.
                </p>
              </div>
            ) : (
              <div className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
                Bu profil şu an doğrudan iletişim paylaşmıyor. Aşağıdaki formdan kısa mesaj bırakabilirsiniz.
              </div>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {allowDirectCall && callHref ? (
                <SecondaryAction href={callHref} label="Ara" />
              ) : null}

              {allowDirectWhatsapp && whatsappHref ? (
                <SecondaryAction href={whatsappHref} label="WhatsApp" />
              ) : null}

              {contactEmailValue && emailHref ? (
                <SecondaryAction href={emailHref} label="E-posta" />
              ) : null}
            </div>
          </div>
        </section>

        {(displayOwnerName || contactPhoneValue || contactEmailValue || displayCity || displayNote || data.alerts.length > 0) ? (
          <section className="grid gap-3 sm:grid-cols-2">
            {displayOwnerName ? (
              <InfoCard label={getOwnerLabel(data.productType)} value={displayOwnerName} />
            ) : null}

            {contactPhoneValue ? (
              <InfoCard label="Telefon" value={contactPhoneValue} />
            ) : null}

            {contactEmailValue ? (
              <InfoCard label="E-posta" value={contactEmailValue} />
            ) : null}

            {displayCity ? <InfoCard label="Şehir" value={displayCity} /> : null}

            {displayNote ? (
              <div className="rounded-[22px] border border-neutral-200 bg-white px-4 py-4 sm:col-span-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  Not
                </p>
                <p className="mt-2 text-sm leading-6 text-neutral-900">{displayNote}</p>
              </div>
            ) : null}

            {data.alerts.length > 0 ? (
              <div className="rounded-[22px] border border-neutral-200 bg-white px-4 py-4 sm:col-span-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  Uyarılar
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {data.alerts.map((alert) => (
                    <span
                      key={alert}
                      className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900"
                    >
                      {alert}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-6 py-5 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Alternatif iletişim
            </p>
            <h2 className="mt-2 text-xl font-semibold text-neutral-900">
              Kısa mesaj bırak
            </h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Doğrudan aramak istemiyorsanız kısa bir bilgi bırakabilirsiniz.
            </p>
          </div>

          <div className="px-6 py-6 sm:px-8">
            {sendError ? (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                {sendError}
              </div>
            ) : null}

            {sendSuccess ? (
              <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-700">
                {sendSuccess}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-900">
                    Adınız
                  </label>
                  <input
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                    placeholder="Adınız"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-900">
                    Telefon
                  </label>
                  <input
                    value={senderPhone}
                    onChange={(e) =>
                      setSenderPhone(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                    placeholder="05xxxxxxxxx"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-900">
                  E-posta
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
                <label className="mb-2 block text-sm font-medium text-neutral-900">
                  Mesajınız
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                  placeholder="Kısa bir bilgi paylaşın"
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-neutral-900">
                  Size nasıl dönülsün?
                </p>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-3 py-2 text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      checked={contactPhone}
                      onChange={(e) => setContactPhone(e.target.checked)}
                    />
                    Telefon
                  </label>
                  <label className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-3 py-2 text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      checked={contactWhatsapp}
                      onChange={(e) => setContactWhatsapp(e.target.checked)}
                    />
                    WhatsApp
                  </label>
                  <label className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-3 py-2 text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      checked={contactEmail}
                      onChange={(e) => setContactEmail(e.target.checked)}
                    />
                    E-posta
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? "Gönderiliyor..." : "Mesajı Gönder"}
              </button>
            </form>
          </div>
        </section>
      </div>

      {primaryAction ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur sm:hidden">
          <a
            href={primaryAction.href}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white"
          >
            {primaryAction.label}
          </a>
        </div>
      ) : null}
    </main>
  );
}
