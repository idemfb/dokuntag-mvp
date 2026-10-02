"use client";

import { useEffect, useMemo, useState } from "react";

type PrintPageSize = "A4" | "A3" | "custom";
type Orientation = "portrait" | "landscape";
type PrintSideMode = "qr" | "front" | "both" | "separate";
type SizeOption = "1cm" | "2cm" | "2.5cm" | "3cm" | "4cm" | "5cm" | "6cm" | "custom";

type BatchItem = { code: string; label?: string };

type DesignState = {
  size?: SizeOption;
  customWidthCm?: number;
  customHeightCm?: number;
  shape?: string;
  codeText?: string;
  hideCode?: boolean;
  qrScale?: number;
  codeScale?: number;
  codeGap?: number;
  qrOffsetX?: number;
  qrOffsetY?: number;
  foregroundColor?: string;
  codeColor?: string;
  showGuide?: boolean;
  outputMode?: "qr" | "front" | "both";
  qrGlowSize?: number;
  qrGlowOpacity?: number;
  qrGlowColor?: string;
    brandSide?: "off" | "front" | "qr" | "both";
  sloganSide?: "off" | "front" | "qr" | "both";
  nfcSide?: "off" | "front" | "qr" | "both";
  brandColor?: string;
  sloganColor?: string;
  nfcColor?: string;
  brandSize?: number;
  sloganSize?: number;
  nfcSize?: number;
  brandX?: number;
  brandY?: number;
  sloganX?: number;
  sloganY?: number;
  nfcX?: number;
  nfcY?: number;
  nfcIconGap?: number;
  brandSloganGap?: number;
  nfcStyle?: "waves" | "text" | "both";
  brandAlign?: "left" | "center" | "right";
  sloganAlign?: "left" | "center" | "right";
  nfcAlign?: "left" | "center" | "right";
  brandFont?: "sans" | "serif" | "mono";
  sloganFont?: "sans" | "serif" | "mono";
};

type ArtworkState = {
  imageUrl: string;
  fileName: string;
  fit: "cover" | "contain";
  scale: number;
  x: number;
  y: number;
  caption: string;
  captionColor: string;
  captionScale: number;
};

type PrintEntry = { item: BatchItem; side: "qr" | "front" };

const TEMPLATE_STORAGE_KEY = "dokuntag_template_artwork";
const FRONT_ARTWORK_STORAGE_KEY = "dokuntag_front_artwork_v2";
const LEGACY_TEMPLATE_STORAGE_KEY = "dokuntag_front_artwork";

function getDefaultArtwork(): ArtworkState {
  return { imageUrl: "", fileName: "", fit: "cover", scale: 100, x: 0, y: 0, caption: "", captionColor: "#111111", captionScale: 100 };
}

function tryParseJson<T>(value: string | null): T | null {
  if (!value) return null;
  try { return JSON.parse(value) as T; } catch { return null; }
}

function readSavedArtwork(storageKey: string, legacyKey?: string): ArtworkState {
  const current = tryParseJson<Partial<ArtworkState>>(window.localStorage.getItem(storageKey));
  if (current) return { ...getDefaultArtwork(), ...current };
  if (legacyKey) {
    const legacy = tryParseJson<Partial<ArtworkState>>(window.localStorage.getItem(legacyKey));
    if (legacy) return { ...getDefaultArtwork(), ...legacy };
  }
  return getDefaultArtwork();
}

function getBaseUrl() {
  const value = process.env.NEXT_PUBLIC_BASE_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  return value.replace(/\/+$/, "");
}

function getItemSizeMm(design: DesignState | null) {
  if (!design) return { width: 30, height: 30 };
  if (design.size === "custom") {
    return {
      width: Math.max(10, Math.round((Number(design.customWidthCm) || 3) * 10)),
      height: Math.max(10, Math.round((Number(design.customHeightCm) || 5.2) * 10))
    };
  }
  if (design.size === "1cm") return { width: 10, height: 10 };
  if (design.size === "2cm") return { width: 20, height: 20 };
  if (design.size === "2.5cm") return { width: 25, height: 25 };
  if (design.size === "4cm") return { width: 40, height: 40 };
  if (design.size === "5cm") return { width: 50, height: 50 };
  if (design.size === "6cm") return { width: 60, height: 60 };
  return { width: 30, height: 30 };
}

function getRawPageSize(pageSize: PrintPageSize, customWidth: number, customHeight: number) {
  if (pageSize === "A3") return { width: 420, height: 297 };
  if (pageSize === "custom") return { width: customWidth, height: customHeight };
  return { width: 297, height: 210 };
}

