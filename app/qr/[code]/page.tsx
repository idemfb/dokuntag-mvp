"use client";

import { useEffect, useMemo, useState } from "react";

type SizeOption = "1cm" | "2cm" | "2.5cm" | "3cm" | "4cm" | "5cm" | "6cm";
type ShapeOption = "round" | "square";
type OutputMode = "qr" | "front" | "both";
type FitMode = "cover" | "contain";

type DesignState = {
  size: SizeOption;
  shape: ShapeOption;
  hasHole: boolean;
  topText: string;
  codeText: string;
  hideCode: boolean;
  qrScale: number;
  codeScale: number;
  topGap: number;
  codeGap: number;
  qrOffsetY: number;
  foregroundColor: string;
  guideColor: string;
  showGuide: boolean;
  outputMode: OutputMode;
};

type ArtworkState = {
  imageUrl: string;
  fileName: string;
  fit: FitMode;
  scale: number;
  x: number;
  y: number;
  caption: string;
  captionColor: string;
  captionScale: number;
};

const DEFAULT_DESIGN: DesignState = {
  size: "3cm",
  shape: "round",
  hasHole: true,
  topText: "OKUT",
  codeText: "",
  hideCode: false,
  qrScale: 80,
  codeScale: 100,
  topGap: 100,
  codeGap: 100,
  qrOffsetY: 100,
  foregroundColor: "#111111",
  guideColor: "#ef4444",
  showGuide: true,
  outputMode: "qr"
};

const DEFAULT_ARTWORK: ArtworkState = {
  imageUrl: "",
  fileName: "",
  fit: "cover",
  scale: 100,
  x: 0,
  y: 0,
  caption: "",
  captionColor: "#111111",
  captionScale: 100
};

const SIZE_OPTIONS: Array<{ value: SizeOption; label: string }> = [
  { value: "1cm", label: "1 cm" },
  { value: "2cm", label: "2 cm" },
  { value: "2.5cm", label: "2.5 cm" },
  { value: "3cm", label: "3 cm" },
  { value: "4cm", label: "4 cm" },
  { value: "5cm", label: "5 cm" },
  { value: "6cm", label: "6 cm" }
];

