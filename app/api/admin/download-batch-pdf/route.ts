import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";

export const runtime = "nodejs";

type BatchItem = {
  code?: string;
  label?: string;
};

type PrintPageSize = "A4" | "A3" | "custom";
type Orientation = "portrait" | "landscape";

type DesignInput = {
  size?: "1cm" | "2cm" | "2.5cm" | "3cm" | "4cm" | "5cm" | "6cm";
  qrScale?: number;
  codeScale?: number;
  foregroundColor?: string;
  codeColor?: string;
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
  return typeof value === "string"
    ? value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10)
    : "";
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

function getBaseUrl(request: NextRequest) {
  const envBaseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "";

  return envBaseUrl ? envBaseUrl.replace(/\/+$/, "") : request.nextUrl.origin.replace(/\/+$/, "");
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

  return orientation === "portrait"
    ? { widthMm: portraitWidth, heightMm: portraitHeight }
    : { widthMm: portraitHeight, heightMm: portraitWidth };
}

function getItemSizeMm(design: DesignInput) {
  if (design.size === "1cm") return 10;
  if (design.size === "2cm") return 20;
  if (design.size === "2.5cm") return 25;
  if (design.size === "4cm") return 40;
  if (design.size === "5cm") return 50;
  if (design.size === "6cm") return 60;
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

async function buildQrPngBytes(targetUrl: string, foregroundColor: string) {
  const dataUrl = await QRCode.toDataURL(targetUrl, {
    type: "image/png",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 512,
    color: {
      dark: foregroundColor,
      light: "#FFFFFF"
    }
  });

  return Buffer.from(dataUrl.split(",")[1], "base64");
}

function drawCutMarks(page: any, x: number, y: number, size: number) {
  const len = mmToPt(2.5);
  const lineWidth = 0.4;
  const color = rgb(0.2, 0.2, 0.2);

  page.drawLine({ start: { x, y: y + size - len }, end: { x, y: y + size }, thickness: lineWidth, color });
  page.drawLine({ start: { x, y: y + size }, end: { x: x + len, y: y + size }, thickness: lineWidth, color });
  page.drawLine({ start: { x: x + size, y: y + size - len }, end: { x: x + size, y: y + size }, thickness: lineWidth, color });
  page.drawLine({ start: { x: x + size - len, y: y + size }, end: { x: x + size, y: y + size }, thickness: lineWidth, color });
  page.drawLine({ start: { x, y }, end: { x, y: y + len }, thickness: lineWidth, color });
  page.drawLine({ start: { x, y }, end: { x: x + len, y }, thickness: lineWidth, color });
  page.drawLine({ start: { x: x + size, y }, end: { x: x + size, y: y + len }, thickness: lineWidth, color });
  page.drawLine({ start: { x: x + size - len, y }, end: { x: x + size, y }, thickness: lineWidth, color });
}

function fitFontSize(text: string, preferred: number, maxWidth: number) {
  const estimatedWidth = preferred * Math.max(text.length, 1) * 0.62;
  if (estimatedWidth <= maxWidth) return preferred;
  return clamp(preferred * (maxWidth / estimatedWidth), 5, preferred);
}

function drawCell(args: {
  page: any;
  qrImage: any;
  font: any;
  code: string;
  x: number;
  y: number;
  size: number;
  design: DesignInput;
}) {
  const { page, qrImage, font, code, x, y, size, design } = args;

  const qrScale = parsePercent(design.qrScale, 76, 45, 82);
  const codeScale = parsePercent(design.codeScale, 100, 60, 145);

  const foregroundColor = parseColorHex(design.foregroundColor, "#111111");
  const codeColor = hexToRgb(parseColorHex(design.codeColor || foregroundColor, "#111111"));

  const topSafeArea = size * 0.08;
  const codeSafeArea = size * 0.24;
  const qrCodeGap = size * 0.075;

  const availableQrArea = size - topSafeArea - codeSafeArea - qrCodeGap;
  const qrSize = clamp(size * (qrScale / 100), size * 0.45, availableQrArea);

  const qrX = x + (size - qrSize) / 2;
  const qrY = y + codeSafeArea + qrCodeGap;

  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrSize,
    height: qrSize
  });

  const preferredCodeSize = clamp(size * 0.083 * (codeScale / 100), 5, 16);
  const codeSize = fitFontSize(code, preferredCodeSize, size * 0.78);
  const codeWidth = font.widthOfTextAtSize(code, codeSize);

  // QR'ın altına sabit küçük boşlukla yerleştir
