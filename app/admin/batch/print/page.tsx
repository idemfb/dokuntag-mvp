"use client";

import { useEffect, useMemo, useState } from "react";

type PrintPageSize = "A4" | "A3" | "custom";
type Orientation = "portrait" | "landscape";
type ShapeOption = "round" | "square";
type DesignType = "standard" | "tag" | "card" | "vehicle" | "business";

type BatchItem = {
  code: string;
  label?: string;
};

type DesignState = {
  size: "2.5cm" | "3cm" | "4cm";
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
  brandWeight: "500" | "600" | "700" | "800";
  sloganWeight: "500" | "600" | "700" | "800";
  brandStyle: "normal" | "italic";
  sloganStyle: "normal" | "italic";
  codeStyle: "normal" | "italic";
  brandColor: string;
  sloganColor: string;
  codeColor: string;
  brandAlign: "left" | "center" | "right";
  sloganAlign: "left" | "center" | "right";
  badgeScale: number;
  badgeOffsetX: number;
  badgeOffsetY: number;
  lockTextAdjustments?: boolean;
};

type PageDims = {
  width: number;
  height: number;
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

  if (orientation === "portrait") {
    return { width: portraitWidth, height: portraitHeight };
  }

  return { width: portraitHeight, height: portraitWidth };
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

function getItemSizeMm(design: DesignState | null) {
  if (!design) return 30;
  if (design.size === "2.5cm") return 25;
  if (design.size === "4cm") return 40;
  return 30;
}

function getPageSizeLabel(
  pageSize: PrintPageSize,
  orientation: Orientation,
  customWidth: number,
  customHeight: number
) {
  if (pageSize === "custom") {
    return `${customWidth} × ${customHeight} mm`;
  }
  return `${pageSize} ${orientation === "portrait" ? "Dikey" : "Yatay"}`;
}

export default function BatchPrintPage() {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [design, setDesign] = useState<DesignState | null>(null);
  const [pageSize, setPageSize] = useState<PrintPageSize>("A3");
  const [orientation, setOrientation] = useState<Orientation>("landscape");
  const [gapMm, setGapMm] = useState(4);
  const [marginMm, setMarginMm] = useState(8);
  const [showCutMarks, setShowCutMarks] = useState(true);
  const [customWidth, setCustomWidth] = useState(420);
  const [customHeight, setCustomHeight] = useState(297);
  const [previewLimit, setPreviewLimit] = useState(120);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dataRaw = params.get("data");
    const designRaw = params.get("design");
    const storageKey = params.get("storageKey");

    let loadedItems: BatchItem[] = [];
    let loadedDesign: DesignState | null = null;

    const directItems = tryParseJson<BatchItem[]>(dataRaw);
    if (Array.isArray(directItems)) {
      loadedItems = directItems;
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

    setItems(loadedItems);
    setDesign(loadedDesign);
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

  const previewItems = useMemo(() => items.slice(0, previewLimit), [items, previewLimit]);
  const previewPagesRaw = useMemo(
    () => chunkItems(previewItems, layout.perPage),
    [previewItems, layout.perPage]
  );
  const previewPages = useMemo(
    () => previewPagesRaw.map((page) => padPage(page, layout.perPage)),
    [previewPagesRaw, layout.perPage]
  );

  const totalPages = Math.max(1, Math.ceil(items.length / layout.perPage));
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
          options: {
            pageSize,
            orientation,
            customWidth,
            customHeight,
            gapMm,
            marginMm,
            showCutMarks,
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
      a.download = `dokuntag-batch-${items.length}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setPdfLoading(false);
    }
  };

  const openPrintForAll = () => {
    setPreviewLimit(items.length);
    window.setTimeout(() => window.print(), 350);
  };

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-6 text-neutral-900 print:bg-white print:p-0">
      <style jsx global>{pageCss}</style>

      <div className="mx-auto max-w-[1800px] space-y-6 print:max-w-none print:space-y-0">
        <section className="rounded-[2rem] border border-neutral-200 bg-white px-6 py-6 shadow-sm print:hidden">
          <div className="flex flex-wrap gap-3">
            <div className="min-w-[220px]">
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">Baskı üretimi</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Toplu baskı görünümü</h1>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                Önizleme, gerçek PDF ve SVG ZIP aynı sayfada. Burada gördüğün ayarla gerçek PDF alabilirsin.
              </p>
            </div>

            <div className="ml-auto grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
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
                <span className="text-xs font-medium text-neutral-600">QR aralığı (mm)</span>
                <input
                  type="number"
                  value={gapMm}
                  onChange={(e) => setGapMm(Number(e.target.value) || 0)}
                  className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
                />
              </label>

              <label className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                <span className="text-xs font-medium text-neutral-600">Kenar boşluğu (mm)</span>
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
                    <span className="text-xs font-medium text-neutral-600">Özel genişlik (mm)</span>
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(Number(e.target.value) || 420)}
                      className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
                    />
                  </label>

                  <label className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                    <span className="text-xs font-medium text-neutral-600">Özel yükseklik (mm)</span>
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
                <span className="text-xs font-medium text-neutral-600">Önizleme adedi</span>
                <input
                  type="number"
                  min={1}
                  max={Math.max(items.length, 1)}
                  value={previewLimit}
                  onChange={(e) => setPreviewLimit(Math.max(1, Number(e.target.value) || 1))}
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
            <span>Sayfa: <strong>{getPageSizeLabel(pageSize, orientation, customWidth, customHeight)}</strong></span>
            <span>Kolon: <strong>{layout.columns}</strong></span>
            <span>Satır: <strong>{layout.rows}</strong></span>
            <span>Sayfa başına: <strong>{layout.perPage}</strong></span>
            <span>Grid genişliği: <strong>{layout.gridWidth} mm</strong></span>
            <span>Grid yüksekliği: <strong>{layout.gridHeight} mm</strong></span>
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
                      {pageItems.map((item, cellIndex) => {
                        if (!item) {
                          return <div key={`empty-${pageIndex}-${cellIndex}`} />;
                        }

                        const effectiveCode = item.code || "";
                        const imageUrl = `${baseUrl}/api/qr/${effectiveCode}?${designQuery}`;

                        return (
                          <div
                            key={`${effectiveCode}-${cellIndex}`}
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
                              className="flex items-center justify-center"
                              style={{
                                width: `${itemSizeMm}mm`,
                                height: `${itemSizeMm}mm`
                              }}
                            >
                              <img src={imageUrl} alt={effectiveCode} className="block h-full w-full" />
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