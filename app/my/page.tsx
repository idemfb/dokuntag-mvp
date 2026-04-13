"use client";

import { useMemo, useState } from "react";

type Item = {
  code: string;
  petName?: string;
  status?: string;
  productType?: "pet" | "item" | "key" | "person";
};

function getIcon(productType?: Item["productType"]) {
  if (productType === "pet") return "🐶";
  if (productType === "key") return "🔑";
  if (productType === "person") return "🧍";
  if (productType === "item") return "🎒";
  return "🏷️";
}

function getTypeLabel(productType?: Item["productType"]) {
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

function normalizeEmailInput(value: string) {
  return value.trim().toLowerCase();
}

function detectInput(input: string) {
  const trimmed = input.trim();

  if (trimmed.includes("@")) {
    return {
      email: normalizeEmailInput(trimmed),
      phone: "",
      inputType: "email" as const
    };
  }

  return {
    email: "",
    phone: normalizePhoneInput(trimmed),
    inputType: "phone" as const
  };
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

export default function MyPage() {
  const [value, setValue] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const activeCount = useMemo(() => {
    return items.filter((item) => item.status === "active").length;
  }, [items]);

  const pendingCount = useMemo(() => {
    return items.filter((item) => item.status === "unclaimed").length;
  }, [items]);

  const petCount = useMemo(() => {
    return items.filter((item) => item.productType === "pet").length;
  }, [items]);

  const searchMeta = useMemo(() => {
    return detectInput(value);
  }, [value]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setItems([]);
      setSearched(true);

      const { email, phone } = detectInput(value);

      if (!email && !phone) {
        throw new Error("Email veya telefon girin.");
      }

      const res = await fetch("/api/recover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          phone,
          mode: "list"
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ürünler bulunamadı.");
      }

      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  async function openManagementPage(code: string) {
    try {
      setError("");

      const { email, phone } = detectInput(value);

      const res = await fetch("/api/recover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code,
          email,
          phone
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Yönetim bağlantısı oluşturulamadı.");
      }

      if (data.manageLink) {
        window.location.href = data.manageLink;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    }
  }

  function clearSearch() {
    setValue("");
    setItems([]);
    setError("");
    setSearched(false);
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-900">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-neutral-100/80 px-6 py-7">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Dokuntag
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Ürünlerim
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
              Email veya telefon ile ürünlerinize hızlıca ulaşabilir, ilgili ürünü seçip yönetim sayfasına geçebilirsiniz.
            </p>
          </div>

          <div className="px-6 py-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <GuideStep
                step="1. Adım"
                title="Telefon veya e-postanızı yazın"
                text="Kayıt sırasında kullandığınız bilgi ile ürünlerinizi bulun."
              />
              <GuideStep
                step="2. Adım"
                title="Ürünlerinizi listeleyin"
                text="Aynı iletişim bilgisiyle eklenmiş tüm ürünler burada görünür."
              />
              <GuideStep
                step="3. Adım"
                title="Yönetim sayfasına geçin"
                text="İlgili ürünü seçerek düzenleme sayfasını açabilirsiniz."
              />
            </div>

            <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm leading-6 text-neutral-700">
              Bu alan ürünlerinizi bulmak ve hızlıca yönetim sayfasına geçmek içindir. Yeni ürün eklemek için setup, erişim kaybettiyseniz recover kullanılabilir.
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Email veya telefon"
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                />
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-neutral-500">
                    Aynı email veya telefon ile kayıtlı ürünler listelenir.
                  </p>

                  {value.trim() ? (
                    <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-medium text-neutral-600">
                      {searchMeta.inputType === "email" ? "Email ile arama" : "Telefon ile arama"}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-2xl bg-neutral-900 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
                >
                  {loading ? "Aranıyor..." : "Ürünlerimi getir"}
                </button>

                <button
                  type="button"
                  onClick={clearSearch}
                  disabled={loading && !value}
                  className="rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50 disabled:opacity-60"
                >
                  Temizle
                </button>
              </div>
            </form>
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 shadow-sm">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 text-sm text-neutral-500 shadow-sm">
            Ürünler aranıyor...
          </div>
        ) : null}

        {!loading && searched && items.length === 0 && !error ? (
          <div className="rounded-[2rem] border border-dashed border-neutral-200 bg-white p-8 text-center shadow-sm">
            <p className="text-base font-medium text-neutral-800">
              Eşleşen ürün bulunamadı
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              Girdiğiniz email veya telefon ile kayıtlı bir ürün bulunamadı. Bilgiyi kontrol edip tekrar deneyin.
            </p>
          </div>
        ) : null}

        {!loading && items.length > 0 ? (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <p className="text-xs text-neutral-400">Toplam ürün</p>
                <p className="mt-2 text-2xl font-semibold text-neutral-900">
                  {items.length}
                </p>
              </div>

              <div className="rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm">
                <p className="text-xs text-green-600">Aktif</p>
                <p className="mt-2 text-2xl font-semibold text-green-900">
                  {activeCount}
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                <p className="text-xs text-amber-600">Kurulum bekliyor</p>
                <p className="mt-2 text-2xl font-semibold text-amber-900">
                  {pendingCount}
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-semibold tracking-tight text-neutral-900">
                    Bulunan ürünler
                  </p>
                  <p className="mt-1 text-sm text-neutral-600">
                    İlgili ürünü seçerek doğrudan yönetim sayfasına geçebilirsiniz.
                  </p>
                </div>

                <div className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">
                  {petCount > 0 ? `${petCount} evcil hayvan etiketi dahil` : "Ürünler listelendi"}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.code}
                  className="rounded-[2rem] border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 text-2xl">
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

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(item.status)}`}
                          >
                            {getStatusLabel(item.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="sm:shrink-0">
                      <button
                        type="button"
                        onClick={() => void openManagementPage(item.code)}
                        className="w-full rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 sm:w-auto"
                      >
                        Yönetim sayfasına git
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}