const codeY = qrY - codeSize - size * 0.005;

  page.drawText(code, {
    x: x + (size - codeWidth) / 2,
    y: codeY,
    size: codeSize,
    font,
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
    const gapMm = clamp(Number(options.gapMm) || 4, 0, 40);
    const marginMm = clamp(Number(options.marginMm) || 8, 0, 60);
    const showCutMarks = options.showCutMarks !== false;

    const { widthMm, heightMm } = getPageSize(pageSize, orientation, customWidth, customHeight);
    const pageWidthPt = mmToPt(widthMm);
    const pageHeightPt = mmToPt(heightMm);

    const itemSizeMm = getItemSizeMm(design);
    const itemSizePt = mmToPt(itemSizeMm);
    const gapPt = mmToPt(gapMm);
    const marginPt = mmToPt(marginMm);
    const cutMarkReservePt = showCutMarks ? mmToPt(6) : 0;
    const cellSizePt = itemSizePt + cutMarkReservePt;

    const usableWidth = Math.max(pageWidthPt - marginPt * 2, cellSizePt);
    const usableHeight = Math.max(pageHeightPt - marginPt * 2, cellSizePt);
    const columns = Math.max(1, Math.floor((usableWidth + gapPt) / (cellSizePt + gapPt)));
    const rows = Math.max(1, Math.floor((usableHeight + gapPt) / (cellSizePt + gapPt)));
    const perPage = Math.max(1, columns * rows);

    const gridWidth = columns * cellSizePt + Math.max(0, columns - 1) * gapPt;
    const gridHeight = rows * cellSizePt + Math.max(0, rows - 1) * gapPt;
    const startX = (pageWidthPt - gridWidth) / 2;
    const startY = (pageHeightPt - gridHeight) / 2;

    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.HelveticaBold);
    const pages = chunkItems(items, perPage);
    const baseUrl = getBaseUrl(request);
    const foregroundColor = parseColorHex(design.foregroundColor, "#111111");

    for (const pageItems of pages) {
      const page = pdf.addPage([pageWidthPt, pageHeightPt]);

      for (let index = 0; index < pageItems.length; index += 1) {
        const item = pageItems[index];
        const code = normalizeCode(item.code);
        const row = Math.floor(index / columns);
        const col = index % columns;

        const cellX = startX + col * (cellSizePt + gapPt);
        const cellY = pageHeightPt - startY - (row + 1) * cellSizePt - row * gapPt;
        const itemX = cellX + cutMarkReservePt / 2;
        const itemY = cellY + cutMarkReservePt / 2;

        if (showCutMarks) {
          drawCutMarks(page, itemX, itemY, itemSizePt);
        }

        const targetUrl = `${baseUrl}/t/${code}`;
        const qrBytes = await buildQrPngBytes(targetUrl, foregroundColor);
        const qrImage = await pdf.embedPng(qrBytes);

        drawCell({
          page,
          qrImage,
          font,
          code,
          x: itemX,
          y: itemY,
          size: itemSizePt,
          design
        });
      }
    }

    const pdfBytes = await pdf.save();
    const safeFileName = String(options.fileName || `dokuntag-batch-${items.length}`)
      .trim()
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .slice(0, 80);

    return new NextResponse(new Uint8Array(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFileName || "dokuntag-batch"}.pdf"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("DOWNLOAD_BATCH_PDF_ERROR", error);

    return NextResponse.json(
      { error: "PDF hazırlanamadı." },
      { status: 500 }
    );
  }
}