function getPageSize(pageSize: PrintPageSize, orientation: Orientation, customWidth: number, customHeight: number) {
  const raw = getRawPageSize(pageSize, customWidth, customHeight);
  const portraitWidth = Math.min(raw.width, raw.height);
  const portraitHeight = Math.max(raw.width, raw.height);
  return orientation === "portrait" ? { width: portraitWidth, height: portraitHeight } : { width: portraitHeight, height: portraitWidth };
}

function buildDesignQuery(design: DesignState) {
  const params = new URLSearchParams();
  Object.entries(design || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  });
  return params.toString();
}

function normalizePrintMode(value: string | null | undefined): PrintSideMode {
  if (value === "qr") return "qr";
  if (value === "front" || value === "template") return "front";
  if (value === "both") return "both";
  if (value === "separate") return "separate";
  return "both";
}

function buildPrintEntries(items: BatchItem[], sideMode: PrintSideMode): PrintEntry[] {
  if (sideMode === "front") return items.map((item) => ({ item, side: "front" }));
  if (sideMode === "both") return items.flatMap((item) => [{ item, side: "front" as const }, { item, side: "qr" as const }]);
  if (sideMode === "separate") return [...items.map((item) => ({ item, side: "front" as const })), ...items.map((item) => ({ item, side: "qr" as const }))];
  return items.map((item) => ({ item, side: "qr" }));
}

function chunkItems<T>(items: T[], chunkSize: number) {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) chunks.push(items.slice(i, i + chunkSize));
  return chunks;
}

function padPage<T>(items: T[], size: number): Array<T | null> {
  const next: Array<T | null> = [...items];
  while (next.length < size) next.push(null);
  return next;
}

function ArtworkLayer({ artwork, label }: { artwork: ArtworkState; label: string }) {
  if (!artwork.imageUrl) {
    return <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white px-2 text-center text-[8px] leading-tight text-neutral-400">{label}</div>;
  }
  return <img src={artwork.imageUrl} alt={artwork.fileName || label} className="absolute left-1/2 top-1/2 h-full w-full" style={{ objectFit: artwork.fit, transform: `translate(-50%, -50%) translate(${artwork.x}px, ${artwork.y}px) scale(${artwork.scale / 100})` }} />;
}

function shouldShowOverlay(
  side: DesignState["brandSide"],
  currentSide: "front" | "qr"
) {
  return side === "both" || side === currentSide;
}

function getFontClass(font?: "sans" | "serif" | "mono") {
  if (font === "serif") return "font-serif";
  if (font === "mono") return "font-mono";
  return "font-sans";
}

function getAlignStyle(align?: "left" | "center" | "right") {
  if (align === "left") {
    return {
      left: "3mm",
      right: "3mm",
      textAlign: "left" as const,
      justifyContent: "flex-start"
    };
  }

  if (align === "right") {
    return {
      left: "3mm",
      right: "3mm",
      textAlign: "right" as const,
      justifyContent: "flex-end"
    };
  }

  return {
    left: "3mm",
    right: "3mm",
    textAlign: "center" as const,
    justifyContent: "center"
  };
}

