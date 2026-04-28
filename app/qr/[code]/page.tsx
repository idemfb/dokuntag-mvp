"use client";

import { useEffect, useMemo, useState } from "react";

type SizeOption = "2.5cm" | "3cm" | "4cm";
type ShapeOption = "round" | "square" | "drop";
type FontWeightOption = "500" | "600" | "700" | "800";
type FontStyleOption = "normal" | "italic";
type AlignOption = "left" | "center" | "right";
type FitMode = "cover" | "contain";
type TabKey = "general" | "front" | "back" | "qr" | "output";

type DesignState = {
  size: SizeOption;
  shape: ShapeOption;
  hasHole: boolean;
  brandText: string;
  sloganText: string;
  codeText: string;
  brandScale: number;
  sloganScale: number;
  codeScale: number;
  qrScale: number;
  verticalBalance: number;
  horizontalBalance: number;
  brandGap: number;
  sloganGap: number;
  codeInset: number;
  innerSafe: number;
  outerSafe: number;
  brandWeight: FontWeightOption;
  sloganWeight: FontWeightOption;
  brandStyle: FontStyleOption;
  sloganStyle: FontStyleOption;
  codeStyle: FontStyleOption;
  codeAlign: AlignOption;
  brandColor: string;
  sloganColor: string;
  codeColor: string;
  brandAlign: AlignOption;
  sloganAlign: AlignOption;
  badgeScale: number;
  badgeOffsetX: number;
  badgeOffsetY: number;
  lockTextAdjustments: boolean;
};

type ArtworkState = {
  imageUrl: string;
  fileName: string;
  fit: FitMode;
  scale: number;
  x: number;
  y: number;
  rotate: number;
  caption: string;
  captionColor: string;
  captionScale: number;
  captionY: number;
};

const DEFAULTS_BY_SIZE: Record<SizeOption, DesignState> = {
  "2.5cm": {
    size: "2.5cm",
    shape: "round",
    hasHole: true,
    brandText: "dokuntag",
    sloganText: "",
    codeText: "",
    brandScale: 100,
    sloganScale: 100,
    codeScale: 100,
    qrScale: 100,
    verticalBalance: 100,
    horizontalBalance: 100,
    brandGap: 100,
    sloganGap: 100,
    codeInset: 100,
    innerSafe: 100,
    outerSafe: 100,
    brandWeight: "800",
    sloganWeight: "700",
    brandStyle: "normal",
    sloganStyle: "normal",
    codeStyle: "normal",
    codeAlign: "center",
    brandColor: "#111111",
    sloganColor: "#111111",
    codeColor: "#111111",
    brandAlign: "center",
    sloganAlign: "center",
    badgeScale: 140,
    badgeOffsetX: 130,
    badgeOffsetY: 100,
    lockTextAdjustments: false
  },
  "3cm": {
    size: "3cm",
    shape: "round",
    hasHole: true,
    brandText: "dokuntag",
    sloganText: "",
    codeText: "",
    brandScale: 100,
    sloganScale: 100,
    codeScale: 100,
    qrScale: 100,
    verticalBalance: 100,
    horizontalBalance: 100,
    brandGap: 100,
    sloganGap: 100,
    codeInset: 100,
    innerSafe: 100,
    outerSafe: 100,
    brandWeight: "800",
    sloganWeight: "700",
    brandStyle: "normal",
    sloganStyle: "normal",
    codeStyle: "normal",
    codeAlign: "center",
    brandColor: "#111111",
    sloganColor: "#111111",
    codeColor: "#111111",
    brandAlign: "center",
    sloganAlign: "center",
    badgeScale: 140,
    badgeOffsetX: 130,
    badgeOffsetY: 100,
    lockTextAdjustments: false
  },
  "4cm": {
    size: "4cm",
    shape: "round",
    hasHole: true,
    brandText: "dokuntag",
    sloganText: "",
    codeText: "",
    brandScale: 110,
    sloganScale: 110,
    codeScale: 110,
    qrScale: 100,
    verticalBalance: 100,
    horizontalBalance: 100,
    brandGap: 100,
    sloganGap: 100,
    codeInset: 100,
    innerSafe: 100,
    outerSafe: 100,
    brandWeight: "800",
    sloganWeight: "700",
    brandStyle: "normal",
    sloganStyle: "normal",
    codeStyle: "normal",
    codeAlign: "center",
    brandColor: "#111111",
    sloganColor: "#111111",
    codeColor: "#111111",
    brandAlign: "center",
    sloganAlign: "center",
    badgeScale: 150,
    badgeOffsetX: 130,
    badgeOffsetY: 100,
    lockTextAdjustments: false
  }
};

