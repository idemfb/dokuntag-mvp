"use client";

import { useMemo, useState } from "react";

type BatchItem = {
  code: string;
  label: string;
  setupLink: string;
  qrPageLink: string;
  qrDownloadLink: string;
};

function getMainSiteUrl() {
  const value =
    process.env.NEXT_PUBLIC_MAIN_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://dokuntag.com";

  return value.replace(/\/+$/, "");
}

function buildPrintText(items: BatchItem[]) {
  return items.map((item) => `${item.code} | ${item.label}`).join("\n");
}

function buildOpsText(items: BatchItem[]) {
  return items
    .map((item) => `${item.code} | ${item.label} | ${item.setupLink}`)
    .join("\n");
}

function buildFullText(items: BatchItem[]) {
  return items
    .map((item) =>
      [
        item.code,
        item.label,
        item.setupLink,
        item.qrPageLink,
        item.qrDownloadLink
      ].join(" | ")
    )
    .join("\n");
}

function buildPrintPageUrl(items: BatchItem[]) {
  const payload = encodeURIComponent(JSON.stringify(items));
  return `/admin/batch/print?data=${payload}`;
}

export default function AdminBatchPage() {
  const mainSiteUrl = getMainSiteUrl();

  const [count, setCount] = useState("20");
  const [labelTemplate, setLabelTemplate] = useState("Dokuntag");
  const [loading, setLoading] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<BatchItem[]>([]);

  const printText = useMemo(() => buildPrintText(items), [items]);
  const opsText = useMemo(() => buildOpsText(items), [items]);
  const fullText = useMemo(() => buildFullText(items), [items]);
  const printPageUrl = useMemo(() => buildPrintPageUrl(items), [items]);

  async function handleGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const parsedCount = Number(count);

      const res = await fetch("/api/admin/generate-batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          count: parsedCount,
          labelTemplate
        })
      });

      const data = (await res.json()) as {
        error?: string;
        items?: BatchItem[];
      };

      if (!res.ok) {
        throw new Error(data?.error || "Toplu üretim başarısız.");
      }

      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function copyText(value: string) {
    if (!value) return;
    await navigator.clipboard.writeText(value);
  }

  async function downloadZip() {
    if (!items.length) return;

    try {
      setZipLoading(true);
      setError("");

      const res = await fetch("/api/admin/download-batch-zip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          zipName: `dokuntag-batch-${items.length}`,
          items: items.map((item) => ({
            code: item.code,
            label: item.label
          }))
        })
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data?.error || "ZIP indirilemedi.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `dokuntag-batch-${items.length}.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ZIP indirilemedi.");
    } finally {
      setZipLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 text-neutral-900">
      <div className="mx-auto max-w-6xl space-y-6">
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
                href="/"
                className="text-sm text-neutral-500 transition hover:text-neutral-900 hover:underline"
              >
                Ana sisteme dön
              </a>
            </div>

            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-neutral-400">
              Dokuntag
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Toplu kod ve QR üretimi
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
              Üretilen tüm kodlar veritabanına <strong>unclaimed</strong> olarak eklenir.
              Baskı için sade çıktı, operasyon için linkli çıktı ve tam teknik çıktı ayrı ayrı alınabilir.
            </p>
          </div>

          <div className="px-6 py-6">
            <form onSubmit={handleGenerate} className="grid gap-4 md:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-neutral-700">
                  Adet
                </span>
                <input
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  inputMode="numeric"
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500"
                  placeholder="20"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-neutral-700">
                  QR alt yazı şablonu
                </span>
                <input
                  value={labelTemplate}
                  onChange={(e) => setLabelTemplate(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500"
                  placeholder="Dokuntag"
                />
              </label>

              <div className="md:col-span-3 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Üretiliyor..." : "Toplu üretim başlat"}
                </button>

                <button
                  type="button"
                  onClick={() => copyText(printText)}
                  disabled={!items.length}
                  className="rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Baskı listesini kopyala
                </button>

                <button
                  type="button"
                  onClick={() => copyText(opsText)}
                  disabled={!items.length}
                  className="rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Operasyon listesini kopyala
                </button>

                <button
                  type="button"
                  onClick={() => copyText(fullText)}
                  disabled={!items.length}
                  className="rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Tam listeyi kopyala
                </button>

                <button
                  type="button"
                  onClick={downloadZip}
                  disabled={!items.length || zipLoading}
                  className="rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {zipLoading ? "ZIP hazırlanıyor..." : "Tüm QR'ları ZIP indir"}
                </button>

                <a
                  href={items.length ? printPageUrl : "#"}
                  target="_blank"
                  rel="noreferrer"
                  className={`rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50 ${
                    !items.length ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  Baskı görünümünü aç
                </a>
              </div>
            </form>

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
                {error}
              </div>
            ) : null}
          </div>
        </section>

        {items.length ? (
          <>
            <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
              <div className="border-b border-neutral-200 px-6 py-5">
                <h2 className="text-lg font-semibold">Üretilen kodlar</h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Toplam {items.length} adet kod üretildi.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-neutral-50 text-left text-neutral-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Kod</th>
                      <th className="px-4 py-3 font-medium">Yazı</th>
                      <th className="px-4 py-3 font-medium">Kurulum</th>
                      <th className="px-4 py-3 font-medium">QR sayfası</th>
                      <th className="px-4 py-3 font-medium">QR indir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.code} className="border-t border-neutral-200">
                        <td className="px-4 py-3 font-semibold text-neutral-900">
                          {item.code}
                        </td>
                        <td className="px-4 py-3 text-neutral-700">{item.label}</td>
                        <td className="px-4 py-3">
                          <a
                            href={item.setupLink}
                            target="_blank"
                            rel="noreferrer"
                            className="break-all text-neutral-700 underline underline-offset-4"
                          >
                            Aç
                          </a>
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={item.qrPageLink}
                            target="_blank"
                            rel="noreferrer"
                            className="break-all text-neutral-700 underline underline-offset-4"
                          >
                            QR sayfası
                          </a>
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={item.qrDownloadLink}
                            target="_blank"
                            rel="noreferrer"
                            className="break-all text-neutral-700 underline underline-offset-4"
                          >
                            İndir
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
              <div className="border-b border-neutral-200 px-6 py-5">
                <h2 className="text-lg font-semibold">Baskı listesi</h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Matbaa veya üretim için en sade çıktı.
                </p>
              </div>

              <div className="px-6 py-6">
                <textarea
                  readOnly
                  value={printText}
                  className="min-h-[180px] w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-4 text-sm outline-none"
                />
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}