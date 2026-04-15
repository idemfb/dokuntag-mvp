"use client";

import { useEffect, useMemo, useState } from "react";

function getMainSiteUrl() {
  const value =
    process.env.NEXT_PUBLIC_MAIN_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://dokuntag.com";

  return value.replace(/\/+$/, "");
}

function EmptyState({
  title,
  text
}: {
  title: string;
  text: string;
}) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
      <div className="px-6 py-8">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
          Dokuntag
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
          {text}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="/recover"
            className="rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Recover sayfasına dön
          </a>

          <a
            href="/my"
            className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
          >
            Ürünlerim sayfasına git
          </a>
        </div>
      </div>
    </section>
  );
}

export default function RecoverSelectPage() {
const [token, setToken] = useState("");
const [code, setCode] = useState("");

useEffect(() => {
  const params = new URLSearchParams(window.location.search);

  setToken(params.get("token") || "");
  setCode(params.get("code")?.toUpperCase() || "");
}, []);

  const mainSiteUrl = getMainSiteUrl();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [managePath, setManagePath] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!token || !code) {
        if (!cancelled) {
          setError("Ürün seçimi için gerekli token veya ürün kodu bağlantıda bulunamadı.");
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError("");
        setMessage("");

        const res = await fetch("/api/recover/select", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            token,
            code
          })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Yönetim bağlantısı oluşturulamadı.");
        }

        if (!cancelled) {
          setManagePath(data.managePath || "");
          setMessage(
            data?.message ||
              "Yeni yönetim bağlantısı oluşturuldu. Eski bağlantı artık geçersiz sayılabilir."
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Bir hata oluştu."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [token, code]);

  if (!token || !code) {
    return (
      <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-900">
        <div className="mx-auto max-w-4xl space-y-6">
          <EmptyState
            title="Eksik bağlantı"
            text="Ürün seçimi için gerekli token veya ürün kodu bağlantıda bulunamadı."
          />
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-900">
        <div className="mx-auto max-w-4xl space-y-6">
          <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
            <div className="px-6 py-8">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                Dokuntag
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
                Yönetim bağlantısı hazırlanıyor
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
                Seçtiğiniz ürün için güvenli doğrulama yapılıyor.
              </p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-900">
        <div className="mx-auto max-w-4xl space-y-6">
          <EmptyState
            title="Yönetim bağlantısı oluşturulamadı"
            text={error}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-900">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-neutral-100/80 px-6 py-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <a
                href={mainSiteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-neutral-500 transition hover:text-neutral-900 hover:underline"
              >
                Dokuntag ana sayfa
              </a>

              <a
                href={`/p/${encodeURIComponent(code)}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-neutral-500 transition hover:text-neutral-900 hover:underline"
              >
                Public profili aç
              </a>
            </div>

            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-neutral-400">
              Dokuntag
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Yeni yönetim bağlantınız hazır
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
              Güvenli doğrulama tamamlandı. Seçtiğiniz ürün için yeni manage link oluşturuldu.
            </p>
          </div>

          <div className="px-6 py-6">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-800">
              {message}
            </div>

            <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm leading-6 text-neutral-700">
              Ürün kodu: <span className="font-medium text-neutral-900">{code}</span>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={managePath}
                className="rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Yönetim panelini aç
              </a>

              <a
                href="/my"
                className="rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
              >
                Ürünlerim sayfasına dön
              </a>
            </div>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-800">
              Bu doğrulama bağlantısı tek kullanımlıktır. Aynı işlem için yeniden mail isteyebilirsiniz.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}