const DEFAULT_ARTWORK: ArtworkState = {
  imageUrl: "",
  fileName: "",
  fit: "cover",
  scale: 100,
  x: 0,
  y: 0,
  rotate: 0,
  caption: "",
  captionColor: "#111111",
  captionScale: 100,
  captionY: 78
};

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

function encode(value: string) {
  return encodeURIComponent(value);
}

function parsePercent(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return clamp(parsed, min, max);
}

function parseColor(value: string | null, fallback: string) {
  const text = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(text) ? text : fallback;
}

function parseWeight(value: string | null, fallback: FontWeightOption): FontWeightOption {
  return value === "500" || value === "600" || value === "700" || value === "800"
    ? value
    : fallback;
}

function parseStyle(value: string | null, fallback: FontStyleOption): FontStyleOption {
  return value === "italic" || value === "normal" ? value : fallback;
}

function parseAlign(value: string | null, fallback: AlignOption): AlignOption {
  return value === "left" || value === "center" || value === "right" ? value : fallback;
}

function getDefaults(size: SizeOption): DesignState {
  return { ...DEFAULTS_BY_SIZE[size] };
}

function readStateFromUrl(params: URLSearchParams): DesignState {
  const sizeParam = params.get("size");
  const size: SizeOption =
    sizeParam === "2.5cm" || sizeParam === "3cm" || sizeParam === "4cm"
      ? sizeParam
      : "3cm";
  const defaults = getDefaults(size);

  return {
    ...defaults,
    shape:
      params.get("shape") === "square"
        ? "square"
        : params.get("shape") === "drop"
          ? "drop"
          : defaults.shape,
    hasHole: params.get("hasHole") === "false" ? false : true,
    brandText: String(params.get("brandText") ?? defaults.brandText).slice(0, 24),
    sloganText: String(params.get("sloganText") ?? defaults.sloganText).slice(0, 28),
    codeText: String(params.get("codeText") ?? defaults.codeText).slice(0, 20),
    brandScale: parsePercent(params.get("brandScale"), defaults.brandScale, 40, 500),
    sloganScale: parsePercent(params.get("sloganScale"), defaults.sloganScale, 40, 500),
    codeScale: parsePercent(params.get("codeScale"), defaults.codeScale, 40, 500),
    qrScale: parsePercent(params.get("qrScale"), defaults.qrScale, 40, 300),
    verticalBalance: parsePercent(params.get("verticalBalance"), defaults.verticalBalance, 50, 150),
    horizontalBalance: parsePercent(
      params.get("horizontalBalance"),
      defaults.horizontalBalance,
      50,
      150
    ),
    brandGap: parsePercent(params.get("brandGap"), defaults.brandGap, 50, 220),
    sloganGap: parsePercent(params.get("sloganGap"), defaults.sloganGap, 50, 220),
    codeInset: parsePercent(params.get("codeInset"), defaults.codeInset, 50, 180),
    innerSafe: parsePercent(params.get("innerSafe"), defaults.innerSafe, 80, 160),
    outerSafe: parsePercent(params.get("outerSafe"), defaults.outerSafe, 80, 180),
    brandWeight: parseWeight(params.get("brandWeight"), defaults.brandWeight),
    sloganWeight: parseWeight(params.get("sloganWeight"), defaults.sloganWeight),
    brandStyle: parseStyle(params.get("brandStyle"), defaults.brandStyle),
    sloganStyle: parseStyle(params.get("sloganStyle"), defaults.sloganStyle),
    codeStyle: parseStyle(params.get("codeStyle"), defaults.codeStyle),
    codeAlign: parseAlign(params.get("codeAlign"), defaults.codeAlign),
    brandColor: parseColor(params.get("brandColor"), defaults.brandColor),
    sloganColor: parseColor(params.get("sloganColor"), defaults.sloganColor),
    codeColor: parseColor(params.get("codeColor"), defaults.codeColor),
    brandAlign: parseAlign(params.get("brandAlign"), defaults.brandAlign),
    sloganAlign: parseAlign(params.get("sloganAlign"), defaults.sloganAlign),
    badgeScale: parsePercent(params.get("badgeScale"), defaults.badgeScale, 50, 300),
    badgeOffsetX: parsePercent(params.get("badgeOffsetX"), defaults.badgeOffsetX, 0, 220),
    badgeOffsetY: parsePercent(params.get("badgeOffsetY"), defaults.badgeOffsetY, 0, 220),
    lockTextAdjustments: params.get("lockTextAdjustments") === "true"
  };
}

