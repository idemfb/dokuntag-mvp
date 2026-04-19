"use client";

import { useState } from "react";

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

export default function MyPage() {
  const mainSiteUrl = getMainSiteUrl();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await fetch("/api/recover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          entryType: "my"
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "İşlem başarısız oldu.");
      }

      setSuccess(
        data?.message ||
          "Bu e-posta sistemde kayıtlıysa, güvenli giriş bağlantısı gönderildi."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-900">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-neutral-100/80 px-6 py-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-neutral-500">Ürün yönetimi</div>

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
              Ürünlerim
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
              Kurtarma e-posta adresinizi girin. Mailinize gönderilen güvenli bağlantı ile ürünlerinizi belirli bir süre boyunca görüntüleyip yönetebilirsiniz.
            </p>
          </div>

          <div className="px-6 py-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <GuideStep
                step="1. Adım"
                title="Recovery e-postanızı girin"
                text="Ürünlerinize bağlı kurtarma e-posta adresinizi yazın."
              />
              <GuideStep
                step="2. Adım"
                title="Maildeki linki açın"
                text="Sisteme uygunsa tek kullanımlık ve süreli güvenli giriş bağlantısı gönderilir."
              />
              <GuideStep
                step="3. Adım"
                title="Ürünlerinizi görün"
                text="Doğrulamadan sonra bu e-postaya bağlı tüm ürünler tek ekranda listelenir."
              />
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm leading-6 text-red-800">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-800">
                {success}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-5 max-w-xl space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-900">
                  Recovery e-postası
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                  placeholder="ornek@mail.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Gönderiliyor..." : "Güvenli giriş bağlantısı gönder"}
              </button>
            </form>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-800">
              Güvenlik nedeniyle ürünler artık yalnızca doğrulanmış e-posta bağlantısı ile görüntülenebilir.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}