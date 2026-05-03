"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

type SizeOption = "1cm" | "2cm" | "2.5cm" | "3cm" | "4cm" | "5cm" | "6cm";
type ShapeOption = "round" | "square" | "drop";
type FitMode = "cover" | "contain";
type OutputMode = "qr" | "front" | "both";

type DesignState = {
  size: SizeOption;
  shape: ShapeOption;
  hasHole: boolean;
  codeText: string;
  hideCode: boolean;
  qrScale: number;
  codeScale: number;
  codeGap: number;
  qrOffsetX: number;
  qrOffsetY: number;
  foregroundColor: string;
  codeColor: string;
  guideColor: string;
  showGuide: boolean;
  outputMode: OutputMode;
  colorMode: "both" | "qr" | "code";
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

const TEMPLATE_STORAGE_KEY = "dokuntag_template_artwork";
const FRONT_ARTWORK_STORAGE_KEY = "dokuntag_front_artwork_v2";
const LEGACY_TEMPLATE_STORAGE_KEY = "dokuntag_front_artwork";
const DESIGN_STORAGE_KEY = "dokuntag_qr_design";
const BATCH_ITEMS_STORAGE_KEY = "dokuntag_batch_items";

const DEFAULT_DESIGN: DesignState = {
  size: "3cm",
  shape: "round",
  hasHole: true,
  codeText: "",
  hideCode: false,
  qrScale: 80,
  codeScale: 100,
  codeGap: 100,
  qrOffsetX: 0,
  qrOffsetY: 0,
  foregroundColor: "#111111",
  codeColor: "#111111",
  guideColor: "#ef4444",
  showGuide: true,
  outputMode: "both",
  colorMode: "both"
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
  if (shape === "drop") {
    return "polygon(50% 2%, 78% 20%, 96% 52%, 82% 88%, 50% 100%, 18% 88%, 4% 52%, 22% 20%)";
  }

  if (shape === "round") return "circle(50% at 50% 50%)";

  return "inset(0 round 18px)";
}

function previewSize(size: SizeOption) {
  if (size === "1cm") return { width: 140, height: 140 };
  if (size === "2cm") return { width: 170, height: 170 };
  if (size === "2.5cm") return { width: 200, height: 200 };
  if (size === "4cm") return { width: 260, height: 260 };
  if (size === "5cm") return { width: 280, height: 280 };
  if (size === "6cm") return { width: 300, height: 300 };
  return { width: 240, height: 240 };
}

function normalizeOutputMode(value: string | null): OutputMode {
  if (value === "qr" || value === "front" || value === "both") return value;
  if (value === "template") return "qr";
  return DEFAULT_DESIGN.outputMode;
}

function readDesignFromUrl(params: URLSearchParams): DesignState {
  const rawSize = params.get("size");

  const size = SIZE_OPTIONS.some((item) => item.value === rawSize)
    ? (rawSize as SizeOption)
    : DEFAULT_DESIGN.size;

  const rawShape = params.get("shape");
  const shape: ShapeOption =
    rawShape === "square" ? "square" : rawShape === "drop" ? "drop" : "round";

  const foregroundColor = parseColor(
    params.get("foregroundColor"),
    DEFAULT_DESIGN.foregroundColor
  );

  return {
    ...DEFAULT_DESIGN,
    size,
    shape,
    hasHole: params.get("hasHole") === "false" ? false : true,
    codeText: String(params.get("codeText") ?? DEFAULT_DESIGN.codeText).slice(0, 20),
    hideCode: params.get("hideCode") === "true",
    qrScale: parseNumber(params.get("qrScale"), DEFAULT_DESIGN.qrScale, 35, 95),
    codeScale: parseNumber(params.get("codeScale"), DEFAULT_DESIGN.codeScale, 50, 180),
    codeGap: parseNumber(params.get("codeGap"), DEFAULT_DESIGN.codeGap, 20, 180),
    qrOffsetX: parseNumber(params.get("qrOffsetX"), DEFAULT_DESIGN.qrOffsetX, -45, 45),
    qrOffsetY: parseNumber(params.get("qrOffsetY"), DEFAULT_DESIGN.qrOffsetY, -45, 45),
    foregroundColor,
    codeColor: parseColor(params.get("codeColor"), foregroundColor),
    guideColor: parseColor(params.get("guideColor"), DEFAULT_DESIGN.guideColor),
    showGuide: params.get("showGuide") === "false" ? false : true,
    colorMode:
      params.get("colorMode") === "qr" ||
      params.get("colorMode") === "code" ||
      params.get("colorMode") === "both"
        ? (params.get("colorMode") as DesignState["colorMode"])
        : "both",
    outputMode: normalizeOutputMode(params.get("outputMode"))
  };
}

function buildDesignQuery(design: DesignState) {
  const params = new URLSearchParams();

  params.set("size", design.size);
  params.set("shape", design.shape);
  params.set("hasHole", design.hasHole ? "true" : "false");
  params.set("codeText", design.codeText);
  params.set("hideCode", design.hideCode ? "true" : "false");
  params.set("qrScale", String(design.qrScale));
  params.set("codeScale", String(design.codeScale));
  params.set("codeGap", String(design.codeGap));
  params.set("qrOffsetX", String(design.qrOffsetX));
  params.set("qrOffsetY", String(design.qrOffsetY));
  params.set("foregroundColor", design.foregroundColor);
  params.set("codeColor", design.codeColor);
  params.set("colorMode", design.colorMode);
  params.set("guideColor", design.guideColor);
  params.set("showGuide", design.showGuide ? "true" : "false");
  params.set("outputMode", design.outputMode);
  params.set("designType", "tag");

  return params.toString();
}

function tryParseJson<T>(value: string | null): T | null {
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function readSavedArtwork() {
  if (typeof window === "undefined") return DEFAULT_ARTWORK;

  const current = tryParseJson<Partial<ArtworkState>>(
    window.localStorage.getItem(TEMPLATE_STORAGE_KEY)
  );

  if (current) {
    return { ...DEFAULT_ARTWORK, ...current };
  }

  const legacy = tryParseJson<Partial<ArtworkState>>(
    window.localStorage.getItem(LEGACY_TEMPLATE_STORAGE_KEY)
  );

  if (legacy) {
    return { ...DEFAULT_ARTWORK, ...legacy };
  }

  return DEFAULT_ARTWORK;
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
          {value}
          {suffix || ""}
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

function ColorField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
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

function SectionCard({
  title,
  id,
  openPanel,
  setOpenPanel,
  children
}: {
  title: string;
  id: "template" | "front" | "measure" | "qr" | "color";
  openPanel: "template" | "front" | "measure" | "qr" | "color" | null;
  setOpenPanel: (value: "template" | "front" | "measure" | "qr" | "color" | null) => void;
  children: ReactNode;
}) {
  const isOpen = openPanel === id;

  return (
    <section className="rounded-[1.5rem] border border-neutral-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpenPanel(isOpen ? null : id)}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
      >
        <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
        <span className="text-xs font-semibold text-neutral-400">
          {isOpen ? "Açık" : "Aç"}
        </span>
      </button>

      {isOpen ? (
        <div className="space-y-3 border-t border-neutral-100 p-4">{children}</div>
      ) : null}
    </section>
  );
}

export default function QrPage() {
  const [code, setCode] = useState("");
  const [design, setDesign] = useState<DesignState>(DEFAULT_DESIGN);
  const [artwork, setArtwork] = useState<ArtworkState>(DEFAULT_ARTWORK);
  const [frontArtwork, setFrontArtwork] = useState<ArtworkState>(DEFAULT_ARTWORK);
  const [copied, setCopied] = useState(false);
  const [openPanel, setOpenPanel] = useState<
  "template" | "front" | "measure" | "qr" | "color" | null
  >("template");

  useEffect(() => {
    const parts = window.location.pathname.split("/");
    const codeFromUrl = parts[parts.length - 1];
    const params = new URLSearchParams(window.location.search);

    setCode(codeFromUrl?.toUpperCase() || "");
    setDesign(readDesignFromUrl(params));
    setArtwork(readSavedArtwork());
    const savedFront = tryParseJson<Partial<ArtworkState>>(
  window.localStorage.getItem(FRONT_ARTWORK_STORAGE_KEY)
);

setFrontArtwork(savedFront ? { ...DEFAULT_ARTWORK, ...savedFront } : DEFAULT_ARTWORK);
  }, []);

  useEffect(() => {
    if (!code) return;

    const next = `${window.location.pathname}?${buildDesignQuery(design)}`;
    window.history.replaceState(null, "", next);

    try {
      window.localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify(design));
    } catch {}
  }, [code, design]);

  useEffect(() => {
    try {
      window.localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(artwork));
    } catch {}
  }, [artwork]);
  useEffect(() => {
  try {
    window.localStorage.setItem(FRONT_ARTWORK_STORAGE_KEY, JSON.stringify(frontArtwork));
  } catch {}
}, [frontArtwork]);

  const designQuery = useMemo(() => buildDesignQuery(design), [design]);

  const qrImageUrl = useMemo(
    () => `/api/qr/${code}?${designQuery}`,
    [code, designQuery]
  );

  const transparentQrImageUrl = useMemo(
    () => `/api/qr/${code}?${designQuery}&transparent=true`,
    [code, designQuery]
  );

  const qrDownloadUrl = useMemo(
    () => `/api/qr-download/${code}?${designQuery}`,
    [code, designQuery]
  );

  const qrPageUrl = useMemo(
    () => `${getBaseUrl()}/qr/${code}?${designQuery}`,
    [code, designQuery]
  );

  const frame = previewSize(design.size);
  const displayCode = design.codeText.trim() || code;
  const showQr = design.outputMode === "qr" || design.outputMode === "both";
  const showFront = design.outputMode === "front";
  const showBoth = design.outputMode === "both";

  const updateDesign = <K extends keyof DesignState>(key: K, value: DesignState[K]) => {
    setDesign((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "foregroundColor" && prev.colorMode === "both") {
        next.codeColor = value as string;
      }

      if (key === "codeColor" && prev.colorMode === "both") {
        next.foregroundColor = value as string;
      }

      return next;
    });
  };

  const updateArtwork = <K extends keyof ArtworkState>(key: K, value: ArtworkState[K]) => {
    setArtwork((prev) => ({ ...prev, [key]: value }));
  };
  const updateFrontArtwork = <K extends keyof ArtworkState>(
  key: K,
  value: ArtworkState[K]
) => {
  setFrontArtwork((prev) => ({ ...prev, [key]: value }));
};

function centerFrontArtwork() {
  setFrontArtwork((prev) => ({
    ...prev,
    x: 0,
    y: 0,
    scale: 100
  }));
}

function clearFrontArtwork() {
  setFrontArtwork(DEFAULT_ARTWORK);

  try {
    window.localStorage.removeItem(FRONT_ARTWORK_STORAGE_KEY);
  } catch {}
}

function handleFrontArtworkUpload(file: File | undefined) {
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Lütfen PNG veya JPG görsel yükleyin.");
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert("Ön yüz görseli en fazla 2 MB olmalı.");
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    updateFrontArtwork("imageUrl", String(reader.result || ""));
    updateFrontArtwork("fileName", file.name);
  };

  reader.readAsDataURL(file);
}
  function centerQr() {
  setDesign((prev) => ({
    ...prev,
    qrOffsetX: 0,
    qrOffsetY: 0
  }));
}