function buildDesignQuery(state: DesignState) {
  const params = new URLSearchParams();
  params.set("size", state.size);
  params.set("shape", state.shape);
  params.set("hasHole", state.hasHole ? "true" : "false");
  params.set("brandText", state.brandText);
  params.set("sloganText", state.sloganText);
  params.set("codeText", state.codeText);
  params.set("brandScale", String(state.brandScale));
  params.set("sloganScale", String(state.sloganScale));
  params.set("codeScale", String(state.codeScale));
  params.set("qrScale", String(state.qrScale));
  params.set("verticalBalance", String(state.verticalBalance));
  params.set("horizontalBalance", String(state.horizontalBalance));
  params.set("brandGap", String(state.brandGap));
  params.set("sloganGap", String(state.sloganGap));
  params.set("codeInset", String(state.codeInset));
  params.set("innerSafe", String(state.innerSafe));
  params.set("outerSafe", String(state.outerSafe));
  params.set("brandWeight", state.brandWeight);
  params.set("sloganWeight", state.sloganWeight);
  params.set("brandStyle", state.brandStyle);
  params.set("sloganStyle", state.sloganStyle);
  params.set("codeStyle", state.codeStyle);
  params.set("codeAlign", state.codeAlign);
  params.set("brandColor", state.brandColor);
  params.set("sloganColor", state.sloganColor);
  params.set("codeColor", state.codeColor);
  params.set("brandAlign", state.brandAlign);
  params.set("sloganAlign", state.sloganAlign);
  params.set("badgeScale", String(state.badgeScale));
  params.set("badgeOffsetX", String(state.badgeOffsetX));
  params.set("badgeOffsetY", String(state.badgeOffsetY));
  params.set("lockTextAdjustments", state.lockTextAdjustments ? "true" : "false");
  params.set("designType", "tag");
  return params.toString();
}

function cmPreviewStyle(size: SizeOption) {
  if (size === "2.5cm") return { width: "240px", height: "300px" };
  if (size === "4cm") return { width: "330px", height: "410px" };
  return { width: "285px", height: "355px" };
}

function getShapeClip(shape: ShapeOption) {
  if (shape === "round") return "circle(49% at 50% 50%)";
  if (shape === "square") return "inset(0 round 18px)";
  return "path('M 50% 2% C 67% 17% 94% 42% 94% 66% C 94% 88% 77% 98% 50% 98% C 23% 98% 6% 88% 6% 66% C 6% 42% 33% 17% 50% 2% Z')";
}

function getShapeLabel(shape: ShapeOption) {
  if (shape === "round") return "Daire";
  if (shape === "square") return "Kare";
  return "Damla";
}

