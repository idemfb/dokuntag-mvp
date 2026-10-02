"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

type SizeOption = "1cm" | "2cm" | "2.5cm" | "3cm" | "4cm" | "5cm" | "6cm" | "custom";
type ShapeOption = "round" | "square" | "drop" | "pebble" | "shield";
type FitMode = "cover" | "contain";
type OutputMode = "qr" | "front" | "both";
type OverlaySide = "off" | "front" | "qr" | "both";
type NfcStyle = "waves" | "text" | "both";
type OverlayAlign = "left" | "center" | "right";
type DesignState = {
  qrGlowSize: number;
  qrGlowOpacity: number;
  qrGlowColor: string;
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
  brandSide: OverlaySide;
  sloganSide: OverlaySide;
  nfcSide: OverlaySide;
  codeSide: OverlaySide;
  brandColor: string;
  sloganColor: string;
  nfcColor: string;
  brandSize: number;
  sloganSize: number;
  nfcSize: number;
  brandX: number;
  brandY: number;
  sloganX: number;
  sloganY: number;
  nfcX: number;
  nfcY: number;
  nfcIconGap: number;
  brandSloganGap: number;
  nfcStyle: NfcStyle;
  brandAlign: OverlayAlign;
  sloganAlign: OverlayAlign;
  nfcAlign: OverlayAlign;
  brandFont: "sans" | "serif" | "mono";
  sloganFont: "sans" | "serif" | "mono";
  outputMode: OutputMode;
  colorMode: "both" | "qr" | "code";
  customWidthCm: number;
  customHeightCm: number;
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
  brandAlign: "center",
  sloganAlign: "center",
  nfcAlign: "center",
  nfcIconGap: 4,
  qrGlowSize: 42,
  qrGlowOpacity: 78,
  qrGlowColor: "#ffffff",
  size: "3cm",
  shape: "pebble",
  hasHole: false,
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
  colorMode: "both",
  brandSide: "off",
  sloganSide: "off",
  nfcSide: "off",
  codeSide: "qr",
  brandColor: "#111111",
  sloganColor: "#111111",
  nfcColor: "#111111",
  brandSize: 100,
  sloganSize: 100,
  nfcSize: 100,
  brandX: 0,
  brandY: 0,
  sloganX: 0,
  sloganY: 0,
  nfcX: 0,
  nfcY: -6,
  customWidthCm: 3,
  customHeightCm: 5.2,
  brandSloganGap: 4,
  nfcStyle: "waves",
  brandFont: "sans",
  sloganFont: "sans"
  
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
  { value: "6cm", label: "6 cm" },
  { value: "custom", label: "Özel ölçü" }
];

function shouldShowOverlay(side: OverlaySide, currentSide: "front" | "qr") {
  return side === "both" || side === currentSide;
}

function getFontClass(font: "sans" | "serif" | "mono") {
  if (font === "serif") return "font-serif";
  if (font === "mono") return "font-mono";
  return "font-sans";
}

