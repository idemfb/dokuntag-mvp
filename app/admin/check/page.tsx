"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

type CheckData = {
  code: string;
  status: string;
  isTest?: boolean;
  name?: string;
  ownerName?: string;
};

type PendingItem = {
  code: string;
  status: string;
  isTest?: boolean;
  name?: string;
  ownerName?: string;
};

type MismatchLog = {
  time: string;
  productCode: string;
  qrCode: string;
  nfcCode: string;
  reason: string;
};

const BASE_URL = "https://dokuntag.com";

function extractCode(value: string) {
  const raw = String(value || "").trim();

  if (!raw) return "";

  try {
    const withProtocol =
      raw.startsWith("http://") || raw.startsWith("https://")
        ? raw
        : raw.includes("/t/")
          ? `https://${raw.replace(/^\/+/, "")}`
          : "";

    if (withProtocol) {
      const url = new URL(withProtocol);
      const parts = url.pathname.split("/").filter(Boolean);
      const tIndex = parts.findIndex((part) => part.toLowerCase() === "t");

      if (tIndex !== -1 && parts[tIndex + 1]) {
        return normalizeCode(parts[tIndex + 1]);
      }
    }
  } catch {}

  const match = raw.match(/\/t\/([a-zA-Z0-9]+)/i);
  if (match?.[1]) return normalizeCode(match[1]);

  return normalizeCode(raw);
}

function normalizeCode(value: string) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);
}

function getTargetLink(code: string) {
  return code ? `${BASE_URL}/t/${code}` : "";
}

function getStatusLabel(status: string) {
  if (status === "production_hold") return "Kontrol bekliyor";
  if (status === "unclaimed") return "Satışa hazır";
  if (status === "active") return "Aktif";
  if (status === "inactive") return "Pasif";
  if (status === "void") return "İptal / hatalı";
  return status || "-";
}