function getPreviewFrameClass(shape: ShapeOption) {
  if (shape === "round") return "rounded-full";
  if (shape === "square") return "rounded-[1.75rem]";
  return "rounded-[2rem]";
}

function TabButton({
  active,
  label,
  onClick
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-50"
      }`}
    >
      {label}
    </button>
  );
}

function SectionCard({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.5rem] border border-neutral-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
      {description ? (
        <p className="mt-1 text-xs leading-5 text-neutral-500">{description}</p>
      ) : null}
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
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

function SelectField({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
      <span className="text-sm font-medium text-neutral-900">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-3 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
      >
        {options.map((item) => (
          <option key={`${label}-${item.value}`} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextField({
  label,
  value,
  placeholder,
  onChange
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
      <span className="text-sm font-medium text-neutral-900">{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-3 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
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

function ShapeButton({
  active,
  label,
  onClick
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
        active
          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
      }`}
    >
      {label}
    </button>
  );
}

function PreviewShell({
  title,
  subtitle,
  shape,
  children,
  showGuide
}: {
  title: string;
  subtitle: string;
  shape: ShapeOption;
  children: React.ReactNode;
  showGuide: boolean;
}) {
  return (
    <section className="min-w-0 rounded-[1.75rem] border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
          {title}
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-900">
          {subtitle}
        </h2>
      </div>

      <div className="flex justify-center">
        <div
          className={`relative flex items-center justify-center bg-white shadow-sm ${getPreviewFrameClass(shape)}`}
          style={cmPreviewStyle("3cm")}
        >
          {children}

          {showGuide ? (
            <div
              className="pointer-events-none absolute inset-0 border-2 border-dashed border-neutral-400/60"
              style={{ clipPath: getShapeClip(shape) }}
            />
          ) : null}

          <div
            className="pointer-events-none absolute -inset-5 border border-dashed border-neutral-300"
            style={{ borderRadius: shape === "round" ? "999px" : "32px" }}
          />
        </div>
      </div>
    </section>
  );
}

