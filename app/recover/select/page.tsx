"use client";

import { useEffect, useState } from "react";

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
            href="/my"
            className="rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Ürünlerim girişine dön
          </a>

          <a
            href="/"
            className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
          >
            Ana sayfaya git
          </a>
        </div>
      </div>
    </section>
  );
}

export default function RecoverSelectPage() {
  const [token, setToken] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") || "");
    setCode(params.get("code")?.toUpperCase() || "");
  }, []);

  useEffect(() => {
    let cancelled = false;
    let redirectTimer: number | undefined;

    async function run() {
      if (!token || !code) {
        if (!cancelled) {
          setError("Bağlantıda gerekli ürün bilgisi bulunamadı.");
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
          throw new Error(data?.error || "Ürün erişimi hazırlanamadı.");
        }

        const nextManagePath = String(data.managePath || "").trim();

        if (!nextManagePath) {
          throw new Error("Düzenleme bağlantısı oluşturulamadı.");
        }

        if (!cancelled) {
          setMessage("Düzenleme sayfanız açılıyor.");
          setLoading(false);

          redirectTimer = window.setTimeout(() => {
          const nextUrl = new URL(nextManagePath, window.location.origin);
          nextUrl.searchParams.set("myToken", token);
          window.location.replace(nextUrl.toString());
        }, 450);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Bir hata oluştu.");
          setLoading(false);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
      if (redirectTimer) {
        window.clearTimeout(redirectTimer);
      }
    };
  }, [token, code]);

  if (!token || !code) {
    return (
      <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-900">
        <div className="mx-auto max-w-3xl space-y-6">
          <EmptyState
            title="Eksik bağlantı"
            text="Ürün seçimi için gerekli bilgi bağlantıda bulunamadı."
          />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-900">
        <div className="mx-auto max-w-3xl space-y-6">
          <EmptyState title="Erişim hazırlanamadı" text={error} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-900">
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
          <div className="px-6 py-8">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Dokuntag
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
              {loading ? "Hazırlanıyor" : "Yönlendiriliyorsunuz"}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
              {loading
                ? "Seçtiğiniz ürün için güvenli erişim hazırlanıyor."
                : "Düzenleme sayfanız açılıyor."}
            </p>

            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-800">
              {message || "Lütfen bekleyin..."}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}