export default function AdminCheckPage() {
  const [code, setCode] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [nfcCode, setNfcCode] = useState("");
  const [nfcInput, setNfcInput] = useState("");
  const [data, setData] = useState<CheckData | null>(null);
  const [error, setError] = useState("");
  const [nfcMessage, setNfcMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [mismatchLogs, setMismatchLogs] = useState<MismatchLog[]>([]);

  const scannerRef = useRef<Html5Qrcode | null>(null);

  const targetLink = getTargetLink(data?.code || code);

  const compareState = useMemo(() => {
    if (!qrCode || !nfcCode) {
      return {
        ready: false,
        matched: false,
        label: "QR ve NFC bekleniyor",
        className: "border-neutral-200 bg-neutral-50 text-neutral-600",
      };
    }

    if (qrCode === nfcCode) {
      return {
        ready: true,
        matched: true,
        label: "Eşleşme doğru",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    }

    return {
      ready: true,
      matched: false,
      label: "Eşleşme hatalı",
      className: "border-red-200 bg-red-50 text-red-700",
    };
  }, [qrCode, nfcCode]);

  const canRelease =
    Boolean(data) &&
    data?.status === "production_hold" &&
    !data?.isTest &&
    Boolean(data?.code) &&
    qrCode === data?.code &&
    nfcCode === data?.code &&
    qrCode === nfcCode;

  function resetReadings() {
    setQrCode("");
    setNfcCode("");
    setNfcInput("");
    setNfcMessage("");
  }

  function addMismatchLog(reason: string, productCode?: string, qr?: string, nfc?: string) {
    const log: MismatchLog = {
      time: new Date().toLocaleString("tr-TR"),
      productCode: productCode || data?.code || code || "-",
      qrCode: qr || qrCode || "-",
      nfcCode: nfc || nfcCode || "-",
      reason,
    };

    setMismatchLogs((prev) => [log, ...prev].slice(0, 10));
  }

  async function fetchCode(rawValue: string, options?: { source?: "manual" | "qr" | "nfc" }) {
    const extracted = extractCode(rawValue);

    if (!extracted) {
      setError("Kod okunamadı.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/admin/check?code=${extracted}`, {
        cache: "no-store",
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Kod bulunamadı.");

      setCode(extracted);
      setData(json);

      if (options?.source === "qr") {
        setQrCode(extracted);
      }

      if (options?.source === "nfc") {
        setNfcCode(extracted);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kod alınamadı.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPendingItems() {
    try {
      setPendingLoading(true);

      const res = await fetch("/api/admin/check?mode=pending", {
        cache: "no-store",
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

    if (action === "release" && !canRelease) {
      alert("Satışa açmak için QR ve NFC aynı ürün kodunu göstermeli.");
      return;
    }

    const ok = window.confirm("Onaylıyor musunuz?");
    if (!ok) return;

    const res = await fetch("/api/admin/check/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: data.code,
        action,
        qrCode,
        nfcCode,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      alert(json.error);
      return;
    }

    setData((prev) =>
      prev
        ? {
            ...prev,
            status: json.status,
          }
        : prev
    );

    fetchPendingItems();
  }

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
          const extracted = extractCode(decodedText);

          if (!extracted) {
            setError("QR kod okunamadı.");
            return;
          }

          setQrCode(extracted);
          setCode(extracted);
          fetchCode(extracted, { source: "qr" });
        },
        () => {}
      );
    } catch {
      setCameraOpen(false);
      setError(
        "Kamera bulunamadı veya izin verilmedi. Bilgisayarda barkod okuyucu/input ile devam edebilirsiniz."
      );
    }
  }

  async function stopCamera() {
    try {
      await scannerRef.current?.stop();
    } catch {}

    scannerRef.current = null;
    setCameraOpen(false);
  }

  async function readNfc() {
    try {
      setNfcMessage("");
      setError("");

      const NDEFReaderCtor = (window as unknown as { NDEFReader?: new () => any })
        .NDEFReader;

      if (!NDEFReaderCtor) {
        setNfcMessage(
          "Bu cihazda tarayıcıdan NFC okuma desteklenmiyor. NFC’yi telefonda açıp linki input’a okutabilir veya barkod okuyucu/input alanını kullanabilirsiniz."
        );
        return;
      }

      const reader = new NDEFReaderCtor();

      await reader.scan();

      setNfcMessage("NFC okutma hazır. Telefonu etikete yaklaştırın.");

      reader.onreading = (event: any) => {
        let text = "";

        for (const record of event.message.records || []) {
          if (record.recordType === "url") {
            const decoder = new TextDecoder();
            text = decoder.decode(record.data);
            break;
          }

          if (record.recordType === "text") {
            const decoder = new TextDecoder(record.encoding || "utf-8");
            text = decoder.decode(record.data);
            break;
          }
        }

        const extracted = extractCode(text);

        if (!extracted) {
          setNfcMessage("NFC okundu ancak kod ayıklanamadı.");
          return;
        }

        setNfcCode(extracted);
        setNfcInput(text);
        setNfcMessage(`NFC okundu: ${extracted}`);

        if (!data) {
          fetchCode(extracted, { source: "nfc" });
        }
      };

      reader.onerror = () => {
        setNfcMessage("NFC okunamadı. Manuel input ile devam edebilirsiniz.");
      };
    } catch {
      setNfcMessage(
        "NFC okuma başlatılamadı. Manuel NFC link alanı veya barkod okuyucu/input ile devam edebilirsiniz."
      );
    }
  }

  async function copyTargetLink() {
    if (!targetLink) return;

    try {
      await navigator.clipboard.writeText(targetLink);
      setNfcMessage("NFC’ye yazılacak link kopyalandı.");
    } catch {
      setNfcMessage(targetLink);
    }
  }

  useEffect(() => {
    fetchPendingItems();

    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (!qrCode || !nfcCode) return;

    if (qrCode !== nfcCode) {
      addMismatchLog("QR ve NFC farklı kodlara işaret ediyor.");
      return;
    }

    if (data?.code && (qrCode !== data.code || nfcCode !== data.code)) {
      addMismatchLog("Okunan kodlar seçili ürün koduyla eşleşmiyor.");
    }
  }, [qrCode, nfcCode, data?.code]);

  return (
    <main className="min-h-screen bg-neutral-50 p-4 text-neutral-900 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                Dokuntag
              </p>
              <h1 className="mt-1 text-2xl font-semibold">Ürün Kontrol</h1>
              <p className="mt-2 text-sm text-neutral-500">
                QR ve NFC aynı ürün kodunu göstermeden satışa açma yapılamaz.
              </p>
            </div>

            <button
              type="button"
              onClick={resetReadings}
              className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold"
            >
              Okumaları sıfırla
            </button>
          </div>
        </section>

        <section className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold">1. QR kontrolü</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Kamera, barkod okuyucu veya manuel input ile ürün QR kodunu okutun.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {!cameraOpen ? (
                <button
                  type="button"
                  onClick={startCamera}
                  className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white"
                >
                  Kamera ile QR okut
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

            <div
              id="reader"
              className="mt-3 w-full max-w-sm overflow-hidden rounded-xl border"
            />

            <input
              value={code}
              onChange={(e) => setCode(extractCode(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const extracted = extractCode(code);
                  setQrCode(extracted);
                  fetchCode(extracted, { source: "qr" });
                }
              }}
              placeholder="QR kodu / linki gir veya okut"
              className="mt-3 w-full rounded-xl border border-neutral-300 p-3 text-sm uppercase outline-none focus:border-neutral-500"
            />

            <button
              type="button"
              onClick={() => {
                const extracted = extractCode(code);
                setQrCode(extracted);
                fetchCode(extracted, { source: "qr" });
              }}
              className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold"
            >
              QR kodu kontrol et
            </button>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold">2. NFC kontrolü</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Android Chrome destekliyorsa NFC okutabilir, desteklemiyorsa NFC
              linkini input’a yapıştırabilirsiniz.
            </p>

            <button
              type="button"
              onClick={readNfc}
              className="mt-4 w-full rounded-xl bg-neutral-950 px-4 py-3 text-sm font-semibold text-white"
            >
              NFC okut
            </button>

            <input
              value={nfcInput}
              onChange={(e) => {
                const raw = e.target.value;
                const extracted = extractCode(raw);
                setNfcInput(raw);
                setNfcCode(extracted);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && nfcCode && !data) {
                  fetchCode(nfcCode, { source: "nfc" });
                }
              }}
              placeholder="NFC linkini okut / yapıştır"
              className="mt-3 w-full rounded-xl border border-neutral-300 p-3 text-sm outline-none focus:border-neutral-500"
            />

            {targetLink ? (
              <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <p className="text-xs text-neutral-500">NFC’ye yazılacak link</p>
                <p className="mt-1 break-all text-sm font-semibold text-neutral-900">
                  {targetLink}
                </p>
                <button
                  type="button"
                  onClick={copyTargetLink}
                  className="mt-3 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold"
                >
                  Linki kopyala
                </button>
              </div>
            ) : null}

            {nfcMessage ? (
              <p className="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                {nfcMessage}
              </p>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Kontrol durumu</h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-xs text-neutral-500">QR okunan</p>
              <p className="mt-1 text-lg font-semibold">
                {qrCode || "-"} {qrCode ? "✅" : ""}
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-xs text-neutral-500">NFC okunan</p>
              <p className="mt-1 text-lg font-semibold">
                {nfcCode || "-"} {nfcCode ? (nfcCode === qrCode ? "✅" : "❌") : ""}
              </p>
            </div>

            <div className={`rounded-xl border p-3 ${compareState.className}`}>
              <p className="text-xs">Eşleşme</p>
              <p className="mt-1 text-lg font-semibold">{compareState.label}</p>
            </div>
          </div>
        </section>

        {loading && <p className="text-sm text-neutral-500">Yükleniyor...</p>}
        {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</p>}

        {data && (
          <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="space-y-1">
              <p>
                <strong>Kod:</strong> {data.code}
              </p>
              <p>
                <strong>Durum:</strong> {getStatusLabel(data.status)}
              </p>

              {data.isTest && (
                <p className="text-sm font-semibold text-blue-600">Test kodu</p>
              )}
            </div>

            {data.status === "production_hold" ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {!data.isTest ? (
                  <button
                    onClick={() => updateStatus("release")}
                    disabled={!canRelease}
                    className="rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Kontrol edildi / satışa aç
                  </button>
                ) : (
                  <span className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
                    Test kodu aktif edilemez
                  </span>
                )}

                <button
                  onClick={() => updateStatus("void")}
                  className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white"
                >
                  Hatalı / iptal
                </button>

                {!canRelease && !data.isTest ? (
                  <p className="w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Satışa açmak için QR ve NFC aynı ürün kodunu göstermeli.
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
                Bu ürün üretim kontrol bekleme durumunda değil. Yanlışlıkla
                aktif, satışa açık veya iptal ürünlerde işlem yapılmaz.
              </div>
            )}
          </section>
        )}

        {mismatchLogs.length ? (
          <section className="rounded-2xl border border-red-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-red-700">
              Son eşleşme hataları
            </h2>

            <div className="mt-3 space-y-2">
              {mismatchLogs.map((item, index) => (
                <div
                  key={`${item.time}-${index}`}
                  className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-800"
                >
                  <p>
                    <strong>Zaman:</strong> {item.time}
                  </p>
                  <p>
                    <strong>Ürün:</strong> {item.productCode}
                  </p>
                  <p>
                    <strong>QR:</strong> {item.qrCode}
                  </p>
                  <p>
                    <strong>NFC:</strong> {item.nfcCode}
                  </p>
                  <p>
                    <strong>Sebep:</strong> {item.reason}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
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
                            resetReadings();
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
      </div>
    </main>
  );
} 