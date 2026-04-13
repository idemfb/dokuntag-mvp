"use client";

import { useMemo, useState } from "react";

type RecoverResponse = {
  success: boolean;
  code: string;
  manageLink: string;
  message?: string;
  warning?: string;
};

type FoundItem = {
  code: string;
  petName?: string;
  status?: string;
  productType?: "pet" | "item" | "key" | "person";
};

function getIcon(productType?: FoundItem["productType"]) {
  if (productType === "pet") return "🐶";
  if (productType === "key") return "🔑";
  if (productType === "person") return "🧍";
  if (productType === "item") return "🎒";
  return "🏷️";
}

function getTypeLabel(productType?: FoundItem["productType"]) {
  if (productType === "pet") return "Evcil hayvan";
  if (productType === "key") return "Anahtar";
  if (productType === "person") return "Birey";
  if (productType === "item") return "Ürün";
  return "Etiket";
}

function getStatusLabel(status?: string) {
  if (status === "active") return "Aktif";
  if (status === "unclaimed") return "Kurulum bekliyor";
  return "Bilinmiyor";
}

function getStatusClass(status?: string) {
  if (status === "active") return "text-green-700 bg-green-50 border-green-200";
  if (status === "unclaimed") return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-neutral-600 bg-neutral-50 border-neutral-200";
}

function normalizePhoneInput(value: string) {
  return value.replace(/[^0-9]/g, "");
}

function getMainSiteUrl() {
  const value =
    process.env.NEXT_PUBLIC_MAIN_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://dokuntag.com";

  return value.replace(/\/+$/, "");
}

function GuideStep({
  step,
  title,
  text
}: {
  step: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="inline-flex rounded-full border border-neutral-300 bg-neutral-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
        {step}
      </div>
      <h3 className="mt-3 text-sm font-semibold text-neutral-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-neutral-600">{text}</p>
    </div>
  );
}

