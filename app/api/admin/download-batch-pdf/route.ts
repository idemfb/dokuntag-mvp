import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import QRCode from "qrcode";

export const runtime = "nodejs";

type BatchItem = {
  code?: string;
  label?: string;
};

type ShapeOption = "round" | "square" | "drop";
type PrintPageSize = "A4" | "A3" | "custom";
type Orientation = "portrait" | "landscape";
type DesignType = "standard" | "tag" | "card" | "vehicle" | "business";

type DesignInput = {
  size?: "2.5cm" | "3cm" | "4cm";
  shape?: ShapeOption;
  hasHole?: boolean;
  brandText?: string;
  sloganText?: string;
  codeText?: string;
  brandScale?: number;
  sloganScale?: number;
  codeScale?: number;
  qrScale?: number;
  verticalBalance?: number;
  horizontalBalance?: number;
  brandGap?: number;
  sloganGap?: number;
  codeInset?: number;
  innerSafe?: number;
  outerSafe?: number;
  brandWeight?: "500" | "600" | "700" | "800";
  sloganWeight?: "500" | "600" | "700" | "800";
  brandStyle?: "normal" | "italic";
  sloganStyle?: "normal" | "italic";
  codeStyle?: "normal" | "italic";
  brandColor?: string;
  sloganColor?: string;
  codeColor?: string;
  brandAlign?: "left" | "center" | "right";
  sloganAlign?: "left" | "center" | "right";
  badgeScale?: number;
  badgeOffsetX?: number;
  badgeOffsetY?: number;
};

type PdfOptions = {
  pageSize?: PrintPageSize;
  orientation?: Orientation;
  customWidth?: number;
  customHeight?: number;
  gapMm?: number;
  marginMm?: number;
  showCutMarks?: boolean;
  fileName?: string;
};

const MM_TO_PT = 72 / 25.4;

