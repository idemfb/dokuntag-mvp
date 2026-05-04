
"use client";

import { useEffect, useMemo, useState } from "react";

type BatchItem = {
  code: string;
  label: string;
  setupLink: string;
  qrPageLink: string;
  qrDownloadLink: string;
  status?: "production_hold" | "unclaimed" | "active" | "inactive" | "void";
};

type PdfPageSize = "A4" | "A3" | "custom";
type PdfOrientation = "portrait" | "landscape";
type ShapeOption = "round" | "square" | "drop";
type DesignType = "standard" | "tag" | "card" | "vehicle" | "business";

type DesignState = {
  size: "2.5cm" | "3cm" | "4cm";
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
  foregroundColor: string;
  guideColor: string;
  showGuide: boolean;
  colorMode: "both" | "qr" | "code";
};
type TemplateArtworkState = {
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
const TEMPLATE_STORAGE_KEY = "dokuntag_template_artwork";
const LEGACY_TEMPLATE_STORAGE_KEY = "dokuntag_front_artwork";
function getMainSiteUrl() {
  const value =
    process.env.NEXT_PUBLIC_MAIN_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://dokuntag.com";

  return value.replace(/\/+$/, "");
}

function buildPrintText(items: BatchItem[]) {
  return items.map((item) => `${item.code} | ${item.label} | ${item.setupLink}`).join("\n");
}

function buildOpsText(items: BatchItem[]) {
  return items
    .map((item) => `${item.code} | ${item.label} | ${item.setupLink}`)
    .join("\n");
}

function buildFullText(items: BatchItem[]) {
  return items
    .map((item) =>
      [
        item.code,
        item.label,
        item.setupLink,
        item.qrPageLink,
        item.qrDownloadLink
      ].join(" | ")
    )
    .join("\n");
}

function getDefaultDesign(): DesignState {
  return {
    size: "3cm",
    shape: "round",
    hasHole: true,
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
    lockTextAdjustments: false,
    foregroundColor: "#111111",
    guideColor: "#ef4444",
    showGuide: false,
    colorMode: "both"
  };
}

function tryGetSavedDesign(): DesignState {
  try {
    const raw = window.localStorage.getItem("dokuntag_qr_design");
    if (!raw) return getDefaultDesign();
    return { ...getDefaultDesign(), ...(JSON.parse(raw) as Partial<DesignState>) };
  } catch {
    return getDefaultDesign();
  }
}
function getDefaultTemplateArtwork(): TemplateArtworkState {
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

function tryGetSavedTemplateArtwork(): TemplateArtworkState {
  try {
    const raw =
      window.localStorage.getItem(TEMPLATE_STORAGE_KEY) ||
      window.localStorage.getItem(LEGACY_TEMPLATE_STORAGE_KEY);

    if (!raw) return getDefaultTemplateArtwork();

    return {
      ...getDefaultTemplateArtwork(),
      ...(JSON.parse(raw) as Partial<TemplateArtworkState>)
    };
  } catch {
    return getDefaultTemplateArtwork();
  }
}
export default function AdminBatchPage() {
  const mainSiteUrl = getMainSiteUrl();

  const [count, setCount] = useState("20");
  const [labelTemplate, setLabelTemplate] = useState("Dokuntag");
  const [existingCode, setExistingCode] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<BatchItem[]>([]);
  const [productionBatchName, setProductionBatchName] = useState("");
  const [productionBatches, setProductionBatches] = useState<any[]>([]);
  const [productionSaving, setProductionSaving] = useState(false);
  const [productionLoading, setProductionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | BatchItem["status"] | "test">("all");
  const [sortBy, setSortBy] = useState<"code" | "status" | "label">("code");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [pdfPageSize, setPdfPageSize] = useState<PdfPageSize>("A3");
  const [pdfOrientation, setPdfOrientation] = useState<PdfOrientation>("landscape");
  const [pdfGapMm, setPdfGapMm] = useState("4");
  const [pdfMarginMm, setPdfMarginMm] = useState("8");
  const [pdfCutMarks, setPdfCutMarks] = useState(true);
  const [pdfCustomWidth, setPdfCustomWidth] = useState("420");
  const [pdfCustomHeight, setPdfCustomHeight] = useState("297");
  const [design, setDesign] = useState<DesignState>(() => tryGetSavedDesign());

  const [templateArtwork, setTemplateArtwork] = useState<TemplateArtworkState>(() =>
  tryGetSavedTemplateArtwork()
);
 useEffect(() => {
  setDesign(tryGetSavedDesign());
  setTemplateArtwork(tryGetSavedTemplateArtwork());
  fetchProductionBatches();

  function handleFocus() {
    setDesign(tryGetSavedDesign());
    setTemplateArtwork(tryGetSavedTemplateArtwork());

    fetchProductionBatches();
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === "dokuntag_qr_design") {
      setDesign(tryGetSavedDesign());
    }

    if (
      event.key === "dokuntag_template_artwork" ||
      event.key === "dokuntag_front_artwork"
    ) {
      setTemplateArtwork(tryGetSavedTemplateArtwork());
    }
  }

  window.addEventListener("focus", handleFocus);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener("focus", handleFocus);
    window.removeEventListener("storage", handleStorage);
  };
}, []);
  function updateDesign<K extends keyof DesignState>(key: K, value: DesignState[K]) {
    setDesign((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "foregroundColor" && prev.colorMode === "both") {
  next.codeColor = value as string;
}

if (key === "codeColor" && prev.colorMode === "both") {
  next.foregroundColor = value as string;
}
      try {
        window.localStorage.setItem("dokuntag_qr_design", JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  const printText = useMemo(() => buildPrintText(items), [items]);
  const opsText = useMemo(() => buildOpsText(items), [items]);
  const fullText = useMemo(() => buildFullText(items), [items]);
  const statusCounts = useMemo(() => {
  return items.reduce(
    (acc, item) => {
      const status = item.status || "production_hold";
      acc.total += 1;
      acc[status] += 1;

      if (isTestItem(item)) {
        acc.test += 1;
      }

      return acc;
    },
    {
      total: 0,
      production_hold: 0,
      unclaimed: 0,
      active: 0,
      inactive: 0,
      void: 0,
      test: 0
    }
  );
}, [items]);

const visibleItems = useMemo(() => {
  const filtered = items.filter((item) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "test") return isTestItem(item);
    return (item.status || "production_hold") === statusFilter;
  });

  const sorted = [...filtered].sort((a, b) => {
    const aValue =
      sortBy === "status" ? getStatusLabel(a.status) : sortBy === "label" ? a.label : a.code;

    const bValue =
      sortBy === "status" ? getStatusLabel(b.status) : sortBy === "label" ? b.label : b.code;

    return sortDirection === "asc"
      ? aValue.localeCompare(bValue, "tr")
      : bValue.localeCompare(aValue, "tr");
  });

  return sorted;
}, [items, statusFilter, sortBy, sortDirection]);

  function normalizeAdminCode(value: string) {
  return value
    .toLocaleUpperCase("tr-TR")
    .replace(/Ç/g, "C")
    .replace(/Ğ/g, "G")
    .replace(/İ/g, "I")
    .replace(/I/g, "I")
    .replace(/Ö/g, "O")
    .replace(/Ş/g, "S")
    .replace(/Ü/g, "U")
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);
}

  function makeItemFromExistingCode(rawCode: string): BatchItem | null {
    const normalizedCode = normalizeAdminCode(rawCode);
    if (!normalizedCode) return null;

    const designQuery = new URLSearchParams();
    Object.entries(design).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      designQuery.set(key, String(value));
    });

    const query = designQuery.toString() ? `?${designQuery.toString()}` : "";
    const baseUrl = window.location.origin;

    return {
      code: normalizedCode,
      label: normalizedCode,
      setupLink: `${baseUrl}/t/${normalizedCode}`,
      qrPageLink: `${baseUrl}/qr/${normalizedCode}${query}`,
      qrDownloadLink: `${baseUrl}/api/qr-download/${normalizedCode}${query}`,
      status: "production_hold",
    };
  }

  function addExistingCodeToList() {
    const nextItem = makeItemFromExistingCode(existingCode);
    if (!nextItem) {
      setError("Kod girin.");
      return;
    }

    setItems((prev) => {
      const filtered = prev.filter((item) => item.code !== nextItem.code);
      const nextItems = [nextItem, ...filtered];
      try {
        window.localStorage.setItem("dokuntag_batch_items", JSON.stringify(nextItems));
      } catch {}
      return nextItems;
    });
    setExistingCode(nextItem.code);
    setError("");
  }

  function getStatusLabel(status?: BatchItem["status"]) {
    if (status === "production_hold") return "Kontrol bekliyor";
    if (status === "unclaimed") return "Satışa açık";
    if (status === "active") return "Kuruldu";
    if (status === "inactive") return "Pasif";
    if (status === "void") return "İptal";
    return "Kontrol bekliyor";
  }
  function isTestItem(item: BatchItem) {
  return item.code.startsWith("TEST");
}

function getStatusBadgeClass(status?: BatchItem["status"]) {
  if (status === "unclaimed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "active") {
    return "border-green-300 bg-green-100 text-green-800";
  }

  if (status === "inactive") {
    return "border-neutral-300 bg-neutral-100 text-neutral-600";
  }

  if (status === "void") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-800";
}

function toggleSort(nextSortBy: "code" | "status" | "label") {
  if (sortBy === nextSortBy) {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    return;
  }

  setSortBy(nextSortBy);
  setSortDirection("asc");
}
  async function updateItemStatus(code: string, action: "release" | "void") {
    const message = action === "release"
      ? `${code} kodu kontrol edildi ve kurulum/satışa açılacak. Onaylıyor musunuz?`
      : `${code} kodu hatalı/iptal olarak kapatılacak. Bu kod artık kullanılamaz. Onaylıyor musunuz?`;

    if (!window.confirm(message)) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/admin/generate-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, code })
      });

      const data = (await res.json()) as { error?: string; status?: BatchItem["status"] };

      if (!res.ok) {
        throw new Error(data?.error || "Durum güncellenemedi.");
      }

      setItems((prev) => {
        const nextItems = prev.map((item) =>
          item.code === code ? { ...item, status: data.status } : item
        );
        try {
          window.localStorage.setItem("dokuntag_batch_items", JSON.stringify(nextItems));
        } catch {}
        return nextItems;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Durum güncellenemedi.");
    } finally {
      setLoading(false);
    }
  }
  async function fetchProductionBatches() {
  try {
    setProductionLoading(true);

    const res = await fetch("/api/admin/production-batches", {
      cache: "no-store"
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "Üretim listesi alınamadı.");
    }

    setProductionBatches(Array.isArray(data.batches) ? data.batches : []);
  } catch {
    setProductionBatches([]);
  } finally {
    setProductionLoading(false);
  }
}

