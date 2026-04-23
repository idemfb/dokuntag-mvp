"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ProductType = "pet" | "item" | "key" | "person" | "other";

type SetupForm = {
  productType: ProductType;
  petName: string;
  phone: string;
  email: string;
  note: string;
  recoveryPhone: string;
  recoveryEmail: string;
  useRecoveryPhoneForContact: boolean;
  useRecoveryEmailForContact: boolean;
  allowDirectCall: boolean;
  allowDirectWhatsapp: boolean;
};

type Props = {
  params: Promise<{ code: string }>;
};

const initialForm: SetupForm = {
  allowDirectCall: false,
  allowDirectWhatsapp: false,
  productType: "item",
  petName: "",
  phone: "",
  email: "",
  note: "",
  recoveryPhone: "",
  recoveryEmail: "",
  useRecoveryPhoneForContact: false,
  useRecoveryEmailForContact: true
  
};

function getPrimaryPlaceholder(type: ProductType) {
  if (type === "pet") return "Evcil hayvan adı";
  if (type === "person") return "Kişi adı";
  if (type === "key") return "Anahtar adı";
  if (type === "other") return "Ad / başlık";
  return "Ürün adı";
}

function getProductTypeLabel(type: ProductType) {
  if (type === "pet") return "Evcil hayvan";
  if (type === "key") return "Anahtar";
  if (type === "person") return "Birey";
  if (type === "other") return "Diğer";
  return "Eşya";
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
    if (form.useRecoveryPhoneForContact) {
      const normalized = normalizePhone(form.recoveryPhone);
      if (form.phone !== normalized) {
        update("phone", normalized);
      }
    } else if (form.phone && form.phone === normalizePhone(form.recoveryPhone)) {
      update("phone", "");
    }
  }, [form.recoveryPhone, form.useRecoveryPhoneForContact]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (form.useRecoveryEmailForContact) {
      const normalized = normalizeEmail(form.recoveryEmail);
      if (form.email !== normalized) {
        update("email", normalized);
      }
    } else if (
      form.email &&
      form.email === normalizeEmail(form.recoveryEmail)
    ) {
      update("email", "");
    }
  }, [form.recoveryEmail, form.useRecoveryEmailForContact]); // eslint-disable-line react-hooks/exhaustive-deps

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
      const normalizedEmail = normalizeEmail(form.email);
      const normalizedRecoveryPhone = normalizePhone(form.recoveryPhone);
      const normalizedRecoveryEmail = normalizeEmail(form.recoveryEmail);
      const hasNote = Boolean(form.note.trim());

      const payload = {
        productType: form.productType,
        petName: form.petName.trim(),
        name: "",
        ownerName: "",
        phone: normalizedPhone,
        email: normalizedEmail,
        city: "",
        addressDetail: "",
        distinctiveFeature: "",
        note: form.note.trim(),
        alerts: [],
        allowPhone: Boolean(normalizedPhone),
        allowWhatsapp: false,
        showName: false,
        showPhone: Boolean(normalizedPhone),
        showEmail: Boolean(normalizedEmail),
        showCity: false,
        showAddressDetail: false,
        showPetName: true,
        showNote: hasNote,
        recoveryPhone: normalizedRecoveryPhone,
        recoveryEmail: normalizedRecoveryEmail,
        recoveryEmailConfirm: normalizeEmail(recoveryEmailConfirm),
        useRecoveryPhoneAsContact: form.useRecoveryPhoneForContact,
        useRecoveryEmailAsContact: form.useRecoveryEmailForContact
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

          <section className="rounded-[1.5rem] border border-neutral-200 bg-white px-4 py-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                  Dokuntag
                </p>
                <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">
                  Kurulum tamamlandı
                </h1>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium ${theme.badge}`}
              >
                Hazır
              </span>
            </div>

            <p className="mt-2.5 text-sm leading-6 text-neutral-600">
              Ürününüz artık aktif. Herkese açık sayfayı inceleyebilir,
              ayrıntılı bilgi girişi ve tüm ayarlar için yönetim sayfasına
              geçebilirsiniz.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
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

          <section className="rounded-[1.5rem] border border-neutral-200 bg-white px-4 py-4 shadow-sm">
            <p className="text-sm font-medium text-neutral-900">
              Dokuntag ile örnek profil ve kullanım akışını inceleyin.
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2">
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
                Dokuntag
              </p>
              <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">
                Hızlı kurulum
              </h1>
            </div>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${theme.badge}`}
            >
              {getProductTypeLabel(form.productType)}
            </span>
          </div>

          <p className="mt-2.5 text-sm leading-6 text-neutral-600">
            Bilgileri girin, kurulumu tamamlayın, sonra herkese açık sayfanızı ve
            yönetim alanınızı inceleyin.
          </p>
        </section>

        <form
          noValidate
          onSubmit={handleSubmit}
          className="rounded-[1.5rem] border border-neutral-200 bg-white px-4 py-4 shadow-sm"
        >
          <div className="space-y-2.5">
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                {error}
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-2">
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

              <input
                value={form.petName}
                onChange={(e) => update("petName", e.target.value)}
                placeholder={getPrimaryPlaceholder(form.productType)}
                className="min-w-0 rounded-2xl border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  update("email", normalizeEmail(e.target.value))
                }
                placeholder="İletişim e-postası"
                disabled={form.useRecoveryEmailForContact}
                className="min-w-0 rounded-2xl border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 disabled:cursor-not-allowed disabled:bg-neutral-100"
              />

              <input
                value={form.phone}
                onChange={(e) =>
                  update("phone", normalizePhone(e.target.value))
                }
                placeholder="İletişim telefonu"
                disabled={form.useRecoveryPhoneForContact}
                className="min-w-0 rounded-2xl border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 disabled:cursor-not-allowed disabled:bg-neutral-100"
              />
            </div>

            <textarea
              value={form.note}
              onChange={(e) => update("note", e.target.value)}
              placeholder="Kısa not veya ayırt edici özellik gibi bilgileri girebilirsiniz. (isteğe bağlı)"
              className="min-h-[72px] w-full rounded-2xl border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
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
                    value={form.recoveryEmail}
                    onChange={(e) =>
                      update("recoveryEmail", normalizeEmail(e.target.value))
                    }
                    placeholder="Kurtarma e-postası"
                    className={`w-full min-w-0 rounded-2xl border bg-white px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
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
                    placeholder="Kurtarma e-postasını tekrar yazın"
                    className={`mt-2 w-full min-w-0 rounded-2xl border bg-white px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
                      recoveryEmailError
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : "border-neutral-300 focus:border-neutral-500 focus:ring-neutral-200"
                    }`}
                  />

                  <label className="mt-1.5 inline-flex items-center gap-2 text-xs text-neutral-700">
                    <input
                      type="checkbox"
                      checked={form.useRecoveryEmailForContact}
                      onChange={(e) =>
                        update("useRecoveryEmailForContact", e.target.checked)
                      }
                    />
                    İletişim için kullan
                  </label>
                </div>

                <div className="min-w-0">
                  <input
                    value={form.recoveryPhone}
                    onChange={(e) =>
                      update("recoveryPhone", normalizePhone(e.target.value))
                    }
                    placeholder="Kurtarma telefonu"
                    className="w-full min-w-0 rounded-2xl border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                  />
                  <div className="mt-2 space-y-1">
  <label className="flex items-center gap-2 text-xs">
    <input
      type="checkbox"
      checked={form.allowDirectCall}
      onChange={(e) =>
        update("allowDirectCall", e.target.checked)
      }
      disabled={!form.recoveryPhone}
    />
    Telefon açılsın
  </label>

  <label className="flex items-center gap-2 text-xs">
    <input
      type="checkbox"
      checked={form.allowDirectWhatsapp}
      onChange={(e) =>
        update("allowDirectWhatsapp", e.target.checked)
      }
      disabled={!form.allowDirectCall || !form.recoveryPhone}
    />
    WhatsApp açılsın
  </label>
</div>
                  <label className="mt-1.5 inline-flex items-center gap-2 text-xs text-neutral-700">
                    <input
                      type="checkbox"
                      checked={form.useRecoveryPhoneForContact}
                      onChange={(e) =>
                        update("useRecoveryPhoneForContact", e.target.checked)
                      }
                    />
                    
                    İletişim için kullan
                  </label>
                </div>
              </div>
            </div>

            <button
              disabled={saving}
              className="w-full rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Kaydediliyor..." : "Kurulumu tamamla"}
            </button>
          </div>
        </form>

        <section className="rounded-[1.5rem] border border-neutral-200 bg-white px-4 py-4 shadow-sm">
          <p className="text-sm font-medium text-neutral-900">
            Dokuntag ile örnek profil ve kullanım akışını inceleyin.
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
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