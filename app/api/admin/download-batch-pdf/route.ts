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
type OutputMode = "qr" | "front" | "both" | "separate";

type DesignInput = {
  size?: "1cm" | "2cm" | "2.5cm" | "3cm" | "4cm" | "5cm" | "6cm";
  qrScale?: number;
  codeScale?: number;
  qrOffsetX?: number;
  qrOffsetY?: number;
  codeGap?: number;
  foregroundColor?: string;
  codeColor?: string;
};

type ArtworkInput = {
  imageUrl?: string;
  fileName?: string;
  fit?: "cover" | "contain";
  scale?: number;
  x?: number;
  y?: number;
  caption?: string;
  captionColor?: string;
  captionScale?: number;
};

type PdfOptions = {
  pageSize?: PrintPageSize;
  orientation?: Orientation;
  customWidth?: number;
  customHeight?: number;
  gapMm?: number;
  marginMm?: number;
  showCutMarks?: boolean;
  outputMode?: OutputMode;
  fileName?: string;
};

type PrintEntry = {
  item: BatchItem;
  side: "front" | "qr";
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

  return envBaseUrl
    ? envBaseUrl.replace(/\/+$/, "")
    : request.nextUrl.origin.replace(/\/+$/, "");
}

function normalizeOutputMode(value: unknown): OutputMode {
  if (value === "front") return "front";
  if (value === "both") return "both";
  if (value === "separate") return "separate";
  return "qr";
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

function buildPrintEntries(items: BatchItem[], outputMode: OutputMode): PrintEntry[] {
  if (outputMode === "front") {
    return items.map((item) => ({ item, side: "front" }));
  }

  if (outputMode === "both") {
    return items.flatMap((item) => [
      { item, side: "front" as const },
      { item, side: "qr" as const }
    ]);
  }

  if (outputMode === "separate") {
    return [
      ...items.map((item) => ({ item, side: "front" as const })),
      ...items.map((item) => ({ item, side: "qr" as const }))
    ];
  }

  return items.map((item) => ({ item, side: "qr" }));
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
      light: "#00000000"
    }
  });

  return Buffer.from(dataUrl.split(",")[1], "base64");
}

function getImageDataFromDataUrl(dataUrl?: string) {
  if (!dataUrl || !dataUrl.startsWith("data:image/")) return null;

  const match = dataUrl.match(
    /^data:(image\/png|image\/jpeg|image\/jpg|image\/webp);base64,(.+)$/i
  );
  if (!match) return null;

  return {
    mimeType: match[1].toLowerCase(),
    bytes: Buffer.from(match[2], "base64")
  };
}

async function embedArtworkImage(pdf: PDFDocument, artwork?: ArtworkInput) {
  const imageData = getImageDataFromDataUrl(artwork?.imageUrl);

  if (!imageData) return null;

  if (imageData.mimeType === "image/png") {
    return pdf.embedPng(imageData.bytes);
  }

  if (imageData.mimeType === "image/jpeg" || imageData.mimeType === "image/jpg") {
    return pdf.embedJpg(imageData.bytes);
  }

  return null;
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

function drawArtwork(args: {
  page: any;
  artworkImage: any | null;
  artwork?: ArtworkInput;
  x: number;
  y: number;
  size: number;
}) {
  const { page, artworkImage, artwork, x, y, size } = args;

  if (!artworkImage || !artwork?.imageUrl) return;

  const scale = clamp(Number(artwork.scale) || 100, 50, 180) / 100;
  const offsetX = mmToPt((Number(artwork.x) || 0) * 0.08);
  const offsetY = -mmToPt((Number(artwork.y) || 0) * 0.08);
  const fit = artwork.fit === "contain" ? "contain" : "cover";

  const imageWidth = artworkImage.width;
  const imageHeight = artworkImage.height;
  const imageRatio = imageWidth / imageHeight;

  let drawWidth = size;
  let drawHeight = size;

  if (fit === "contain") {
    if (imageRatio > 1) {
      drawWidth = size;
      drawHeight = size / imageRatio;
    } else {
      drawHeight = size;
      drawWidth = size * imageRatio;
    }
  } else {
    if (imageRatio > 1) {
      drawHeight = size;
      drawWidth = size * imageRatio;
    } else {
      drawWidth = size;
      drawHeight = size / imageRatio;
    }
  }

  drawWidth *= scale;
  drawHeight *= scale;

  page.drawImage(artworkImage, {
    x: x + (size - drawWidth) / 2 + offsetX,
    y: y + (size - drawHeight) / 2 + offsetY,
    width: drawWidth,
    height: drawHeight
  });
}

function drawQrGroup(args: {
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

  const qrScale = parsePercent(design.qrScale, 76, 35, 95);
  const codeScale = parsePercent(design.codeScale, 100, 50, 180);
  const qrOffsetX = parsePercent(design.qrOffsetX, 0, -45, 45);
  const qrOffsetY = parsePercent(design.qrOffsetY, 0, -45, 45);
  const codeGapPercent = parsePercent(design.codeGap, 100, 20, 180);

  const foregroundColor = parseColorHex(design.foregroundColor, "#111111");
  const codeColor = hexToRgb(parseColorHex(design.codeColor || foregroundColor, "#111111"));

  const safePadding = size * 0.13;
  const safeX = x + safePadding;
  const safeY = y + safePadding;
  const safeSize = size - safePadding * 2;

  const preferredCodeSize = clamp(size * 0.055 * (codeScale / 100), 4, size * 0.13);
  const codeSize = fitFontSize(code, preferredCodeSize, safeSize * 0.78);
  const codeGap = clamp(size * 0.035 * (codeGapPercent / 100), size * 0.006, size * 0.075);

  const maxQrSize = safeSize - codeGap - codeSize * 1.45;
  const preferredQrSize = size * (qrScale / 100);
  const qrSize = clamp(preferredQrSize, size * 0.35, maxQrSize);

  const groupHeight = qrSize + codeGap + codeSize * 1.45;
  const groupWidth = qrSize;

  const baseGroupX = safeX + (safeSize - groupWidth) / 2;
  const baseGroupY = safeY + (safeSize - groupHeight) / 2;

  const maxOffsetX = Math.max(0, (safeSize - groupWidth) / 2);
  const maxOffsetY = Math.max(0, (safeSize - groupHeight) / 2);

  const offsetX = clamp(safeSize * (qrOffsetX / 100), -maxOffsetX, maxOffsetX);
  const offsetY = clamp(safeSize * (qrOffsetY / 100), -maxOffsetY, maxOffsetY);

  const qrX = baseGroupX + offsetX;
  const qrY = baseGroupY + offsetY;
  const codeWidth = font.widthOfTextAtSize(code, codeSize);
  const codeY = qrY - codeGap - codeSize;

  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrSize,
    height: qrSize
  });

  page.drawText(code, {
    x: qrX + (qrSize - codeWidth) / 2,
    y: codeY,
    size: codeSize,
    font,
    color: codeColor
  });
}

