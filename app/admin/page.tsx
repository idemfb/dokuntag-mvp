"use client";

import { useEffect, useRef, useState } from "react";

type Stats = {
  total: number;
  production_hold: number;
  unclaimed: number;
  active: number;
  inactive: number;
  void: number;
  registered: number;
  test: number;
};

const emptyStats: Stats = {
  total: 0,
  production_hold: 0,
  unclaimed: 0,
  active: 0,
  inactive: 0,
  void: 0,
  registered: 0,
  test: 0
};

export default function AdminPage() {
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [manualLoading, setManualLoading] = useState(false);
  const [error, setError] = useState("");
  const requestIdRef = useRef(0);

  async function fetchStats(showLoading = false) {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    try {
      if (showLoading) setManualLoading(true);
      setError("");

      const res = await fetch(`/api/admin/stats?t=${Date.now()}`, {
        cache: "no-store"
      });

      const data = await res.json();

      if (requestId !== requestIdRef.current) return;

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "İstatistikler alınamadı.");
      }

      const nextStats = { ...emptyStats, ...data.counts };
      setStats(nextStats);

      try {
        window.sessionStorage.setItem("dokuntag_admin_stats", JSON.stringify(nextStats));
      } catch {}
    } catch (err) {
      if (requestId !== requestIdRef.current) return;

      setError(err instanceof Error ? err.message : "İstatistikler alınamadı.");
    } finally {
      if (requestId === requestIdRef.current) {
        setManualLoading(false);
      }
    }
  }

  useEffect(() => {
    try {
      const cached = window.sessionStorage.getItem("dokuntag_admin_stats");
      if (cached) {
        setStats({ ...emptyStats, ...JSON.parse(cached) });
      }
    } catch {}

    fetchStats(false);

    function handlePageShow() {
      fetchStats(false);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        fetchStats(false);
      }
    }

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const cards = [
    {
      label: "Toplam ürün",
      value: stats.total,
      href: "/admin/products",
      className: "border-neutral-200 bg-white text-neutral-900"
    },
    {
      label: "Kontrol bekliyor",
      value: stats.production_hold,
      href: "/admin/products?status=production_hold",
      className: "border-amber-200 bg-amber-50 text-amber-800"
    },
    {
      label: "Satışa hazır",
      value: stats.unclaimed,
      href: "/admin/products?status=unclaimed",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700"
    },
    {
      label: "Aktif / kayıtlı",
      value: stats.active,
      href: "/admin/products?status=active",
      className: "border-green-300 bg-green-100 text-green-800"
    },
    {
      label: "Pasif",
      value: stats.inactive,
      href: "/admin/products?status=inactive",
      className: "border-neutral-300 bg-neutral-100 text-neutral-600"
    },
    {
      label: "Hatalı / iptal",
      value: stats.void,
      href: "/admin/products?status=void",
      className: "border-red-200 bg-red-50 text-red-700"
    },
    {
      label: "Test kodu",
      value: stats.test,
      href: "/admin/products?test=1",
      className: "border-blue-200 bg-blue-50 text-blue-800"
    }
  ];

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 text-neutral-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                Dokuntag
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Admin Panel
              </h1>
              <p className="mt-2 text-sm text-neutral-600">
                Üretim, kontrol ve ürün durumlarını tek yerden takip edin.
              </p>
            </div>
                        <a
              href="/admin/orders"
              className="rounded-2xl border border-neutral-300 bg-white px-5 py-4 text-center text-sm font-semibold transition hover:bg-neutral-50"
            >
              Siparişe kod bağla
            </a>
            <button
              type="button"
              onClick={() => fetchStats(true)}
              className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-neutral-50"
            >
              {manualLoading ? "Yenileniyor..." : "Yenile"}
            </button>

          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <a
              key={card.label}
              href={card.href}
              className={`rounded-2xl border p-5 shadow-sm transition hover:scale-[1.01] ${card.className}`}
            >
              <p className="text-xs font-medium">{card.label}</p>
              <p className="mt-2 text-3xl font-semibold">{card.value}</p>
            </a>
          ))}
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <a
            href="/admin/batch"
            className="rounded-2xl bg-black px-5 py-4 text-center text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Üretim / Batch ekranına git
          </a>

          <a
            href="/admin/check"
            className="rounded-2xl border border-neutral-300 bg-white px-5 py-4 text-center text-sm font-semibold transition hover:bg-neutral-50"
          >
            Ürün kontrol ekranına git
          </a>
        </section>
      </div>
    </main>
  );
}