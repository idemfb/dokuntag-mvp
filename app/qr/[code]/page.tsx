
"use client";

import { useEffect, useMemo, useState } from "react";

type SizeOption = "2.5cm" | "3cm" | "4cm";
type ShapeOption = "round" | "square";
type FontWeightOption = "500" | "600" | "700" | "800";
type FontStyleOption = "normal" | "italic";
type AlignOption = "left" | "center" | "right";
type TabKey = "general" | "brand" | "slogan" | "code" | "badge" | "output";

type DesignState = {
  size: SizeOption;
  shape: ShapeOption;
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

const DEFAULTS_BY_SIZE: Record<SizeOption, DesignState> = {
  "2.5cm": {
    size: "2.5cm",
    shape: "round",
    brandText: "DOKUNTAG",
    sloganText: "Bul • Buluştur",
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
    sloganStyle: "italic",
    codeStyle: "normal",
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
    brandText: "DOKUNTAG",
    sloganText: "Bul • Buluştur",
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
    sloganStyle: "italic",
    codeStyle: "normal",
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
    brandText: "DOKUNTAG",
    sloganText: "Bul • Buluştur",
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
    sloganStyle: "italic",
    codeStyle: "normal",
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
    sizeParam === "2.5cm" || sizeParam === "3cm" || sizeParam === "4cm" ? sizeParam : "3cm";
  const defaults = getDefaults(size);

  return {
    ...defaults,
    shape: params.get("shape") === "square" ? "square" : defaults.shape,
    brandText: String(params.get("brandText") || defaults.brandText).slice(0, 24),
    sloganText: String(params.get("sloganText") || defaults.sloganText).slice(0, 28),
    codeText: String(params.get("codeText") || defaults.codeText).slice(0, 20),
    brandScale: parsePercent(params.get("brandScale"), defaults.brandScale, 40, 500),
    sloganScale: parsePercent(params.get("sloganScale"), defaults.sloganScale, 40, 500),
    codeScale: parsePercent(params.get("codeScale"), defaults.codeScale, 40, 500),
    qrScale: parsePercent(params.get("qrScale"), defaults.qrScale, 85, 115),
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
  params.set("brandColor", state.brandColor);
  params.set("sloganColor", state.sloganColor);
  params.set("codeColor", state.codeColor);
  params.set("brandAlign", state.brandAlign);
  params.set("sloganAlign", state.sloganAlign);
  params.set("badgeScale", String(state.badgeScale));
  params.set("badgeOffsetX", String(state.badgeOffsetX));
  params.set("badgeOffsetY", String(state.badgeOffsetY));
  params.set("lockTextAdjustments", state.lockTextAdjustments ? "true" : "false");
  return params.toString();
}

function cmPreviewStyle(size: SizeOption) {
  if (size === "2.5cm") return { width: "160px", height: "160px" };
  if (size === "4cm") return { width: "230px", height: "230px" };
  return { width: "190px", height: "190px" };
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
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-black text-white"
          : "bg-white text-neutral-700 ring-1 ring-neutral-300 hover:bg-neutral-50"
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
    <section className="rounded-[1.75rem] border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
      {description ? <p className="mt-1 text-xs leading-5 text-neutral-500">{description}</p> : null}
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-neutral-900">{label}</span>
        <span className="text-xs font-medium text-neutral-500">%{value}</span>
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
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
      <span className="text-sm font-medium text-neutral-900">{label}</span>
      <input
        type="text"
        value={value}
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

export default function QrPage() {
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [design, setDesign] = useState<DesignState>(getDefaults("3cm"));
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("general");

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

  const baseUrl = getBaseUrl();
  const designQuery = useMemo(() => buildDesignQuery(design), [design]);
  const qrImageUrl = useMemo(() => `/api/qr/${code}?${designQuery}`, [code, designQuery]);
  const qrDownloadUrl = useMemo(
    () => `/api/qr-download/${code}?${designQuery}`,
    [code, designQuery]
  );
  const qrPageUrl = useMemo(() => `${baseUrl}/qr/${code}?${designQuery}`, [baseUrl, code, designQuery]);

  const updateDesign = <K extends keyof DesignState>(key: K, value: DesignState[K]) => {
    setDesign((prev) => ({ ...prev, [key]: value }));
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

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(qrPageUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const openBatchPrintView = () => {
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
  };

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
    <main className="min-h-screen bg-neutral-50 px-4 py-6 text-neutral-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-neutral-200 bg-white px-6 py-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Dokuntag production mode</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">QR baskı ayarı</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
            QR ortada sabit kalır. Burada sadece yazıların dengesi, mesafesi, görünümü ve çıktı düzeni ayarlanır.
          </p>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="space-y-6 min-w-0">
            <section className="rounded-[2rem] border border-neutral-200 bg-white px-5 py-5 shadow-sm sm:px-6">
              <div className="flex flex-wrap items-center gap-2">
                <TabButton active={activeTab === "general"} label="Genel" onClick={() => setActiveTab("general")} />
                <TabButton active={activeTab === "brand"} label="Üst yazı" onClick={() => setActiveTab("brand")} />
                <TabButton active={activeTab === "slogan"} label="Slogan" onClick={() => setActiveTab("slogan")} />
                <TabButton active={activeTab === "code"} label="Sağ kod" onClick={() => setActiveTab("code")} />
                <TabButton active={activeTab === "badge"} label="® simgesi" onClick={() => setActiveTab("badge")} />
                <TabButton active={activeTab === "output"} label="Çıktı" onClick={() => setActiveTab("output")} />
              </div>
            </section>

            {activeTab === "general" ? (
              <>
                <SectionCard title="Ölçü ve şekil" description="QR sabit kalır. Boyuta göre yazılar otomatik dengelenir.">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SelectField
                      label="Hazır ölçü"
                      value={design.size}
                      onChange={(value) =>
                        setDesign({ ...getDefaults(value as SizeOption), shape: design.shape })
                      }
                      options={[
                        { value: "2.5cm", label: "2,5 cm" },
                        { value: "3cm", label: "3 cm" },
                        { value: "4cm", label: "4 cm" }
                      ]}
                    />
                    <SelectField
                      label="Şekil"
                      value={design.shape}
                      onChange={(value) => updateDesign("shape", value as ShapeOption)}
                      options={[
                        { value: "round", label: "Yuvarlak" },
                        { value: "square", label: "Kare" }
                      ]}
                    />
                  </div>
                </SectionCard>

                <SectionCard title="Denge ve güvenli sınırlar" description="Yazılar QR üstüne binmez ve baskı alanı dışına taşmaz.">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <SliderField label="Dikey denge" value={design.verticalBalance} min={50} max={150} onChange={(v) => updateDesign("verticalBalance", v)} />
                    <SliderField label="Yatay denge" value={design.horizontalBalance} min={50} max={150} onChange={(v) => updateDesign("horizontalBalance", v)} />
                    <SliderField label="İç güvenli alan" value={design.innerSafe} min={80} max={160} onChange={(v) => updateDesign("innerSafe", v)} />
                    <SliderField label="Dış güvenli alan" value={design.outerSafe} min={80} max={180} onChange={(v) => updateDesign("outerSafe", v)} />
                    <SliderField label="QR oranı" value={design.qrScale} min={85} max={115} onChange={(v) => updateDesign("qrScale", v)} />
                  </div>
                  <label className="mt-2 flex items-center gap-2 text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      checked={design.lockTextAdjustments}
                      onChange={(e) => updateDesign("lockTextAdjustments", e.target.checked)}
                    />
                    Yazı ölçeklerini ve boşluklarını orantılı ayarla
                  </label>
                </SectionCard>
              </>
            ) : null}

            {activeTab === "brand" ? (
              <SectionCard title="Üst yazı" description="QR’a en yakın konumda bile üstüne binmez.">
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField label="Metin" value={design.brandText} onChange={(v) => updateDesign("brandText", v.slice(0, 24))} />
                  <ColorField label="Renk" value={design.brandColor} onChange={(v) => updateDesign("brandColor", v)} />
                  <SliderField label="Yazı boyutu" value={design.brandScale} min={40} max={500} onChange={(v) => updateScaledField("brandScale", v)} />
                  <SliderField label="QR'a uzaklık" value={design.brandGap} min={50} max={220} onChange={(v) => updateScaledField("brandGap", v)} />
                  <SelectField label="Kalınlık" value={design.brandWeight} onChange={(v) => updateDesign("brandWeight", v as FontWeightOption)} options={[
                    { value: "500", label: "Orta" },
                    { value: "600", label: "Yarı kalın" },
                    { value: "700", label: "Kalın" },
                    { value: "800", label: "Çok kalın" }
                  ]} />
                  <SelectField label="Hizalama" value={design.brandAlign} onChange={(v) => updateDesign("brandAlign", v as AlignOption)} options={[
                    { value: "left", label: "Sola" },
                    { value: "center", label: "Ortala" },
                    { value: "right", label: "Sağa" }
                  ]} />
                  <SelectField label="Stil" value={design.brandStyle} onChange={(v) => updateDesign("brandStyle", v as FontStyleOption)} options={[
                    { value: "normal", label: "Normal" },
                    { value: "italic", label: "İtalik" }
                  ]} />
                </div>
              </SectionCard>
            ) : null}

            {activeTab === "slogan" ? (
              <SectionCard title="Alt slogan" description="En yakın konumda bile QR’ın üstüne çıkmaz.">
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField label="Metin" value={design.sloganText} onChange={(v) => updateDesign("sloganText", v.slice(0, 28))} />
                  <ColorField label="Renk" value={design.sloganColor} onChange={(v) => updateDesign("sloganColor", v)} />
                  <SliderField label="Yazı boyutu" value={design.sloganScale} min={40} max={500} onChange={(v) => updateScaledField("sloganScale", v)} />
                  <SliderField label="QR'a uzaklık" value={design.sloganGap} min={50} max={220} onChange={(v) => updateScaledField("sloganGap", v)} />
                  <SelectField label="Kalınlık" value={design.sloganWeight} onChange={(v) => updateDesign("sloganWeight", v as FontWeightOption)} options={[
                    { value: "500", label: "Orta" },
                    { value: "600", label: "Yarı kalın" },
                    { value: "700", label: "Kalın" },
                    { value: "800", label: "Çok kalın" }
                  ]} />
                  <SelectField label="Hizalama" value={design.sloganAlign} onChange={(v) => updateDesign("sloganAlign", v as AlignOption)} options={[
                    { value: "left", label: "Sola" },
                    { value: "center", label: "Ortala" },
                    { value: "right", label: "Sağa" }
                  ]} />
                  <SelectField label="Stil" value={design.sloganStyle} onChange={(v) => updateDesign("sloganStyle", v as FontStyleOption)} options={[
                    { value: "normal", label: "Normal" },
                    { value: "italic", label: "İtalik" }
                  ]} />
                </div>
              </SectionCard>
            ) : null}

            {activeTab === "code" ? (
              <SectionCard title="Sağ kod" description="Sağ tarafta kalır; yukarı-aşağı merkezi QR’a göre korunur.">
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField label="Metin" value={design.codeText} onChange={(v) => updateDesign("codeText", v.slice(0, 20))} />
                  <ColorField label="Renk" value={design.codeColor} onChange={(v) => updateDesign("codeColor", v)} />
                  <SliderField label="Kod boyutu" value={design.codeScale} min={40} max={500} onChange={(v) => updateScaledField("codeScale", v)} />
                  <SliderField label="Sağ iç boşluk" value={design.codeInset} min={50} max={180} onChange={(v) => updateDesign("codeInset", v)} />
                  <SelectField label="Stil" value={design.codeStyle} onChange={(v) => updateDesign("codeStyle", v as FontStyleOption)} options={[
                    { value: "normal", label: "Normal" },
                    { value: "italic", label: "İtalik" }
                  ]} />
                </div>
              </SectionCard>
            ) : null}

            {activeTab === "badge" ? (
              <SectionCard title="® simgesi" description="Üst yazıya bağlı kalır ama daha görünür ve esnek konumlanır.">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <SliderField label="Simge boyutu" value={design.badgeScale} min={50} max={300} onChange={(v) => updateDesign("badgeScale", v)} />
                  <SliderField label="Sağa-sola konum" value={design.badgeOffsetX} min={0} max={220} onChange={(v) => updateDesign("badgeOffsetX", v)} />
                  <SliderField label="Yukarı-aşağı konum" value={design.badgeOffsetY} min={0} max={220} onChange={(v) => updateDesign("badgeOffsetY", v)} />
                </div>
              </SectionCard>
            ) : null}

            {activeTab === "output" ? (
              <SectionCard title="Çıktı ve paylaşım" description="Son tasarım toplu baskıya aynı ayarla taşınır.">
                <div className="grid gap-3 sm:grid-cols-2">
                  <a href={qrDownloadUrl} className="rounded-2xl bg-black px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-neutral-800">SVG indir</a>
                  <button
                    type="button"
                    onClick={openBatchPrintView}
                    className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-center text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
                  >
                    Toplu baskı görünümünü aç
                  </button>
                  <button type="button" onClick={copyLink} className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-center text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50">
                    {copied ? "Bağlantı kopyalandı" : "Ayar bağlantısını kopyala"}
                  </button>
                </div>
              </SectionCard>
            ) : null}
          </section>

          <aside className="min-w-0 xl:sticky xl:top-6 self-start space-y-6">
            <section className="rounded-[2rem] border border-neutral-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-neutral-100/80 px-6 py-6">
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">Canlı önizleme</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Baskı görünümü</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  Son ayar burada görünür. Aynı ayar toplu baskı sayfasına ve SVG çıktısına taşınır.
                </p>
              </div>
              <div className="space-y-5 px-6 py-6">
                <div className="flex justify-center">
                  <div
                    className={`flex items-center justify-center border border-neutral-200 bg-white p-2 shadow-sm ${design.shape === "round" ? "rounded-full" : "rounded-3xl"}`}
                    style={cmPreviewStyle(design.size)}
                  >
                    <img src={qrImageUrl} alt={`${code} QR`} className="h-full w-full" />
                  </div>
                </div>
                <div className="break-all rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-xs leading-6 text-neutral-700">
                  {qrPageUrl}
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
