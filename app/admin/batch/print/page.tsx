"use client";

import { useEffect, useMemo, useState } from "react";

type PrintPageSize = "A4" | "A3" | "custom";
type Orientation = "portrait" | "landscape";
type PrintSideMode = "qr" | "front" | "both" | "separate";
type ShapeOption = "round" | "square" | "drop";

const TEMPLATE_STORAGE_KEY = "dokuntag_template_artwork";
const FRONT_ARTWORK_STORAGE_KEY = "dokuntag_front_artwork_v2";
const LEGACY_TEMPLATE_STORAGE_KEY = "dokuntag_front_artwork";

type BatchItem = {
  code: string;
  label?: string;
};

type DesignState = {
  size: "1cm" | "2cm" | "2.5cm" | "3cm" | "4cm" | "5cm" | "6cm";
  shape: ShapeOption;
  codeText: string;
  hideCode: boolean;
  qrScale: number;
  codeScale?: number;
  codeGap: number;
  qrOffsetX?: number;
  qrOffsetY: number;
  foregroundColor: string;
  guideColor: string;
  showGuide: boolean;
  outputMode?: "qr" | "front" | "both";
  codeColor?: string;
  colorMode?: "both" | "qr" | "code";
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

type PageDims = {
  width: number;
  height: number;
};

type PrintEntry = {
  item: BatchItem;
  side: "qr" | "front";
};

function getBaseUrl() {
  const value =
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "http://localhost:3000";

  return value.replace(/\/+$/, "");
}

function tryParseJson<T>(value: string | null): T | null {
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function getDefaultArtwork(): ArtworkState {
  return {
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
}

function readSavedArtwork(storageKey: string, legacyKey?: string): ArtworkState {
  const current = tryParseJson<Partial<ArtworkState>>(
    window.localStorage.getItem(storageKey)
  );

  if (current) return { ...getDefaultArtwork(), ...current };

  if (legacyKey) {
    const legacy = tryParseJson<Partial<ArtworkState>>(
      window.localStorage.getItem(legacyKey)
    );

    if (legacy) return { ...getDefaultArtwork(), ...legacy };
  }

  return getDefaultArtwork();
}

function getRawPageSize(
  pageSize: PrintPageSize,
  customWidth: number,
  customHeight: number
): PageDims {
  if (pageSize === "A3") return { width: 420, height: 297 };
  if (pageSize === "custom") return { width: customWidth, height: customHeight };
  return { width: 297, height: 210 };
}

function getPageSize(
  pageSize: PrintPageSize,
  orientation: Orientation,
  customWidth: number,
  customHeight: number
): PageDims {
  const raw = getRawPageSize(pageSize, customWidth, customHeight);
  const portraitWidth = Math.min(raw.width, raw.height);
  const portraitHeight = Math.max(raw.width, raw.height);

  return orientation === "portrait"
    ? { width: portraitWidth, height: portraitHeight }
    : { width: portraitHeight, height: portraitWidth };
}

function buildDesignQuery(design: DesignState) {
  const params = new URLSearchParams();

  Object.entries(design).forEach(([key, value]) => {
    if (typeof value !== "undefined") {
      params.set(key, String(value));
    }
  });

  return params.toString();
}

function chunkItems<T>(items: T[], chunkSize: number) {
  if (chunkSize <= 0) return [items];

  const chunks: T[][] = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }

  return chunks;
}

function padPage<T>(items: T[], size: number): Array<T | null> {
  const next: Array<T | null> = [...items];

  while (next.length < size) {
    next.push(null);
  }

  return next;
}

function normalizePrintMode(value: string | null | undefined): PrintSideMode {
  if (value === "qr") return "qr";
  if (value === "front" || value === "template") return "front";
  if (value === "both") return "both";
  if (value === "separate") return "separate";
  return "qr";
}

function buildPrintEntries(items: BatchItem[], sideMode: PrintSideMode): PrintEntry[] {
  if (sideMode === "front") {
    return items.map((item) => ({ item, side: "front" }));
  }

  if (sideMode === "both") {
    return items.flatMap((item) => [
      { item, side: "front" as const },
      { item, side: "qr" as const }
    ]);
  }

  if (sideMode === "separate") {
    return [
      ...items.map((item) => ({ item, side: "front" as const })),
      ...items.map((item) => ({ item, side: "qr" as const }))
    ];
  }

  return items.map((item) => ({ item, side: "qr" }));
}

function getItemSizeMm(design: DesignState | null) {
  if (!design) return 30;
  if (design.size === "1cm") return 10;
  if (design.size === "2cm") return 20;
  if (design.size === "2.5cm") return 25;
  if (design.size === "4cm") return 40;
  if (design.size === "5cm") return 50;
  if (design.size === "6cm") return 60;
  return 30;
}

function getPageSizeLabel(
  pageSize: PrintPageSize,
  orientation: Orientation,
  customWidth: number,
  customHeight: number
) {
  if (pageSize === "custom") return `${customWidth} × ${customHeight} mm`;
  return `${pageSize} ${orientation === "portrait" ? "Dikey" : "Yatay"}`;
}

function getPrintModeLabel(mode: PrintSideMode) {
  if (mode === "front") return "Sadece ön yüz";
  if (mode === "both") return "Ön + QR yan yana";
  if (mode === "separate") return "Önler sonra QR’lar";
  return "Sadece QR yüzü";
}

function ArtworkLayer({
  artwork,
  label
}: {
  artwork: ArtworkState;
  label: string;
}) {
  if (!artwork.imageUrl) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center rounded-[24%] border border-dashed border-neutral-300 bg-neutral-50 px-2 text-center text-[8px] leading-tight text-neutral-500">
        <span>{label}</span>
      </div>
    );
  }

  return (
    <img
      src={artwork.imageUrl}
      alt={artwork.fileName || label}
      className="absolute left-1/2 top-1/2 h-full w-full"
      style={{
        objectFit: artwork.fit,
        transform: `translate(-50%, -50%) translate(${artwork.x}px, ${artwork.y}px) scale(${artwork.scale / 100})`
      }}
    />
  );
}