export default function QrPage() {
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [design, setDesign] = useState<DesignState>(getDefaults("3cm"));
  const [artwork, setArtwork] = useState<ArtworkState>(DEFAULT_ARTWORK);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [showGuide, setShowGuide] = useState(true);

  useEffect(() => {
    const parts = window.location.pathname.split("/");
    const codeFromUrl = parts[parts.length - 1];
    const params = new URLSearchParams(window.location.search);
    const nextDesign = readStateFromUrl(params);

    setCode(codeFromUrl?.toUpperCase() || "");
    setToken(params.get("token") || "");
    setDesign(nextDesign);

    try {
      const saved = window.localStorage.getItem("dokuntag_qr_design");
      if (!params.toString() && saved) {
        const parsed = JSON.parse(saved) as DesignState;
        setDesign({ ...getDefaults(parsed.size), ...parsed });
      }

      const savedArtwork = window.localStorage.getItem("dokuntag_front_artwork");
      if (savedArtwork) {
        setArtwork({ ...DEFAULT_ARTWORK, ...(JSON.parse(savedArtwork) as Partial<ArtworkState>) });
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!code) return;
    const next = `${window.location.pathname}?${buildDesignQuery(design)}${
      token ? `&token=${encode(token)}` : ""
    }`;
    window.history.replaceState(null, "", next);
    try {
      window.localStorage.setItem("dokuntag_qr_design", JSON.stringify(design));
    } catch {}
  }, [code, design, token]);

  useEffect(() => {
    try {
      window.localStorage.setItem("dokuntag_front_artwork", JSON.stringify(artwork));
    } catch {}
  }, [artwork]);

  const baseUrl = getBaseUrl();
  const designQuery = useMemo(() => buildDesignQuery(design), [design]);
  const qrImageUrl = useMemo(() => `/api/qr/${code}?${designQuery}`, [code, designQuery]);
  const qrDownloadUrl = useMemo(
    () => `/api/qr-download/${code}?${designQuery}`,
    [code, designQuery]
  );
  const qrPageUrl = useMemo(
    () => `${baseUrl}/qr/${code}?${designQuery}`,
    [baseUrl, code, designQuery]
  );

  const updateDesign = <K extends keyof DesignState>(key: K, value: DesignState[K]) => {
    setDesign((prev) => ({ ...prev, [key]: value }));
  };

  const updateArtwork = <K extends keyof ArtworkState>(key: K, value: ArtworkState[K]) => {
    setArtwork((prev) => ({ ...prev, [key]: value }));
  };

  const updateScaledField = (
    key: "brandScale" | "sloganScale" | "codeScale" | "brandGap" | "sloganGap",
    value: number
  ) => {
    setDesign((prev) => {
      if (!prev.lockTextAdjustments) {
        return { ...prev, [key]: value };
      }
      const delta = value - prev[key];
      return {
        ...prev,
        [key]: value,
        brandScale: clamp(prev.brandScale + (key === "brandScale" ? delta : 0), 40, 500),
        sloganScale: clamp(prev.sloganScale + (key === "sloganScale" ? delta : 0), 40, 500),
        codeScale: clamp(prev.codeScale + (key === "codeScale" ? delta : 0), 40, 500),
        brandGap: clamp(prev.brandGap + (key === "brandGap" ? delta : 0), 50, 220),
        sloganGap: clamp(prev.sloganGap + (key === "sloganGap" ? delta : 0), 50, 220)
      };
    });
  };

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(qrPageUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  function openBatchPrintView() {
    try {
      const storageKey = `dokuntag_batch_${Date.now()}`;
      const items = [{ code }];

      window.sessionStorage.setItem(storageKey, JSON.stringify(items));
      window.localStorage.setItem("dokuntag_batch_items", JSON.stringify(items));

      const url = `/admin/batch/print?storageKey=${encodeURIComponent(storageKey)}&design=${encodeURIComponent(
        JSON.stringify(design)
      )}`;

      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      const fallbackUrl = `/admin/batch/print?design=${encodeURIComponent(JSON.stringify(design))}`;
      window.open(fallbackUrl, "_blank", "noopener,noreferrer");
    }
  }

  function handleArtworkUpload(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      setArtwork((prev) => ({
        ...prev,
        imageUrl: String(reader.result || ""),
        fileName: file.name
      }));
    };
    reader.readAsDataURL(file);
  }

  function resetArtwork() {
    setArtwork(DEFAULT_ARTWORK);
  }

  function resetDesign() {
    setDesign({ ...getDefaults("3cm"), shape: design.shape, hasHole: design.hasHole });
  }

  if (!code) {
    return (
      <main className="min-h-screen bg-neutral-50 px-4 py-8 text-neutral-900">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-neutral-200 bg-white px-6 py-8 shadow-sm">
          Geçersiz ürün kodu.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-neutral-900">
      <div className="grid min-h-screen lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="border-b border-neutral-200 bg-white p-4 lg:border-b-0 lg:border-r">
          <div className="mb-6">
            <p className="text-2xl font-semibold tracking-tight">dokuntag</p>
            <p className="mt-2 text-sm font-medium text-neutral-900">Tasarım Ayarları</p>
            <p className="mt-1 text-xs leading-5 text-neutral-500">
              Metinleri, görselleri ve konumları düzenleyin.
            </p>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2">
            <TabButton active={activeTab === "general"} label="Genel" onClick={() => setActiveTab("general")} />
            <TabButton active={activeTab === "front"} label="Ön yüz" onClick={() => setActiveTab("front")} />
            <TabButton active={activeTab === "back"} label="Arka yüz" onClick={() => setActiveTab("back")} />
            <TabButton active={activeTab === "qr"} label="QR" onClick={() => setActiveTab("qr")} />
            <TabButton active={activeTab === "output"} label="Çıktı" onClick={() => setActiveTab("output")} />
          </div>

          <div className="space-y-4">
            {activeTab === "general" ? (
              <>
                <SectionCard title="Şekil ve boyut">
                  <div className="grid grid-cols-3 gap-2">
                    <ShapeButton active={design.shape === "round"} label="Daire" onClick={() => updateDesign("shape", "round")} />
                    <ShapeButton active={design.shape === "drop"} label="Damla" onClick={() => updateDesign("shape", "drop")} />
                    <ShapeButton active={design.shape === "square"} label="Kare" onClick={() => updateDesign("shape", "square")} />
                  </div>

                  <SelectField
                    label="Hazır ölçü"
                    value={design.size}
                    onChange={(value) =>
                      setDesign({
                        ...getDefaults(value as SizeOption),
                        shape: design.shape,
                        hasHole: design.hasHole,
                        codeAlign: design.codeAlign
                      })
                    }
                    options={[
                      { value: "2.5cm", label: "2,5 cm" },
                      { value: "3cm", label: "3 cm" },
                      { value: "4cm", label: "4 cm" }
                    ]}
                  />

                  <label className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm">
                    <span className="font-medium text-neutral-900">Dış kenar çizgisi</span>
                    <input
                      type="checkbox"
                      checked={showGuide}
                      onChange={(e) => setShowGuide(e.target.checked)}
                    />
                  </label>

                  <label className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm">
                    <span className="font-medium text-neutral-900">Delik alanı</span>
                    <input
                      type="checkbox"
                      checked={design.hasHole}
                      disabled={design.shape !== "drop"}
                      onChange={(e) => updateDesign("hasHole", e.target.checked)}
                    />
                  </label>
                </SectionCard>

                <SectionCard title="Güvenli alan">
                  <SliderField label="Dikey denge" value={design.verticalBalance} min={50} max={150} onChange={(v) => updateDesign("verticalBalance", v)} />
                  <SliderField label="Yatay denge" value={design.horizontalBalance} min={50} max={150} onChange={(v) => updateDesign("horizontalBalance", v)} />
                  <SliderField label="İç güvenli alan" value={design.innerSafe} min={80} max={160} onChange={(v) => updateDesign("innerSafe", v)} />
                  <SliderField label="Dış güvenli alan" value={design.outerSafe} min={80} max={180} onChange={(v) => updateDesign("outerSafe", v)} />
                </SectionCard>
              </>
            ) : null}

            {activeTab === "front" ? (
              <>
                <SectionCard title="Ön yüz marka">
                  <TextField label="Marka" value={design.brandText} placeholder="Boş bırakılırsa görünmez" onChange={(v) => updateDesign("brandText", v.slice(0, 24))} />
                  <TextField label="Slogan" value={design.sloganText} placeholder="Boş bırakılırsa görünmez" onChange={(v) => updateDesign("sloganText", v.slice(0, 28))} />
                  <ColorField label="Marka rengi" value={design.brandColor} onChange={(v) => updateDesign("brandColor", v)} />
                  <SliderField label="Marka boyutu" value={design.brandScale} min={40} max={500} suffix="%" onChange={(v) => updateScaledField("brandScale", v)} />
                  <SliderField label="Slogan boyutu" value={design.sloganScale} min={40} max={500} suffix="%" onChange={(v) => updateScaledField("sloganScale", v)} />
                </SectionCard>

                <SectionCard title="® simgesi">
                  <SliderField label="Simge boyutu" value={design.badgeScale} min={50} max={300} suffix="%" onChange={(v) => updateDesign("badgeScale", v)} />
                  <SliderField label="Sağa-sola" value={design.badgeOffsetX} min={0} max={220} onChange={(v) => updateDesign("badgeOffsetX", v)} />
                  <SliderField label="Yukarı-aşağı" value={design.badgeOffsetY} min={0} max={220} onChange={(v) => updateDesign("badgeOffsetY", v)} />
                </SectionCard>
              </>
            ) : null}

            {activeTab === "back" ? (
              <>
                <SectionCard title="Görsel yükle" description="Photoshop/AI görselini burada son forma sığdır.">
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center text-sm transition hover:bg-neutral-100">
                    <span className="font-semibold text-neutral-900">Görsel seç</span>
                    <span className="mt-1 text-xs text-neutral-500">PNG, JPG, WEBP</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleArtworkUpload(e.target.files?.[0])}
                    />
                  </label>

                  {artwork.fileName ? (
                    <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-xs text-neutral-600">
                      {artwork.fileName}
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={resetArtwork}
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold hover:bg-neutral-50"
                  >
                    Görseli sıfırla
                  </button>
                </SectionCard>

                <SectionCard title="Görsel yerleşimi">
                  <SelectField
                    label="Sığdırma"
                    value={artwork.fit}
                    onChange={(v) => updateArtwork("fit", v as FitMode)}
                    options={[
                      { value: "cover", label: "Doldur / kırp" },
                      { value: "contain", label: "Tamamı görünsün" }
                    ]}
                  />
                  <SliderField label="Görsel ölçeği" value={artwork.scale} min={40} max={220} suffix="%" onChange={(v) => updateArtwork("scale", v)} />
                  <SliderField label="Yatay X" value={artwork.x} min={-160} max={160} onChange={(v) => updateArtwork("x", v)} />
                  <SliderField label="Dikey Y" value={artwork.y} min={-160} max={160} onChange={(v) => updateArtwork("y", v)} />
                  <SliderField label="Döndürme" value={artwork.rotate} min={-180} max={180} suffix="°" onChange={(v) => updateArtwork("rotate", v)} />
                </SectionCard>

                <SectionCard title="Arka yüz yazısı">
                  <TextField label="Yazı" value={artwork.caption} placeholder="İsteğe bağlı" onChange={(v) => updateArtwork("caption", v.slice(0, 28))} />
                  <ColorField label="Yazı rengi" value={artwork.captionColor} onChange={(v) => updateArtwork("captionColor", v)} />
                  <SliderField label="Yazı boyutu" value={artwork.captionScale} min={50} max={220} suffix="%" onChange={(v) => updateArtwork("captionScale", v)} />
                  <SliderField label="Yazı dikey konum" value={artwork.captionY} min={20} max={92} suffix="%" onChange={(v) => updateArtwork("captionY", v)} />
                </SectionCard>
              </>
            ) : null}

            {activeTab === "qr" ? (
              <>
                <SectionCard title="QR ayarı" description="Ön yüzde QR alanını sürükleyerek de konumlandırabilirsin.">
                  <SliderField label="QR boyutu" value={design.qrScale} min={40} max={300} suffix="%" onChange={(v) => updateDesign("qrScale", v)} />
                  <SliderField label="Yatay konum" value={design.horizontalBalance} min={50} max={150} onChange={(v) => updateDesign("horizontalBalance", v)} />
                  <SliderField label="Dikey konum" value={design.verticalBalance} min={50} max={150} onChange={(v) => updateDesign("verticalBalance", v)} />
                </SectionCard>

                <SectionCard title="Kod" description="Kararsızsan boş bırak. Kod zaten QR içinde var.">
                  <TextField label="Kod metni" value={design.codeText} placeholder={code} onChange={(v) => updateDesign("codeText", v.slice(0, 20))} />
                  <ColorField label="Kod rengi" value={design.codeColor} onChange={(v) => updateDesign("codeColor", v)} />
                  <SliderField label="Kod boyutu" value={design.codeScale} min={40} max={500} suffix="%" onChange={(v) => updateScaledField("codeScale", v)} />
                  <SelectField label="Kod konumu" value={design.codeAlign} onChange={(v) => updateDesign("codeAlign", v as AlignOption)} options={[
                    { value: "left", label: "Sol" },
                    { value: "center", label: "Orta" },
                    { value: "right", label: "Sağ" }
                  ]} />
                </SectionCard>
              </>
            ) : null}

            {activeTab === "output" ? (
              <SectionCard title="Çıktı ve indirme">
                <a href={qrDownloadUrl} className="block rounded-2xl bg-black px-4 py-3 text-center text-sm font-semibold text-white hover:bg-neutral-800">
                  SVG indir - QR yüzü
                </a>
                <button
                  type="button"
                  onClick={openBatchPrintView}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-center text-sm font-semibold hover:bg-neutral-50"
                >
                  Toplu baskı görünümünü aç
                </button>
                <button
                  type="button"
                  onClick={copyLink}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-center text-sm font-semibold hover:bg-neutral-50"
                >
                  {copied ? "Bağlantı kopyalandı" : "Ayar bağlantısını kopyala"}
                </button>
                <button
                  type="button"
                  onClick={resetDesign}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-center text-sm font-semibold hover:bg-neutral-50"
                >
                  Ayarları sıfırla
                </button>
              </SectionCard>
            ) : null}
          </div>
        </aside>

        <section className="min-w-0 p-4 lg:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <a href="/admin/batch" className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-neutral-50">
                ← Geri
              </a>
              <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm">
                <span className="font-semibold">Kod:</span> {code}
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm">
                <span className="font-semibold">Form:</span> {getShapeLabel(design.shape)}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setShowGuide((v) => !v)} className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-neutral-50">
                {showGuide ? "Kılavuzu gizle" : "Kılavuzu göster"}
              </button>
              <a href={qrDownloadUrl} className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
                SVG indir
              </a>
            </div>
          </div>

          <div className="grid gap-6 2xl:grid-cols-2">
            <PreviewShell
              title="Ön yüz"
              subtitle="QR tarafı"
              shape={design.shape}
              showGuide={showGuide}
            >
              <div className="absolute inset-0 select-none">
                <img
                  src={qrImageUrl}
                  alt={`${code} QR`}
                  className="h-full w-full object-contain"
                  draggable={false}
                />
              </div>
            </PreviewShell>

            <PreviewShell
              title="Arka yüz"
              subtitle="Görsel tarafı"
              shape={design.shape}
              showGuide={showGuide}
            >
              <div
                className="absolute inset-0 overflow-hidden bg-neutral-100"
                style={{ clipPath: getShapeClip(design.shape) }}
              >
                {artwork.imageUrl ? (
                  <div className="absolute inset-0 select-none">
                    <img
                      src={artwork.imageUrl}
                      alt="Arka yüz görseli"
                      draggable={false}
                      className="h-full w-full"
                      style={{
                        objectFit: artwork.fit,
                        transform: `translate(${artwork.x}px, ${artwork.y}px) scale(${artwork.scale / 100}) rotate(${artwork.rotate}deg)`,
                        transformOrigin: "center"
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-10 text-center text-sm leading-6 text-neutral-500">
                    Arka yüz için görsel yükle. Görsel bu formun içine kırpılır.
                  </div>
                )}

                {design.shape === "drop" && design.hasHole ? (
                  <div className="absolute left-1/2 top-[11%] h-14 w-14 -translate-x-1/2 rounded-full border-4 border-white bg-white/80 shadow-inner" />
                ) : null}

                {artwork.caption.trim() ? (
                  <div
                    className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-center font-extrabold tracking-wide drop-shadow-sm"
                    style={{
                      top: `${artwork.captionY}%`,
                      color: artwork.captionColor,
                      fontSize: `${14 * (artwork.captionScale / 100)}px`
                    }}
                  >
                    {artwork.caption}
                  </div>
                ) : null}
              </div>
            </PreviewShell>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            Dış kenar çizgisi ve kılavuz sadece yerleşim içindir. QR SVG çıktısında gerçek form çizilir; arka yüz görseli şimdilik yerel önizleme amaçlıdır.
          </div>
        </section>
      </div>
    </main>
  );
}