function NfcWaveIcon({
  color = "currentColor",
  size = 14
}: {
  color?: string;
  size?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9.5C7.5 11 7.5 13 6 14.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M10 6.5C13 9.5 13 14.5 10 17.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M14 3.5C19 8.5 19 15.5 14 20.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function OverlayLayer({
  design,
  side
}: {
  design: DesignState | null;
  side: "front" | "qr";
}) {
  if (!design) return null;

  const brandAlign = getAlignStyle(design.brandAlign);
  const sloganAlign = getAlignStyle(design.sloganAlign);
  const nfcAlign = getAlignStyle(design.nfcAlign);

  const showBrand = shouldShowOverlay(design.brandSide, side);
  const showSlogan = shouldShowOverlay(design.sloganSide, side);
  const showNfc = shouldShowOverlay(design.nfcSide, side);

  return (
    <>
      {showNfc ? (
        <div
          className="absolute top-[3mm] z-20 flex items-center font-bold"
          style={{
            left: nfcAlign.left,
            right: nfcAlign.right,
            justifyContent: nfcAlign.justifyContent,
            gap: `${Number(design.nfcIconGap ?? 4)}px`,
            color: String(design.nfcColor || "#111111"),
            fontSize: `${10 * (Number(design.nfcSize ?? 100) / 100)}px`,
            transform: `translate(${Number(design.nfcX ?? 0)}px, ${Number(design.nfcY ?? 0)}px)`
          }}
        >
          {design.nfcStyle === "text" || design.nfcStyle === "both" ? <span>NFC</span> : null}
          {design.nfcStyle === "waves" || design.nfcStyle === "both" || !design.nfcStyle ? (
            <NfcWaveIcon
              color={String(design.nfcColor || "#111111")}
              size={Math.round(14 * (Number(design.nfcSize ?? 100) / 100))}
            />
          ) : null}
        </div>
      ) : null}

      {showBrand ? (
        <div
          className={`absolute bottom-[7mm] z-20 font-extrabold tracking-tight ${getFontClass(design.brandFont)}`}
          style={{
            left: brandAlign.left,
            right: brandAlign.right,
            color: String(design.brandColor || "#111111"),
            fontSize: `${11 * (Number(design.brandSize ?? 100) / 100)}px`,
            textAlign: brandAlign.textAlign,
            transform: `translate(${Number(design.brandX ?? 0)}px, ${Number(design.brandY ?? 0)}px)`
          }}
        >
          dokuntag<span className="align-super text-[0.55em]">®</span>
        </div>
      ) : null}

      {showSlogan ? (
        <div
          className={`absolute bottom-[3.8mm] z-20 font-semibold ${getFontClass(design.sloganFont)}`}
          style={{
            left: sloganAlign.left,
            right: sloganAlign.right,
            color: String(design.sloganColor || "#111111"),
            fontSize: `${6.5 * (Number(design.sloganSize ?? 100) / 100)}px`,
            textAlign: sloganAlign.textAlign,
            transform: `translate(${Number(design.sloganX ?? 0)}px, ${Number(design.sloganY ?? 0)}px)`
          }}
        >
          bul • buluştur
        </div>
      ) : null}
    </>
  );
}
export default function BatchPrintPage() {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [design, setDesign] = useState<DesignState | null>(null);
  const [templateArtwork, setTemplateArtwork] = useState<ArtworkState>(getDefaultArtwork());
  const [frontArtwork, setFrontArtwork] = useState<ArtworkState>(getDefaultArtwork());
  const [pageSize, setPageSize] = useState<PrintPageSize>("A3");
  const [orientation, setOrientation] = useState<Orientation>("landscape");
  const [gapMm, setGapMm] = useState(4);
  const [marginMm, setMarginMm] = useState(8);
  const [showCutMarks, setShowCutMarks] = useState(true);
  const [printSideMode, setPrintSideMode] = useState<PrintSideMode>("both");
  const [customWidth, setCustomWidth] = useState(420);
  const [customHeight, setCustomHeight] = useState(297);
  const [previewLimit, setPreviewLimit] = useState(300);
  const [printCountLimit, setPrintCountLimit] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const storageKey = params.get("storageKey");
    const outputMode = params.get("outputMode");
    let loadedItems: BatchItem[] = [];
    let loadedDesign: DesignState | null = null;

    if (storageKey) {
      const payload = tryParseJson<{ items?: BatchItem[]; design?: DesignState; templateArtwork?: ArtworkState; frontArtwork?: ArtworkState }>(window.sessionStorage.getItem(`${storageKey}:payload`));
      if (payload) {
        if (Array.isArray(payload.items)) loadedItems = payload.items;
        if (payload.design) loadedDesign = payload.design;
        if (payload.templateArtwork) setTemplateArtwork({ ...getDefaultArtwork(), ...payload.templateArtwork });
        if (payload.frontArtwork) setFrontArtwork({ ...getDefaultArtwork(), ...payload.frontArtwork });
      }
      if (!loadedItems.length) {
        const rawItems = tryParseJson<BatchItem[]>(window.sessionStorage.getItem(storageKey));
        if (Array.isArray(rawItems)) loadedItems = rawItems;
      }
    }

    if (!loadedItems.length) {
      const fallbackItems = tryParseJson<BatchItem[]>(window.localStorage.getItem("dokuntag_batch_items"));
      if (Array.isArray(fallbackItems)) loadedItems = fallbackItems;
    }
    if (!loadedDesign) {
      loadedDesign = tryParseJson<DesignState>(window.localStorage.getItem("dokuntag_qr_design"));
    }

    setItems(loadedItems);
    setDesign(loadedDesign);
    setTemplateArtwork((prev) => prev.imageUrl ? prev : readSavedArtwork(TEMPLATE_STORAGE_KEY, LEGACY_TEMPLATE_STORAGE_KEY));
    setFrontArtwork((prev) => prev.imageUrl ? prev : readSavedArtwork(FRONT_ARTWORK_STORAGE_KEY));
    setPrintSideMode(outputMode ? normalizePrintMode(outputMode) : normalizePrintMode(loadedDesign?.outputMode));
  }, []);

  const baseUrl = getBaseUrl();
  const designQuery = useMemo(() => (design ? buildDesignQuery(design) : ""), [design]);
  const itemSize = useMemo(() => getItemSizeMm(design), [design]);
  const maxItemSize = Math.max(itemSize.width, itemSize.height);
  const pageDims = useMemo(() => getPageSize(pageSize, orientation, customWidth, customHeight), [pageSize, orientation, customWidth, customHeight]);

  const layout = useMemo(() => {
    const cutMarkReserve = showCutMarks ? 6 : 0;
    const usableWidth = Math.max(pageDims.width - marginMm * 2, maxItemSize);
    const usableHeight = Math.max(pageDims.height - marginMm * 2, maxItemSize);
    const cellSize = maxItemSize + cutMarkReserve;
    const columns = Math.max(1, Math.floor((usableWidth + gapMm) / (cellSize + gapMm)));
    const rows = Math.max(1, Math.floor((usableHeight + gapMm) / (cellSize + gapMm)));
    const autoPerPage = Math.max(1, columns * rows);
    const perPage = autoPerPage;
    const gridWidth = columns * cellSize + Math.max(0, columns - 1) * gapMm;
    const gridHeight = rows * cellSize + Math.max(0, rows - 1) * gapMm;
    return { cellSize, columns, rows, perPage, gridWidth, gridHeight, cutMarkReserve };
  }, [showCutMarks, pageDims.width, pageDims.height, marginMm, maxItemSize, gapMm]);

  const limitedItems = useMemo(() => {
  const limit = Number(printCountLimit);

  if (!Number.isFinite(limit) || limit <= 0) {
    return items;
  }

  return items.slice(0, limit);
}, [items, printCountLimit]);

const printEntries = useMemo(
  () => buildPrintEntries(limitedItems, printSideMode),
  [limitedItems, printSideMode]
);
  const previewItems = useMemo(() => printEntries.slice(0, previewLimit), [printEntries, previewLimit]);
  const previewPages = useMemo(() => chunkItems(previewItems, layout.perPage).map((page) => padPage(page, layout.perPage)), [previewItems, layout.perPage]);

  const pageCss = useMemo(() => {
    const pageSizeText = pageSize === "custom" ? `${customWidth}mm ${customHeight}mm` : `${pageSize} ${orientation}`;
    return `@page{size:${pageSizeText};margin:0;}@media print{html,body{background:white!important;}body{margin:0!important;}.print\\:hidden{display:none!important;}}`;
  }, [pageSize, orientation, customWidth, customHeight]);

  const downloadRealPdf = async () => {
    if (!limitedItems.length || !design) return;

    try {
      setPdfLoading(true);
      const response = await fetch("/api/admin/download-batch-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: limitedItems,
          design: {
          ...design,
          codeText: ""
        },
          templateArtwork,
          frontArtwork,
          options: {
            pageSize,
            orientation,
            customWidth,
            customHeight,
            gapMm,
            marginMm,
            showCutMarks,
            outputMode: printSideMode,
            fileName: `dokuntag-batch-${limitedItems.length}-${printSideMode}`
          }
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert(data?.error || "PDF hazırlanamadı.");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dokuntag-batch-${limitedItems.length}-${printSideMode}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setPdfLoading(false);
    }
  };

  const openPrintForAll = () => {
    setPreviewLimit(printEntries.length);
    window.setTimeout(() => window.print(), 350);
  };

  function renderItem(entry: PrintEntry) {
    const code = String(entry.item.code || "").toUpperCase();
    const qrParams = new URLSearchParams(designQuery);
    qrParams.delete("codeText");
    qrParams.set("transparent", "true");
    qrParams.set("showGuide", "false");
    const qrUrl = `/api/qr/${code}?${qrParams.toString()}`;
    const glowOpacity =
  Math.max(0, Math.min(100, Number(design?.qrGlowOpacity ?? 48))) / 100;

const glowSize =
  Math.max(30, Math.min(90, Number(design?.qrGlowSize ?? 52)));

const glowColor = String(design?.qrGlowColor || "#f7f6f2");

    return (
      <div className="relative overflow-hidden bg-white" style={{ width: `${itemSize.width}mm`, height: `${itemSize.height}mm`, borderRadius: design?.size === "custom" ? "4mm" : undefined }}>
        {entry.side === "front" ? (
  <>
    <ArtworkLayer artwork={frontArtwork} label="Ön yüz" />
    <OverlayLayer design={design} side="front" />
  </>
) : (
  <>
    <ArtworkLayer artwork={templateArtwork} label="QR yüzü" />
    <div className="absolute left-1/2 top-1/2 rounded-[30%]" style={{ width: `${glowSize}%`, height: `${glowSize}%`, transform: "translate(-50%,-50%)", backgroundColor: glowColor, opacity: glowOpacity }} />
    <img src={qrUrl} alt={`QR ${code}`} className="absolute inset-0 h-full w-full" />
    <OverlayLayer design={design} side="qr" />
  </>
)}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-6 text-neutral-900 print:bg-white print:p-0">
      <style jsx global>{pageCss}</style>
      <div className="mx-auto max-w-[1800px] space-y-6 print:max-w-none print:space-y-0">
        <section className="rounded-[2rem] border border-neutral-200 bg-white px-6 py-6 shadow-sm print:hidden">
          <div className="flex flex-wrap gap-3">
            <div className="min-w-[220px]"><p className="text-xs uppercase tracking-[0.18em] text-neutral-400">Baskı üretimi</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Toplu baskı görünümü</h1><p className="mt-2 text-sm leading-6 text-neutral-600">Ön yüz ve QR yüzü üretim çıktısını aynı sayfada kontrol edebilirsin.</p></div>
            <div className="ml-auto grid gap-3 sm:grid-cols-2 xl:grid-cols-8">
              <label className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"><span className="text-xs font-medium text-neutral-600">Baskı modu</span><select value={printSideMode} onChange={(e) => setPrintSideMode(e.target.value as PrintSideMode)} className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"><option value="qr">Sadece QR</option><option value="front">Sadece ön</option><option value="both">Ön + QR</option><option value="separate">Önler sonra QR</option></select></label>
              <label className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"><span className="text-xs font-medium text-neutral-600">Sayfa</span><select value={pageSize} onChange={(e) => setPageSize(e.target.value as PrintPageSize)} className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"><option value="A4">A4</option><option value="A3">A3</option><option value="custom">Özel</option></select></label>
              <label className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"><span className="text-xs font-medium text-neutral-600">Yön</span><select value={orientation} onChange={(e) => setOrientation(e.target.value as Orientation)} className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"><option value="landscape">Yatay</option><option value="portrait">Dikey</option></select></label>
              <label className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"><span className="text-xs font-medium text-neutral-600">Boşluk mm</span><input value={gapMm} onChange={(e) => setGapMm(Number(e.target.value) || 0)} className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm" /></label>
              <label className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"><span className="text-xs font-medium text-neutral-600">Kenar mm</span><input value={marginMm} onChange={(e) => setMarginMm(Number(e.target.value) || 0)} className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm" /></label>
              <label className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                <span className="text-xs font-medium text-neutral-600">Baskıya alınacak adet</span>
                <input
                  type="number"
                  min={1}
                  max={items.length || 1}
                  value={printCountLimit}
                  onChange={(e) => setPrintCountLimit(e.target.value)}
                  placeholder={`Tümü (${items.length})`}
                  className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"><span className="text-xs font-medium text-neutral-600">Özel W</span><input value={customWidth} onChange={(e) => setCustomWidth(Number(e.target.value) || 420)} className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm" /></label>
              <label className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"><span className="text-xs font-medium text-neutral-600">Özel H</span><input value={customHeight} onChange={(e) => setCustomHeight(Number(e.target.value) || 297)} className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm" /></label>
              <label className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm"><input type="checkbox" checked={showCutMarks} onChange={(e) => setShowCutMarks(e.target.checked)} /> Kesim çizgisi</label>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3"><button onClick={openPrintForAll} className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white">Yazdır</button><button onClick={downloadRealPdf} disabled={pdfLoading} className="rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold">PDF olarak yazdır / kaydet</button></div>
        </section>

        {previewPages.map((pageEntries, pageIndex) => (
          <section key={pageIndex} className="bg-white shadow-sm print:break-after-page print:shadow-none" style={{ width: `${pageDims.width}mm`, height: `${pageDims.height}mm`, overflow: "hidden", boxSizing: "border-box" }}>
            <div style={{ width: `${pageDims.width - marginMm * 2}mm`, height: `${pageDims.height - marginMm * 2}mm`, margin: `${marginMm}mm`, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${layout.columns}, ${layout.cellSize}mm)`, gridAutoRows: `${layout.cellSize}mm`, gap: `${gapMm}mm` }}>
                {pageEntries.map((entry, index) => (
                  <div key={index} className="relative flex items-center justify-center">
                    {entry ? <>{showCutMarks ? <div className="pointer-events-none absolute inset-0 border border-neutral-300/70" /> : null}{renderItem(entry)}</> : null}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
