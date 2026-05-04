"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function AdminCheckPage() {
  const [code, setCode] = useState("");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  function normalize(value: string) {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  }

  async function fetchCode(c: string) {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/admin/check?code=${c}`);
      const json = await res.json();

      if (!res.ok) throw new Error(json.error);

      setData(json);
    } catch (e: any) {
      setError(e.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }
  async function fetchPendingItems() {
  try {
    setPendingLoading(true);

    const res = await fetch("/api/admin/check?mode=pending", {
      cache: "no-store"
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || "Liste alınamadı.");
    }

    setPendingItems(Array.isArray(json.items) ? json.items : []);
  } catch {
    setPendingItems([]);
  } finally {
    setPendingLoading(false);
  }
}
  async function updateStatus(action: "release" | "void") {
    if (!data?.code) return;

    const ok = window.confirm("Onaylıyor musunuz?");
    if (!ok) return;

    const res = await fetch("/api/admin/check/status", {
      method: "POST",
      body: JSON.stringify({
        code: data.code,
        action
      })
    });

    const json = await res.json();

    if (!res.ok) {
      alert(json.error);
      return;
    }

    setData((prev: any) => ({
      ...prev,
      status: json.status
    }));
    fetchPendingItems();
  }

  const [cameraOpen, setCameraOpen] = useState(false);

async function startCamera() {
  try {
    setError("");
    setCameraOpen(true);

    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    await scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        const lastPart = decodedText.split("/").pop() || decodedText;
        const c = normalize(lastPart);
        setCode(c);
        fetchCode(c);
      },
      () => {}
    );
  } catch {
    setCameraOpen(false);
    setError("Kamera bulunamadı veya izin verilmedi. Bilgisayarda barkod okuyucu/input ile devam edebilirsiniz.");
  }
}

async function stopCamera() {
  try {
    await scannerRef.current?.stop();
  } catch {}

  scannerRef.current = null;
  setCameraOpen(false);
}

useEffect(() => {
  fetchPendingItems();

  return () => {
    scannerRef.current?.stop().catch(() => {});
  };
}, []);

  return (
    <main className="min-h-screen p-6 space-y-4">
      <h1 className="text-xl font-semibold">Ürün Kontrol</h1>

      <div className="flex flex-wrap gap-2">
  {!cameraOpen ? (
    <button
      type="button"
      onClick={startCamera}
      className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white"
    >
      Kamera ile okut
    </button>
  ) : (
    <button
      type="button"
      onClick={stopCamera}
      className="rounded-xl border border-neutral-300 px-4 py-3 text-sm font-semibold"
    >
      Kamerayı kapat
    </button>
  )}
</div>

<div id="reader" className="w-full max-w-sm overflow-hidden rounded-xl border" />

      <input
        value={code}
        onChange={(e) => setCode(normalize(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") fetchCode(code);
        }}
        placeholder="Kod gir veya okut"
        className="w-full max-w-sm border p-3 rounded-xl"
      />

      {loading && <p>Yükleniyor...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {data && (
        <div className="p-4 border rounded-xl space-y-2">
          <p><strong>Kod:</strong> {data.code}</p>
          <p><strong>Durum:</strong> {data.status}</p>

          {data.isTest && (
            <p className="text-blue-600 text-sm">Test kodu</p>
          )}

          {data.status === "production_hold" ? (
  <div className="flex flex-wrap gap-2">
    {!data.isTest ? (
      <button
        onClick={() => updateStatus("release")}
        className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white"
      >
        Kontrol edildi
      </button>
    ) : (
      <span className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
        Test kodu aktif edilemez
      </span>
    )}

    <button
      onClick={() => updateStatus("void")}
      className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white"
    >
      Hatalı
    </button>
  </div>
) : (
  <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
    Bu ürün üretim kontrol bekleme durumunda değil. Yanlışlıkla aktif, satışa açık veya iptal ürünlerde işlem yapılmaz.
  </div>
)}
        </div>
      )}
      <section className="mt-6 max-w-3xl rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
  <div className="flex flex-wrap items-center justify-between gap-2">
    <div>
      <h2 className="text-lg font-semibold">Üretim kontrol bekleyenler</h2>
      <p className="mt-1 text-sm text-neutral-500">
        Sadece bu listedeki ürünlerde kontrol işlemi yapılır.
      </p>
    </div>

    <button
      type="button"
      onClick={fetchPendingItems}
      className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold"
    >
      Yenile
    </button>
  </div>

  {pendingLoading ? (
    <p className="mt-4 text-sm text-neutral-500">Liste yükleniyor...</p>
  ) : pendingItems.length ? (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-neutral-50 text-left text-neutral-600">
          <tr>
            <th className="px-3 py-2 font-medium">Kod</th>
            <th className="px-3 py-2 font-medium">Durum</th>
            <th className="px-3 py-2 font-medium">Tip</th>
            <th className="px-3 py-2 font-medium">İşlem</th>
          </tr>
        </thead>

        <tbody>
          {pendingItems.map((item) => (
            <tr key={item.code} className="border-t border-neutral-200">
              <td className="px-3 py-2 font-semibold">{item.code}</td>
              <td className="px-3 py-2">
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                  Kontrol bekliyor
                </span>
              </td>
              <td className="px-3 py-2">
                {item.isTest ? (
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    Test
                  </span>
                ) : (
                  <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-600">
                    Üretim
                  </span>
                )}
              </td>
              <td className="px-3 py-2">
                <button
                  type="button"
                  onClick={() => {
                    setCode(item.code);
                    fetchCode(item.code);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="rounded-xl border border-neutral-300 px-3 py-2 text-xs font-semibold"
                >
                  Kontrole al
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <p className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-500">
      Kontrol bekleyen ürün yok.
    </p>
  )}
</section>
    </main>
  );
}