function drawCell(args: {
  page: any;
  side: "front" | "qr";
  qrImage: any | null;
  templateImage: any | null;
  frontImage: any | null;
  font: any;
  code: string;
  x: number;
  y: number;
  size: number;
  design: DesignInput;
  templateArtwork?: ArtworkInput;
  frontArtwork?: ArtworkInput;
}) {
  const {
    page,
    side,
    qrImage,
    templateImage,
    frontImage,
    font,
    code,
    x,
    y,
    size,
    design,
    templateArtwork,
    frontArtwork
  } = args;

  if (side === "front") {
    drawArtwork({
      page,
      artworkImage: frontImage,
      artwork: frontArtwork,
      x,
      y,
      size
    });
    return;
  }

  drawArtwork({
    page,
    artworkImage: templateImage,
    artwork: templateArtwork,
    x,
    y,
    size
  });

  if (qrImage) {
    drawQrGroup({
      page,
      qrImage,
      font,
      code,
      x,
      y,
      size,
      design
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      items?: BatchItem[];
      design?: DesignInput;
      templateArtwork?: ArtworkInput;
      frontArtwork?: ArtworkInput;
      options?: PdfOptions;
    };

    const items = Array.isArray(body?.items)
      ? body.items.filter((item) => normalizeCode(item?.code))
      : [];

    if (!items.length) {
      return NextResponse.json({ error: "PDF için en az 1 ürün gerekir." }, { status: 400 });
    }

    const design = body?.design || {};
    const templateArtwork = body?.templateArtwork || {};
    const frontArtwork = body?.frontArtwork || {};
    const options = body?.options || {};
    const outputMode = normalizeOutputMode(options.outputMode);

    const pageSize = options.pageSize || "A3";
    const orientation = options.orientation || "landscape";
    const customWidth = Number(options.customWidth) || 420;
    const customHeight = Number(options.customHeight) || 297;
    const gapMm = clamp(Number(options.gapMm) || 4, 0, 40);
    const marginMm = clamp(Number(options.marginMm) || 8, 0, 60);
    const showCutMarks = options.showCutMarks !== false;

    const entries = buildPrintEntries(items, outputMode);

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
    const pages = chunkItems(entries, perPage);
    const baseUrl = getBaseUrl(request);
    const foregroundColor = parseColorHex(design.foregroundColor, "#111111");
    const templateImage = await embedArtworkImage(pdf, templateArtwork);
    const frontImage = await embedArtworkImage(pdf, frontArtwork);

    for (const pageEntries of pages) {
      const page = pdf.addPage([pageWidthPt, pageHeightPt]);

      for (let index = 0; index < pageEntries.length; index += 1) {
        const entry = pageEntries[index];
        const code = normalizeCode(entry.item.code);
        const row = Math.floor(index / columns);
        const col = index % columns;

        const cellX = startX + col * (cellSizePt + gapPt);
        const cellY = pageHeightPt - startY - (row + 1) * cellSizePt - row * gapPt;
        const itemX = cellX + cutMarkReservePt / 2;
        const itemY = cellY + cutMarkReservePt / 2;

        if (showCutMarks) {
          drawCutMarks(page, itemX, itemY, itemSizePt);
        }

        let qrImage: any | null = null;

        if (entry.side === "qr") {
          const targetUrl = `${baseUrl}/t/${code}`;
          const qrBytes = await buildQrPngBytes(targetUrl, foregroundColor);
          qrImage = await pdf.embedPng(qrBytes);
        }

        drawCell({
          page,
          side: entry.side,
          qrImage,
          templateImage,
          frontImage,
          font,
          code,
          x: itemX,
          y: itemY,
          size: itemSizePt,
          design,
          templateArtwork,
          frontArtwork
        });
      }
    }

    const pdfBytes = await pdf.save();
    const safeFileName = String(options.fileName || `dokuntag-batch-${entries.length}`)
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

    return NextResponse.json({ error: "PDF hazırlanamadı." }, { status: 500 });
  }
}