"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function AdminProductsContent() {
  const params = useSearchParams();

  const status = params.get("status") || "";
  const test = params.get("test") === "1";

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchItems() {
    try {
      setLoading(true);

      const query = new URLSearchParams();

      if (status) query.set("status", status);
      if (test) query.set("test", "1");

      const res = await fetch(`/api/admin/products?${query.toString()}`, {
        cache: "no-store"
      });

      const data = await res.json();

      if (!res.ok) throw new Error();

      setItems(data.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
  }, [status, test]);

  function getStatusLabel(s: string) {
    switch (s) {
      case "production_hold":
        return "Kontrol bekliyor";
      case "unclaimed":
        return "Satışa hazır";
      case "active":
        return "Aktif";
      case "inactive":
        return "Pasif";
      case "void":
        return "Hatalı";
      default:
        return s;
    }
  }

  function getStatusClass(s: string) {
    switch (s) {
      case "production_hold":
        return "bg-amber-50 text-amber-800";
      case "unclaimed":
        return "bg-emerald-50 text-emerald-700";
      case "active":
        return "bg-green-100 text-green-800";
      case "void":
        return "bg-red-50 text-red-700";
      default:
        return "bg-neutral-100 text-neutral-700";
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">
            Ürün listesi {status ? `(${getStatusLabel(status)})` : test ? "(Test)" : ""}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Toplam {items.length} ürün
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
  <button
    type="button"
    onClick={fetchItems}
    disabled={loading}
    className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold disabled:opacity-60"
  >
    {loading ? "Yükleniyor..." : "Yenile"}
  </button>

  <a
    href="/admin"
    className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold"
  >
    Admin panele dön
  </a>
</div>
      </div>

      {loading ? (
        <p>Yükleniyor...</p>
      ) : items.length ? (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.code}
              className="flex items-center justify-between rounded-xl border bg-white p-3"
            >
              <div>
                <p className="font-semibold">{item.code}</p>
                <p className="text-xs text-neutral-500">
                  {item.name || "İsimsiz"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-1 text-xs ${getStatusClass(item.status)}`}
                >
                  {getStatusLabel(item.status)}
                </span>

                <a
                  href={`/t/${item.code}`}
                  target="_blank"
                  className="text-xs underline"
                >
                  Aç
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Liste boş</p>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <main className="min-h-screen bg-neutral-50 p-6">
      <Suspense fallback={<p>Yükleniyor...</p>}>
        <AdminProductsContent />
      </Suspense>
    </main>
  );
}