export default function BatchPrintPage() {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [design, setDesign] = useState<DesignState | null>(null);
  const [templateArtwork, setTemplateArtwork] = useState<ArtworkState>(
    getDefaultArtwork()
  );
  const [frontArtwork, setFrontArtwork] = useState<ArtworkState>(
    getDefaultArtwork()
  );
  const [pageSize, setPageSize] = useState<PrintPageSize>("A3");
  const [orientation, setOrientation] = useState<Orientation>("landscape");
  const [gapMm, setGapMm] = useState(4);
  const [marginMm, setMarginMm] = useState(8);
  const [showCutMarks, setShowCutMarks] = useState(true);
  const [printSideMode, setPrintSideMode] = useState<PrintSideMode>("qr");
  const [customWidth, setCustomWidth] = useState(420);
  const [customHeight, setCustomHeight] = useState(297);
  const [previewLimit, setPreviewLimit] = useState(120);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dataRaw = params.get("data");
    const designRaw = params.get("design");
    const storageKey = params.get("storageKey");
    const outputMode = params.get("outputMode");

    let loadedItems: BatchItem[] = [];
    let loadedDesign: DesignState | null = null;

    const directItems = tryParseJson<BatchItem[]>(dataRaw);
    if (Array.isArray(directItems)) {
      loadedItems = directItems;
    }
    if (storageKey) {
  const payload = tryParseJson<{
    items?: BatchItem[];
    design?: DesignState;
    templateArtwork?: ArtworkState;
    frontArtwork?: ArtworkState;
  }>(window.sessionStorage.getItem(`${storageKey}:payload`));

  if (payload) {
    if (Array.isArray(payload.items)) loadedItems = payload.items;
    if (payload.design) loadedDesign = payload.design;
    if (payload.templateArtwork) setTemplateArtwork({ ...getDefaultArtwork(), ...payload.templateArtwork });
    if (payload.frontArtwork) setFrontArtwork({ ...getDefaultArtwork(), ...payload.frontArtwork });
  }
}
    if (!loadedItems.length && storageKey) {
      const fromSession = tryParseJson<BatchItem[]>(
        window.sessionStorage.getItem(storageKey)
      );

      if (Array.isArray(fromSession)) {
        loadedItems = fromSession;
      } else {
        const fromLocal = tryParseJson<BatchItem[]>(
          window.localStorage.getItem(storageKey)
        );

        if (Array.isArray(fromLocal)) {
          loadedItems = fromLocal;
        }
      }
    }

    if (!loadedItems.length) {
      const fallbackItems = tryParseJson<BatchItem[]>(
        window.localStorage.getItem("dokuntag_batch_items")
      );

      if (Array.isArray(fallbackItems)) {
        loadedItems = fallbackItems;
      }
    }

    const directDesign = tryParseJson<DesignState>(designRaw);
    if (directDesign) {
      loadedDesign = directDesign;
    }

    if (!loadedDesign) {
      const savedDesign = tryParseJson<DesignState>(
        window.localStorage.getItem("dokuntag_qr_design")
      );

      if (savedDesign) {
        loadedDesign = savedDesign;
      }
    }

    setPrintSideMode(
      outputMode
        ? normalizePrintMode(outputMode)
        : normalizePrintMode(loadedDesign?.outputMode)
    );

    setItems(loadedItems);
    setDesign(loadedDesign);
    setTemplateArtwork((prev) =>
  prev.imageUrl ? prev : readSavedArtwork(TEMPLATE_STORAGE_KEY, LEGACY_TEMPLATE_STORAGE_KEY)
);

setFrontArtwork((prev) =>
  prev.imageUrl ? prev : readSavedArtwork(FRONT_ARTWORK_STORAGE_KEY)
);
  }, []);

  const baseUrl = getBaseUrl();
  const designQuery = useMemo(() => (design ? buildDesignQuery(design) : ""), [design]);
  const itemSizeMm = useMemo(() => getItemSizeMm(design), [design]);

  const pageDims = useMemo(
    () => getPageSize(pageSize, orientation, customWidth, customHeight),
    [pageSize, orientation, customWidth, customHeight]
  );

  const layout = useMemo(() => {
    const cutMarkReserve = showCutMarks ? 6 : 0;
    const printSafety = 3;

    const usableWidth = Math.max(
      pageDims.width - marginMm * 2 - printSafety * 2,
      itemSizeMm
    );
    const usableHeight = Math.max(
      pageDims.height - marginMm * 2 - printSafety * 2,
      itemSizeMm
    );

    const cellSize = itemSizeMm + cutMarkReserve;
    const columns = Math.max(1, Math.floor((usableWidth + gapMm) / (cellSize + gapMm)));
    const rows = Math.max(1, Math.floor((usableHeight + gapMm) / (cellSize + gapMm)));
    const perPage = Math.max(1, columns * rows);

    const gridWidth = columns * cellSize + Math.max(0, columns - 1) * gapMm;
    const gridHeight = rows * cellSize + Math.max(0, rows - 1) * gapMm;

    return {
      cellSize,
      columns,
      rows,
      perPage,
      gridWidth,
      gridHeight
    };
  }, [showCutMarks, pageDims.width, pageDims.height, marginMm, itemSizeMm, gapMm]);

  const printEntries = useMemo(
    () => buildPrintEntries(items, printSideMode),
    [items, printSideMode]
  );

  const previewItems = useMemo(
    () => printEntries.slice(0, previewLimit),
    [printEntries, previewLimit]
  );

  const previewPagesRaw = useMemo(
    () => chunkItems(previewItems, layout.perPage),
    [previewItems, layout.perPage]
  );

  const previewPages = useMemo(
    () => previewPagesRaw.map((page) => padPage(page, layout.perPage)),
    [previewPagesRaw, layout.perPage]
  );

  const totalPages = Math.max(1, Math.ceil(printEntries.length / layout.perPage));
  const previewPageCount = previewPages.length;

  const pageStyle = {
    width: `${pageDims.width}mm`,
    height: `${pageDims.height}mm`,
    overflow: "hidden" as const,
    boxSizing: "border-box" as const
  };

  const sheetInnerStyle = {
    width: `${pageDims.width - marginMm * 2}mm`,
    height: `${pageDims.height - marginMm * 2}mm`,
    margin: `${marginMm}mm`,
    boxSizing: "border-box" as const,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };

  const pageCss = useMemo(() => {
    const pageSizeText =
      pageSize === "custom"
        ? `${customWidth}mm ${customHeight}mm`
        : `${pageSize} ${orientation}`;

    return `
      @page {
        size: ${pageSizeText};
        margin: 0;
      }

      @media print {
        html, body {
          width: ${pageDims.width}mm;
          height: ${pageDims.height}mm;
          background: white !important;
        }

        body {
          margin: 0 !important;
        }
      }
    `;
  }, [pageSize, orientation, customWidth, customHeight, pageDims.width, pageDims.height]);

  const downloadZip = async () => {
    if (!items.length || !design) return;

    const response = await fetch("/api/admin/download-batch-zip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        items,
        design,
        templateArtwork,
        zipName: "dokuntag-batch"
      })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      alert(data?.error || "ZIP hazırlanamadı.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dokuntag-batch.zip";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadRealPdf = async () => {
    if (!items.length || !design) return;

    try {
      setPdfLoading(true);

      const response = await fetch("/api/admin/download-batch-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          items,
          design,
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
            fileName: `dokuntag-batch-${items.length}-${pageSize}`
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
      a.download = `dokuntag-batch-${items.length}-${printSideMode}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setPdfLoading(false);
    }
  };

  const openPrintForAll = () => {
    setPreviewLimit(printEntries.length);
    window.setTimeout(() => window.print(), 350);
  };

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-6 text-neutral-900 print:bg-white print:p-0">
      <style jsx global>{pageCss}</style>

      <div className="mx-auto max-w-[1800px] space-y-6 print:max-w-none print:space-y-0">
        <section className="rounded-[2rem] border border-neutral-200 bg-white px-6 py-6 shadow-sm print:hidden">
          <div className="flex flex-wrap gap-3">
            <div className="min-w-[220px]">
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                Baskı üretimi
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Toplu baskı görünümü
              </h1>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                Ön yüz ve QR yüzü üretim çıktısını aynı sayfada kontrol edebilirsin.
              </p>
            </div>

            <div className="ml-auto grid gap-3 sm:grid-cols-2 xl:grid-cols-8">
              <label className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                <span className="text-xs font-medium text-neutral-600">Baskı modu</span>
                <select
                  value={printSideMode}
                  onChange={(e) => setPrintSideMode(e.target.value as PrintSideMode)}
                  className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="qr">Sadece QR</option>
                  <option value="front">Sadece ön</option>
                  <option value="both">Ön + QR yan yana</option>
                  <option value="separate">Önler sonra QR’lar</option>
                </select>
              </label>

              <label className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                <span className="text-xs font-medium text-neutral-600">Sayfa</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as PrintPageSize)}
                  className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="A4">A4</option>
                  <option value="A3">A3</option>
                  <option value="custom">Özel</option>
                </select>
              </label>

              <label className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                <span className="text-xs font-medium text-neutral-600">Yön</span>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as Orientation)}
                  className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="landscape">Yatay</option>
                  <option value="portrait">Dikey</option>
                </select>
              </label>

              <label className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                <span className="text-xs font-medium text-neutral-600">Aralık (mm)</span>
                <input
                  type="number"
                  value={gapMm}
                  onChange={(e) => setGapMm(Number(e.target.value) || 0)}
                  className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
                />
              </label>

              <label className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                <span className="text-xs font-medium text-neutral-600">Kenar (mm)</span>
                <input
                  type="number"
                  value={marginMm}
                  onChange={(e) => setMarginMm(Number(e.target.value) || 0)}
                  className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
                />
              </label>

              {pageSize === "custom" ? (
                <>
                  <label className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                    <span className="text-xs font-medium text-neutral-600">Genişlik</span>
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(Number(e.target.value) || 420)}
                      className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
                    />
                  </label>

                  <label className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                    <span className="text-xs font-medium text-neutral-600">Yükseklik</span>
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(Number(e.target.value) || 297)}
                      className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
                    />
                  </label>
                </>
              ) : null}

              <label className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                <span className="text-xs font-medium text-neutral-600">Önizleme</span>
                <input
                  type="number"
                  min={1}
                  max={Math.max(printEntries.length, 1)}
                  value={previewLimit}
                  onChange={(e) =>
                    setPreviewLimit(Math.max(1, Number(e.target.value) || 1))
                  }
                  className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
                />
              </label>

              <label className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={showCutMarks}
                  onChange={(e) => setShowCutMarks(e.target.checked)}
                />
                Kesim çizgileri
              </label>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm">
            <span>Mod: <strong>{getPrintModeLabel(printSideMode)}</strong></span>
            <span>Sayfa: <strong>{getPageSizeLabel(pageSize, orientation, customWidth, customHeight)}</strong></span>
            <span>Kolon: <strong>{layout.columns}</strong></span>
            <span>Satır: <strong>{layout.rows}</strong></span>
            <span>Sayfa başına: <strong>{layout.perPage}</strong></span>
            <span>Toplam yüz: <strong>{printEntries.length}</strong></span>
            <span>Toplam baskı sayfası: <strong>{totalPages}</strong></span>
            <span>Önizleme sayfası: <strong>{previewPageCount}</strong></span>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white"
            >
              Görünen önizlemeyi PDF olarak kaydet / yazdır
            </button>

            <button
              type="button"
              onClick={openPrintForAll}
              className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium"
            >
              Tümünü aç ve yazdır
            </button>

            <button
              type="button"
              onClick={downloadRealPdf}
              disabled={!items.length || !design || pdfLoading}
              className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium"
            >
              {pdfLoading ? "PDF hazırlanıyor..." : "Gerçek PDF indir"}
            </button>

            <button
              type="button"
              onClick={downloadZip}
              className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium"
            >
              SVG ZIP indir
            </button>
          </div>
        </section>

        {!design || !items.length ? (
          <section className="rounded-[2rem] border border-neutral-200 bg-white px-6 py-8 shadow-sm">
            Baskı verisi bulunamadı. Toplu baskı sayfasını storageKey ile açman gerekiyor.
          </section>
        ) : (
          <div className="space-y-6 print:space-y-0">
            {previewPages.map((pageItems, pageIndex) => {
              const isLastPage = pageIndex === previewPages.length - 1;

              return (
                <section
                  key={`page-${pageIndex}`}
                  className={`mx-auto bg-white shadow-sm print:shadow-none ${
                    isLastPage ? "" : "print:break-after-page"
                  }`}
                  style={pageStyle}
                >
                  <div style={sheetInnerStyle}>
                    <div
                      className="grid"
                      style={{
                        gridTemplateColumns: `repeat(${layout.columns}, ${layout.cellSize}mm)`,
                        gridTemplateRows: `repeat(${layout.rows}, ${layout.cellSize}mm)`,
                        gap: `${gapMm}mm`,
                        width: `${layout.gridWidth}mm`,
                        height: `${layout.gridHeight}mm`,
                        boxSizing: "border-box",
                        justifyContent: "center",
                        alignContent: "center"
                      }}
                    >
                      {pageItems.map((entry, cellIndex) => {
                        if (!entry) {
                          return <div key={`empty-${pageIndex}-${cellIndex}`} />;
                        }

                        const effectiveCode = entry.item.code || "";
                        const imageUrl = `${baseUrl}/api/qr/${effectiveCode}?${designQuery}&transparent=true`;

                        return (
                          <div
                            key={`${effectiveCode}-${entry.side}-${pageIndex}-${cellIndex}`}
                            className="relative flex items-center justify-center"
                            style={{
                              width: `${layout.cellSize}mm`,
                              height: `${layout.cellSize}mm`
                            }}
                          >
                            {showCutMarks ? (
                              <>
                                <span className="absolute left-0 top-0 h-[6mm] w-[0.2mm] bg-black/30" />
                                <span className="absolute left-0 top-0 h-[0.2mm] w-[6mm] bg-black/30" />
                                <span className="absolute right-0 top-0 h-[6mm] w-[0.2mm] bg-black/30" />
                                <span className="absolute right-0 top-0 h-[0.2mm] w-[6mm] bg-black/30" />
                                <span className="absolute bottom-0 left-0 h-[6mm] w-[0.2mm] bg-black/30" />
                                <span className="absolute bottom-0 left-0 h-[0.2mm] w-[6mm] bg-black/30" />
                                <span className="absolute bottom-0 right-0 h-[6mm] w-[0.2mm] bg-black/30" />
                                <span className="absolute bottom-0 right-0 h-[0.2mm] w-[6mm] bg-black/30" />
                              </>
                            ) : null}

                            <div
                              className="relative flex items-center justify-center overflow-hidden bg-white"
                              style={{
                                width: `${itemSizeMm}mm`,
                                height: `${itemSizeMm}mm`
                              }}
                            >
                              {entry.side === "front" ? (
                                <ArtworkLayer
                                  artwork={frontArtwork}
                                  label={`Ön yüz alanı ${effectiveCode}`}
                                />
                              ) : (
                                <>
                                  <ArtworkLayer
                                    artwork={templateArtwork}
                                    label={`QR yüzü şablonu ${effectiveCode}`}
                                  />
                                  <img
                                    src={imageUrl}
                                    alt={effectiveCode}
                                    className="relative z-10 block h-full w-full"
                                  />
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}