function NfcWaveIcon({
  color = "currentColor",
  size = 14
}: {
  color?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 9.5C7.5 11 7.5 13 6 14.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10 6.5C13 9.5 13 14.5 10 17.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 3.5C19 8.5 19 15.5 14 20.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
function hexToRgba(hex: string, opacity: number) {
  const normalized = parseColor(hex, "#ffffff");
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
function getShapeClip(shape: ShapeOption) {
  if (shape === "drop") {
    return "polygon(50% 2%, 78% 20%, 96% 52%, 82% 88%, 50% 100%, 18% 88%, 4% 52%, 22% 20%)";
  }

  if (shape === "pebble") {
    return "polygon(50% 3%, 82% 16%, 98% 48%, 88% 82%, 55% 99%, 18% 90%, 2% 58%, 14% 22%)";
  }

  if (shape === "shield") {
    return "polygon(50% 2%, 92% 18%, 86% 68%, 50% 99%, 14% 68%, 8% 18%)";
  }

  if (shape === "round") return "circle(50% at 50% 50%)";

  return "inset(0 round 18px)";
}

function previewSize(
  size: SizeOption,
  customWidthCm = 3,
  customHeightCm = 5.2
) {
  if (size === "custom") {
    const widthCm = clamp(customWidthCm, 1, 10);
    const heightCm = clamp(customHeightCm, 1, 15);

    const pxPerCm = 60;

    return {
      width: Math.round(widthCm * pxPerCm),
      height: Math.round(heightCm * pxPerCm)
    };
  }

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
    rawShape === "square" ||
    rawShape === "drop" ||
    rawShape === "pebble" ||
    rawShape === "shield"
      ? rawShape
      : "round";

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
  qrScale: parseNumber(params.get("qrScale"), DEFAULT_DESIGN.qrScale, 15, 95),
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
  outputMode: normalizeOutputMode(params.get("outputMode")),
  brandSide:
  params.get("brandSide") === "off" ||
  params.get("brandSide") === "front" ||
  params.get("brandSide") === "qr" ||
  params.get("brandSide") === "both"
    ? (params.get("brandSide") as OverlaySide)
    : DEFAULT_DESIGN.brandSide,
sloganSide:
  params.get("sloganSide") === "off" ||
  params.get("sloganSide") === "front" ||
  params.get("sloganSide") === "qr" ||
  params.get("sloganSide") === "both"
    ? (params.get("sloganSide") as OverlaySide)
    : DEFAULT_DESIGN.sloganSide,
nfcSide:
  params.get("nfcSide") === "off" ||
  params.get("nfcSide") === "front" ||
  params.get("nfcSide") === "qr" ||
  params.get("nfcSide") === "both"
    ? (params.get("nfcSide") as OverlaySide)
    : DEFAULT_DESIGN.nfcSide,
codeSide:
  params.get("codeSide") === "off" ||
  params.get("codeSide") === "front" ||
  params.get("codeSide") === "qr" ||
  params.get("codeSide") === "both"
    ? (params.get("codeSide") as OverlaySide)
    : DEFAULT_DESIGN.codeSide,
    customWidthCm: parseNumber(
  params.get("customWidthCm"),
  DEFAULT_DESIGN.customWidthCm,
  1,
  10
),
customHeightCm: parseNumber(
  params.get("customHeightCm"),
  DEFAULT_DESIGN.customHeightCm,
  1,
  15
),
brandColor: parseColor(params.get("brandColor"), DEFAULT_DESIGN.brandColor),
sloganColor: parseColor(params.get("sloganColor"), DEFAULT_DESIGN.sloganColor),
nfcColor: parseColor(params.get("nfcColor"), DEFAULT_DESIGN.nfcColor),
brandSize: parseNumber(params.get("brandSize"), DEFAULT_DESIGN.brandSize, 60, 300),
sloganSize: parseNumber(params.get("sloganSize"), DEFAULT_DESIGN.sloganSize, 60, 300),
nfcSize: parseNumber(params.get("nfcSize"), DEFAULT_DESIGN.nfcSize, 60, 300),
brandFont:
  params.get("brandFont") === "serif" ||
  params.get("brandFont") === "mono"
    ? (params.get("brandFont") as DesignState["brandFont"])
    : DEFAULT_DESIGN.brandFont,
sloganFont:
  params.get("sloganFont") === "serif" ||
  params.get("sloganFont") === "mono"
    ? (params.get("sloganFont") as DesignState["sloganFont"])
    : DEFAULT_DESIGN.sloganFont,
qrGlowSize: parseNumber(
  params.get("qrGlowSize"),
  DEFAULT_DESIGN.qrGlowSize,
  25,
  70
),
qrGlowOpacity: parseNumber(
  params.get("qrGlowOpacity"),
  DEFAULT_DESIGN.qrGlowOpacity,
  0,
  100
),
qrGlowColor: parseColor(
  params.get("qrGlowColor"),
  DEFAULT_DESIGN.qrGlowColor
),
brandX: parseNumber(params.get("brandX"), DEFAULT_DESIGN.brandX, -60, 60),
brandY: parseNumber(params.get("brandY"), DEFAULT_DESIGN.brandY, -60, 60),
sloganX: parseNumber(params.get("sloganX"), DEFAULT_DESIGN.sloganX, -60, 60),
sloganY: parseNumber(params.get("sloganY"), DEFAULT_DESIGN.sloganY, -60, 60),
nfcX: parseNumber(params.get("nfcX"), DEFAULT_DESIGN.nfcX, -60, 60),
nfcY: parseNumber(params.get("nfcY"), DEFAULT_DESIGN.nfcY, -60, 60),
brandSloganGap: parseNumber(
  params.get("brandSloganGap"),
  DEFAULT_DESIGN.brandSloganGap,
  0,
  16
),
nfcStyle:
  params.get("nfcStyle") === "text" ||
  params.get("nfcStyle") === "both"
    ? (params.get("nfcStyle") as NfcStyle)
    : DEFAULT_DESIGN.nfcStyle,
    nfcIconGap: parseNumber(
  params.get("nfcIconGap"),
  DEFAULT_DESIGN.nfcIconGap,
  0,
  30
),
brandAlign:
  params.get("brandAlign") === "left" ||
  params.get("brandAlign") === "right" ||
  params.get("brandAlign") === "center"
    ? (params.get("brandAlign") as OverlayAlign)
    : DEFAULT_DESIGN.brandAlign,
sloganAlign:
  params.get("sloganAlign") === "left" ||
  params.get("sloganAlign") === "right" ||
  params.get("sloganAlign") === "center"
    ? (params.get("sloganAlign") as OverlayAlign)
    : DEFAULT_DESIGN.sloganAlign,
nfcAlign:
  params.get("nfcAlign") === "left" ||
  params.get("nfcAlign") === "right" ||
  params.get("nfcAlign") === "center"
    ? (params.get("nfcAlign") as OverlayAlign)
    : DEFAULT_DESIGN.nfcAlign
};
}

function buildDesignQuery(design: DesignState) {
  const params = new URLSearchParams();
  params.set("customWidthCm", String(design.customWidthCm));
  params.set("customHeightCm", String(design.customHeightCm));
  params.set("nfcIconGap", String(design.nfcIconGap));
  params.set("brandAlign", design.brandAlign);
  params.set("sloganAlign", design.sloganAlign);
  params.set("nfcAlign", design.nfcAlign);
  params.set("qrGlowSize", String(design.qrGlowSize));
  params.set("qrGlowOpacity", String(design.qrGlowOpacity));
  params.set("qrGlowColor", design.qrGlowColor);
  params.set("qrGlowSize", String(design.qrGlowSize));
  params.set("qrGlowOpacity", String(design.qrGlowOpacity));
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
  params.set("brandSide", design.brandSide);
  params.set("sloganSide", design.sloganSide);
  params.set("nfcSide", design.nfcSide);
  params.set("codeSide", design.codeSide);
  params.set("brandColor", design.brandColor);
  params.set("sloganColor", design.sloganColor);
  params.set("nfcColor", design.nfcColor);
  params.set("brandSize", String(design.brandSize));
  params.set("sloganSize", String(design.sloganSize));
  params.set("nfcSize", String(design.nfcSize));
  params.set("brandFont", design.brandFont);
  params.set("sloganFont", design.sloganFont);
  params.set("brandX", String(design.brandX));
  params.set("brandY", String(design.brandY));
  params.set("sloganX", String(design.sloganX));
  params.set("sloganY", String(design.sloganY));
  params.set("nfcX", String(design.nfcX));
  params.set("nfcY", String(design.nfcY));
  params.set("brandSloganGap", String(design.brandSloganGap));
  params.set("nfcStyle", design.nfcStyle);
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
  id:
  | "template"
  | "front"
  | "measure"
  | "qr"
  | "color"
  | "production"
  | "qrGlow"
  | "code"
  | "brand"
  | "slogan"
  | "nfc";
  openPanel:
  | "template"
  | "front"
  | "measure"
  | "qr"
  | "color"
  | "production"
  | "qrGlow"
  | "code"
  | "brand"
  | "slogan"
  | "nfc"
    | null;
  setOpenPanel: (
  value:
    | "template"
    | "front"
    | "measure"
    | "qr"
    | "color"
    | "production"
    | "qrGlow"
    | "code"
    | "brand"
    | "slogan"
    | "nfc"
    | null
) => void;
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
  | "template"
  | "front"
  | "measure"
  | "qr"
  | "color"
  | "production"
  | "qrGlow"
  | "code"
  | "brand"
  | "slogan"
  | "nfc"
  | null
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

  const previewQrImageUrl = useMemo(() => {
    const params = new URLSearchParams(designQuery);
    params.set("transparent", "true");
    params.set("showGuide", "false");
    return `/api/qr/${code}?${params.toString()}`;
  }, [code, designQuery]);

  const qrDownloadUrl = useMemo(
    () => `/api/qr-download/${code}?${designQuery}`,
    [code, designQuery]
  );

  const qrPageUrl = useMemo(
    () => `${getBaseUrl()}/qr/${code}?${designQuery}`,
    [code, designQuery]
  );

  const frame = previewSize(
  design.size,
  design.customWidthCm,
  design.customHeightCm
);
const scaleFactor =
  design.size === "custom"
    ? Math.max(0.8, Math.min(2.4, frame.width / 240))
    : 1;
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
function centerBrand() {
  setDesign((prev) => ({
    ...prev,
    brandAlign: "center",
    brandX: 0
  }));
}

function centerSlogan() {
  setDesign((prev) => ({
    ...prev,
    sloganAlign: "center",
    sloganX: 0
  }));
}

function centerNfc() {
  setDesign((prev) => ({
    ...prev,
    nfcAlign: "center",
    nfcX: 0
  }));
}
function applyPreset(type: "pet" | "key" | "person") {
  const presets: Record<typeof type, Partial<DesignState>> = {
    pet: {
      size: "3cm",
      shape: "pebble",
      qrScale: 78,
      codeScale: 95,
      codeGap: 70,
      qrOffsetX: 0,
      qrOffsetY: 2,
      foregroundColor: "#111111",
      codeColor: "#111111",
      colorMode: "both",
      showGuide: true,
      outputMode: "both"
    },
    key: {
      size: "3cm",
      shape: "pebble",
      qrScale: 82,
      codeScale: 90,
      codeGap: 55,
      qrOffsetX: 0,
      qrOffsetY: 0,
      foregroundColor: "#111111",
      codeColor: "#111111",
      colorMode: "both",
      showGuide: true,
      outputMode: "both"
    },
    person: {
      size: "3cm",
      shape: "pebble",
      qrScale: 86,
      codeScale: 105,
      codeGap: 60,
      qrOffsetX: 0,
      qrOffsetY: -2,
      foregroundColor: "#111111",
      codeColor: "#111111",
      colorMode: "both",
      showGuide: true,
      outputMode: "both"
    }
  };

  setDesign((prev) => ({
    ...prev,
    ...presets[type]
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

    const safeDesign = {
      ...design,
      codeText: ""
    };

    const payload = {
      items,
      design: safeDesign
    };

    window.sessionStorage.setItem(storageKey, JSON.stringify(items));
    window.sessionStorage.setItem(`${storageKey}:payload`, JSON.stringify(payload));
    window.localStorage.setItem(BATCH_ITEMS_STORAGE_KEY, JSON.stringify(items));
    window.localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify(safeDesign));

    window.open(
      `/admin/batch/print?storageKey=${encodeURIComponent(storageKey)}&outputMode=${safeDesign.outputMode}`,
      "_blank",
      "noopener,noreferrer"
    );
  } catch (err) {
    alert(err instanceof Error ? err.message : "Baskı görünümü açılamadı.");
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
function getAlignStyle(align: OverlayAlign) {
  if (align === "left") {
    return {
      left: "16px",
      right: "16px",
      textAlign: "left" as const,
      transformBase: "translate(0, 0)"
    };
  }

  if (align === "right") {
    return {
      left: "16px",
      right: "16px",
      textAlign: "right" as const,
      transformBase: "translate(0, 0)"
    };
  }

  return {
    left: "16px",
    right: "16px",
    textAlign: "center" as const,
    transformBase: "translate(0, 0)"
  };
}

function renderProductionOverlay(side: "front" | "qr") {
  const showBrand = shouldShowOverlay(design.brandSide, side);
  const showSlogan = shouldShowOverlay(design.sloganSide, side);
  const showNfc = shouldShowOverlay(design.nfcSide, side);
  const showCode = shouldShowOverlay(design.codeSide, side);
  const productCode = design.codeText.trim() || code;

  const brandAlign = getAlignStyle(design.brandAlign);
  const sloganAlign = getAlignStyle(design.sloganAlign);
  const nfcAlign = getAlignStyle(design.nfcAlign);

  return (
    <>
      {showNfc ? (
        <div
          className="absolute top-3 flex items-center text-[10px] font-bold"
style={{
  left: nfcAlign.left,
  right: nfcAlign.right,
  justifyContent:
    design.nfcAlign === "left"
      ? "flex-start"
      : design.nfcAlign === "right"
        ? "flex-end"
        : "center",
        gap: `${design.nfcIconGap}px`,
  color: design.nfcColor,
  fontSize: `${10 * (design.nfcSize / 100) * scaleFactor}px`,
  transform: `${nfcAlign.transformBase} translate(${design.nfcX}px, ${design.nfcY}px)`
}}
        >
          {design.nfcStyle === "text" || design.nfcStyle === "both" ? (
          <span>NFC</span>
        ) : null}

        {design.nfcStyle === "waves" || design.nfcStyle === "both" ? (
          <NfcWaveIcon
            color={design.nfcColor}
            size={Math.round(14 * (design.nfcSize / 100) * scaleFactor)}
          />
        ) : null}
        </div>
      ) : null}

      {showBrand ? (
        <div
          className={`absolute bottom-8 font-extrabold tracking-tight drop-shadow-sm ${getFontClass(
            design.brandFont
          )}`}
          style={{
            left: brandAlign.left,
            right: brandAlign.right,
            color: design.brandColor,
            fontSize: `${11 * (design.brandSize / 100) * scaleFactor}px`,
            textAlign: brandAlign.textAlign,
            transform: `${brandAlign.transformBase} translate(${design.brandX}px, ${design.brandY}px)`
          }}
        >
          dokuntag<span className="align-super text-[0.55em]">®</span>
        </div>
      ) : null}

      {showSlogan ? (
        <div
          className={`absolute font-semibold ${getFontClass(design.sloganFont)}`}
          style={{
            left: sloganAlign.left,
            right: sloganAlign.right,
            bottom: `${24 - design.brandSloganGap}px`,
            color: design.sloganColor,
            fontSize: `${8 * (design.sloganSize / 100) * scaleFactor}px`,
            textAlign: sloganAlign.textAlign,
            transform: `${sloganAlign.transformBase} translate(${design.sloganX}px, ${design.sloganY}px)`
          }}
        >
          bul • buluştur
        </div>
      ) : null}

{showCode && productCode && !design.hideCode ? (
  <div
    className="absolute bottom-2 left-0 right-0 text-center font-bold tracking-wider"
    style={{
      color: design.codeColor,
      fontSize: `${8 * scaleFactor}px`
    }}
  >
    {productCode}
  </div>
) : null}
    </>
  );
}


  const previewFrame = showBoth
    ? {
        width: Math.max(150, Math.round(frame.width * 0.72)),
        height: Math.max(150, Math.round(frame.height * 0.72))
      }
    : frame;

  function renderPreviewFace(side: "front" | "qr") {
    const isFront = side === "front";
    const clipPath =
      design.size === "custom" ? "inset(0 round 18px)" : getShapeClip(design.shape);

    return (
      <div
        className="relative overflow-hidden bg-white shadow-sm"
        style={{
          width: previewFrame.width,
          height: previewFrame.height,
          clipPath
        }}
      >
        {isFront ? (
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
        ) : (
          <>
            {artwork.imageUrl ? (
              <img
                src={artwork.imageUrl}
                alt={artwork.fileName || "QR yüzü"}
                className="absolute left-1/2 top-1/2 h-full w-full"
                style={{
                  objectFit: artwork.fit,
                  transform: `translate(-50%, -50%) translate(${artwork.x}px, ${artwork.y}px) scale(${artwork.scale / 100})`
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-neutral-400">
                Matbaa şablonu / arka plan görseli yükleyin
              </div>
            )}

            {code && design.qrGlowOpacity > 0 ? (
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[1.4rem] blur-md"
                style={{
                  width: `${design.qrGlowSize}%`,
                  height: `${design.qrGlowSize}%`,
                  backgroundColor: hexToRgba(
                    design.qrGlowColor,
                    design.qrGlowOpacity / 100
                  )
                }}
              />
            ) : null}

            {code ? (
              <img
                src={previewQrImageUrl}
                alt={`Dokuntag QR ${code}`}
                className="absolute inset-0 h-full w-full"
              />
            ) : null}
          </>
        )}

        {renderProductionOverlay(side)}

        {design.showGuide ? (
          <div className="pointer-events-none absolute inset-0 border-2 border-dashed border-red-500/80" />
        ) : null}
      </div>
    );
  }
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
              <aside className="space-y-3 lg:sticky lg:top-8 lg:self-start xl:mt-8">                
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

                <div className="mt-4 overflow-auto rounded-3xl bg-white p-3 shadow-inner sm:mt-6 sm:p-6">
                  <div className={`flex min-w-max items-start ${showBoth ? "gap-4" : "justify-center"}`}>
                    {showBoth ? (
                      <>
                        <div className="space-y-2 text-center">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">Ön yüz</p>
                          {renderPreviewFace("front")}
                        </div>
                        <div className="space-y-2 text-center">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">QR yüzü</p>
                          {renderPreviewFace("qr")}
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2 text-center">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                          {showFront ? "Ön yüz" : "QR yüzü"}
                        </p>
                        {renderPreviewFace(showFront ? "front" : "qr")}
                      </div>
                    )}
                  </div>
                </div>
                
            
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

    <SectionCard title="Ölçü ve çıktı" id="measure" openPanel={openPanel} setOpenPanel={setOpenPanel}>
      <label className="block rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
        <span className="text-sm font-medium text-neutral-900">Ölçü</span>
        <select
          value={design.size}
          onChange={(e) => {
  const nextSize = e.target.value as SizeOption;

  setDesign((prev) => ({
    ...prev,
    size: nextSize,
    shape: nextSize === "custom" ? "square" : prev.shape
  }));
}}
          className="mt-3 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
        >
          {SIZE_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        {design.size === "custom" ? (
  <div className="grid gap-3 sm:grid-cols-2">
    <label className="block rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
      <span className="text-sm font-medium text-neutral-900">
        Genişlik / sağ-sol
      </span>
      <input
        type="number"
        step="0.1"
        min="1"
        max="10"
        value={design.customWidthCm}
        onChange={(e) =>
          updateDesign("customWidthCm", Number(e.target.value))
        }
        className="mt-3 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
      />
    </label>

    <label className="block rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
      <span className="text-sm font-medium text-neutral-900">
        Yükseklik / yukarı-aşağı
      </span>
      <input
        type="number"
        step="0.1"
        min="1"
        max="15"
        value={design.customHeightCm}
        onChange={(e) =>
          updateDesign("customHeightCm", Number(e.target.value))
        }
        className="mt-3 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
      />
    </label>
  </div>
) : null}
      </label>

      <label className="block rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
        <span className="text-sm font-medium text-neutral-900">Form</span>
        <select
          value={design.shape}
          onChange={(e) => updateDesign("shape", e.target.value as ShapeOption)}
          className="mt-3 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
        >
        <option value="round">Yuvarlak</option>
        <option value="square">Özel kesim kare</option>
        <option value="drop">Damla</option>
        <option value="pebble">Pebble</option>
        <option value="shield">Shield</option>
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
            <SectionCard title="QR ayarı" id="qr" openPanel={openPanel} setOpenPanel={setOpenPanel}>
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
      <SliderField label="QR büyüklüğü" value={design.qrScale} min={15} max={95} suffix="%" onChange={(value) => updateDesign("qrScale", value)} />
      <SliderField label="Kod boyutu" value={design.codeScale} min={50} max={180} suffix="%" onChange={(value) => updateDesign("codeScale", value)} />
      <SliderField label="QR–kod mesafesi" value={design.codeGap} min={20} max={180} suffix="%" onChange={(value) => updateDesign("codeGap", value)} />
      <SliderField label="QR + kod sağ / sol" value={design.qrOffsetX} min={-45} max={45} onChange={(value) => updateDesign("qrOffsetX", value)} />
      <SliderField label="QR + kod yukarı / aşağı" value={design.qrOffsetY} min={-45} max={45} onChange={(value) => updateDesign("qrOffsetY", value)} />
            <ColorField
  label="QR rengi"
  value={design.foregroundColor}
  onChange={(value) => updateDesign("foregroundColor", value)}
/>

<ColorField
  label="Ürün kodu rengi"
  value={design.codeColor}
  onChange={(value) => updateDesign("codeColor", value)}
/>
<label className="block">
  <span className="mb-2 block text-sm font-medium text-neutral-700">
    Renk modu
  </span>
  <select
    value={design.colorMode}
    onChange={(e) =>
      updateDesign("colorMode", e.target.value as DesignState["colorMode"])
    }
    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
  >
    <option value="both">QR + kod aynı</option>
    <option value="qr">Sadece QR</option>
    <option value="code">Sadece kod</option>
  </select>
</label>
            <button
        type="button"
        onClick={centerQr}
        className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-neutral-50"
      >
        QR + kodu tam ortala
      </button>
    </SectionCard>
          <SectionCard title="QR arkası" id="qrGlow" openPanel={openPanel} setOpenPanel={setOpenPanel}>
  <SliderField
    label="QR arkası alan"
    value={design.qrGlowSize}
    min={15}
    max={70}
    suffix="%"
    onChange={(value) => updateDesign("qrGlowSize", value)}
  />

  <SliderField
    label="QR arkası görünürlük"
    value={design.qrGlowOpacity}
    min={0}
    max={100}
    suffix="%"
    onChange={(value) => updateDesign("qrGlowOpacity", value)}
  />

  <ColorField
    label="QR arkası rengi"
    value={design.qrGlowColor}
    onChange={(value) => updateDesign("qrGlowColor", value)}
  />
</SectionCard>
  </div>

  <div className="space-y-4">



<SectionCard title="Ürün kodu" id="code" openPanel={openPanel} setOpenPanel={setOpenPanel}>
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
    QR içindeki ürün kodunu gizle
  </label>

  <label className="block">
    <span className="mb-2 block text-sm font-medium text-neutral-700">
      Production kod katmanı
    </span>
    <select
      value={design.codeSide}
      onChange={(e) => updateDesign("codeSide", e.target.value as OverlaySide)}
      className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
    >
      <option value="off">Kapalı</option>
      <option value="front">Ön yüzde</option>
      <option value="qr">QR yüzünde</option>
      <option value="both">İki yüzde</option>
    </select>
  </label>

  <SliderField
    label="Kod boyutu"
    value={design.codeScale}
    min={50}
    max={180}
    suffix="%"
    onChange={(value) => updateDesign("codeScale", value)}
  />

  <SliderField
    label="QR–kod mesafesi"
    value={design.codeGap}
    min={20}
    max={180}
    suffix="%"
    onChange={(value) => updateDesign("codeGap", value)}
  />
</SectionCard>
<SectionCard title="Marka" id="brand" openPanel={openPanel} setOpenPanel={setOpenPanel}>
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-neutral-700">Dokuntag® marka</span>
    <select
      value={design.brandSide}
      onChange={(e) => updateDesign("brandSide", e.target.value as OverlaySide)}
      className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
    >
      <option value="off">Kapalı</option>
      <option value="front">Ön yüzde</option>
      <option value="qr">QR yüzünde</option>
      <option value="both">İki yüzde</option>
    </select>
  </label>
      
  <ColorField label="Marka rengi" value={design.brandColor} onChange={(value) => updateDesign("brandColor", value)} />
  <SliderField label="Marka boyutu" value={design.brandSize} min={60} max={300} onChange={(value) => updateDesign("brandSize", value)} />
  <SliderField label="Marka sağ / sol" value={design.brandX} min={-60} max={60} onChange={(value) => updateDesign("brandX", value)} />
  <SliderField label="Marka yukarı / aşağı" value={design.brandY} min={-60} max={60} onChange={(value) => updateDesign("brandY", value)} />
<button
  type="button"
  onClick={centerBrand}
  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-neutral-50"
>
  Markayı ortala
</button>
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-neutral-700">Marka hizalama</span>
    <select
      value={design.brandAlign}
      onChange={(e) => updateDesign("brandAlign", e.target.value as OverlayAlign)}
      className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
    >
      <option value="left">Sol</option>
      <option value="center">Orta</option>
      <option value="right">Sağ</option>
    </select>
  </label>

  <label className="block">
    <span className="mb-2 block text-sm font-medium text-neutral-700">Marka fontu</span>
    <select
      value={design.brandFont}
      onChange={(e) => updateDesign("brandFont", e.target.value as DesignState["brandFont"])}
      className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
    >
      <option value="sans">Modern</option>
      <option value="serif">Klasik</option>
      <option value="mono">Teknik</option>
    </select>
  </label>
</SectionCard>
<SectionCard title="Slogan" id="slogan" openPanel={openPanel} setOpenPanel={setOpenPanel}>
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-neutral-700">Slogan</span>
    <select
      value={design.sloganSide}
      onChange={(e) => updateDesign("sloganSide", e.target.value as OverlaySide)}
      className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
    >
      <option value="off">Kapalı</option>
      <option value="front">Ön yüzde</option>
      <option value="qr">QR yüzünde</option>
      <option value="both">İki yüzde</option>
    </select>
  </label>

  <ColorField label="Slogan rengi" value={design.sloganColor} onChange={(value) => updateDesign("sloganColor", value)} />
  <SliderField label="Slogan boyutu" value={design.sloganSize} min={60} max={300} onChange={(value) => updateDesign("sloganSize", value)} />
  <button
  type="button"
  onClick={centerSlogan}
  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-neutral-50"
>
  Sloganı ortala
</button>
  <SliderField label="Slogan sağ / sol" value={design.sloganX} min={-60} max={60} onChange={(value) => updateDesign("sloganX", value)} />
    <SliderField label="Slogan yukarı / aşağı" value={design.sloganY} min={-60} max={60} onChange={(value) => updateDesign("sloganY", value)} />
  <SliderField label="Marka / slogan mesafesi" value={design.brandSloganGap} min={0} max={16} suffix="px" onChange={(value) => updateDesign("brandSloganGap", value)} />

  <label className="block">
    <span className="mb-2 block text-sm font-medium text-neutral-700">Slogan hizalama</span>
    <select
      value={design.sloganAlign}
      onChange={(e) => updateDesign("sloganAlign", e.target.value as OverlayAlign)}
      className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
    >
      <option value="left">Sol</option>
      <option value="center">Orta</option>
      <option value="right">Sağ</option>
    </select>
  </label>

  <label className="block">
    <span className="mb-2 block text-sm font-medium text-neutral-700">Slogan fontu</span>
    <select
      value={design.sloganFont}
      onChange={(e) => updateDesign("sloganFont", e.target.value as DesignState["sloganFont"])}
      className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
    >
      <option value="sans">Modern</option>
      <option value="serif">Klasik</option>
      <option value="mono">Teknik</option>
    </select>
  </label>
</SectionCard>
<SectionCard title="NFC" id="nfc" openPanel={openPanel} setOpenPanel={setOpenPanel}>
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-neutral-700">NFC simgesi</span>
    <select
      value={design.nfcSide}
      onChange={(e) => updateDesign("nfcSide", e.target.value as OverlaySide)}
      className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
    >
      <option value="off">Kapalı</option>
      <option value="front">Ön yüzde</option>
      <option value="qr">QR yüzünde</option>
      <option value="both">İki yüzde</option>
    </select>
  </label>

  <label className="block">
    <span className="mb-2 block text-sm font-medium text-neutral-700">NFC görünümü</span>
    <select
      value={design.nfcStyle}
      onChange={(e) => updateDesign("nfcStyle", e.target.value as NfcStyle)}
      className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
    >
      <option value="waves">Sadece yay simgesi</option>
      <option value="text">Sadece NFC yazısı</option>
      <option value="both">NFC + yay simgesi</option>
    </select>
  </label>

  <ColorField label="NFC rengi" value={design.nfcColor} onChange={(value) => updateDesign("nfcColor", value)} />

  <SliderField label="NFC boyutu" value={design.nfcSize} min={60} max={300} onChange={(value) => updateDesign("nfcSize", value)} />
  <SliderField
  label="NFC yazı / yay mesafesi"
  value={design.nfcIconGap}
  min={0}
  max={30}
  suffix="px"
  onChange={(value) => updateDesign("nfcIconGap", value)}
/>
<button
  type="button"
  onClick={centerNfc}
  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-neutral-50"
>
  NFC’yi ortala
</button>
  <SliderField label="NFC sağ / sol" value={design.nfcX} min={-60} max={60} onChange={(value) => updateDesign("nfcX", value)} />
  <SliderField label="NFC yukarı / aşağı" value={design.nfcY} min={-60} max={60} onChange={(value) => updateDesign("nfcY", value)} />

  <label className="block">
    <span className="mb-2 block text-sm font-medium text-neutral-700">NFC hizalama</span>
    <select
      value={design.nfcAlign}
      onChange={(e) => updateDesign("nfcAlign", e.target.value as OverlayAlign)}
      className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
    >
      <option value="left">Sol</option>
      <option value="center">Orta</option>
      <option value="right">Sağ</option>
    </select>
  </label>
</SectionCard>
  </div>
</div>
          </div>
        </section>
      </div>
    </main>
  );
}