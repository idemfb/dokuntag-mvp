"use client";

import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

type SizeOption = "2.5cm" | "3cm" | "4cm";

function getBaseUrl() {
  const value =
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "http://localhost:3000";

  return value.replace(/\/+$/, "");
}

function encode(value: string) {
  return encodeURIComponent(value);
}

export default function QrPage() {
  const params = useParams<{ code: string }>();
  const searchParams = useSearchParams();

  const code = String(params?.code || "").trim().toUpperCase();
  const token = searchParams.get("token")?.trim() || "";
  const [size, setSize] = useState<SizeOption>("3cm");

  const baseUrl = getBaseUrl();
  const targetUrl = `${baseUrl}/t/${code}`;
  const manageUrl = token ? `/manage/${code}?token=${encode(token)}` : "";

  const qrImageUrl = useMemo(() => {
    return `/api/qr/${code}?size=${encode(size)}`;
  }, [code, size]);

  const qrDownloadUrl = useMemo(() => {
    return `/api/qr-download/${code}?size=${encode(size)}`;
  }, [code, size]);

  const qrPageUrl = useMemo(() => {
    const base = `${baseUrl}/qr/${code}?size=${encode(size)}`;
    return token ? `${base}&token=${encode(token)}` : base;
  }, [baseUrl, code, size, token]);

  const printUrl = useMemo(() => {
    const data = encode(
      JSON.stringify([{ code }])
    );

    return `/admin/batch/print?data=${data}&size=${encode(size)}&shape=round`;
  }, [code, size]);

  const shareText = useMemo(() => {
    return [
      `Dokuntag QR sayfası: ${qrPageUrl}`,
      `QR indirme linki: ${baseUrl}/api/qr-download/${code}?size=${encode(size)}`,
      `Hedef bağlantı: ${targetUrl}`
    ].join("\n\n");
  }, [baseUrl, code, qrPageUrl, size, targetUrl]);

  const whatsappUrl = useMemo(() => {
    return `https://wa.me/?text=${encode(shareText)}`;
  }, [shareText]);

  const emailUrl = useMemo(() => {
    const subject = `Dokuntag QR - ${code}`;
    return `mailto:?subject=${encode(subject)}&body=${encode(shareText)}`;
  }, [code, shareText]);

  if (!code) {
    return (
      <main className="min-h-screen bg-neutral-50 px-4 py-8 text-neutral-900">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[2rem] border border-neutral-200 bg-white px-6 py-8 shadow-sm">
            Geçersiz ürün kodu.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 text-neutral-900">
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-neutral-100/80 px-6 py-7">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Dokuntag
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              QR oluşturma ve paylaşım
            </h1>

            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Bu QR kod <strong>{code}</strong> ürün kodu için hazırlanmıştır.
              Varsayılan baskı ölçüsü <strong>3 cm</strong> olarak seçilidir.
            </p>
          </div>

          <div className="px-6 py-6">
            <div className="mb-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setSize("2.5cm")}
                className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                  size === "2.5cm"
                    ? "border-black bg-black text-white"
                    : "border-neutral-300 bg-white hover:border-neutral-400 hover:bg-neutral-50"
                }`}
              >
                2.5 cm
              </button>

              <button
                type="button"
                onClick={() => setSize("3cm")}
                className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                  size === "3cm"
                    ? "border-black bg-black text-white"
                    : "border-neutral-300 bg-white hover:border-neutral-400 hover:bg-neutral-50"
                }`}
              >
                3 cm
              </button>

              <button
                type="button"
                onClick={() => setSize("4cm")}
                className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                  size === "4cm"
                    ? "border-black bg-black text-white"
                    : "border-neutral-300 bg-white hover:border-neutral-400 hover:bg-neutral-50"
                }`}
              >
                4 cm
              </button>
            </div>

            <div className="flex justify-center">
              <img
                src={qrImageUrl}
                alt={`${code} QR`}
                className="h-auto w-full max-w-[256px] rounded-2xl border border-neutral-200 bg-white p-3"
              />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a
                href={qrDownloadUrl}
                className="rounded-2xl bg-black px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                QR indir
              </a>

              <a
                href={printUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-center text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
              >
                Bu boyutta yazdır
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-center text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
              >
                WhatsApp ile paylaş
              </a>

              <a
                href={emailUrl}
                className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-center text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
              >
                E-posta ile gönder
              </a>

              <a
                href={targetUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-center text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
              >
                Hedef bağlantıyı aç
              </a>

              {manageUrl ? (
                <a
                  href={manageUrl}
                  className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-center text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50 sm:col-span-2"
                >
                  Yönetim sayfasına git
                </a>
              ) : null}
            </div>

            <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-neutral-400">
                Paylaşım içeriği
              </p>

              <pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-neutral-700">
                {shareText}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}