function snapQr(position: "center" | "top" | "bottom" | "left" | "right") {
  setDesign((prev) => {
    const qrRatio = (prev.qrScale || 76) / 100;
    const codeRatio = (prev.codeScale || 100) / 100;

    const groupHeight = qrRatio + 0.25 * codeRatio;
    const groupWidth = qrRatio;

    const maxY = Math.max(0, (1 - groupHeight) / 2) * 100;
    const maxX = Math.max(0, (1 - groupWidth) / 2) * 100;

    const preset = {
      center: { x: 0, y: 0 },
      top: { x: 0, y: -maxY },
      bottom: { x: 0, y: maxY },
      left: { x: -maxX, y: 0 },
      right: { x: maxX, y: 0 }
    }[position];

    return {
      ...prev,
      qrOffsetX: preset.x,
      qrOffsetY: preset.y
    };
  });
}

 function centerArtwork() {
  setArtwork((prev) => ({
    ...prev,
    x: 0,
    y: 0,
    scale: 100
  }));
}

  function handleArtworkUpload(file: File | undefined) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Lütfen PNG veya JPG görsel yükleyin.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Şablon görseli en fazla 2 MB olmalı. Daha küçük PNG/JPG yükleyin.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      updateArtwork("imageUrl", String(reader.result || ""));
      updateArtwork("fileName", file.name);
    };

    reader.readAsDataURL(file);
  }

  function clearArtwork() {
    setArtwork(DEFAULT_ARTWORK);

    try {
      window.localStorage.removeItem(TEMPLATE_STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_TEMPLATE_STORAGE_KEY);
    } catch {}
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
      const savedItems = tryParseJson<Array<{ code: string; label?: string }>>(
        window.localStorage.getItem(BATCH_ITEMS_STORAGE_KEY)
      );

      const items = Array.isArray(savedItems) && savedItems.length ? savedItems : [{ code }];

      window.sessionStorage.setItem(storageKey, JSON.stringify(items));
      window.sessionStorage.setItem(
        `${storageKey}:payload`,
        JSON.stringify({
          items,
          design,
          templateArtwork: artwork,
          frontArtwork
        })
      );
      window.localStorage.setItem(BATCH_ITEMS_STORAGE_KEY, JSON.stringify(items));
      window.localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify(design));
      window.localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(artwork));
      window.localStorage.setItem(FRONT_ARTWORK_STORAGE_KEY, JSON.stringify(frontArtwork));
      window.open(
        `/admin/batch/print?storageKey=${encodeURIComponent(storageKey)}&outputMode=${design.outputMode}`,
        "_blank",
        "noopener,noreferrer"
      );
    } catch {
      window.open(`/admin/batch/print?outputMode=${design.outputMode}`, "_blank");
    }
  }

  const templateLayer = artwork.imageUrl ? (
    <img
      src={artwork.imageUrl}
      alt={artwork.fileName || "Template"}
      className="absolute left-1/2 top-1/2 h-full w-full"
      style={{
        objectFit: artwork.fit,
        transform: `translate(-50%, -50%) translate(${artwork.x}px, ${artwork.y}px) scale(${artwork.scale / 100})`
      }}
    />
  ) : null;

  const templateEmptyState = !artwork.imageUrl ? (
    <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-neutral-400">
      Matbaa şablonu / arka plan görseli yükleyin
    </div>
  ) : null;

  return (
    <main className="min-h-screen bg-neutral-50 px-3 py-4 pb-28 text-neutral-900 sm:px-4 sm:py-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-neutral-100/80 px-5 py-5">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Dokuntag</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              QR baskı ve template
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
              QR ve kod tek grup gibi hareket eder. Şablon görseli arka plan olarak
              saklanır; baskı ve PDF adımında aynı ayarlar kullanılır.
            </p>
          </div>

          <div className="grid gap-4 p-3 sm:p-5 xl:grid-cols-[minmax(420px,520px)_1fr]">
            <aside className="space-y-3 xl:sticky xl:top-5 xl:self-start xl:mt-8">
              <section className="rounded-[1.6rem] border border-neutral-200 bg-gradient-to-b from-white to-neutral-100 p-4 shadow-md sm:rounded-[2rem] sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                      Canlı prova
                    </p>
                    <h2 className="mt-1 text-lg font-semibold tracking-tight text-neutral-900">
                      {design.outputMode === "qr"
                      ? "QR yüzü"
                      : design.outputMode === "front"
                        ? "Ön yüz"
                        : "Ön + QR"}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={centerQr}
                    className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold transition hover:bg-neutral-50"
                  >
                    QR ortala
                  </button>
                </div>

                <div className="mt-4 flex justify-center overflow-auto rounded-3xl bg-white p-3 shadow-inner sm:mt-6 sm:p-6">
                  <div
                    className="relative overflow-hidden bg-white shadow-sm"
                    style={{
                      width: frame.width,
                      height: frame.height,
                      clipPath: getShapeClip(design.shape)
                    }}
                  >
                    {showFront ? (
  frontArtwork.imageUrl ? (
    <img
      src={frontArtwork.imageUrl}
      alt={frontArtwork.fileName || "Ön yüz"}
      className="absolute left-1/2 top-1/2 h-full w-full"
      style={{
        objectFit: frontArtwork.fit,
        transform: `translate(-50%, -50%) translate(${frontArtwork.x}px, ${frontArtwork.y}px) scale(${frontArtwork.scale / 100})`
      }}
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-neutral-400">
      Ön yüz görseli yükleyin
    </div>
  )
) : null}

{showQr ? templateLayer : null}
{showQr ? templateEmptyState : null}

{showQr && code ? (
  <img
    src={transparentQrImageUrl}
                        alt={`Dokuntag QR ${code}`}
                        className="absolute inset-0 h-full w-full"
                      />
                    ) : null}

                    {design.showGuide ? (
                      <div className="pointer-events-none absolute inset-0 border-2 border-dashed border-red-500/80" />
                    ) : null}
                  </div>
                </div>
                
                {frontArtwork.imageUrl || artwork.imageUrl ? (
  <div className="mt-4 rounded-3xl border border-neutral-200 bg-white p-4">
    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
      Ön + QR yan yana prova
    </p>

    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <p className="text-center text-xs font-semibold text-neutral-500">Ön yüz</p>
        <div className="flex justify-center rounded-2xl bg-neutral-50 p-4">
          <div
            className="relative overflow-hidden bg-white shadow-sm"
            style={{
              width: Math.min(frame.width, 180),
              height: Math.min(frame.height, 180),
              clipPath: getShapeClip(design.shape)
            }}
          >
            {frontArtwork.imageUrl ? (
              <img
                src={frontArtwork.imageUrl}
                alt={frontArtwork.fileName || "Ön yüz"}
                className="absolute left-1/2 top-1/2 h-full w-full"
                style={{
                  objectFit: frontArtwork.fit,
                  transform: `translate(-50%, -50%) translate(${frontArtwork.x}px, ${frontArtwork.y}px) scale(${frontArtwork.scale / 100})`
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs text-neutral-400">
                Ön yüz yok
              </div>
            )}
          </div>
        </div>
      </div>

          <div className="space-y-2">
            <p className="text-center text-xs font-semibold text-neutral-500">QR yüzü</p>
            <div className="flex justify-center rounded-2xl bg-neutral-50 p-4">
              <div
                className="relative overflow-hidden bg-white shadow-sm"
                style={{
                  width: Math.min(frame.width, 180),
                  height: Math.min(frame.height, 180),
                  clipPath: getShapeClip(design.shape)
                }}
              >
                {templateLayer}
                {code ? (
                  <img
                    src={transparentQrImageUrl}
                    alt={`Dokuntag QR ${code}`}
                    className="absolute inset-0 h-full w-full"
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : null}
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => updateDesign("outputMode", "qr")}
                    className={`rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
                      design.outputMode === "qr"
                        ? "border-black bg-black text-white"
                        : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    Sadece QR
                  </button>
                  <button
                      type="button"
                      onClick={() => updateDesign("outputMode", "front")}
                      className={`rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
                        design.outputMode === "front"
                          ? "border-black bg-black text-white"
                          : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      Ön yüz
                    </button>

                  <button
                    type="button"
                    onClick={() => updateDesign("outputMode", "both")}
                    className={`rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
                      design.outputMode === "both"
                        ? "border-black bg-black text-white"
                        : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    Her ikisi
                  </button>
                </div>
              </section>
              {showQr ? (
               <div className="mt-3 grid gap-2 sm:grid-cols-5">
                <button type="button" onClick={() => snapQr("center")} className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold">
                  Ortala
                </button>
                <button type="button" onClick={() => snapQr("top")} className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold">
                  Yukarı
                </button>
                <button type="button" onClick={() => snapQr("bottom")} className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold">
                  Aşağı
                </button>
                <button type="button" onClick={() => snapQr("left")} className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold">
                  Sol
                </button>
                <button type="button" onClick={() => snapQr("right")} className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold">
                  Sağ
                </button>
              </div>     
              ) : null}  
              <section className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-1 gap-2 rounded-[1.5rem] border border-neutral-200 bg-white/95 p-3 shadow-2xl backdrop-blur sm:static sm:flex sm:flex-wrap sm:shadow-sm sm:backdrop-blur-0">
                <a
                  href={qrDownloadUrl}
                  className="rounded-2xl bg-black px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  SVG indir
                </a>

                <button
                  type="button"
                  onClick={openPrintView}
                  className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-center text-sm font-semibold transition hover:bg-neutral-50"
                >
                  Baskı görünümünü aç
                </button>

                <button
                  type="button"
                  onClick={copyLink}
                  className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-center text-sm font-semibold transition hover:bg-neutral-50"
                >
                  {copied ? "Kopyalandı" : "Tasarım linkini kopyala"}
                </button>
              </section>
            </aside>
<div className="grid gap-4 lg:grid-cols-2">
  <div className="space-y-4">
    <SectionCard title="QR yüzü şablonu" id="template" openPanel={openPanel} setOpenPanel={setOpenPanel}>
      <label className="block rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
        <span className="text-sm font-medium text-neutral-900">Şablon görseli yükle</span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={(e) => handleArtworkUpload(e.target.files?.[0])}
          className="mt-3 w-full text-sm"
        />
        <p className="mt-2 text-xs leading-5 text-neutral-500">
          PNG/JPG önerilir. PDF için 2 MB altında kullan.
        </p>
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

      <SliderField label="Şablon boyutu" value={artwork.scale} min={50} max={180} suffix="%" onChange={(value) => updateArtwork("scale", value)} />
      <SliderField label="Şablon sağ / sol" value={artwork.x} min={-80} max={80} onChange={(value) => updateArtwork("x", value)} />
      <SliderField label="Şablon yukarı / aşağı" value={artwork.y} min={-80} max={80} onChange={(value) => updateArtwork("y", value)} />

      <div className="grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={centerArtwork} className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-neutral-50">
          Şablonu ortala
        </button>

        <button type="button" onClick={clearArtwork} className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-neutral-50">
          Şablonu temizle
        </button>
      </div>
    </SectionCard>

              <SectionCard title="Ön yüz görseli" id="front" openPanel={openPanel} setOpenPanel={setOpenPanel}>
  <label className="block rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
    <span className="text-sm font-medium text-neutral-900">Ön yüz görseli yükle</span>
    <input
      type="file"
      accept="image/png,image/jpeg,image/jpg,image/webp"
      onChange={(e) => handleFrontArtworkUpload(e.target.files?.[0])}
      className="mt-3 w-full text-sm"
    />
    <p className="mt-2 text-xs leading-5 text-neutral-500">
      Karakter, logo veya tasarım yüzü için kullanılır.
    </p>
  </label>

  <label className="block rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
    <span className="text-sm font-medium text-neutral-900">Sığdırma</span>
    <select
      value={frontArtwork.fit}
      onChange={(e) => updateFrontArtwork("fit", e.target.value as FitMode)}
      className="mt-3 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
    >
      <option value="cover">Doldur</option>
      <option value="contain">Tamamı görünsün</option>
    </select>
  </label>

  <SliderField label="Ön yüz boyutu" value={frontArtwork.scale} min={50} max={180} suffix="%" onChange={(value) => updateFrontArtwork("scale", value)} />
  <SliderField label="Ön yüz sağ / sol" value={frontArtwork.x} min={-80} max={80} onChange={(value) => updateFrontArtwork("x", value)} />
  <SliderField label="Ön yüz yukarı / aşağı" value={frontArtwork.y} min={-80} max={80} onChange={(value) => updateFrontArtwork("y", value)} />

  <div className="grid gap-2 sm:grid-cols-2">
    <button type="button" onClick={centerFrontArtwork} className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-neutral-50">
      Ön yüzü ortala
    </button>

    <button type="button" onClick={clearFrontArtwork} className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-neutral-50">
      Ön yüzü temizle
    </button>
  </div>
</SectionCard>
    <SectionCard title="Renk" id="color" openPanel={openPanel} setOpenPanel={setOpenPanel}>
      <label className="block rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
        <span className="text-sm font-medium text-neutral-900">Renk modu</span>
        <select
          value={design.colorMode}
          onChange={(e) => {
            const mode = e.target.value as DesignState["colorMode"];
            setDesign((prev) => ({
              ...prev,
              colorMode: mode,
              codeColor: mode === "both" ? prev.foregroundColor : prev.codeColor
            }));
          }}
          className="mt-3 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
        >
          <option value="both">QR + kod birlikte</option>
          <option value="qr">Sadece QR</option>
          <option value="code">Sadece kod</option>
        </select>
      </label>

      {design.colorMode === "both" || design.colorMode === "qr" ? (
        <ColorField
          label={design.colorMode === "both" ? "QR + kod rengi" : "QR rengi"}
          value={design.foregroundColor}
          onChange={(value) => updateDesign("foregroundColor", value)}
        />
      ) : null}

      {design.colorMode === "code" ? (
        <ColorField
          label="Kod rengi"
          value={design.codeColor}
          onChange={(value) => updateDesign("codeColor", value)}
        />
      ) : null}
    </SectionCard>
    <SectionCard title="Ölçü ve çıktı" id="measure" openPanel={openPanel} setOpenPanel={setOpenPanel}>
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
          <option value="drop">Damla / Şablon</option>
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
        <SectionCard title="QR ve kod ayarı" id="qr" openPanel={openPanel} setOpenPanel={setOpenPanel}>
      <label className="block rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
        <span className="text-sm font-medium text-neutral-900">Ürün kodu</span>
        <input
          value={design.codeText || displayCode}
          onChange={(e) =>
            updateDesign(
              "codeText",
              e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20)
            )
          }
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

      <SliderField label="QR büyüklüğü" value={design.qrScale} min={35} max={95} suffix="%" onChange={(value) => updateDesign("qrScale", value)} />
      <SliderField label="Kod boyutu" value={design.codeScale} min={50} max={180} suffix="%" onChange={(value) => updateDesign("codeScale", value)} />
      <SliderField label="QR–kod mesafesi" value={design.codeGap} min={20} max={180} suffix="%" onChange={(value) => updateDesign("codeGap", value)} />
      <SliderField label="QR + kod sağ / sol" value={design.qrOffsetX} min={-45} max={45} onChange={(value) => updateDesign("qrOffsetX", value)} />
      <SliderField label="QR + kod yukarı / aşağı" value={design.qrOffsetY} min={-45} max={45} onChange={(value) => updateDesign("qrOffsetY", value)} />

            <button
        type="button"
        onClick={centerQr}
        className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-neutral-50"
      >
        QR + kodu tam ortala
      </button>
    </SectionCard>
  </div>
</div>
          </div>
        </section>
      </div>
    </main>
  );
}