export default function RecoverPage() {
  const mainSiteUrl = getMainSiteUrl();

  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [finding, setFinding] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState<RecoverResponse | null>(null);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);

  const hasContactInfo = useMemo(() => {
    return Boolean(phone.trim() || email.trim());
  }, [phone, email]);

  const canRecoverSingle = useMemo(() => {
    return Boolean(code.trim() && hasContactInfo);
  }, [code, hasContactInfo]);

  async function copyManageLink() {
    if (!successData?.manageLink) return;
    await navigator.clipboard.writeText(successData.manageLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccessData(null);

      const res = await fetch("/api/recover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          phone: phone.trim(),
          email: email.trim().toLowerCase()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "İşlem tamamlanamadı.");

      setSuccessData(data);
      setCopied(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  async function findMyProducts() {
    try {
      setFinding(true);
      setError("");
      setFoundItems([]);
      setSuccessData(null);

      const res = await fetch("/api/recover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          mode: "list"
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ürünler bulunamadı.");

      setFoundItems(data.items || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setFinding(false);
    }
  }

  async function generateManage(selectedCode: string) {
    try {
      setError("");
      setSuccessData(null);

      const res = await fetch("/api/recover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code: selectedCode.trim().toUpperCase(),
          email: email.trim().toLowerCase(),
          phone: phone.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Yönetim bağlantısı oluşturulamadı.");

      setSuccessData(data);
      setCopied(false);

      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    }
  }

  function clearForm() {
    setCode("");
    setPhone("");
    setEmail("");
    setError("");
    setSuccessData(null);
    setFoundItems([]);
    setCopied(false);
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-900">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-neutral-100/80 px-6 py-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <a
                href="/my"
                className="text-sm text-neutral-500 transition hover:text-neutral-900 hover:underline"
              >
                ← Ürünlerime git
              </a>

              <a
                href={mainSiteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-neutral-500 transition hover:text-neutral-900 hover:underline"
              >
                Dokuntag ana sayfa
              </a>
            </div>

            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-neutral-400">
              Dokuntag
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Yönetim bağlantısı kurtarma
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
              Telefon veya email doğrulaması ile ürünlerinizi bulabilir, ilgili ürün için yeni bir yönetim bağlantısı oluşturabilirsiniz.
            </p>
          </div>

          <div className="px-6 py-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <GuideStep
                step="1. Adım"
                title="Telefon veya e-postanızı girin"
                text="Kayıt sırasında kullandığınız iletişim bilgisini yazın."
              />
              <GuideStep
                step="2. Adım"
                title="Ürünü bulun veya kodu yazın"
                text="Kod biliyorsanız tek ürün seçin, bilmiyorsanız ürünlerinizi listeleyin."
              />
              <GuideStep
                step="3. Adım"
                title="Yeni yönetim bağlantısını alın"
                text="Eski bağlantı kapanır, yeni bağlantıyı güvenli şekilde saklayın."
              />
            </div>

            <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm leading-6 text-neutral-700">
              Burada iki yol var: Kod biliyorsanız tek ürün için hızlıca yeni bağlantı oluşturabilirsiniz. Kod bilmiyorsanız telefon veya e-posta ile tüm ürünlerinizi listeleyebilirsiniz.
            </div>

            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-xs leading-5 text-amber-800">
              Güvenlik için eski yönetim bağlantısı geçersiz olur ve yeni bir bağlantı oluşturulur. Yeni bağlantıyı güvenli şekilde saklayın.
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <section className="rounded-[1.5rem] border border-neutral-200 bg-white p-5">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    Tek ürün için yeni bağlantı oluştur
                  </p>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">
                    Ürün kodunu biliyorsanız bu alan daha hızlıdır.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-800">
                      Kod
                    </label>
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="Örn: DT001"
                      className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                    />
                    <p className="mt-2 text-xs text-neutral-500">
                      Bu alanda ürün kodu zorunludur.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !canRecoverSingle}
                    className="w-full rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
                  >
                    {loading ? "Kontrol ediliyor..." : "Bu ürün için bağlantı oluştur"}
                  </button>
                </form>
              </section>

              <section className="rounded-[1.5rem] border border-neutral-200 bg-white p-5">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    Tüm ürünlerimi bul
                  </p>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">
                    Kod bilmiyorsanız telefon veya email ile tüm ürünlerinizi listeleyin.
                  </p>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-neutral-800">
                        Telefon
                      </label>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(normalizePhoneInput(e.target.value))}
                        placeholder="05XXXXXXXXX"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-neutral-800">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ornek@email.com"
                        className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-neutral-500">
                    Telefon veya email alanlarından en az biri gereklidir.
                  </p>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={findMyProducts}
                      disabled={finding || !hasContactInfo}
                      className="flex-1 rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50 disabled:opacity-60"
                    >
                      {finding ? "Aranıyor..." : "Ürünlerimi listele"}
                    </button>

                    <button
                      type="button"
                      onClick={clearForm}
                      className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
                    >
                      Temizle
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        ) : null}

        {successData ? (
          <section className="rounded-[2rem] border border-green-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.16em] text-green-600">
                Doğrulama başarılı
              </p>
              <h2 className="mt-2 text-lg font-semibold text-neutral-900">
                Yeni yönetim bağlantısı oluşturuldu
              </h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                {successData.message ||
                  "Eski yönetim bağlantısı geçersiz hale getirildi ve yeni bir bağlantı oluşturuldu."}
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-sm font-medium text-neutral-900">Yönetim bağlantısı</p>
              <p className="mt-2 break-all text-sm text-neutral-700">
                {successData.manageLink}
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
              {successData.warning ||
                "Bu size özel yönetim bağlantısıdır. Lütfen güvenli şekilde saklayın ve başkalarıyla paylaşmayın."}
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => void copyManageLink()}
                className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
              >
                {copied ? "Kopyalandı" : "Bağlantıyı kopyala"}
              </button>

              <a
                href={successData.manageLink}
                className="rounded-2xl bg-black px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Yönetim sayfasına git
              </a>
            </div>
          </section>
        ) : null}

        {foundItems.length > 0 ? (
          <section className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
                Bulunan ürünler
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                İstediğiniz ürün için yeni bir yönetim bağlantısı oluşturabilirsiniz.
              </p>
            </div>

            <div className="space-y-3">
              {foundItems.map((item) => (
                <div
                  key={item.code}
                  className="flex flex-col gap-4 rounded-[1.5rem] border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 text-xl">
                      {getIcon(item.productType)}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-medium tracking-wide text-neutral-400">
                          {item.code}
                        </p>
                        <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-medium text-neutral-600">
                          {getTypeLabel(item.productType)}
                        </span>
                      </div>

                      <p className="mt-1 text-base font-semibold text-neutral-900">
                        {item.petName || "İsimsiz ürün"}
                      </p>

                      <div className="mt-2">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(item.status)}`}
                        >
                          {getStatusLabel(item.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => void generateManage(item.code)}
                    className="rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    Bu ürün için bağlantı oluştur
                  </button>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}