"use client";

export const dynamic = "force-dynamic";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function getNextPath(searchParams: URLSearchParams) {
  const next = searchParams.get("next")?.trim() || "/admin/batch";

  if (!next.startsWith("/")) {
    return "/admin/batch";
  }

  if (next.startsWith("//")) {
    return "/admin/batch";
  }

  return next;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ key })
      });

      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Giriş başarısız.");
      }

      router.replace(getNextPath(searchParams));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-8 text-neutral-900 sm:px-5 sm:py-10">
      <div className="mx-auto max-w-md">
        <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-neutral-100/80 px-6 py-7">
            <p className="text-sm uppercase tracking-[0.24em] text-neutral-500">
              Dokuntag
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Admin girişi
            </h1>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Sadece yetkili kullanıcılar admin alanına erişebilir.
            </p>
          </div>

          <div className="px-6 py-6">
            {error ? (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-900">
                  Erişim anahtarı
                </label>
                <input
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                  placeholder="Admin erişim anahtarı"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-neutral-800 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Giriş yapılıyor..." : "Giriş yap"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}