function mmToPt(mm: number) {
  return mm * MM_TO_PT;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeCode(value: unknown) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function toPdfSafeText(value: string) {
  return value
    .replace(/Ç/g, "C")
    .replace(/ç/g, "c")
    .replace(/Ğ/g, "G")
    .replace(/ğ/g, "g")
    .replace(/İ/g, "I")
    .replace(/İ/g, "I")
    .replace(/ı/g, "i")
    .replace(/Ö/g, "O")
    .replace(/ö/g, "o")
    .replace(/Ş/g, "S")
    .replace(/ş/g, "s")
    .replace(/Ü/g, "U")
    .replace(/ü/g, "u");
}

function normalizeText(value: unknown, fallback: string, maxLength: number) {
  const text = String(value || "").trim();
  return toPdfSafeText((text || fallback).slice(0, maxLength));
}

function parsePercent(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return clamp(parsed, min, max);
}

function parseColorHex(value: unknown, fallback: string) {
  const text = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(text) ? text : fallback;
}

function hexToRgb(hex: string) {
  const safe = hex.replace("#", "");
  const r = parseInt(safe.slice(0, 2), 16) / 255;
  const g = parseInt(safe.slice(2, 4), 16) / 255;
  const b = parseInt(safe.slice(4, 6), 16) / 255;
  return rgb(r, g, b);
}

function getDropPath(contentX: number, contentY: number, itemSizePt: number) {
  const sx = itemSizePt / 256;
  const sy = itemSizePt / 320;
  const x = (n: number) => contentX + n * sx;
  const y = (n: number) => contentY + n * sy;
  return `M ${x(128)} ${y(312)} C ${x(80)} ${y(270)} ${x(14)} ${y(202)} ${x(14)} ${y(122)} C ${x(14)} ${y(55)} ${x(62)} ${y(8)} ${x(128)} ${y(8)} C ${x(194)} ${y(8)} ${x(242)} ${y(55)} ${x(242)} ${y(122)} C ${x(242)} ${y(202)} ${x(176)} ${y(270)} ${x(128)} ${y(312)} Z`;
}

function getPageSize(
  pageSize: PrintPageSize,
  orientation: Orientation,
  customWidth: number,
  customHeight: number
) {
  let widthMm = 297;
  let heightMm = 210;

  if (pageSize === "A3") {
    widthMm = 420;
    heightMm = 297;
  } else if (pageSize === "custom") {
    widthMm = customWidth;
    heightMm = customHeight;
  }

  const portraitWidth = Math.min(widthMm, heightMm);
  const portraitHeight = Math.max(widthMm, heightMm);

  if (orientation === "portrait") {
    return { widthMm: portraitWidth, heightMm: portraitHeight };
  }

  return { widthMm: portraitHeight, heightMm: portraitWidth };
}

function getItemSizeMm(design: DesignInput) {
  if (design.size === "2.5cm") return 25;
  if (design.size === "4cm") return 40;
  return 30;
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

function fitFontSize(text: string, preferred: number, maxWidth: number) {
  if (!text) return preferred;
  const estimatedWidth = preferred * Math.max(text.length, 1) * 0.58;
  if (estimatedWidth <= maxWidth) return preferred;
  return clamp(preferred * (maxWidth / estimatedWidth), 5, preferred);
}

async function buildQrPngBytes(targetUrl: string) {
  const dataUrl = await QRCode.toDataURL(targetUrl, {
    type: "image/png",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 256,
    color: {
      dark: "#000000",
      light: "#FFFFFF"
    }
  });

  const base64 = dataUrl.split(",")[1];
  return Buffer.from(base64, "base64");
}

function drawCutMarks(page: any, x: number, y: number, size: number) {
  const len = mmToPt(2.5);
  const lineWidth = 0.4;
  const color = rgb(0.2, 0.2, 0.2);

  page.drawLine({
    start: { x, y: y + size - len },
    end: { x, y: y + size },
    thickness: lineWidth,
    color
  });
  page.drawLine({
    start: { x, y: y + size },
    end: { x: x + len, y: y + size },
    thickness: lineWidth,
    color
  });

  page.drawLine({
    start: { x: x + size, y: y + size - len },
    end: { x: x + size, y: y + size },
    thickness: lineWidth,
    color
  });
  page.drawLine({
    start: { x: x + size - len, y: y + size },
    end: { x: x + size, y: y + size },
    thickness: lineWidth,
    color
  });

  page.drawLine({
    start: { x, y },
    end: { x, y: y + len },
    thickness: lineWidth,
    color
  });
  page.drawLine({
    start: { x, y },
    end: { x: x + len, y },
    thickness: lineWidth,
    color
  });

  page.drawLine({
    start: { x: x + size, y },
    end: { x: x + size, y: y + len },
    thickness: lineWidth,
    color
  });
  page.drawLine({
    start: { x: x + size - len, y },
    end: { x: x + size, y },
    thickness: lineWidth,
    color
  });
}

function drawCell(
  page: any,
  fonts: { regular: any; bold: any; italic: any; boldItalic: any },
  qrImage: any,
  item: BatchItem,
  design: DesignInput,
  cellX: number,
  cellY: number,
  cellSizePt: number,
  qrSizePt: number,
  itemSizePt: number,
  showCutMarks: boolean
) {
  const code = normalizeCode(item.code);
  const brandText = normalizeText(design.brandText, "DOKUNTAG", 24);
  const sloganText = normalizeText(design.sloganText, "Bul • Bulustur", 28);
  const codeText = normalizeText(design.codeText, code, 20);

  const brandColor = hexToRgb(parseColorHex(design.brandColor, "#111111"));
  const sloganColor = hexToRgb(parseColorHex(design.sloganColor, "#111111"));
  const codeColor = hexToRgb(parseColorHex(design.codeColor, "#111111"));

  const contentX = cellX + (cellSizePt - itemSizePt) / 2;
  const contentY = cellY + (cellSizePt - itemSizePt) / 2;

  if (showCutMarks) {
    drawCutMarks(page, cellX, cellY, cellSizePt);
  }

  const isDrop = design.shape === "drop";
  const hasHole = design.hasHole !== false;

  if (isDrop) {
    page.drawSvgPath(getDropPath(contentX, contentY, itemSizePt), {
      color: rgb(1, 1, 1),
      borderColor: rgb(0.12, 0.12, 0.12),
      borderWidth: 0.35
    });

    if (hasHole) {
      const holeX = contentX + itemSizePt / 2;
      const holeY = contentY + itemSizePt * 0.84;
      page.drawCircle({ x: holeX, y: holeY, size: itemSizePt * 0.046, color: rgb(1, 1, 1), borderColor: rgb(0.1, 0.1, 0.1), borderWidth: 0.45 });
    }
  }

  const qrX = contentX + (itemSizePt - qrSizePt) / 2;
  const qrY = isDrop
    ? contentY + (hasHole ? itemSizePt * 0.28 : itemSizePt * 0.24)
    : contentY + (itemSizePt - qrSizePt) / 2;

  const brandPreferred =
    mmToPt(1.6) * (parsePercent(design.brandScale, 100, 40, 500) / 100);
  const sloganPreferred =
    mmToPt(1.25) * (parsePercent(design.sloganScale, 100, 40, 500) / 100);
  const codePreferred =
    mmToPt(1.05) * (parsePercent(design.codeScale, 100, 40, 500) / 100);
  const badgePreferred =
    mmToPt(0.7) * (parsePercent(design.badgeScale, 140, 50, 300) / 100);

  const availableTextWidth = itemSizePt - mmToPt(2);
  const brandSize = fitFontSize(brandText, brandPreferred, availableTextWidth);
  const sloganSize = fitFontSize(sloganText, sloganPreferred, availableTextWidth);

  const brandGapPt =
    mmToPt(1) +
    mmToPt((parsePercent(design.brandGap, 100, 50, 220) - 100) * 0.02);
  const sloganGapPt =
    mmToPt(1.2) +
    mmToPt((parsePercent(design.sloganGap, 100, 50, 220) - 100) * 0.02);
  const codeInsetPt =
    mmToPt(0.4) +
    mmToPt((parsePercent(design.codeInset, 100, 50, 180) - 100) * 0.015);

  const brandY = isDrop && hasHole ? contentY + itemSizePt * 0.9 : qrY + qrSizePt + brandGapPt + brandSize;
  const sloganY = isDrop ? contentY + itemSizePt * 0.13 : contentY + sloganSize * 0.2;
  const codeCenterX = contentX + itemSizePt - codeInsetPt;
  const codeCenterY = contentY + itemSizePt / 2;

  const brandWidth = fonts.bold.widthOfTextAtSize(brandText, brandSize);

  const sloganFont =
    design.sloganStyle === "italic" && String(design.sloganWeight || "700") >= "700"
      ? fonts.boldItalic
      : design.sloganStyle === "italic"
      ? fonts.italic
      : String(design.sloganWeight || "700") >= "700"
      ? fonts.bold
      : fonts.regular;

  const codeFont = design.codeStyle === "italic" ? fonts.italic : fonts.regular;

  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrSizePt,
    height: qrSizePt
  });

  const brandX = contentX + (itemSizePt - brandWidth) / 2;
  page.drawText(brandText, {
    x: brandX,
    y: brandY,
    size: brandSize,
    font: fonts.bold,
    color: brandColor
  });

  page.drawText("®", {
    x: brandX + brandWidth + mmToPt(0.5),
    y: brandY + brandSize * 0.35,
    size: badgePreferred,
    font: fonts.bold,
    color: brandColor
  });

  const sloganWidth = sloganFont.widthOfTextAtSize(sloganText, sloganSize);
  page.drawText(sloganText, {
    x: contentX + (itemSizePt - sloganWidth) / 2,
    y: sloganY,
    size: sloganSize,
    font: sloganFont,
    color: sloganColor
  });

  const codeWidth = codeFont.widthOfTextAtSize(codeText, codePreferred);
  page.drawText(codeText, {
    x: codeCenterX - codePreferred / 3,
    y: codeCenterY - codeWidth / 2,
    size: codePreferred,
    rotate: degrees(90),
    font: codeFont,
    color: codeColor
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      items?: BatchItem[];
      design?: DesignInput;
      options?: PdfOptions;
    };

    const items = Array.isArray(body?.items)
      ? body.items.filter((item) => normalizeCode(item?.code))
      : [];

    if (!items.length) {
      return NextResponse.json({ error: "PDF için en az 1 ürün gerekir." }, { status: 400 });
    }

    const design = body?.design || {};
    const options = body?.options || {};

    const pageSize = options.pageSize || "A3";
    const orientation = options.orientation || "landscape";
    const customWidth = Number(options.customWidth) || 420;
    const customHeight = Number(options.customHeight) || 297;
    const gapMm = clamp(Number(options.gapMm) || 4, 0, 20);
    const marginMm = clamp(Number(options.marginMm) || 8, 0, 30);
    const showCutMarks = Boolean(options.showCutMarks);

    const { widthMm, heightMm } = getPageSize(
      pageSize,
      orientation,
      customWidth,
      customHeight
    );

    const itemSizeMm = getItemSizeMm(design);
    const cutMarkReserve = showCutMarks ? 6 : 0;
    const printSafety = 3;

    const usableWidth = Math.max(widthMm - marginMm * 2 - printSafety * 2, itemSizeMm);
    const usableHeight = Math.max(heightMm - marginMm * 2 - printSafety * 2, itemSizeMm);
    const cellSizeMm = itemSizeMm + cutMarkReserve;

    const columns = Math.max(1, Math.floor((usableWidth + gapMm) / (cellSizeMm + gapMm)));
    const rows = Math.max(1, Math.floor((usableHeight + gapMm) / (cellSizeMm + gapMm)));
    const perPage = Math.max(1, columns * rows);
    const pages = chunkItems(items, perPage);

    const pdf = await PDFDocument.create();
    const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const fontItalic = await pdf.embedFont(StandardFonts.HelveticaOblique);
    const fontBoldItalic = await pdf.embedFont(StandardFonts.HelveticaBoldOblique);

    const fonts = {
      regular: fontRegular,
      bold: fontBold,
      italic: fontItalic,
      boldItalic: fontBoldItalic
    };

    const pageWidthPt = mmToPt(widthMm);
    const pageHeightPt = mmToPt(heightMm);
    const marginPt = mmToPt(marginMm);
    const gapPt = mmToPt(gapMm);
    const cellSizePt = mmToPt(cellSizeMm);
    const itemSizePt = mmToPt(itemSizeMm);
    const qrScale = parsePercent(design.qrScale, 100, 85, 115) / 100;
    const qrSizePt = itemSizePt * (design.shape === "drop" ? 0.55 : 0.64) * qrScale;
    const gridWidthPt = columns * cellSizePt + Math.max(0, columns - 1) * gapPt;
    const gridHeightPt = rows * cellSizePt + Math.max(0, rows - 1) * gapPt;

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
      process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
      request.nextUrl.origin;

    for (const pageItems of pages) {
      const page = pdf.addPage([pageWidthPt, pageHeightPt]);
      const paddedPageItems = padPage(pageItems, perPage);

      const originX = marginPt + (pageWidthPt - marginPt * 2 - gridWidthPt) / 2;
      const originY = marginPt + (pageHeightPt - marginPt * 2 - gridHeightPt) / 2;

      for (let index = 0; index < paddedPageItems.length; index += 1) {
        const item = paddedPageItems[index];
        if (!item) continue;

        const col = index % columns;
        const row = Math.floor(index / columns);

        const cellX = originX + col * (cellSizePt + gapPt);
        const cellY = pageHeightPt - originY - (row + 1) * cellSizePt - row * gapPt;

        const code = normalizeCode(item.code);
        const targetUrl = `${baseUrl.replace(/\/+$/, "")}/t/${code}`;
        const qrBytes = await buildQrPngBytes(targetUrl);
        const qrImage = await pdf.embedPng(qrBytes);

        drawCell(
          page,
          fonts,
          qrImage,
          item,
          design,
          cellX,
          cellY,
          cellSizePt,
          qrSizePt,
          itemSizePt,
          showCutMarks
        );
      }
    }

    const pdfBytes = await pdf.save();
    const fileName = String(options.fileName || `dokuntag-batch-${items.length}`).slice(0, 80);

    return new NextResponse(new Uint8Array(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}.pdf"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata";
    console.error("DOWNLOAD_BATCH_PDF_ERROR", error);

    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? `PDF hazırlanamadı: ${message}`
            : "PDF hazırlanamadı."
      },
      { status: 500 }
    );
  }
}