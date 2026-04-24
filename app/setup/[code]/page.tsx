"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

type SetupForm = {
  productType: ProductType;
  productSubtype: ProductSubtype | "";
  petName: string;
  ownerName: string;
  phone: string;
  note: string;
  recoveryEmail: string;
  allowDirectCall: boolean;
  allowDirectWhatsapp: boolean;
};

type Props = {
  params: Promise<{ code: string }>;
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

const initialForm: SetupForm = {
  productType: "item",
  productSubtype: "",
  petName: "",
  ownerName: "",
  phone: "",
  note: "",
  recoveryEmail: "",
  allowDirectCall: false,
  allowDirectWhatsapp: false
};

function getProductTypeLabel(type: ProductType) {
  if (type === "pet") return "Evcil hayvan";
  if (type === "key") return "Anahtar";
  if (type === "person") return "Birey";
  if (type === "other") return "Diğer";
  return "Eşya";
}

function getPrimaryPlaceholder(type: ProductType) {
  if (type === "pet") return "Evcil hayvan adı";
  if (type === "person") return "Kişi adı";
  if (type === "key") return "Anahtar adı";
  if (type === "other") return "Ad / başlık";
  return "Eşya adı";
}

function getOwnerPlaceholder(type: ProductType) {
  if (type === "person") return "Yakını";
  if (type === "pet") return "Sahibi";
  return "Sahibi";
}

function getSubtypePlaceholder(type: ProductType) {
  if (type === "pet") return "Tür";
  if (type === "key") return "Anahtar türü";
  if (type === "person") return "Kategori";
  return "Kategori";
}

function getHeaderDescription(type: ProductType) {
  if (type === "pet") {
    return "Evcil hayvanınız kaybolduğunda size hızlıca ulaşılabilmesi için kısa bilgileri girin.";
  }

  if (type === "person") {
    return "Bu profil, ihtiyaç halinde yakınınıza hızlıca ulaşılmasına yardımcı olur.";
  }

  if (type === "key") {
    return "Anahtar üzerinde adres paylaşmadan, bulan kişinin size güvenli şekilde ulaşmasını sağlar.";
  }

  return "Kaybolduğunda size ulaşılabilmesi için kısa bilgileri girin.";
}

function getTheme(type: ProductType) {
  switch (type) {
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

function normalizePhone(value: string) {
  return String(value || "").replace(/[^0-9]/g, "");
}

function normalizeEmail(value: string) {
  return String(value || "").trim().toLowerCase();
}

function getMainSiteUrl() {
  const value =
    process.env.NEXT_PUBLIC_MAIN_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://dokuntag.com";

  return value.replace(/\/+$/, "");
}

export default function SetupPage({ params }: Props) {
  const router = useRouter();
  const mainSiteUrl = getMainSiteUrl();

  const [code, setCode] = useState("");
  const [form, setForm] = useState<SetupForm>(initialForm);
  const [recoveryEmailConfirm, setRecoveryEmailConfirm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [manageLink, setManageLink] = useState("");
  const [error, setError] = useState("");

  const theme = getTheme(form.productType);

  const subtypeOptions = useMemo(
    () => PRODUCT_SUBTYPE_OPTIONS[form.productType],
    [form.productType]
  );

  const recoveryEmailError =
    Boolean(error) &&
    (error.toLowerCase().includes("kurtarma e-postası") ||
      error.toLowerCase().includes("kurtarma e-postaları") ||
      error.toLowerCase().includes("tekrar yazın"));

  function update<K extends keyof SetupForm>(key: K, value: SetupForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    (async () => {
      const resolved = await params;
      setCode(String(resolved.code || "").trim().toUpperCase());
      setLoading(false);
    })();
  }, [params]);

  useEffect(() => {
    const valid = subtypeOptions.some(
      (item) => item.value === form.productSubtype
    );

    if (form.productSubtype && !valid) {
      update("productSubtype", "");
    }
  }, [form.productType, form.productSubtype, subtypeOptions]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
  if (!form.phone) {
  if (form.allowDirectCall) update("allowDirectCall", false);
  if (form.allowDirectWhatsapp) update("allowDirectWhatsapp", false);
}
}, [form.phone, form.allowDirectCall, form.allowDirectWhatsapp]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (!form.petName.trim()) {
        throw new Error("İsim zorunlu.");
      }

      if (!form.recoveryEmail.trim()) {
        throw new Error("Kurtarma e-postası zorunlu.");
      }

      if (!recoveryEmailConfirm.trim()) {
        throw new Error("Kurtarma e-postasını tekrar yazın.");
      }

      if (
        normalizeEmail(form.recoveryEmail) !== normalizeEmail(recoveryEmailConfirm)
      ) {
        throw new Error("Kurtarma e-postaları aynı olmalıdır.");
      }

      const normalizedPhone = normalizePhone(form.phone);
      const normalizedRecoveryEmail = normalizeEmail(form.recoveryEmail);
      const hasNote = Boolean(form.note.trim());

      const payload = {
        productType: form.productType,
        productSubtype: form.productSubtype,
        petName: form.petName.trim(),
        name: form.petName.trim(),
        ownerName: form.ownerName.trim(),
        phone: normalizedPhone,
        email: normalizedRecoveryEmail,
        city: "",
        addressDetail: "",
        distinctiveFeature: "",
        note: form.note.trim(),
        alerts: [],
        allowPhone: Boolean(normalizedPhone && form.allowDirectCall),
        allowWhatsapp: Boolean(
          normalizedPhone && form.allowDirectCall && form.allowDirectWhatsapp
        ),
        showName: Boolean(form.ownerName.trim()),
        showPhone: Boolean(normalizedPhone && form.allowDirectCall),
        showEmail: false,
        showCity: false,
        showAddressDetail: false,
        showPetName: true,
        showNote: hasNote,
        recoveryPhone: "",
        recoveryEmail: normalizedRecoveryEmail,
        recoveryEmailConfirm: normalizeEmail(recoveryEmailConfirm),
        useRecoveryPhoneAsContact: false,
        useRecoveryEmailAsContact: false
      };

      const res = await fetch(`/api/setup/${code}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Kurulum başarısız.");
      }

      const origin = window.location.origin;
      setManageLink(`${origin}${data.managePath}`);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setSaving(false);
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

  if (done) {
    return (
      <main className="min-h-screen bg-[#f5f5f3] px-4 py-5 text-neutral-900">
        <div className="mx-auto max-w-md space-y-2 md:space-y-3">
          <a
            href={mainSiteUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-neutral-500 transition hover:text-neutral-900 hover:underline"
          >
            ← Dokuntag ana sayfa
          </a>

          <section className="rounded-[1.5rem] border border-neutral-200 bg-white px-4 py-3.5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
              Dokuntag
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">
              Kurulum tamamlandı
            </h1>

            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Profil aktif. Herkese açık sayfayı inceleyebilir, ayrıntıları
              yönetim sayfasından düzenleyebilirsiniz.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => router.push(`/p/${code}`)}
                className="rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Herkese açık sayfayı gör
              </button>

              <button
                type="button"
                onClick={() => {
                  const token =
                    new URL(manageLink).searchParams.get("token") || "";
                  router.push(`/manage/${code}?token=${token}`);
                }}
                className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-50"
              >
                Yönetim sayfasına git
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f3] px-4 py-3.5 text-neutral-900">
      <div className="mx-auto max-w-md  ">
        <a
          href={mainSiteUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-neutral-500 transition hover:text-neutral-900 hover:underline"
        >
          ← Dokuntag ana sayfa
        </a>

        <section
          className={`rounded-[1.5rem] border px-4 py-3.5 shadow-sm ${theme.wrapper}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                Dokuntag
              </p>
              <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">
                Hızlı kurulum
              </h1>
            </div>
 <span className={`rounded-full border px-3 py-1 text-xs font-medium ${theme.badge}`}>
  Kod • {code || "-"}
</span>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${theme.badge}`}
            >
              {getProductTypeLabel(form.productType)}
            </span>
            
          </div>

          <p className="mt-2 text-sm leading-6 text-neutral-600">
            {getHeaderDescription(form.productType)}
          </p>

          <div className="mt-3 flex justify-end">
          
          </div>
        </section>

        <section className="rounded-[1.35rem] border border-blue-200 bg-blue-50 px-3 py-3">
          <p className="text-sm font-medium text-blue-950">
            Bu sayfa hızlı kurulum içindir
          </p>
          <p className="mt-0.5 text-xs leading-5 text-blue-900">
            İsterseniz daha sonra yönetim sayfasından detayları ekleyebilirsiniz.
          </p>
        </section>

        <form
          noValidate
          onSubmit={handleSubmit}
          className="rounded-[1.5rem] border border-neutral-200 bg-white px-4 py-3.5 shadow-sm"
        >
          <div className="space-y-2.5 md:space-y-3">
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                {error}
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-1.5">
              <select
                value={form.productType}
                onChange={(e) =>
                  update("productType", e.target.value as ProductType)
                }
                className="min-w-0 rounded-2xl border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
              >
                <option value="item">Eşya</option>
                <option value="key">Anahtar</option>
                <option value="pet">Evcil hayvan</option>
                <option value="person">Birey</option>
                <option value="other">Diğer</option>
              </select>

              <select
                value={form.productSubtype}
                onChange={(e) =>
                  update("productSubtype", e.target.value as ProductSubtype | "")
                }
                className="min-w-0 rounded-2xl border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
              >
                <option value="">{getSubtypePlaceholder(form.productType)}</option>
                {subtypeOptions.map((item) => (
                  <option key={`${form.productType}-${item.value}`} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <input
                value={form.petName}
                onChange={(e) => update("petName", e.target.value)}
                placeholder={getPrimaryPlaceholder(form.productType)}
                className="min-w-0 rounded-2xl border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                required
              />

              <input
                value={form.ownerName}
                onChange={(e) => update("ownerName", e.target.value)}
                placeholder={getOwnerPlaceholder(form.productType)}
                className="min-w-0 rounded-2xl border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
              />
            </div>

            <section className="rounded-[1.35rem] border border-neutral-200 bg-neutral-50 px-3 py-3">
              <p className="text-sm font-medium text-neutral-900">
                İletişim telefonu
              </p>
              <p className="mt-0.5 text-xs leading-5 text-neutral-500">
                Telefon, bulan kişinin size hızlıca ulaşabilmesi içindir. Arama ve WhatsApp seçeneklerini siz belirlersiniz.
              </p>

              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <input
                  value={form.phone}
                  onChange={(e) =>
                    update("phone", normalizePhone(e.target.value))
                  }
                  placeholder="05xxxxxxxxx"
                  className="min-w-0 rounded-2xl border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                />

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    disabled={!form.phone}
                    onClick={() => {
                      const next = !form.allowDirectCall;
                      update("allowDirectCall", next);
                     
                    }}
                    className={`rounded-2xl border px-3 py-2.5 text-xs font-medium transition ${
                      form.allowDirectCall
                        ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                        : form.phone
                          ? "border-neutral-300 bg-white text-neutral-600 hover:border-blue-200 hover:bg-blue-50"
                          : "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                    }`}
                  >
                  Telefon
                  </button>

                  <button
                    type="button"
                    disabled={!form.phone}
                    onClick={() =>
                      update("allowDirectWhatsapp", !form.allowDirectWhatsapp)
                    }
                    className={`rounded-2xl border px-3 py-2.5 text-xs font-medium transition ${
                      form.allowDirectWhatsapp
                        ? "border-green-600 bg-green-600 text-white shadow-sm"
                        : form.phone
                        ? "border-neutral-300 bg-white text-neutral-700 hover:border-emerald-300 hover:bg-emerald-50"
                        : "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                    }`}
                  >
                    WhatsApp
                  </button>
                </div>
              </div>
            </section>

            <textarea
              value={form.note}
              onChange={(e) => update("note", e.target.value)}
              placeholder="Kısa not veya ayırt edici özellik gibi bilgileri girebilirsiniz. (isteğe bağlı)"
              className="min-h-[72px] w-full rounded-2xl border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
            />

            <section className="rounded-[1.35rem] border border-neutral-200 bg-neutral-50 px-3 py-3">
              <p className="text-sm font-medium text-neutral-900">
                Hesap kurtarma
              </p>
              <p className="mt-0.5 text-xs leading-5 text-neutral-500">
                E-posta kimseye gösterilmez. Yönetim erişimi ve Bildirimler için kullanılır.
              </p>

              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <input
                  type="email"
                  value={form.recoveryEmail}
                  onChange={(e) =>
                    update("recoveryEmail", normalizeEmail(e.target.value))
                  }
                  placeholder="Kurtarma e-postası"
                  className={`min-w-0 rounded-2xl border bg-white px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
                    recoveryEmailError
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-neutral-300 focus:border-neutral-500 focus:ring-neutral-200"
                  }`}
                />

                <input
                  type="email"
                  value={recoveryEmailConfirm}
                  onChange={(e) =>
                    setRecoveryEmailConfirm(normalizeEmail(e.target.value))
                  }
                  placeholder="E-postayı tekrar yazın"
                  className={`min-w-0 rounded-2xl border bg-white px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
                    recoveryEmailError
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-neutral-300 focus:border-neutral-500 focus:ring-neutral-200"
                  }`}
                />
              </div>
            </section>

            <button
              disabled={saving}
              className="w-full rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Kaydediliyor..." : "Kurulumu tamamla"}
            </button>
          </div>
        </form>

        <section className="rounded-[1.5rem] border border-neutral-200 bg-white px-4 py-3.5 shadow-sm">
          <p className="text-sm font-medium text-neutral-900">
            Dokuntag ile örnek profil ve kullanım akışını inceleyin.
          </p>

          <div className="mt-3 grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => router.push("/demo")}
              className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
            >
              Demo sayfası
            </button>
            <button
              type="button"
              onClick={() => router.push("/how-it-works")}
              className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
            >
              Nasıl çalışır?
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}