async function sendCurrentListToProduction() {
  if (!items.length) {
    setError("Üretime gönderilecek liste boş.");
    return;
  }

  const confirmed = window.confirm(
    `${items.length} ürün üretime gönderilen listeye kaydedilecek. Aynı kodlar tekrar üretime gönderilemez. Onaylıyor musunuz?`
  );

  if (!confirmed) return;

  try {
    setProductionSaving(true);
    setError("");

    const res = await fetch("/api/admin/production-batches", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: productionBatchName || `${labelTemplate} - ${items.length} adet`,
        items
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "Üretim listesi kaydedilemedi.");
    }

    setProductionBatchName("");
    await fetchProductionBatches();
  } catch (err) {
    setError(err instanceof Error ? err.message : "Üretim listesi kaydedilemedi.");
  } finally {
    setProductionSaving(false);
  }
}
  async function handleGenerateCustomCode() {
    try {
      setLoading(true);
      setError("");

      const normalizedCode = normalizeAdminCode(customCode);
      if (normalizedCode.length < 3 || normalizedCode.length > 10) {
        throw new Error("Özel kod 3-10 karakter arası olmalı ve sadece A-Z / 0-9 içermelidir.");
      }

      const res = await fetch("/api/admin/generate-batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customCode: normalizedCode,
          labelTemplate,
          design
        })
      });

      const data = (await res.json()) as {
        error?: string;
        items?: BatchItem[];
      };

      if (!res.ok) {
        throw new Error(data?.error || "Özel kod üretilemedi.");
      }

      const nextItems = Array.isArray(data.items) ? data.items : [];
      setItems(nextItems);
      try {
        window.localStorage.setItem("dokuntag_batch_items", JSON.stringify(nextItems));
      } catch {}
    } catch (err) {
      setError(err instanceof Error ? err.message : "Özel kod üretilemedi.");
    } finally {
      setLoading(false);
    }
  }
  async function handleResetTestPool() {
  const confirmed = window.confirm(
    "TEST001–TEST200 test kodları sıfırlanacak. Test kayıtları temizlenir ve tekrar üretim kontrol durumuna alınır. Onaylıyor musunuz?"
  );

  if (!confirmed) return;

  try {
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/generate-batch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "reset-test-pool",
        count: 200,
        labelTemplate: "Test",
        design
      })
    });

    const data = (await res.json()) as {
      error?: string;
      items?: BatchItem[];
    };

    if (!res.ok) {
      throw new Error(data?.error || "Test kodları sıfırlanamadı.");
    }

    const nextItems = Array.isArray(data.items) ? data.items : [];
    setItems(nextItems);

  } catch (err) {
    setError(err instanceof Error ? err.message : "Test kodları sıfırlanamadı.");
  } finally {
    setLoading(false);
  }
}
  async function handleGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const parsedCount = Number(count);

      const res = await fetch("/api/admin/generate-batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          count: parsedCount,
          labelTemplate,
          design
        })
      });

      const data = (await res.json()) as {
        error?: string;
        items?: BatchItem[];
      };

      if (!res.ok) {
        throw new Error(data?.error || "Toplu üretim başarısız.");
      }

      const nextItems = Array.isArray(data.items) ? data.items : [];
      setItems(nextItems);

      try {
        window.localStorage.setItem("dokuntag_batch_items", JSON.stringify(nextItems));
      } catch {}
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function copyText(value: string) {
    if (!value) return;
    await navigator.clipboard.writeText(value);
  }

  function escapeCsvCell(value: string) {
    const text = String(value || "");
    return `"${text.replace(/"/g, '""')}"`;
  }

  function downloadExcelCsv() {
    if (!items.length) return;

    const headers = ["Kod", "Durum", "Etiket", "NFC Link", "QR Sayfası", "QR İndir"];
    const rows = items.map((item) => [
      item.code,
      getStatusLabel(item.status),
      item.label,
      item.setupLink,
      item.qrPageLink,
      item.qrDownloadLink
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => escapeCsvCell(cell)).join(";"))
      .join("\n");

    const blob = new Blob([`\ufeff${csv}`], {
      type: "text/csv;charset=utf-8"
    });

    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `dokuntag-batch-${items.length}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.URL.revokeObjectURL(url);
  }

  async function downloadZip() {
    if (!items.length) return;

    try {
      setZipLoading(true);
      setError("");

      const res = await fetch("/api/admin/download-batch-zip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
        zipName: `dokuntag-batch-${items.length}`,
        design,
        templateArtwork,
        items: items.map((item) => ({
          code: item.code,
          label: item.label
        }))
      })
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data?.error || "ZIP indirilemedi.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `dokuntag-batch-${items.length}.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ZIP indirilemedi.");
    } finally {
      setZipLoading(false);
    }
  }

  function openPrintView() {
    if (!items.length) return;

    try {
      setPrintLoading(true);
      setError("");

      const storageKey = `dokuntag_batch_${Date.now()}`;
      window.sessionStorage.setItem(storageKey, JSON.stringify(items));
      window.localStorage.setItem("dokuntag_batch_items", JSON.stringify(items));
      window.localStorage.setItem("dokuntag_qr_design", JSON.stringify(design));
      window.localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templateArtwork));
      window.open(
        `/admin/batch/print?storageKey=${encodeURIComponent(storageKey)}`,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Baskı görünümü açılamadı.");
    } finally {
      setPrintLoading(false);
    }
  }

  async function downloadPdf() {
    if (!items.length) return;

    try {
      setPdfLoading(true);
      setError("");
   
      const res = await fetch("/api/admin/download-batch-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
        items: items.map((item) => ({
          code: item.code,
          label: item.label
        })),
        design,
        templateArtwork,
        options: {
            pageSize: pdfPageSize,
            orientation: pdfOrientation,
            gapMm: Number(pdfGapMm) || 4,
            marginMm: Number(pdfMarginMm) || 8,
            showCutMarks: pdfCutMarks,
            customWidth: Number(pdfCustomWidth) || 420,
            customHeight: Number(pdfCustomHeight) || 297,
            fileName: `dokuntag-batch-${items.length}-${pdfPageSize}`
          }
        })
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data?.error || "PDF indirilemedi.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `dokuntag-batch-${items.length}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF indirilemedi.");
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 text-neutral-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-neutral-100/80 px-6 py-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <a
                href={mainSiteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-neutral-500 transition hover:text-neutral-900 hover:underline"
              >
                Dokuntag ana sayfa
              </a>

              <a
                href="/"
                className="text-sm text-neutral-500 transition hover:text-neutral-900 hover:underline"
              >
                Ana sisteme dön
              </a>
            </div>

            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-neutral-400">
              Dokuntag
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Toplu kod ve QR üretimi
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
              Üretilen tüm kodlar önce <strong>kontrol bekliyor</strong> durumunda oluşturulur.
              ZIP ve gerçek PDF çıktısı tek yerden alınır.
            </p>
          </div>

          <div className="px-6 py-6">
            <form onSubmit={handleGenerate} className="grid gap-4 md:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-neutral-700">
                  Adet
                </span>
                <input
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  inputMode="numeric"
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500"
                  placeholder="20"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-neutral-700">
                  Liste etiketi
                </span>
                <input
                  value={labelTemplate}
                  onChange={(e) => setLabelTemplate(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500"
                  placeholder="Üretim etiketi"
                />
              </label>

              <div className="md:col-span-3 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Üretiliyor..." : "Toplu üretim başlat"}
                </button>

                <button
                  type="button"
                  onClick={() => copyText(printText)}
                  disabled={!items.length}
                  className="rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Baskı listesini kopyala
                </button>

                <button
                  type="button"
                  onClick={() => copyText(opsText)}
                  disabled={!items.length}
                  className="rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Operasyon listesini kopyala
                </button>

                <button
                  type="button"
                  onClick={() => copyText(fullText)}
                  disabled={!items.length}
                  className="rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Tam listeyi kopyala
                </button>


                <button
                  type="button"
                  onClick={downloadExcelCsv}
                  disabled={!items.length}
                  className="rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Excel / CSV indir
                </button>

                <button
                  type="button"
                  onClick={downloadZip}
                  disabled={!items.length || zipLoading}
                  className="rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {zipLoading ? "ZIP hazırlanıyor..." : "Tüm QR'ları ZIP indir"}
                </button>

                <button
                  type="button"
                  onClick={openPrintView}
                  disabled={!items.length || printLoading}
                  className="rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {printLoading ? "Açılıyor..." : "Baskı görünümünü aç"}
                </button>
                <button
                  type="button"
                  onClick={sendCurrentListToProduction}
                  disabled={!items.length || productionSaving}
                  className="rounded-2xl border border-blue-300 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-800 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {productionSaving ? "Kaydediliyor..." : "Üretime gönderilen listeye ekle"}
                </button>
              </div>
            </form>
              <div className="mt-4 max-w-xl">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-neutral-700">
                    Üretim liste adı
                  </span>
                  <input
                    value={productionBatchName}
                    onChange={(e) => setProductionBatchName(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500"
                    placeholder="Örn. Damla V2 ilk üretim - 100 adet"
                  />
                </label>
              </div>
            <div className="mt-5 grid gap-3 rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-neutral-900">Mevcut QR kodu tekrar hazırla</p>
                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Daha önce oluşturulmuş bir kodu yeniden baskı listesine ekler. NFC linki yine /t/KOD olur.
                </p>
                <div className="mt-3 flex gap-2">
                  <input
                    value={existingCode}
                    onChange={(e) => setExistingCode(normalizeAdminCode(e.target.value))}
                    className="min-w-0 flex-1 rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500"
                    placeholder="Örn. FCMYLK"
                  />
                  <button
                    type="button"
                    onClick={addExistingCodeToList}
                    className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-white"
                  >
                    Listeye ekle
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-neutral-900">Özel kod üret</p>
                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Premium özel sipariş için 3-10 karakter A-Z / 0-9 kod üretir. Aynısı varsa izin verilmez.
                </p>
                <div className="mt-3 flex gap-2">
                  <input
                    value={customCode}
                    onChange={(e) => setCustomCode(normalizeAdminCode(e.target.value))}
                    className="min-w-0 flex-1 rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500"
                    placeholder="Örn. IBRAHIM"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateCustomCode}
                    disabled={loading}
                    className="rounded-2xl border border-neutral-900 bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
                  >
                    Özel üret
                  </button>
                  <button
                    type="button"
                    onClick={handleResetTestPool}
                    disabled={loading}
                    className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-neutral-50 disabled:opacity-60"
                  >
                    Test havuzunu sıfırla
                  </button>
                </div>
              </div>
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
                {error}
              </div>
            ) : null}
          </div>
        </section>


        <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-6 py-5">
            <h2 className="text-lg font-semibold">QR baskı ayarları</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Sade üretim standardı: sadece QR ve altında ürün kodu. Matbaa şablonu geldiğinde arka plan/template katmanı bu yapıya eklenecek.
            </p>
          </div>

          <div className="grid gap-4 px-6 py-6 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-neutral-700">Ürün formu</span>
              <select
                value={design.shape}
                onChange={(e) => updateDesign("shape", e.target.value as ShapeOption)}
                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500"
              >
                <option value="round">Yuvarlak</option>
                <option value="square">Kare</option>
                <option value="drop">Damla V2</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-neutral-700">Etiket ölçüsü</span>
              <select
                value={design.size}
                onChange={(e) => updateDesign("size", e.target.value as DesignState["size"])}
                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500"
              >
                <option value="2.5cm">2.5 cm</option>
                <option value="3cm">3 cm</option>
                <option value="4cm">4 cm</option>
              </select>
            </label>

            <label className="flex items-center gap-2 rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={design.hasHole}
                onChange={(e) => updateDesign("hasHole", e.target.checked)}
              />
              Delik alanı göster
            </label>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900 md:col-span-1">
              Baskıdan önce tek örnek indirip telefonda okutma testi yap. QR ve kod güvenli alanı aşmamalı.
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-6 py-5">
            <h2 className="text-lg font-semibold">Gerçek PDF üretimi</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Tarayıcı print yerine doğrudan server-side PDF üretir. Matbaa için daha tutarlı sonuç verir.
            </p>
          </div>

          <div className="grid gap-4 px-6 py-6 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-neutral-700">PDF sayfa tipi</span>
              <select
                value={pdfPageSize}
                onChange={(e) => setPdfPageSize(e.target.value as PdfPageSize)}
                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500"
              >
                <option value="A4">A4</option>
                <option value="A3">A3</option>
                <option value="custom">Özel</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-neutral-700">Yön</span>
              <select
                value={pdfOrientation}
                onChange={(e) => setPdfOrientation(e.target.value as PdfOrientation)}
                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500"
              >
                <option value="landscape">Yatay</option>
                <option value="portrait">Dikey</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-neutral-700">QR aralığı (mm)</span>
              <input
                value={pdfGapMm}
                onChange={(e) => setPdfGapMm(e.target.value)}
                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-neutral-700">Kenar boşluğu (mm)</span>
              <input
                value={pdfMarginMm}
                onChange={(e) => setPdfMarginMm(e.target.value)}
                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500"
              />
            </label>

            {pdfPageSize === "custom" ? (
              <>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-neutral-700">Özel genişlik (mm)</span>
                  <input
                    value={pdfCustomWidth}
                    onChange={(e) => setPdfCustomWidth(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-neutral-700">Özel yükseklik (mm)</span>
                  <input
                    value={pdfCustomHeight}
                    onChange={(e) => setPdfCustomHeight(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500"
                  />
                </label>
              </>
            ) : null}

            <label className="flex items-center gap-2 rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={pdfCutMarks}
                onChange={(e) => setPdfCutMarks(e.target.checked)}
              />
              Kesim çizgileri
            </label>

            <div className="md:col-span-3">
              <button
                type="button"
                onClick={downloadPdf}
                disabled={!items.length || pdfLoading}
                className="rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pdfLoading ? "PDF hazırlanıyor..." : "Gerçek PDF indir"}
              </button>
            </div>
          </div>
        </section>
           <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-6 py-5">
    <div>
      <h2 className="text-lg font-semibold">Üretime gönderilen listeler</h2>
      <p className="mt-1 text-sm text-neutral-600">
        Baskıya gönderdiğin batch’ler burada kalıcı olarak görünür.
      </p>
    </div>

    <button
      type="button"
      onClick={fetchProductionBatches}
      className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-neutral-50"
    >
      Yenile
    </button>
  </div>

  <div className="px-6 py-5">
    {productionLoading ? (
      <p className="text-sm text-neutral-500">Yükleniyor...</p>
    ) : productionBatches.length ? (
      <div className="space-y-3">
        {productionBatches.map((batch) => {
          const summary = batch.summary || {};
          const total = Number(summary.total || 0);
          const ready = Number(summary.unclaimed || 0);
          const voidCount = Number(summary.void || 0);
          const waiting = Number(summary.production_hold || 0);
          const percent = total ? Math.round(((ready + voidCount) / total) * 100) : 0;

          return (
            <div key={batch.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-950">{batch.name}</p>
                  <p className="mt-1 text-xs text-neutral-500">{batch.id}</p>
                </div>

                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  Üretimde
                </span>
              </div>

              <div className="mt-4 grid gap-2 text-xs sm:grid-cols-4">
                <div className="rounded-xl bg-white p-3">Toplam: <strong>{total}</strong></div>
                <div className="rounded-xl bg-white p-3">Bekleyen: <strong>{waiting}</strong></div>
                <div className="rounded-xl bg-white p-3">Hazır: <strong>{ready}</strong></div>
                <div className="rounded-xl bg-white p-3">Hatalı: <strong>{voidCount}</strong></div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-neutral-950"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <p className="mt-2 text-xs text-neutral-500">
                Tamamlanma: %{percent}
              </p>
              <details className="mt-3 rounded-xl border border-neutral-200 bg-white p-3">
  <summary className="cursor-pointer text-xs font-semibold text-neutral-700">
    Kod listesini göster
  </summary>

  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
    {(batch.items || []).map((item: any) => (
      <div
        key={item.code}
        className="flex items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs"
      >
        <span className="font-semibold text-neutral-900">{item.code}</span>
        <span className={`rounded-full border px-2 py-0.5 font-semibold ${getStatusBadgeClass(item.status)}`}>
          {getStatusLabel(item.status)}
        </span>
      </div>
    ))}
  </div>
</details>
            </div>
          );
        })}
      </div>
    ) : (
      <p className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm text-neutral-500">
        Henüz üretime gönderilmiş kalıcı liste yok.
      </p>
    )}
  </div>
</section>   
        {items.length ? (
  <>
    <section className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm">
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <p className="text-xs text-neutral-500">Toplam</p>
      <p className="mt-1 text-2xl font-semibold">{statusCounts.total}</p>
    </div>

    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
      <p className="text-xs">Kontrol bekliyor</p>
      <p className="mt-1 text-2xl font-semibold">{statusCounts.production_hold}</p>
    </div>

    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
      <p className="text-xs">Satışa açık</p>
      <p className="mt-1 text-2xl font-semibold">{statusCounts.unclaimed}</p>
    </div>

    <div className="rounded-2xl border border-green-300 bg-green-100 p-4 text-green-800">
      <p className="text-xs">Aktif</p>
      <p className="mt-1 text-2xl font-semibold">{statusCounts.active}</p>
    </div>

    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
      <p className="text-xs">İptal / hatalı</p>
      <p className="mt-1 text-2xl font-semibold">{statusCounts.void}</p>
    </div>

    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-800">
      <p className="text-xs">Test kodu</p>
      <p className="mt-1 text-2xl font-semibold">{statusCounts.test}</p>
    </div>
  </div>

  <div className="mt-4 grid gap-3 md:grid-cols-3">
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-neutral-500">Filtre</span>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
        className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
      >
        <option value="all">Tümü</option>
        <option value="production_hold">Kontrol bekliyor</option>
        <option value="unclaimed">Satışa açık</option>
        <option value="active">Aktif</option>
        <option value="inactive">Pasif</option>
        <option value="void">İptal / hatalı</option>
        <option value="test">Test kodları</option>
      </select>
    </label>

    <label className="block">
      <span className="mb-2 block text-xs font-medium text-neutral-500">Sıralama</span>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
        className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
      >
        <option value="code">Koda göre</option>
        <option value="status">Duruma göre</option>
        <option value="label">Etikete göre</option>
      </select>
    </label>

    <label className="block">
      <span className="mb-2 block text-xs font-medium text-neutral-500">Yön</span>
      <select
        value={sortDirection}
        onChange={(e) => setSortDirection(e.target.value as typeof sortDirection)}
        className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
      >
        <option value="asc">Artan</option>
        <option value="desc">Azalan</option>
      </select>
    </label>
  </div>
</section>

      <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 px-6 py-5">
                <h2 className="text-lg font-semibold">Üretilen kodlar</h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Toplam {items.length} adet kod üretildi. Yeni üretimler önce kontrol bekliyor durumundadır.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-neutral-50 text-left text-neutral-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">
                        <button type="button" onClick={() => toggleSort("code")} className="font-medium hover:underline">
                          Kod
                        </button>
                      </th>
                      <th className="px-4 py-3 font-medium">
                        <button type="button" onClick={() => toggleSort("status")} className="font-medium hover:underline">
                          Durum
                        </button>
                      </th>
                      <th className="px-4 py-3 font-medium">
                        <button type="button" onClick={() => toggleSort("label")} className="font-medium hover:underline">
                          Yazı
                        </button>
                      </th>
                      <th className="px-4 py-3 font-medium">Kurulum</th>
                      <th className="px-4 py-3 font-medium">QR sayfası</th>
                      <th className="px-4 py-3 font-medium">QR indir</th>
                      <th className="px-4 py-3 font-medium">Son kontrol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleItems.map((item) => (
                      <tr key={item.code} className="border-t border-neutral-200">
                        <td className="px-4 py-3 font-semibold text-neutral-900">{item.code}</td>
                        <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(item.status)}`}
                        >
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                        <td className="px-4 py-3 text-neutral-700">{item.label}</td>
                        <td className="px-4 py-3">
                          <a href={item.setupLink} target="_blank" rel="noreferrer" className="break-all text-neutral-700 underline underline-offset-4">Aç</a>
                        </td>
                        <td className="px-4 py-3">
                          <a href={item.qrPageLink} target="_blank" rel="noreferrer" className="break-all text-neutral-700 underline underline-offset-4">QR sayfası</a>
                        </td>
                        <td className="px-4 py-3">
                          <a href={item.qrDownloadLink} target="_blank" rel="noreferrer" className="break-all text-neutral-700 underline underline-offset-4">İndir</a>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
{!isTestItem(item) ? (
  <button
    type="button"
    onClick={() => updateItemStatus(item.code, "release")}
    disabled={item.status === "unclaimed" || item.status === "active" || item.status === "void" || loading}
    className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
  >
    Kontrol edildi
  </button>
) : (
  <span className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
    Test kodu
  </span>
)}                            <button type="button" onClick={() => updateItemStatus(item.code, "void")} disabled={item.status === "void" || item.status === "active" || loading} className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-50">Hatalı / iptal</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
              <div className="border-b border-neutral-200 px-6 py-5">
                <h2 className="text-lg font-semibold">Baskı listesi</h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Matbaa ve NFC yazımı için sade çıktı. Satır sonunda NFC linki bulunur.
                </p>
              </div>

              <div className="px-6 py-6">
                <textarea
                  readOnly
                  value={printText}
                  className="min-h-[180px] w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-4 text-sm outline-none"
                />
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
