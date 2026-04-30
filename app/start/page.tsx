"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function normalizeCode(value: string) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);
}

export default function StartPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const isValid = useMemo(() => code.length >= 3 && code.length <= 10, [code]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid) return;
router.push(`/t/${code}?from=start`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f3ea] px-5 py-10 text-neutral-950">
      <section className="w-full max-w-md rounded-[2rem] border border-black/10 bg-white px-6 py-8 shadow-sm sm:px-8">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.24em] text-neutral-500">
          dokuntag®
        </p>

        <h1 className="mt-5 text-center text-4xl font-semibold tracking-tight">
          Dokun veya okut
        </h1>

        <p className="mt-3 text-center text-sm text-neutral-500">
          Uygulama gerekmez
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            value={code}
            onChange={(event) => setCode(normalizeCode(event.target.value))}
            placeholder="Ürün kodunu gir"
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            className="h-14 w-full rounded-2xl border border-neutral-200 bg-[#faf8f3] px-5 text-center text-xl font-semibold tracking-[0.22em] text-neutral-950 outline-none transition focus:border-neutral-950 focus:bg-white"
          />

          <button
            type="submit"
            disabled={!isValid}
            className="h-14 w-full rounded-2xl bg-neutral-950 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Devam et
          </button>
        </form>

        <p className="mt-5 text-center text-xs leading-5 text-neutral-500">
          Kodu etiketteki QR altında bulabilirsiniz.
        </p>
      </section>
    </main>
  );
}