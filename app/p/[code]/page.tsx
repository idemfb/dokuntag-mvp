"use client";

import { use, useEffect, useMemo, useState } from "react";

type ProductType = "pet" | "item" | "key" | "person" | "other";
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

type TagStatus = "production_hold" | "unclaimed" | "active" | "inactive" | "void";

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
  ],
  other: [{ value: "item_other", label: "Diğer" }]
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

function maskPhone(phone: string) {
  const cleaned = normalizePhoneForLink(phone);
  if (!cleaned) return "-";
  if (cleaned.length <= 4) return cleaned;
  return `${cleaned.slice(0, 4)}****${cleaned.slice(-2)}`;
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
  if (productType === "other") return "Diğer";
  return "Eşya";
}

function getProductIcon(productType?: ProductType) {
  if (productType === "pet") return "🐾";
  if (productType === "key") return "🔑";
  if (productType === "person") return "🧍";
  if (productType === "other") return "●";
  return "🎒";
}

function getHeadline(productType?: ProductType) {
  if (productType === "pet") return "Bu evcil hayvanın sahibine ulaşabilirsiniz";
  if (productType === "key") return "Bu anahtarın sahibine ulaşabilirsiniz";
  if (productType === "person") return "Bu kişi için yakınını bilgilendirebilirsiniz";
  if (productType === "other") return "Bu profilin sahibine ulaşabilirsiniz";
  return "Bu eşyanın sahibine ulaşabilirsiniz";
}

function getPrimaryNameLabel(productType?: ProductType) {
  if (productType === "pet") return "Evcil hayvan";
  if (productType === "key") return "Anahtar";
  if (productType === "person") return "Kişi";
  if (productType === "other") return "Başlık";
  return "Eşya";
}

function getOwnerLabel(productType?: ProductType) {
  if (productType === "person") return "Yakını";
  return "Sahibi";
}

function getFallbackName(productType?: ProductType) {
  if (productType === "pet") return "Kayıp evcil hayvan";
  if (productType === "key") return "Bulunan anahtar";
  if (productType === "person") return "Bilgi paylaşımı";
  if (productType === "other") return "Dokuntag profili";
  return "Bulunan eşya";
}

