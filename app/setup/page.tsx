"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function getMainSiteUrl() {
  const value =
    process.env.NEXT_PUBLIC_MAIN_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://dokuntag.com";

  return value.replace(/\/+$/, "");
}

function normalizeCode(value: string) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export default function SetupEntryPage() {
  const router = useRouter();
  const mainSiteUrl = getMainSiteUrl();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const normalizedCode = normalizeCode(code);

    if (!normalizedCode) {
      setError("Lütfen ürün kodunu yazın.");
      return;
    }

    router.push(`/t/${normalizedCode}`);
  }

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

        <section className="rounded-[1.5rem] border border-neutral-200 bg-[linear-gradient(180deg,#fafafa_0%,#ffffff_100%)] px-4 py-3.5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
            Dokuntag
          </p>

          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">
            Ürün kurulumu
          </h1>

          <p className="mt-2 text-sm leading-6 text-neutral-600">
            QR veya NFC etiketi okuttuğunuzda kurulum otomatik başlar. Kodu
            elle girmek isterseniz aşağıya yazabilirsiniz.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700">
              Akıllı yönlendirme
            </span>
            <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700">
              /t/kod
            </span>
          </div>
        </section>

        <section className="rounded-[1.35rem] border border-blue-200 bg-blue-50 px-3 py-4">
          <p className="text-sm font-medium text-blue-950">
            Bu sayfa kodla kurulum içindir
          </p>
          <p className="mt-1.5 text-xs leading-5 text-blue-900">
            Ürün kayıtlı değilse hızlı kurulum açılır. Kayıtlıysa herkese açık
            profile yönlendirilir.
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

            <input
              value={code}
              onChange={(e) => {
                setCode(normalizeCode(e.target.value));
                setError("");
              }}
              placeholder="Ürün kodu"
              className="w-full rounded-2xl border border-neutral-300 bg-white px-3 py-2.5 text-sm uppercase outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
            />

            <button
              type="submit"
              className="w-full rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Devam et
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}