function getBaseUrl() {
  const value =
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "http://localhost:3000";
  return value.replace(/\/+$/, "");
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function parseNumber(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return clamp(parsed, min, max);
}

function parseColor(value: string | null, fallback: string) {
  const text = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(text) ? text : fallback;
}

function getShapeClip(shape: ShapeOption) {
  if (shape === "round") return "circle(50% at 50% 50%)";
  return "inset(0 round 18px)";
}

function previewSize(size: SizeOption) {
  if (size === "1cm") return { width: 150, height: 150 };
  if (size === "2cm") return { width: 190, height: 190 };
  if (size === "2.5cm") return { width: 220, height: 220 };
  if (size === "4cm") return { width: 300, height: 300 };
  if (size === "5cm") return { width: 340, height: 340 };
  if (size === "6cm") return { width: 380, height: 380 };
  return { width: 260, height: 260 };
}

function readDesignFromUrl(params: URLSearchParams): DesignState {
  const rawSize = params.get("size");
  const size = SIZE_OPTIONS.some((item) => item.value === rawSize)
    ? (rawSize as SizeOption)
    : DEFAULT_DESIGN.size;

  const rawShape = params.get("shape");
  const shape: ShapeOption = rawShape === "square" ? "square" : "round";

  return {
    ...DEFAULT_DESIGN,
    size,
    shape,
    hasHole: params.get("hasHole") === "false" ? false : true,
    topText: String(params.get("topText") ?? DEFAULT_DESIGN.topText).slice(0, 12),
    codeText: String(params.get("codeText") ?? DEFAULT_DESIGN.codeText).slice(0, 20),
    hideCode: params.get("hideCode") === "true",
    qrScale: parseNumber(params.get("qrScale"), DEFAULT_DESIGN.qrScale, 40, 96),
    codeScale: parseNumber(params.get("codeScale"), DEFAULT_DESIGN.codeScale, 60, 180),
    topGap: parseNumber(params.get("topGap"), DEFAULT_DESIGN.topGap, 60, 170),
    codeGap: parseNumber(params.get("codeGap"), DEFAULT_DESIGN.codeGap, 60, 170),
    qrOffsetY: parseNumber(params.get("qrOffsetY"), DEFAULT_DESIGN.qrOffsetY, 70, 130),
    foregroundColor: parseColor(params.get("foregroundColor"), DEFAULT_DESIGN.foregroundColor),
    guideColor: parseColor(params.get("guideColor"), DEFAULT_DESIGN.guideColor),
    showGuide: params.get("showGuide") === "false" ? false : true,
    outputMode:
      params.get("outputMode") === "front" || params.get("outputMode") === "both" || params.get("outputMode") === "qr"
        ? (params.get("outputMode") as OutputMode)
        : "qr"
  };
}

function buildDesignQuery(design: DesignState) {
  const params = new URLSearchParams();
  params.set("size", design.size);
  params.set("shape", design.shape);
  params.set("hasHole", design.hasHole ? "true" : "false");
  params.set("topText", design.topText);
  params.set("codeText", design.codeText);
  params.set("hideCode", design.hideCode ? "true" : "false");
  params.set("qrScale", String(design.qrScale));
  params.set("codeScale", String(design.codeScale));
  params.set("topGap", String(design.topGap));
  params.set("codeGap", String(design.codeGap));
  params.set("qrOffsetY", String(design.qrOffsetY));
  params.set("foregroundColor", design.foregroundColor);
  params.set("guideColor", design.guideColor);
  params.set("showGuide", design.showGuide ? "true" : "false");
  params.set("outputMode", design.outputMode);
  params.set("designType", "tag");
  return params.toString();
}

function SliderField({
  label,
  value,
  min,
  max,
  suffix,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-neutral-900">{label}</span>
        <span className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-semibold text-neutral-600">
          {value}{suffix || ""}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full"
      />
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
      <span className="text-sm font-medium text-neutral-900">{label}</span>
      <div className="mt-3 flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 rounded-lg border border-neutral-300 bg-white"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 min-w-0 flex-1 rounded-xl border border-neutral-300 bg-white px-3 text-sm"
        />
      </div>
    </label>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.5rem] border border-neutral-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

export default function QrPage() {
  const [code, setCode] = useState("");
  const [design, setDesign] = useState<DesignState>(DEFAULT_DESIGN);
  const [artwork, setArtwork] = useState<ArtworkState>(DEFAULT_ARTWORK);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const parts = window.location.pathname.split("/");
    const codeFromUrl = parts[parts.length - 1];
    const params = new URLSearchParams(window.location.search);

    setCode(codeFromUrl?.toUpperCase() || "");
    setDesign(readDesignFromUrl(params));

    try {
      const savedArtwork = window.localStorage.getItem("dokuntag_front_artwork");
      if (savedArtwork) {
        setArtwork({ ...DEFAULT_ARTWORK, ...(JSON.parse(savedArtwork) as Partial<ArtworkState>) });
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!code) return;
    const next = `${window.location.pathname}?${buildDesignQuery(design)}`;
    window.history.replaceState(null, "", next);
    try {
      window.localStorage.setItem("dokuntag_qr_design", JSON.stringify(design));
    } catch {}
  }, [code, design]);

  useEffect(() => {
    try {
      window.localStorage.setItem("dokuntag_front_artwork", JSON.stringify(artwork));
    } catch {}
  }, [artwork]);

  const designQuery = useMemo(() => buildDesignQuery(design), [design]);
  const qrImageUrl = useMemo(() => `/api/qr/${code}?${designQuery}`, [code, designQuery]);
  const qrDownloadUrl = useMemo(() => `/api/qr-download/${code}?${designQuery}`, [code, designQuery]);
  const qrPageUrl = useMemo(() => `${getBaseUrl()}/qr/${code}?${designQuery}`, [code, designQuery]);
  const frame = previewSize(design.size);
  const displayCode = design.codeText.trim() || code;

  const updateDesign = <K extends keyof DesignState>(key: K, value: DesignState[K]) => {
    setDesign((prev) => ({ ...prev, [key]: value }));
  };

  const updateArtwork = <K extends keyof ArtworkState>(key: K, value: ArtworkState[K]) => {
    setArtwork((prev) => ({ ...prev, [key]: value }));
  };

  function handleArtworkUpload(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateArtwork("imageUrl", String(reader.result || ""));
      updateArtwork("fileName", file.name);
    };
    reader.readAsDataURL(file);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(qrPageUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  function openPrintView() {
    try {
      const storageKey = `dokuntag_batch_${Date.now()}`;
      const items = [{ code }];

      window.sessionStorage.setItem(storageKey, JSON.stringify(items));
      window.localStorage.setItem("dokuntag_batch_items", JSON.stringify(items));
      window.localStorage.setItem("dokuntag_qr_design", JSON.stringify(design));
      window.localStorage.setItem("dokuntag_front_artwork", JSON.stringify(artwork));

      window.open(
        `/admin/batch/print?storageKey=${encodeURIComponent(storageKey)}&outputMode=${encodeURIComponent(
          design.outputMode
        )}`,
        "_blank",
        "noopener,noreferrer"
      );
    } catch {
      window.open(`/admin/batch/print?outputMode=${encodeURIComponent(design.outputMode)}`, "_blank");
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 text-neutral-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-neutral-100/80 px-6 py-7">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Dokuntag</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">QR baskı yüzü</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
              Sade üretim modu: üstte <strong>OKUT</strong>, ortada QR, altta ürün kodu. NFC linki değişmez: /t/{code}.
            </p>
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-[360px_1fr]">
            <div className="space-y-4">
              <SectionCard title="Temel ayarlar">
                <label className="block rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <span className="text-sm font-medium text-neutral-900">Ölçü</span>
                  <select
                    value={design.size}
                    onChange={(e) => updateDesign("size", e.target.value as SizeOption)}
                    className="mt-3 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
                  >
                    {SIZE_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <span className="text-sm font-medium text-neutral-900">Form</span>
                  <select
                    value={design.shape}
                    onChange={(e) => updateDesign("shape", e.target.value as ShapeOption)}
                    className="mt-3 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="round">Daire</option>
                    <option value="square">Kare</option>
                  </select>
                </label>

              </SectionCard>

              <SectionCard title="QR yüzü">
                <label className="block rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <span className="text-sm font-medium text-neutral-900">Üst yazı</span>
                  <input
                    value={design.topText}
                    onChange={(e) => updateDesign("topText", e.target.value.slice(0, 12).toUpperCase())}
                    className="mt-3 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
                    placeholder="OKUT"
                  />
                </label>

                <label className="block rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <span className="text-sm font-medium text-neutral-900">Ürün kodu</span>
                  <input
                    value={design.codeText || displayCode}
                    onChange={(e) => updateDesign("codeText", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20))}
                    className="mt-3 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
                  />
                </label>

                <label className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-800">
                  <input
                    type="checkbox"
                    checked={design.hideCode}
                    onChange={(e) => updateDesign("hideCode", e.target.checked)}
                  />
                  Ürün kodunu gizle
                </label>

                <SliderField label="QR büyüklüğü" value={design.qrScale} min={40} max={96} suffix="%" onChange={(value) => updateDesign("qrScale", value)} />
                <SliderField label="Kod boyutu" value={design.codeScale} min={60} max={180} suffix="%" onChange={(value) => updateDesign("codeScale", value)} />
                <SliderField label="OKUT–QR mesafesi" value={design.topGap} min={60} max={170} suffix="%" onChange={(value) => updateDesign("topGap", value)} />
                <SliderField label="QR–kod mesafesi" value={design.codeGap} min={60} max={170} suffix="%" onChange={(value) => updateDesign("codeGap", value)} />
                <SliderField label="QR yukarı/aşağı" value={design.qrOffsetY} min={70} max={130} suffix="%" onChange={(value) => updateDesign("qrOffsetY", value)} />
                <ColorField label="QR ve yazı rengi" value={design.foregroundColor} onChange={(value) => updateDesign("foregroundColor", value)} />
              </SectionCard>

              <SectionCard title="Çıktı">
                <label className="block rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <span className="text-sm font-medium text-neutral-900">Baskı görünümü</span>
                  <select
                    value={design.outputMode}
                    onChange={(e) => updateDesign("outputMode", e.target.value as OutputMode)}
                    className="mt-3 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="qr">Sadece QR yüzü</option>
                    <option value="front">Sadece ön yüz</option>
                    <option value="both">Ön + arka birlikte</option>
                  </select>
                </label>

                <label className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-800">
                  <input
                    type="checkbox"
                    checked={design.showGuide}
                    onChange={(e) => updateDesign("showGuide", e.target.checked)}
                  />
                  Kırmızı dış kılavuz çizgisi
                </label>
              </SectionCard>
            </div>

            <div className="space-y-4">
              <section className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[1.75rem] border border-neutral-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">Arka yüz</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-900">QR baskı</h2>
                  <div className="mt-6 flex justify-center overflow-auto rounded-3xl bg-neutral-50 p-6">
                    {code ? (
                      <img src={qrImageUrl} alt={`Dokuntag QR ${code}`} style={frame} />
                    ) : null}
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-neutral-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">Ön yüz</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-900">Görsel prova</h2>
                  <div className="mt-6 flex justify-center overflow-auto rounded-3xl bg-neutral-50 p-6">
                    <div
                      className="relative overflow-hidden bg-white shadow-sm"
                      style={{
                        width: frame.width,
                        height: frame.height,
                        clipPath: getShapeClip(design.shape)
                      }}
                    >
                      {artwork.imageUrl ? (
                        <img
                          src={artwork.imageUrl}
                          alt={artwork.fileName || "Ön yüz"}
                          className="absolute left-1/2 top-1/2 h-full w-full"
                          style={{
                            objectFit: artwork.fit,
                            transform: `translate(-50%, -50%) translate(${artwork.x}px, ${artwork.y}px) scale(${artwork.scale / 100})`
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-neutral-400">
                          Ön yüz görseli yükleyin
                        </div>
                      )}

                      {artwork.caption ? (
                        <div
                          className="absolute bottom-5 left-0 right-0 text-center font-bold"
                          style={{ color: artwork.captionColor, fontSize: `${14 * (artwork.captionScale / 100)}px` }}
                        >
                          {artwork.caption}
                        </div>
                      ) : null}

                      {design.showGuide ? (
                        <div className="pointer-events-none absolute inset-0 border-2 border-dashed border-red-500/80" />
                      ) : null}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-neutral-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Ön yüz görseli</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <label className="block rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 md:col-span-3">
                    <span className="text-sm font-medium text-neutral-900">Görsel yükle</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleArtworkUpload(e.target.files?.[0])}
                      className="mt-3 w-full text-sm"
                    />
                  </label>

                  <label className="block rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                    <span className="text-sm font-medium text-neutral-900">Sığdırma</span>
                    <select
                      value={artwork.fit}
                      onChange={(e) => updateArtwork("fit", e.target.value as FitMode)}
                      className="mt-3 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="cover">Doldur</option>
                      <option value="contain">Tamamı görünsün</option>
                    </select>
                  </label>

                  <SliderField label="Görsel boyutu" value={artwork.scale} min={50} max={180} suffix="%" onChange={(value) => updateArtwork("scale", value)} />
                  <SliderField label="Sağ / sol" value={artwork.x} min={-80} max={80} onChange={(value) => updateArtwork("x", value)} />
                  <SliderField label="Yukarı / aşağı" value={artwork.y} min={-80} max={80} onChange={(value) => updateArtwork("y", value)} />

                  <label className="block rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 md:col-span-3">
                    <span className="text-sm font-medium text-neutral-900">Ön yüz yazısı</span>
                    <input
                      value={artwork.caption}
                      onChange={(e) => updateArtwork("caption", e.target.value.slice(0, 28))}
                      className="mt-3 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
                      placeholder="İsteğe bağlı"
                    />
                  </label>
                </div>
              </section>

              <section className="flex flex-wrap gap-3 rounded-[1.75rem] border border-neutral-200 bg-white p-5 shadow-sm">
                <a
                  href={qrDownloadUrl}
                  className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  SVG indir
                </a>
                <button
                  type="button"
                  onClick={openPrintView}
                  className="rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-neutral-50"
                >
                  Baskı görünümünü aç
                </button>
                <button
                  type="button"
                  onClick={copyLink}
                  className="rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-neutral-50"
                >
                  {copied ? "Kopyalandı" : "Bu tasarım linkini kopyala"}
                </button>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