function getTheme(productType?: ProductType) {
  if (productType === "pet") {
    return {
      pageBg: "bg-[linear-gradient(180deg,#fffcf8_0%,#fffdfa_55%,#ffffff_100%)]",
      heroBg: "bg-gradient-to-br from-violet-50 via-white to-orange-50",
      badge: "border-amber-200 bg-amber-100/80 text-amber-900",
      softLabel: "text-amber-700",
      accentButton: "bg-neutral-900 text-white hover:bg-neutral-800",
      secondaryButton:
        "border-amber-200 bg-white text-amber-900 hover:border-amber-300 hover:bg-amber-50/70",
      ring: "focus:border-amber-300 focus:ring-amber-100",
      chip: "border-amber-200 bg-amber-50/80 text-amber-900",
      stickyButton: "bg-neutral-900 text-white"
    };
  }

  if (productType === "key") {
    return {
      pageBg: "bg-[linear-gradient(180deg,#f9fcff_0%,#fcfdff_55%,#ffffff_100%)]",
      heroBg: "bg-gradient-to-br from-slate-50 via-white to-slate-100",
      badge: "border-sky-200 bg-sky-100/80 text-sky-900",
      softLabel: "text-sky-700",
      accentButton: "bg-neutral-900 text-white hover:bg-neutral-800",
      secondaryButton:
        "border-sky-200 bg-white text-sky-900 hover:border-sky-300 hover:bg-sky-50/70",
      ring: "focus:border-sky-300 focus:ring-sky-100",
      chip: "border-sky-200 bg-sky-50/80 text-sky-900",
      stickyButton: "bg-neutral-900 text-white"
    };
  }

  if (productType === "person") {
    return {
      pageBg: "bg-[linear-gradient(180deg,#f9fcfc_0%,#fcfefe_55%,#ffffff_100%)]",
      heroBg: "bg-gradient-to-br from-blue-50 via-white to-indigo-50",
      badge: "border-teal-200 bg-teal-100/80 text-teal-900",
      softLabel: "text-teal-700",
      accentButton: "bg-neutral-900 text-white hover:bg-neutral-800",
      secondaryButton:
        "border-teal-200 bg-white text-teal-900 hover:border-teal-300 hover:bg-teal-50/70",
      ring: "focus:border-teal-300 focus:ring-teal-100",
      chip: "border-teal-200 bg-teal-50/80 text-teal-900",
      stickyButton: "bg-neutral-900 text-white"
    };
  }

  if (productType === "other") {
    return {
      pageBg: "bg-[linear-gradient(180deg,#fbf8ff_0%,#fdfcff_55%,#ffffff_100%)]",
      heroBg: "bg-gradient-to-br from-violet-50 via-white to-stone-50",
      badge: "border-violet-200 bg-violet-100/80 text-violet-900",
      softLabel: "text-violet-700",
      accentButton: "bg-neutral-900 text-white hover:bg-neutral-800",
      secondaryButton:
        "border-violet-200 bg-white text-violet-900 hover:border-violet-300 hover:bg-violet-50/70",
      ring: "focus:border-violet-300 focus:ring-violet-100",
      chip: "border-violet-200 bg-violet-50/80 text-violet-900",
      stickyButton: "bg-neutral-900 text-white"
    };
  }

  return {
    pageBg: "bg-[linear-gradient(180deg,#fbfbfa_0%,#fdfdfc_55%,#ffffff_100%)]",
    heroBg: "bg-gradient-to-br from-stone-50/80 via-white to-zinc-50/70",
    badge: "border-stone-200 bg-stone-100/80 text-stone-900",
    softLabel: "text-stone-700",
    accentButton: "bg-neutral-900 text-white hover:bg-neutral-800",
    secondaryButton:
      "border-stone-200 bg-white text-stone-900 hover:border-stone-300 hover:bg-stone-50/70",
    ring: "focus:border-stone-300 focus:ring-stone-100",
    chip: "border-stone-200 bg-stone-50/80 text-stone-900",
    stickyButton: "bg-neutral-900 text-white"
  };
}

