"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ScanStatus = "idle" | "starting" | "scanning" | "success" | "error";

function normalizeCode(value: string) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);
}

function isValidCode(value: string) {
  return value.length >= 3 && value.length <= 10;
}

function extractCode(value: string) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    const parts = url.pathname.split("/").filter(Boolean);
    const index = parts.findIndex((item) => item === "p" || item === "t");

    if (index !== -1 && parts[index + 1]) {
      return normalizeCode(parts[index + 1]);
    }

    return "";
  } catch {
    return normalizeCode(trimmed);
  }
}

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const stopRef = useRef(false);

  const [status, setStatus] = useState<ScanStatus>("idle");
  const [message, setMessage] = useState("");
  const [manualCode, setManualCode] = useState("");

  const manualCodeValid = useMemo(() => isValidCode(manualCode), [manualCode]);
  const cameraOpen = status === "starting" || status === "scanning";

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

  function resetCamera() {
    stopCamera();
    setStatus("idle");
    setMessage("");
  }

  function goToCode(code: string) {
    const normalized = extractCode(code);

    if (!isValidCode(normalized)) {
      setStatus("error");
      setMessage("Kod 3–10 karakter olmalı. Sadece harf ve rakam kullanın.");
      return;
    }

    setStatus("success");
    setMessage(`Kod bulundu: ${normalized}`);
    stopCamera();

    window.location.href = `/t/${normalized}?from=scan`;
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
        video: { facingMode: "environment" },
        audio: false,
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
        formats: ["qr_code"],
      });

      setStatus("scanning");
      setMessage("QR kodu kameraya gösterin.");

      async function loop() {
        if (stopRef.current || !videoRef.current) return;

        try {
          const codes = await detector.detect(videoRef.current);
          const rawValue = codes[0]?.rawValue || "";

          if (rawValue) {
            const code = extractCode(rawValue);
            if (code) {
              goToCode(code);
              return;
            }
          }
        } catch {
          // Kamera görüntüsü hazır değilse sonraki frame beklenir.
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

  function toggleCamera() {
    if (cameraOpen) {
      resetCamera();
      return;
    }

    void startScan();
  }

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f3ea] px-5 py-8 text-neutral-950 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <section className="overflow-hidden rounded-[2.5rem] border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 bg-[#fbfaf7] px-6 py-8 sm:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">
              Dokuntag®
            </p>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              QR okut veya kod gir.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">
              Ürünün üzerindeki QR kodu kameraya gösterin. QR okunmuyorsa
              etiketteki ürün kodunu aşağıdan yazabilirsiniz.
            </p>
          </div>

          <div className="p-5 sm:p-8">
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

            <button
              type="button"
              onClick={toggleCamera}
              disabled={status === "starting"}
              className="mt-5 min-h-12 w-full rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "starting"
                ? "Kamera açılıyor..."
                : cameraOpen
                  ? "Kamerayı kapat"
                  : "QR okut"}
            </button>

            <form
              className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]"
              onSubmit={(event) => {
                event.preventDefault();
                goToCode(manualCode);
              }}
            >
              <input
                value={manualCode}
                onChange={(event) =>
                  setManualCode(normalizeCode(event.target.value))
                }
                placeholder="Ürün kodu"
                inputMode="text"
                autoCapitalize="characters"
                autoComplete="off"
                className="min-h-12 w-full rounded-2xl border border-neutral-300 bg-white px-4 text-center text-sm font-semibold tracking-[0.16em] outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
              />

              <button
                type="submit"
                disabled={!manualCodeValid}
                className="min-h-12 rounded-2xl bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Kodu aç
              </button>
            </form>

            <p className="mt-3 text-center text-xs text-neutral-500">
              Kod 3–10 karakter olmalı. Sadece harf ve rakam kullanılabilir.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}