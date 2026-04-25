"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type ScanStatus = "idle" | "starting" | "scanning" | "success" | "error";

function isDokuntagUrl(value: string) {
  try {
    const url = new URL(value);

    return (
      url.hostname === "dokuntag.com" ||
      url.hostname === "www.dokuntag.com" ||
      url.hostname.endsWith(".vercel.app")
    );
  } catch {
    return false;
  }
}

function extractCode(value: string) {
  const trimmed = String(value || "").trim();

  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    const parts = url.pathname.split("/").filter(Boolean);
    const index = parts.findIndex((item) => item === "p" || item === "t");

    if (index !== -1 && parts[index + 1]) {
      return parts[index + 1].trim().toUpperCase();
    }

    return "";
  } catch {
    return trimmed.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  }
}

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const stopRef = useRef(false);

  const [status, setStatus] = useState<ScanStatus>("idle");
  const [message, setMessage] = useState("");
  const [manualCode, setManualCode] = useState("");

  function stopCamera() {
    stopRef.current = true;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  function goToCode(code: string) {
    const normalized = extractCode(code);

    if (!normalized) {
      setStatus("error");
      setMessage("Kod okunamadı. Lütfen tekrar deneyin veya kodu elle girin.");
      return;
    }

    setStatus("success");
    setMessage(`Kod bulundu: ${normalized}`);
    stopCamera();

    window.location.href = `/t/${normalized}`;
  }

  async function startScan() {
    try {
      setStatus("starting");
      setMessage("");
      stopRef.current = false;

      const barcodeDetectorConstructor = (
        window as unknown as {
          BarcodeDetector?: new (options?: {
            formats?: string[];
          }) => {
            detect: (
              source: HTMLVideoElement
            ) => Promise<Array<{ rawValue?: string }>>;
          };
        }
      ).BarcodeDetector;

      if (!barcodeDetectorConstructor) {
        setStatus("error");
        setMessage(
          "Bu tarayıcıda web üzerinden QR okuma desteklenmiyor. Telefon kamerasıyla QR kodu okutabilir veya kodu elle girebilirsiniz."
        );
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment"
        },
        audio: false
      });

      streamRef.current = stream;

      if (!videoRef.current) {
        setStatus("error");
        setMessage("Kamera başlatılamadı.");
        return;
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      const detector = new barcodeDetectorConstructor({
        formats: ["qr_code"]
      });

      setStatus("scanning");
      setMessage("QR kodu kameraya gösterin.");

      async function loop() {
        if (stopRef.current || !videoRef.current) return;

        try {
          const codes = await detector.detect(videoRef.current);
          const rawValue = codes[0]?.rawValue || "";

          if (rawValue) {
            if (isDokuntagUrl(rawValue)) {
              const code = extractCode(rawValue);
              goToCode(code);
              return;
            }

            const code = extractCode(rawValue);

            if (code) {
              goToCode(code);
              return;
            }
          }
        } catch {
          // Kamera görüntüsü hazır değilse bir sonraki frame beklenir.
        }

        window.requestAnimationFrame(loop);
      }

      window.requestAnimationFrame(loop);
    } catch {
      setStatus("error");
      setMessage(
        "Kamera izni alınamadı. Telefon kamerasıyla QR kodu okutabilir veya kodu elle girebilirsiniz."
      );
      stopCamera();
    }
  }

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f3ea] px-5 py-8 text-neutral-950 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Dokuntag
          </Link>

          <Link
            href="/"
            className="rounded-full border border-neutral-300 bg-white/70 px-4 py-2 text-sm font-semibold hover:bg-white"
          >
            Ana sayfa
          </Link>
        </header>

        <section className="overflow-hidden rounded-[2.5rem] border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-stone-100 px-6 py-8 sm:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">
              QR okut
            </p>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Dokuntag kodunu okutun.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">
              QR kodu kameraya gösterin. Kod okunursa ilgili Dokuntag akışına
              yönlendirilirsiniz. Telefon kamerası zaten QR okutabiliyorsa, en
              hızlı yöntem doğrudan kamera uygulamasını kullanmaktır.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <div className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-neutral-950">
              <video
                ref={videoRef}
                muted
                playsInline
                className="aspect-[4/3] w-full object-cover"
              />
            </div>

            {message ? (
              <div
                className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                  status === "error"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : status === "success"
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-neutral-200 bg-neutral-50 text-neutral-700"
                }`}
              >
                {message}
              </div>
            ) : null}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={startScan}
                disabled={status === "starting" || status === "scanning"}
                className="rounded-full bg-neutral-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "scanning"
                  ? "Okutma açık"
                  : status === "starting"
                    ? "Kamera açılıyor..."
                    : "QR okut"}
              </button>

              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setStatus("idle");
                  setMessage("");
                }}
                className="rounded-full border border-neutral-300 bg-white px-6 py-4 text-sm font-semibold hover:bg-neutral-50"
              >
                Kamerayı kapat
              </button>
            </div>

            <div className="mt-8 rounded-[2rem] border border-neutral-200 bg-[#f7f3ea] p-5">
              <h2 className="text-lg font-semibold">Kod elle girilebilir</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                Kamera izni verilemiyorsa veya QR okunmuyorsa, ürün üzerindeki
                kodu elle yazabilirsiniz.
              </p>

              <form
                className="mt-4 flex flex-col gap-3 sm:flex-row"
                onSubmit={(event) => {
                  event.preventDefault();
                  goToCode(manualCode);
                }}
              >
                <input
                  value={manualCode}
                  onChange={(event) => setManualCode(event.target.value)}
                  placeholder="Örn: DKNTG"
                  className="min-h-12 flex-1 rounded-2xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                />

                <button
                  type="submit"
                  className="rounded-2xl bg-neutral-950 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
                >
                  Kodu aç
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}