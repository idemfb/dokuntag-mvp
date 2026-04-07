"use client";

import { useEffect, useMemo, useState } from "react";

const ALERT_OPTIONS = [
  "Acil bana ulaşın",
  "Hayvanım hasta",
  "Alerjisi var",
  "Ürkek / yaklaşmayın",
  "Ödül verilecektir"
];

type ProductType = "pet" | "item" | "key" | "person";

type ManageResponse = {
  code: string;
  productType?: ProductType;
  profile: {
    name: string;
    phone: string;
    email: string;
    petName: string;
    note: string;
  };
  alerts: string[];
  visibility: {
    showName: boolean;
    showPhone: boolean;
    showEmail: boolean;
    showPetName: boolean;
    showNote: boolean;
  };
  contactOptions: {
    allowDirectCall: boolean;
    allowDirectWhatsapp: boolean;
  };
  recovery: {
    phone: string;
    email: string;
  };
  managePath: string;
  manageLink: string;
};

type ManageSubmitResponse = {
  success: boolean;
  code: string;
  message: string;
  publicLink: string;
  managePath: string;
  manageLink: string;
  warning?: string;
};

export default function ManagePage({
  params
}: {
  params: Promise<{ code: string }>;
}) {
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [manageLink, setManageLink] = useState("");
  const [warning, setWarning] = useState(
    "Bu size özel yönetim linkidir. Profil bilgilerinizi güncellemek için kullanılır. Lütfen güvenli şekilde saklayın ve başkalarıyla paylaşmayın."
  );

  const [productType, setProductType] = useState<ProductType>("item");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [petName, setPetName] = useState("");
  const [note, setNote] = useState("");
  const [alerts, setAlerts] = useState<string[]>([]);
  const [showName, setShowName] = useState(true);
  const [showPhone, setShowPhone] = useState(true);
  const [showEmail, setShowEmail] = useState(true);
  const [showPetName, setShowPetName] = useState(true);
  const [showNote, setShowNote] = useState(true);
  const [allowDirectCall, setAllowDirectCall] = useState(false);
  const [allowDirectWhatsapp, setAllowDirectWhatsapp] = useState(false);
  const [recoveryPhone, setRecoveryPhone] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedPublic, setCopiedPublic] = useState(false);

  useEffect(() => {
    params.then((resolved) => setCode(resolved.code));
  }, [params]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    setToken(url.searchParams.get("token") || "");
  }, []);

  useEffect(() => {
    if (!code) return;

    if (!token) {
      setLoading(false);
      setError("Manage token eksik.");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const res = await fetch(
          `/api/manage/${code}?token=${encodeURIComponent(token)}`,
          {
            cache: "no-store"
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Manage verisi alınamadı.");
        }

        const manageData = data as ManageResponse;

        setProductType(manageData.productType || "item");
        setName(manageData.profile.name || "");
        setPhone(manageData.profile.phone || "");
        setEmail(manageData.profile.email || "");
        setPetName(manageData.profile.petName || "");
        setNote(manageData.profile.note || "");
        setAlerts(Array.isArray(manageData.alerts) ? manageData.alerts : []);
        setShowName(Boolean(manageData.visibility?.showName));
        setShowPhone(Boolean(manageData.visibility?.showPhone));
        setShowEmail(Boolean(manageData.visibility?.showEmail));
        setShowPetName(Boolean(manageData.visibility?.showPetName));
        setShowNote(Boolean(manageData.visibility?.showNote));
        setAllowDirectCall(Boolean(manageData.contactOptions?.allowDirectCall));
        setAllowDirectWhatsapp(Boolean(manageData.contactOptions?.allowDirectWhatsapp));
        setRecoveryPhone(manageData.recovery?.phone || "");
        setRecoveryEmail(manageData.recovery?.email || "");
        setManageLink(manageData.manageLink || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [code, token]);

  const publicProfileLink = useMemo(() => {
    if (!code) return "";
    if (typeof window === "undefined") return `/p/${code}`;
    return `${window.location.origin}/p/${code}`;
  }, [code]);

  const saveToLinksHref = useMemo(() => {
    if (!code || !manageLink || !publicProfileLink) return "";

    const searchParams = new URLSearchParams({
      code,
      manage: manageLink,
      public: publicProfileLink
    });

    return `/links?${searchParams.toString()}`;
  }, [code, manageLink, publicProfileLink]);

  function toggleAlert(value: string) {
    setAlerts((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  }

  async function copyManageLink() {
    if (!manageLink) return;
    await navigator.clipboard.writeText(manageLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function copyPublicLink() {
    if (!publicProfileLink) return;
    await navigator.clipboard.writeText(publicProfileLink);
    setCopiedPublic(true);
    setTimeout(() => setCopiedPublic(false), 1500);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");
      setCopied(false);

      const res = await fetch(
        `/api/manage/${code}?token=${encodeURIComponent(token)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            productType,
            name,
            phone,
            email,
            petName,
            note,
            alerts,
            visibility: {
              showName,
              showPhone,
              showEmail,
              showPetName,
              showNote
            },
            contactOptions: {
              allowDirectCall,
              allowDirectWhatsapp
            },
            recovery: {
              phone: recoveryPhone,
              email: recoveryEmail
            }
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Güncelleme başarısız.");
      }

      const submitData = data as ManageSubmitResponse;
      setSuccess(submitData.message || "Profil güncellendi.");
      setManageLink(submitData.manageLink || "");
      if (submitData.warning) {
        setWarning(submitData.warning);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white px-4 py-10 text-neutral-900">
        <div className="mx-auto max-w-2xl">
          <p>Yükleniyor...</p>
        </div>
      </main>
    );
  }

  if (error && (error.includes("Geçersiz") || error.includes("eksik"))) {
    return (
      <main className="min-h-screen bg-white px-4 py-10 text-neutral-900">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
              Dokuntag Manage
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Profil yönetimi</h1>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm text-red-700">{error}</p>

            <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
              Manage linkinizi kaybettiyseniz{" "}
              <a href="/recover" className="font-medium underline">
                recovery sayfasından yeni link oluşturabilirsiniz
              </a>
              .
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-neutral-900">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <a
            href="/my"
            className="text-sm text-neutral-500 hover:underline"
          >
            ← Ürünlerim
          </a>

          <p className="mt-3 text-sm uppercase tracking-[0.2em] text-neutral-500">
            Dokuntag Manage
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Profil yönetimi</h1>
          <p className="mt-2 text-sm text-neutral-600">Kod: {code}</p>
        </div>

        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {warning}
        </div>

        <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5 space-y-5">
          <div>
            <p className="text-sm font-medium text-neutral-900">Public link</p>

            <div className="mt-2 flex gap-2">
              <input
                value={publicProfileLink}
                readOnly
                className="flex-1 rounded-xl border border-neutral-300 px-3 py-2 text-sm"
              />

              <button
                type="button"
                onClick={() => void copyPublicLink()}
                className="rounded-xl border border-neutral-300 px-4 py-2 text-sm"
              >
                {copiedPublic ? "Kopyalandı" : "Kopyala"}
              </button>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-neutral-900">Yönetim linki</p>

            <div className="mt-2 flex gap-2">
              <input
                value={manageLink}
                readOnly
                className="flex-1 rounded-xl border border-neutral-300 px-3 py-2 text-sm"
              />

              <button
                type="button"
                onClick={() => void copyManageLink()}
                className="rounded-xl border border-neutral-300 px-4 py-2 text-sm"
              >
                {copied ? "Kopyalandı" : "Kopyala"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={publicProfileLink}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white"
            >
              Profili Gör
            </a>

            <button
              type="button"
              onClick={() =>
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(publicProfileLink)}`,
                  "_blank"
                )
              }
              className="rounded-xl border border-neutral-300 px-4 py-2 text-sm"
            >
              WhatsApp ile paylaş
            </button>

            <a
              href={saveToLinksHref}
              className="rounded-xl border border-neutral-300 px-4 py-2 text-sm"
            >
              Ürünlerime ekle
            </a>
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="rounded-2xl border border-neutral-200 p-5">
            <h2 className="text-lg font-semibold">Ürün tipi</h2>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <button
                type="button"
                onClick={() => setProductType("pet")}
                className={`rounded-xl border px-4 py-4 text-sm ${
                  productType === "pet"
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 bg-white text-neutral-900"
                }`}
              >
                🐶 Evcil hayvan
              </button>

              <button
                type="button"
                onClick={() => setProductType("item")}
                className={`rounded-xl border px-4 py-4 text-sm ${
                  productType === "item"
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 bg-white text-neutral-900"
                }`}
              >
                🎒 Ürün
              </button>

              <button
                type="button"
                onClick={() => setProductType("key")}
                className={`rounded-xl border px-4 py-4 text-sm ${
                  productType === "key"
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 bg-white text-neutral-900"
                }`}
              >
                🔑 Anahtar
              </button>

              <button
                type="button"
                onClick={() => setProductType("person")}
                className={`rounded-xl border px-4 py-4 text-sm ${
                  productType === "person"
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 bg-white text-neutral-900"
                }`}
              >
                🧍 Birey
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 p-5">
            <h2 className="text-lg font-semibold">Temel bilgiler</h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  İsim / Etiket adı
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Telefon</label>
                <input
                  value={phone}
                  onChange={(e) => {
                    const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
                    setPhone(onlyNumbers);
                  }}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Evcil hayvan adı / ürün adı
                </label>
                <input
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Not</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="min-h-[120px] w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 p-5">
            <h2 className="text-lg font-semibold">Hızlı iletişim izinleri</h2>
            <p className="mt-2 text-sm text-neutral-600">
              İsterseniz public sayfada tek tık arama ve WhatsApp butonları görünebilir.
            </p>

            <div className="mt-5 space-y-3">
              <label className="flex items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allowDirectCall}
                  onChange={(e) => setAllowDirectCall(e.target.checked)}
                />
                <span className="text-sm">Tek tık aramaya izin ver</span>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allowDirectWhatsapp}
                  onChange={(e) => setAllowDirectWhatsapp(e.target.checked)}
                />
                <span className="text-sm">Tek tık WhatsApp’a izin ver</span>
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 p-5">
            <h2 className="text-lg font-semibold">Uyarılar</h2>

            <div className="mt-5 space-y-3">
              {ALERT_OPTIONS.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3"
                >
                  <input
                    type="checkbox"
                    checked={alerts.includes(item)}
                    onChange={() => toggleAlert(item)}
                  />
                  <span className="text-sm">{item}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 p-5">
            <h2 className="text-lg font-semibold">Public profilde göster</h2>

            <div className="mt-5 space-y-3">
              <label className="flex items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3">
                <input
                  type="checkbox"
                  checked={showName}
                  onChange={(e) => setShowName(e.target.checked)}
                />
                <span className="text-sm">İsim göster</span>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3">
                <input
                  type="checkbox"
                  checked={showPhone}
                  onChange={(e) => setShowPhone(e.target.checked)}
                />
                <span className="text-sm">Telefon göster</span>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3">
                <input
                  type="checkbox"
                  checked={showEmail}
                  onChange={(e) => setShowEmail(e.target.checked)}
                />
                <span className="text-sm">Email göster</span>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3">
                <input
                  type="checkbox"
                  checked={showPetName}
                  onChange={(e) => setShowPetName(e.target.checked)}
                />
                <span className="text-sm">Evcil hayvan / ürün adı göster</span>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3">
                <input
                  type="checkbox"
                  checked={showNote}
                  onChange={(e) => setShowNote(e.target.checked)}
                />
                <span className="text-sm">Not göster</span>
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 p-5">
            <h2 className="text-lg font-semibold">Recovery bilgileri</h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Recovery telefon
                </label>
                <input
                  value={recoveryPhone}
                  onChange={(e) => setRecoveryPhone(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Recovery e-posta
                </label>
                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none"
                />
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-neutral-900 px-5 py-4 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Kaydediliyor..." : "Değişiklikleri kaydet"}
          </button>
        </form>
      </div>
    </main>
  );
}