function ActionButton({
  href,
  label,
  className,
  icon
}: {
  href: string;
  label: string;
  className: string;
  icon?: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ${className}`}
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      <span>{label}</span>
    </a>
  );
}

function CompactInfoRow({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-[140px] flex-1 rounded-[20px] border border-neutral-200 bg-white px-4 py-3">
      <p className="text-sm text-neutral-700">
        <span className="font-medium text-neutral-900">{label}:</span>{" "}
        <span>{value}</span>
      </p>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M19.05 4.94A9.86 9.86 0 0 0 12.03 2C6.57 2 2.13 6.44 2.13 11.9c0 1.75.46 3.46 1.33 4.97L2 22l5.28-1.38a9.86 9.86 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.44 9.9-9.9a9.82 9.82 0 0 0-2.88-6.99Zm-7.02 15.22h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.13.82.84-3.05-.2-.31a8.18 8.18 0 0 1-1.26-4.4c0-4.53 3.69-8.22 8.24-8.22a8.15 8.15 0 0 1 5.82 2.42 8.16 8.16 0 0 1 2.4 5.81c0 4.54-3.69 8.23-8.22 8.23Zm4.51-6.16c-.25-.13-1.49-.73-1.72-.81-.23-.09-.4-.13-.57.12-.17.25-.66.81-.8.98-.15.17-.29.19-.54.06-.25-.13-1.04-.38-1.99-1.22-.74-.66-1.24-1.47-1.39-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.29.38-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.57-1.37-.78-1.88-.2-.49-.41-.42-.57-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.09s.9 2.42 1.03 2.59c.13.17 1.77 2.7 4.28 3.79.6.26 1.07.42 1.43.53.6.19 1.14.16 1.57.1.48-.07 1.49-.61 1.7-1.2.21-.59.21-1.1.15-1.2-.06-.1-.23-.17-.48-.29Z" />
    </svg>
  );
}

function ContactChoice({
  checked,
  label,
  tone,
  onChange
}: {
  checked: boolean;
  label: string;
  tone: "phone" | "whatsapp" | "email";
  onChange: (value: boolean) => void;
}) {
const activeClass =
  tone === "whatsapp" 
  ? "border-[#25D366] bg-[#25D366] text-white shadow-sm hover:bg-[#1ebe5d]"
    : tone === "email"
      ? "border-neutral-900 bg-neutral-900 text-white"
      : "border-blue-950 bg-blue-950 text-white";

  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`min-w-0 truncate rounded-2xl border px-2 py-2.5 text-xs font-semibold transition ${
        checked
          ? activeClass
          : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400"
      }`}
    >
      {label}
    </button>
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
  const [redirecting, setRedirecting] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");
  const [contactPhone, setContactPhone] = useState(false);
  const [contactWhatsapp, setContactWhatsapp] = useState(false);
  const [contactEmail, setContactEmail] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");

  const dokuntagHref = getMainSiteUrl();
  const isDemoProfile = ["DKNTG", "DEMO01", "DEMO02", "DEMO03"].includes(
  code.toUpperCase()
);
  useEffect(() => {
    let cancelled = false;

    async function load() {
  let redirectStarted = false;

  try {
    setLoading(true);
    setError("");

    const res = await fetch(`/api/public/${code}`, {
      cache: "no-store",
    });

    const json: PublicApiResponse = await res.json();

    
    if (!res.ok || !json.success || !json.data) {
      redirectStarted = true;
      setRedirecting(true);
      window.location.replace(`/setup/${code}`);
      return;
    }

    if (json.data.status === "unclaimed") {
  redirectStarted = true;
  setRedirecting(true);
  window.location.replace(`/setup/${code}`);
  return;
}

if (
  json.data.status === "production_hold" ||
  json.data.status === "void" ||
  json.data.status === "inactive"
) {
  if (!cancelled) {
    setData(json.data);
  }
  return;
}

    if (!cancelled) {
      setData(json.data);
    }
  } catch (error) {
    redirectStarted = true;
    setRedirecting(true);
    window.location.replace(`/setup/${code}`);
    return;
  } finally {
    if (!cancelled && !redirectStarted) {
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

  const shouldShowCity = Boolean(displayCity && data?.productType !== "key");

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

  const primaryActionKind = useMemo(() => {
    if (allowDirectCall && callHref) return "call";
    if (allowDirectWhatsapp && whatsappHref) return "whatsapp";
    if (contactEmailValue && emailHref) return "email";
    return null;
  }, [
    allowDirectCall,
    callHref,
    allowDirectWhatsapp,
    whatsappHref,
    contactEmailValue,
    emailHref
  ]);

  const theme = useMemo(() => getTheme(data?.productType), [data?.productType]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!data) return;
    if (isDemoProfile) {
  setSendError("");
  setSendSuccess("Bu bir demo profildir. Gerçek mesaj gönderilmez.");
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

      setSendSuccess(json?.message || "Mesaj gönderildi.");
      setSenderName("");
      setSenderPhone("");
      setSenderEmail("");
      setMessage("");
      setContactPhone(false);
      setContactWhatsapp(false);
      setContactEmail(false);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setSending(false);
    }
  }

  const showCallAction = Boolean(allowDirectCall && callHref);
  const showWhatsappAction = Boolean(allowDirectWhatsapp && whatsappHref);
  const showEmailAction = Boolean(contactEmailValue && emailHref);
  const stickyActionLabel = useMemo(() => {
    const productType = data?.productType;

    if (showCallAction) {
      return productType === "person" ? "Yakınını ara" : "Hemen Ara";
    }

    if (showWhatsappAction) {
      return productType === "person" ? "Yakınına yaz" : "WhatsApp";
    }

    return "E-posta";
  }, [showCallAction, showWhatsappAction, data?.productType]);

  if (loading || redirecting) {
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
            Kurulum sayfasına yönlendiriliyorsunuz...
          </p>
        </div>
      </main>
    );
  }

  if (
  data.status === "production_hold" ||
  data.status === "void" ||
  data.status === "inactive"
) {
    return (
      <main
        className={`min-h-screen px-4 py-8 text-neutral-900 sm:px-5 sm:py-10 ${theme.pageBg}`}
      >
        <div className="mx-auto max-w-3xl">
          <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
            <div className={`px-6 py-7 sm:px-8 ${theme.heroBg}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <a
                  href={dokuntagHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600"
                >
                  Dokuntag
                </a>

                <div
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${theme.badge}`}
                >
                  <span aria-hidden="true">{getProductIcon(data.productType)}</span>
                  <span>{getProductTypeLabel(data.productType)}</span>
                </div>
              </div>

              <div className="mt-6 flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] border border-neutral-200 bg-white text-2xl">
                  {getProductIcon(data.productType)}
                </div>
                <div>
                  <h1 className="text-2xl font-semibold leading-tight sm:text-[32px]">
                    Bu sayfa şu an kapalı
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    Profil sahibi herkese açık görünürlüğü geçici olarak
                    kapatmıştır.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-6 sm:px-8">
              <div className="rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
                İletişim seçenekleri şu an görünmüyor. Sayfa yeniden açıldığında
                tekrar kullanılabilir.
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen px-4 py-6 pb-28 text-neutral-900 sm:px-5 sm:py-8 sm:pb-10 ${theme.pageBg}`}
    >
      <div className="mx-auto max-w-3xl space-y-3 sm:space-y-4">
        <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
          <div
            className={`border-b border-neutral-200 px-6 py-5 sm:px-8 sm:py-6 ${theme.heroBg}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <a
                href={dokuntagHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600"
              >
                Dokuntag
              </a>

              <div
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${theme.badge}`}
              >
                <span aria-hidden="true">{getProductIcon(data.productType)}</span>
                <span>{getProductTypeLabel(data.productType)}</span>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <p className={`text-sm font-semibold ${theme.softLabel}`}>
                {getHeadline(data.productType)}
              </p>

              <div className="flex flex-wrap gap-2">
                <div className="min-w-[140px] flex-1 rounded-[20px] border border-neutral-200 bg-white px-4 py-3">
                  <p className="text-sm text-neutral-700">
                    <span className="font-medium text-neutral-900">
                      {getPrimaryNameLabel(data.productType)}:
                    </span>{" "}
                    <span className="font-semibold text-neutral-900">
                      {displayName}
                    </span>
                  </p>
                  {displaySubtype ? (
                    <p className="mt-1 text-sm text-neutral-600">
                      {displaySubtype}
                    </p>
                  ) : null}
                </div>

                {displayOwnerName ? (
                  <CompactInfoRow
                    label={getOwnerLabel(data.productType)}
                    value={displayOwnerName}
                  />
                ) : null}
              </div>
            </div>
          </div>

          <div className="px-6 py-3.5 sm:px-8 sm:py-4">
            {showCallAction || showWhatsappAction || showEmailAction ? (
              <div className="grid grid-cols-2 gap-2">
                {showCallAction ? (
                  <ActionButton
                    href={callHref}
                    label={
                      data?.productType === "person" ? "Yakınını ara" : "Hemen Ara"
                    }
                    className={theme.accentButton}
                  />
                ) : showEmailAction ? (
                  <ActionButton
                    href={emailHref}
                    label="E-posta"
                    className={theme.accentButton}
                  />
                ) : (
                  <div />
                )}

                {showWhatsappAction ? (
                  <ActionButton
                    href={whatsappHref}
                    label={
                      data?.productType === "person" ? "Yakınına yaz" : "WhatsApp"
                    }
                    className="border border-[#25D366] bg-[#25D366] text-white shadow-sm hover:bg-[#1ebe5d]"
                    icon={<WhatsAppIcon />}
                  />
                ) : showCallAction || showEmailAction ? (
                  <div />
                ) : null}
              </div>
            ) : (
              <div className="rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
                Bu sayfada doğrudan iletişim bilgisi görünmüyor. Aşağıdan kısa
                mesaj bırakabilirsiniz.
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {contactPhoneValue ? (
                <CompactInfoRow label="Telefon" value={maskPhone(contactPhoneValue)} />
              ) : null}

              {shouldShowCity ? (
                <CompactInfoRow label="Şehir" value={displayCity} />
              ) : null}

              {showEmailAction && primaryActionKind !== "email" ? (
                <CompactInfoRow label="E-posta" value={contactEmailValue} />
              ) : null}
            </div>
          </div>
        </section>

        {displayNote || data.alerts.length > 0 ? (
          <section className="space-y-3">
            {displayNote ? (
              <div className="rounded-[20px] border border-neutral-200 bg-white px-4 py-4">
                <p className="text-sm text-neutral-700">
                  <span className="font-medium text-neutral-900">Not:</span>{" "}
                  <span>{displayNote}</span>
                </p>
              </div>
            ) : null}

            {data.alerts.length > 0 ? (
              <div className="rounded-[20px] border border-neutral-200 bg-white px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  Uyarılar
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {data.alerts.map((alert) => (
                    <span
                      key={alert}
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${theme.chip}`}
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
          <div className="border-b border-neutral-200 px-6 py-2.5 sm:px-8">
            <h2 className="text-xl font-semibold text-neutral-900">
              Ulaşamazsanız kısa bir mesaj bırakın.
            </h2>
          </div>

          <div className="px-6 py-3.5 sm:px-8 sm:py-4">
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

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className={`w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 ${theme.ring}`}
                  placeholder="Adınız"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    value={senderPhone}
                    onChange={(e) =>
                      setSenderPhone(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className={`w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 ${theme.ring}`}
                    placeholder="Telefon: 05xxxxxxxxx"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className={`w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 ${theme.ring}`}
                    placeholder="E-posta: örnek@mail.com"
                  />
                </div>
              </div>

              <div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className={`w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 ${theme.ring}`}
                  placeholder={
                  isDemoProfile
                    ? "Demo mesajı deneyebilirsiniz. Gerçek mesaj gönderilmez."
                    : "Kısa bir bilgi yazın (nerede bulduğunuz gibi)"
                }
                />
              </div>

              <div>
                <p className="mb-1.5 text-sm font-medium text-neutral-900">
                  Size nasıl dönüş yapılsın?
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <ContactChoice
                    checked={contactPhone}
                    label="Telefon"
                    tone="phone"
                    onChange={setContactPhone}
                  />

                  <ContactChoice
                    checked={contactWhatsapp}
                    label="WhatsApp"
                    tone="whatsapp"
                    onChange={setContactWhatsapp}
                  />

                  <ContactChoice
                    checked={contactEmail}
                    label="E-posta"
                    tone="email"
                    onChange={setContactEmail}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={sending}
                className={`inline-flex min-h-12 w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${theme.accentButton}`}
              >
                {sending ? "Gönderiliyor..." : "Mesajı Gönder"}
              </button>
            </form>
          </div>
        </section>

        
      </div>

      {(showCallAction && callHref) ||
      (showWhatsappAction && whatsappHref) ||
      (showEmailAction && emailHref) ? (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur sm:hidden">
          <a
            href={
              showCallAction
                ? callHref
                : showWhatsappAction
                  ? whatsappHref
                  : emailHref
            }
            className={`inline-flex min-h-12 w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold ${theme.stickyButton}`}
          >
            {stickyActionLabel}
          </a>
        </div>
      ) : null}
    </main>
  );
}