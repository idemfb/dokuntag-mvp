"use client";

import { use, useEffect, useMemo, useState } from "react";

type ProductType = "pet" | "item" | "key" | "person" | "other";
type TransferStatus = "pending" | "used" | "expired" | "cancelled";

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

type ProductSubtypeOption = {
  value: ProductSubtype;
  label: string;
};

type TransferApiResponse = {
  success?: boolean;
  code?: string;
  productType?: ProductType;
  productSubtype?: ProductSubtype | "";
  currentProfile?: {
    name?: string;
    ownerName?: string;
    phone?: string;
    email?: string;
    city?: string;
    addressDetail?: string;
    distinctiveFeature?: string;
    petName?: string;
    note?: string;
  };
  transfer?: {
    token?: string;
    status?: TransferStatus | null;
    createdAt?: string;
    expiresAt?: string;
    usedAt?: string;
  };
  error?: string;
};

type TransferClaimResponse = {
  success?: boolean;
  code?: string;
  managePath?: string;
  manageLink?: string;
  message?: string;
  error?: string;
};

const SUBTYPE_OPTIONS: Record<ProductType, ProductSubtypeOption[]> = {
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

function getProductTypeLabel(productType: ProductType) {
  if (productType === "pet") return "Evcil hayvan";
  if (productType === "key") return "Anahtar";
  if (productType === "person") return "Birey";
  if (productType === "other") return "Diğer";
  return "Eşya";
}

function getPrimaryNameLabel(productType: ProductType) {
  if (productType === "pet") return "Evcil hayvan adı";
  if (productType === "person") return "Kişi adı";
  if (productType === "key") return "Anahtar adı";
  if (productType === "other") return "Ad / başlık";
  return "Eşya adı";
}

function getOwnerNameLabel(productType: ProductType) {
  if (productType === "person") return "Yakını";
  return "Sahibi";
}

function getSubtypeLabel(productType: ProductType) {
  if (productType === "pet") return "Tür";
  if (productType === "key") return "Anahtar türü";
  if (productType === "person") return "Kategori";
  if (productType === "other") return "Diğer";
  return "Kategori";
}

function normalizePhone(value: string) {
  return String(value || "").replace(/[^0-9]/g, "");
}

function normalizeEmail(value: string) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(value: string) {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function formatDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function getTheme(productType: ProductType) {
  switch (productType) {
    case "pet":
      return {
        wrapper:
          "border-emerald-200 bg-[linear-gradient(180deg,#f4fbf7_0%,#ffffff_100%)]",
        badge: "border-emerald-200 bg-emerald-50 text-emerald-700"
      };
    case "key":
      return {
        wrapper:
          "border-amber-200 bg-[linear-gradient(180deg,#fffaf1_0%,#ffffff_100%)]",
        badge: "border-amber-200 bg-amber-50 text-amber-700"
      };
    case "person":
      return {
        wrapper:
          "border-blue-200 bg-[linear-gradient(180deg,#f5f9ff_0%,#ffffff_100%)]",
        badge: "border-blue-200 bg-blue-50 text-blue-700"
      };
    case "other":
      return {
        wrapper:
          "border-violet-200 bg-[linear-gradient(180deg,#faf7ff_0%,#ffffff_100%)]",
        badge: "border-violet-200 bg-violet-50 text-violet-700"
      };
    default:
      return {
        wrapper:
          "border-neutral-200 bg-[linear-gradient(180deg,#fafafa_0%,#ffffff_100%)]",
        badge: "border-neutral-200 bg-neutral-50 text-neutral-700"
      };
  }
}

function getMainSiteUrl() {
  const value =
    process.env.NEXT_PUBLIC_MAIN_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://dokuntag.com";

  return value.replace(/\/+$/, "");
}

export default function TransferPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  const mainSiteUrl = getMainSiteUrl();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loaded, setLoaded] = useState<TransferApiResponse | null>(null);

  const [productType, setProductType] = useState<ProductType>("item");
  const [productSubtype, setProductSubtype] = useState<ProductSubtype | "">("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [petName, setPetName] = useState("");
  const [note, setNote] = useState("");
  const [recoveryPhone, setRecoveryPhone] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryEmailConfirm, setRecoveryEmailConfirm] = useState("");

  const [useRecoveryPhoneAsContact, setUseRecoveryPhoneAsContact] =
    useState(false);
  const [useRecoveryEmailAsContact, setUseRecoveryEmailAsContact] =
    useState(false);

  const [allowDirectCall, setAllowDirectCall] = useState(false);
  const [allowDirectWhatsapp, setAllowDirectWhatsapp] = useState(false);

  const allowedSubtypeOptions = useMemo(
    () => SUBTYPE_OPTIONS[productType] ?? [],
    [productType]
  );

  const theme = getTheme(productType);
  const recoveryEmailError =
    Boolean(error) &&
    (error.toLowerCase().includes("kurtarma e-postası") ||
      error.toLowerCase().includes("kurtarma e-postaları") ||
      error.toLowerCase().includes("tekrar yazın"));

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/transfer/claim/${token}`, {
          cache: "no-store"
        });

        const data: TransferApiResponse = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Devir bağlantısı açılamadı.");
        }

        if (!cancelled) {
          setLoaded(data);
          setProductType(data.productType || "item");
          setProductSubtype((data.productSubtype || "") as ProductSubtype | "");
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
  }, [token]);

  useEffect(() => {
    const hasSubtype = allowedSubtypeOptions.some(
      (item) => item.value === productSubtype
    );
    if (!hasSubtype && productSubtype) {
      setProductSubtype("");
    }
  }, [allowedSubtypeOptions, productSubtype]);

  useEffect(() => {
    if (useRecoveryPhoneAsContact) {
      const normalized = normalizePhone(recoveryPhone);
      if (phone !== normalized) {
        setPhone(normalized);
      }
    } else if (phone && phone === normalizePhone(recoveryPhone)) {
      setPhone("");
    }
  }, [recoveryPhone, useRecoveryPhoneAsContact, phone]);

  useEffect(() => {
    if (useRecoveryEmailAsContact) {
      const normalized = normalizeEmail(recoveryEmail);
      if (email !== normalized) {
        setEmail(normalized);
      }
    } else if (email && email === normalizeEmail(recoveryEmail)) {
      setEmail("");
    }
  }, [recoveryEmail, useRecoveryEmailAsContact, email]);

  useEffect(() => {
    if (!phone) {
      setAllowDirectCall(false);
      setAllowDirectWhatsapp(false);
    }
  }, [phone]);

  const transferStatus = loaded?.transfer?.status;
  const expiresAtText = formatDate(loaded?.transfer?.expiresAt);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const normalizedPetName = petName.trim();
      const normalizedRecoveryEmail = normalizeEmail(recoveryEmail);
      const normalizedRecoveryEmailConfirm = normalizeEmail(recoveryEmailConfirm);
      const normalizedRecoveryPhone = normalizePhone(recoveryPhone);

      const resolvedPhone = useRecoveryPhoneAsContact
        ? normalizedRecoveryPhone
        : normalizePhone(phone);
      const resolvedEmail = useRecoveryEmailAsContact
        ? normalizedRecoveryEmail
        : normalizeEmail(email);

      if (!normalizedPetName) {
        throw new Error("İsim zorunludur.");
      }

      if (!normalizedRecoveryEmail) {
        throw new Error("Kurtarma e-postası zorunludur.");
      }

      if (!normalizedRecoveryEmailConfirm) {
        throw new Error("Kurtarma e-postasını tekrar yazın.");
      }

      if (normalizedRecoveryEmail !== normalizedRecoveryEmailConfirm) {
        throw new Error("Kurtarma e-postaları aynı olmalıdır.");
      }

      if (!isValidEmail(normalizedRecoveryEmail)) {
        throw new Error("Geçerli bir kurtarma e-postası girin.");
      }

      if (resolvedEmail && !isValidEmail(resolvedEmail)) {
        throw new Error("Geçerli bir iletişim e-postası girin.");
      }

      if (!resolvedPhone && !resolvedEmail) {
        throw new Error("Telefon veya e-posta alanlarından en az biri zorunludur.");
      }

      const res = await fetch(`/api/transfer/claim/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          productType,
          productSubtype,
          name: normalizedPetName,
          ownerName: ownerName.trim(),
          phone: resolvedPhone,
          email: resolvedEmail,
          city: "",
          distinctiveFeature: "",
          petName: normalizedPetName,
          note: note.trim(),
          visibility: {
            showName: true,
            showPhone: Boolean(resolvedPhone),
            showEmail: false,
            showCity: false,
            showAddressDetail: false,
            showPetName: true,
            showNote: Boolean(note.trim())
          },
          contactOptions: {
            allowDirectCall: Boolean(allowDirectCall && resolvedPhone),
            allowDirectWhatsapp: Boolean(
              allowDirectWhatsapp && allowDirectCall && resolvedPhone
            )
          },
          recovery: {
            phone: normalizedRecoveryPhone,
            email: normalizedRecoveryEmail,
            emailConfirm: normalizedRecoveryEmailConfirm
          }
        })
      });

      const data: TransferClaimResponse = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Devir tamamlanamadı.");
      }

      setSuccess(
        data?.message || "Devir tamamlandı. Yeni yönetim bağlantınız oluşturuldu."
      );

      if (data?.manageLink) {
        window.location.href = data.manageLink;
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f5f3] px-4 py-8">
        <div className="mx-auto max-w-md rounded-[1.5rem] border border-neutral-200 bg-white px-4 py-5 shadow-sm">
          <p className="text-sm text-neutral-600">Yükleniyor...</p>
        </div>
      </main>
    );
  }

  if (error && !loaded) {
    return (
      <main className="min-h-screen bg-[#f5f5f3] px-4 py-8">
        <div className="mx-auto max-w-md space-y-3">
          <div className="flex items-center justify-between gap-3 px-1">
            <a
              href={mainSiteUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-neutral-500 transition hover:text-neutral-900 hover:underline"
            >
              ← Dokuntag ana sayfa
            </a>
          </div>

          <section className="rounded-[1.5rem] border border-red-200 bg-white px-4 py-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-red-500">
              Dokuntag Devir
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-red-800">
              Devir bağlantısı kullanılamıyor
            </h1>
            <p className="mt-2.5 text-sm leading-6 text-red-700">{error}</p>
          </section>
        </div>
      </main>
    );
  }

  if (transferStatus && transferStatus !== "pending") {
    return (
      <main className="min-h-screen bg-[#f5f5f3] px-4 py-8">
        <div className="mx-auto max-w-md space-y-3">
          <div className="flex items-center justify-between gap-3 px-1">
            <a
              href={mainSiteUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-neutral-500 transition hover:text-neutral-900 hover:underline"
            >
              ← Dokuntag ana sayfa
            </a>
          </div>

          <section className="rounded-[1.5rem] border border-amber-200 bg-white px-4 py-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-amber-600">
              Dokuntag Devir
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-neutral-900">
              Bu bağlantı artık kullanılamaz
            </h1>
            <p className="mt-2.5 text-sm leading-6 text-neutral-700">
              Durum: {transferStatus}
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f3] px-4 py-4 text-neutral-900">
      <div className="mx-auto max-w-md space-y-3">
        <div className="flex items-center justify-between gap-3 px-1">
          <a
            href={mainSiteUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-neutral-500 transition hover:text-neutral-900 hover:underline"
          >
            ← Dokuntag ana sayfa
          </a>
        </div>

        <section
          className={`rounded-[1.5rem] border px-4 py-4 shadow-sm ${theme.wrapper}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                Dokuntag Devir
              </p>
              <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">
                Hızlı devir kurulumu
              </h1>
            </div>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${theme.badge}`}
            >
              {getProductTypeLabel(productType)}
            </span>
          </div>

          <p className="mt-2.5 text-sm leading-6 text-neutral-600">
            Ürünü üzerinize alın, bilgilerinizi girin ve yeni yönetim erişiminizi oluşturun.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-medium text-neutral-700">
              Kod: {loaded?.code || "-"}
            </span>
            <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-medium text-neutral-700">
              Son kullanım: {expiresAtText}
            </span>
          </div>
        </section>

        {success ? (
          <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
            {success}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form
          noValidate
          onSubmit={handleSubmit}
          className="rounded-[1.5rem] border border-neutral-200 bg-white px-4 py-4 shadow-sm"
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">

  <select
    value={productType}
    onChange={(e) => setProductType(e.target.value as ProductType)}
    className="min-w-0 rounded-2xl border border-neutral-300 bg-white px-3 py-2.5 text-sm truncate"
  >
    <option value="item">Eşya</option>
    <option value="key">Anahtar</option>
    <option value="pet">Evcil hayvan</option>
    <option value="person">Birey</option>
    <option value="other">Diğer</option>
  </select>

  <input
    value={petName}
    onChange={(e) => setPetName(e.target.value)}
    placeholder={getPrimaryNameLabel(productType)}
    className="min-w-0 rounded-2xl border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
    required
  />

</div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(normalizeEmail(e.target.value))}
                placeholder="İletişim e-postası"
                disabled={useRecoveryEmailAsContact}
                className="min-w-0 rounded-2xl border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 disabled:cursor-not-allowed disabled:bg-neutral-100"
              />

              <input
                value={phone}
                onChange={(e) => setPhone(normalizePhone(e.target.value))}
                placeholder="İletişim telefonu"
                disabled={useRecoveryPhoneAsContact}
                className="min-w-0 rounded-2xl border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 disabled:cursor-not-allowed disabled:bg-neutral-100"
              />
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Kısa not"
              className="min-h-[76px] w-full rounded-2xl border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
            />

            <div className="rounded-[1.35rem] border border-neutral-200 bg-neutral-50 px-3 py-3">
              <p className="text-sm font-medium text-neutral-900">
                Hesap kurtarma
              </p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">
                Yönetim erişimini tekrar alabilmeniz için kurtarma e-postası iki kez
                aynı şekilde girilmelidir.
              </p>

              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <div className="min-w-0">
                  <input
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) =>
                      setRecoveryEmail(normalizeEmail(e.target.value))
                    }
                    placeholder="Kurtarma e-postası"
                    className={`w-full min-w-0 rounded-2xl border bg-white px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
                      recoveryEmailError
                        ? "border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-100"
                        : "border-neutral-300 focus:border-neutral-500 focus:ring-neutral-200"
                    }`}
                  />

                  <input
                    type="email"
                    value={recoveryEmailConfirm}
                    onChange={(e) =>
                      setRecoveryEmailConfirm(normalizeEmail(e.target.value))
                    }
                    placeholder="Kurtarma e-postasını tekrar yazın"
                    className={`mt-2 w-full min-w-0 rounded-2xl border bg-white px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
                      recoveryEmailError
                        ? "border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-100"
                        : "border-neutral-300 focus:border-neutral-500 focus:ring-neutral-200"
                    }`}
                  />

                  <label className="mt-1.5 inline-flex items-center gap-2 text-xs text-neutral-700">
                    <input
                      type="checkbox"
                      checked={useRecoveryEmailAsContact}
                      onChange={(e) =>
                        setUseRecoveryEmailAsContact(e.target.checked)
                      }
                    />
                    İletişim için kullan
                  </label>
                </div>

                <div className="min-w-0">
                  <input
                    value={recoveryPhone}
                    onChange={(e) =>
                      setRecoveryPhone(normalizePhone(e.target.value))
                    }
                    placeholder="Kurtarma telefonu"
                    className="w-full min-w-0 rounded-2xl border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                  />
                  <div className="mt-2 space-y-1">
  <label className="flex items-center gap-2 text-xs">
    <input
      type="checkbox"
      checked={allowDirectCall}
      onChange={(e) => setAllowDirectCall(e.target.checked)}
      disabled={!recoveryPhone}
    />
    Telefon açılsın
  </label>

  <label className="flex items-center gap-2 text-xs">
    <input
      type="checkbox"
      checked={allowDirectWhatsapp}
      onChange={(e) => setAllowDirectWhatsapp(e.target.checked)}
      disabled={!allowDirectCall || !recoveryPhone}
    />
    WhatsApp açılsın
  </label>
</div>
                  <label className="mt-1.5 inline-flex items-center gap-2 text-xs text-neutral-700">
                    <input
                      type="checkbox"
                      checked={useRecoveryPhoneAsContact}
                      onChange={(e) =>
                        setUseRecoveryPhoneAsContact(e.target.checked)
                      }
                    />
                    İletişim için kullan
                  </label>
                </div>
              </div>
            </div>

            
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Devir tamamlanıyor..." : "Devri tamamla"}
              
            </button>
            <section className="rounded-[1.5rem] border border-neutral-200 bg-white px-4 py-4 shadow-sm">
  <p className="text-sm font-medium text-neutral-900">
    Dokuntag ile örnek profil ve kullanım akışını inceleyin.
  </p>

  <div className="mt-3 grid grid-cols-2 gap-2">
    <button
      type="button"
      onClick={() => window.location.href = "/demo"}
      className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
    >
      Demo sayfası
    </button>

    <button
      type="button"
      onClick={() => window.location.href = "/how-it-works"}
      className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
    >
      Nasıl çalışır
    </button>
  </div>
</section>
          </div>
        </form>
      </div>
    </main>
  );
}