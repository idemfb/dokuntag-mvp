import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

type BatchItem = { code?: string; label?: string };
type PrintPageSize = "A4" | "A3" | "custom";
type Orientation = "portrait" | "landscape";
type OutputMode = "qr" | "front" | "both" | "separate";
type SizeOption = "1cm" | "2cm" | "2.5cm" | "3cm" | "4cm" | "5cm" | "6cm" | "custom";
type ShapeOption = "round" | "square" | "drop" | "pebble" | "shield";

type DesignInput = {
  size?: SizeOption;
  customWidthCm?: number;
  customHeightCm?: number;
  shape?: ShapeOption;
  qrScale?: number;
  codeScale?: number;
  qrOffsetX?: number;
  qrOffsetY?: number;
  codeGap?: number;
  foregroundColor?: string;
  codeColor?: string;
  hideCode?: boolean;
  qrGlowSize?: number;
  qrGlowOpacity?: number;
  qrGlowColor?: string;
  codeText?: string;
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
  nfcStyle?: "waves" | "text" | "both";
};

type ArtworkInput = {
  imageUrl?: string;
  fileName?: string;
  fit?: "cover" | "contain";
  scale?: number;
  x?: number;
  y?: number;
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
  itemsPerPage?: number;
  fileName?: string;
};

type PrintEntry = { item: BatchItem; side: "front" | "qr" };
type EmbeddedImage = Awaited<ReturnType<PDFDocument["embedPng"]>>;
type EmbeddedFont = Awaited<ReturnType<PDFDocument["embedFont"]>>;

const MM_TO_PT = 72 / 25.4;
const CANVAS_WIDTH = 256;
const CANVAS_HEIGHT = 320;

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

function parseNumber(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return clamp(parsed, min, max);
}

function parseColorHex(value: unknown, fallback: string) {
  const text = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(text) ? text : fallback;
}

function hexToRgb(hex: string) {
  const safe = parseColorHex(hex, "#ffffff").replace("#", "");
  return rgb(
    parseInt(safe.slice(0, 2), 16) / 255,
    parseInt(safe.slice(2, 4), 16) / 255,
    parseInt(safe.slice(4, 6), 16) / 255
  );
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
  if (value === "qr") return "qr";
  return "both";
}

function normalizeShape(value: unknown): ShapeOption {
  if (value === "square") return "square";
  if (value === "drop") return "drop";
  if (value === "pebble") return "pebble";
  if (value === "shield") return "shield";
  return "round";
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

function getSafeArea(shape: ShapeOption) {
  if (shape === "drop") return { left: 26, right: 26, top: 40, bottom: 34 };
  if (shape === "pebble") return { left: 28, right: 28, top: 34, bottom: 34 };
  if (shape === "shield") return { left: 34, right: 34, top: 34, bottom: 42 };
  if (shape === "square") return { left: 18, right: 18, top: 24, bottom: 24 };
  return { left: 24, right: 24, top: 32, bottom: 32 };
}

function buildPrintEntries(items: BatchItem[], outputMode: OutputMode): PrintEntry[] {
  if (outputMode === "front") return items.map((item) => ({ item, side: "front" }));

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
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) chunks.push(items.slice(i, i + chunkSize));
  return chunks;
}

async function buildQrPngBytes(targetUrl: string, foregroundColor: string) {
  const dataUrl = await QRCode.toDataURL(targetUrl, {
    type: "image/png",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 1024,
    color: {
      dark: foregroundColor,
      light: "#00000000"
    }
  });

  return Buffer.from(dataUrl.split(",")[1], "base64");
}

function getImageDataFromDataUrl(dataUrl?: string) {
  if (!dataUrl || !dataUrl.startsWith("data:image/")) return null;

  const match = dataUrl.match(/^data:(image\/png|image\/jpeg|image\/jpg);base64,(.+)$/i);
  if (!match) return null;

  return {
    mimeType: match[1].toLowerCase(),
    bytes: Buffer.from(match[2], "base64")
  };
}

async function embedArtworkImage(pdf: PDFDocument, artwork?: ArtworkInput) {
  const imageData = getImageDataFromDataUrl(artwork?.imageUrl);
  if (!imageData) return null;

  if (imageData.mimeType === "image/png") return pdf.embedPng(imageData.bytes);
  if (imageData.mimeType === "image/jpeg" || imageData.mimeType === "image/jpg") {
    return pdf.embedJpg(imageData.bytes);
  }

  return null;
}

async function embedNfcIcon(pdf: PDFDocument) {
  const iconPath = path.join(
    process.cwd(),
    "public",
    "icons",
    "nfc.png"
  );

  const bytes = await fs.readFile(iconPath);
  return pdf.embedPng(bytes);
}

function drawCutMarks(page: any, x: number, y: number, width: number, height: number) {
  const len = mmToPt(2.5);
  const color = rgb(0.2, 0.2, 0.2);
  const thickness = 0.35;

  const points = [
    [x, y + height, x + len, y + height],
    [x, y + height, x, y + height - len],
    [x + width, y + height, x + width - len, y + height],
    [x + width, y + height, x + width, y + height - len],
    [x, y, x + len, y],
    [x, y, x, y + len],
    [x + width, y, x + width - len, y],
    [x + width, y, x + width, y + len]
  ];

  for (const [x1, y1, x2, y2] of points) {
    page.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      thickness,
      color
    });
  }
}

function drawEmptyFront(page: any, x: number, y: number, width: number, height: number) {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.88, 0.88, 0.88),
    borderWidth: 0.25
  });
}

function drawArtwork(args: {
  page: any;
  artworkImage: EmbeddedImage | null;
  artwork?: ArtworkInput;
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  const { page, artworkImage, artwork, x, y, width, height } = args;

  if (!artworkImage || !artwork?.imageUrl) {
    page.drawRectangle({
      x,
      y,
      width,
      height,
      color: rgb(1, 1, 1),
      borderColor: rgb(0.9, 0.9, 0.9),
      borderWidth: 0.2
    });
    return;
  }

  const scale = clamp(Number(artwork.scale) || 100, 50, 220) / 100;
  const offsetX = mmToPt((Number(artwork.x) || 0) * 0.08);
  const offsetY = -mmToPt((Number(artwork.y) || 0) * 0.08);
  const fit = artwork.fit === "contain" ? "contain" : "cover";
  const imageRatio = artworkImage.width / artworkImage.height;
  const boxRatio = width / height;

  let drawWidth = width;
  let drawHeight = height;

  if (fit === "contain") {
    if (imageRatio > boxRatio) {
      drawWidth = width;
      drawHeight = width / imageRatio;
    } else {
      drawHeight = height;
      drawWidth = height * imageRatio;
    }
  } else if (imageRatio > boxRatio) {
    drawHeight = height;
    drawWidth = height * imageRatio;
  } else {
    drawWidth = width;
    drawHeight = width / imageRatio;
  }

  drawWidth *= scale;
  drawHeight *= scale;

  page.drawImage(artworkImage, {
    x: x + (width - drawWidth) / 2 + offsetX,
    y: y + (height - drawHeight) / 2 + offsetY,
    width: drawWidth,
    height: drawHeight
  });
}

function shouldShowOverlay(
  side: "off" | "front" | "qr" | "both" | undefined,
  currentSide: "front" | "qr"
) {
  return side === "both" || side === currentSide;
}
async function embedUnicodeFont(pdf: PDFDocument, weight: "regular" | "bold" = "regular"): Promise<EmbeddedFont> {
  pdf.registerFontkit(fontkit);

  const fileName = weight === "bold" ? "NotoSans-Bold.ttf" : "NotoSans-Regular.ttf";

  const fontPath = path.join(
    process.cwd(),
    "public",
    "fonts",
    fileName
  );

  const fontBytes = await fs.readFile(fontPath);
  return pdf.embedFont(fontBytes);
}

function drawOverlay(args: {
  page: any;
  design: DesignInput;
  side: "front" | "qr";
  x: number;
  y: number;
  width: number;
  height: number;
  font: EmbeddedFont;
  boldFont: EmbeddedFont;
  nfcIcon: EmbeddedImage;
}) {

  const {
  page,
  design,
  side,
  x,
  y,
  width,
  height,
  font: overlayFont,
  boldFont: overlayBoldFont,
  nfcIcon
} = args;

  const brandVisible = shouldShowOverlay(design.brandSide, side);
  const sloganVisible = shouldShowOverlay(design.sloganSide, side);
  const nfcVisible = shouldShowOverlay(design.nfcSide, side);

if (nfcVisible) {
  const color = hexToRgb(parseColorHex(design.nfcColor, "#111111"));
  const iconSize = mmToPt(4.6 * (Number(design.nfcSize ?? 100) / 100));
  const textSize = mmToPt(2.7 * (Number(design.nfcSize ?? 100) / 100));

  const nfcTextMode = design.nfcStyle === "text" || design.nfcStyle === "both";
  const nfcWaveMode =
    design.nfcStyle === "waves" ||
    design.nfcStyle === "both" ||
    !design.nfcStyle;

  const text = nfcTextMode ? "NFC" : "";
  const textWidth = text
    ? overlayBoldFont.widthOfTextAtSize(text, textSize)
    : 0;

  const gap = mmToPt(0.1);

  const totalWidth =
    (nfcTextMode ? textWidth : 0) +
    (nfcTextMode && nfcWaveMode ? gap : 0) +
    (nfcWaveMode ? iconSize : 0);

  const startX =
    x +
    width / 2 -
    totalWidth / 2 +
    mmToPt((Number(design.nfcX ?? 0) || 0) * 0.08);

  const baseY =
    y +
    height -
    mmToPt(8.5) -
    mmToPt((Number(design.nfcY ?? 0) || 0) * 0.08);

  let cursorX = startX;

  if (nfcTextMode) {
    page.drawText(text, {
      x: cursorX,
      y: baseY + iconSize * 0.22,
      size: textSize,
      font: overlayBoldFont,
      color
    });

    cursorX += textWidth + gap;
  }

  if (nfcWaveMode) {
    page.drawImage(nfcIcon, {
      x: cursorX,
      y: baseY,
      width: iconSize,
      height: iconSize
    });
  }
}

  if (brandVisible) {
    const text = "dokuntag®";
    const size = mmToPt(3.1 * (Number(design.brandSize ?? 100) / 100));
    const color = hexToRgb(parseColorHex(design.brandColor, "#111111"));
    const textWidth = overlayBoldFont.widthOfTextAtSize(text, size);

    page.drawText(text, {
      x: x + width / 2 - textWidth / 2 + mmToPt((Number(design.brandX ?? 0) || 0) * 0.08),
      y: y + mmToPt(6.2) - mmToPt((Number(design.brandY ?? 0) || 0) * 0.08),
      size,
      font: overlayBoldFont,
      color
    });
  }

  if (sloganVisible) {
    const text = "bul • buluştur";
    const size = mmToPt(1.9 * (Number(design.sloganSize ?? 100) / 100));
    const color = hexToRgb(parseColorHex(design.sloganColor, "#111111"));
    const textWidth = overlayBoldFont.widthOfTextAtSize(text, size);

    page.drawText(text, {
      x: x + width / 2 - textWidth / 2 + mmToPt((Number(design.sloganX ?? 0) || 0) * 0.08),
      y: y + mmToPt(3.5) - mmToPt((Number(design.sloganY ?? 0) || 0) * 0.08),
      size,
      font: overlayBoldFont,
      color
    });
  }
}

function drawQrGroup(args: {
  page: any;
  qrImage: EmbeddedImage;
  code: string;
  x: number;
  y: number;
  width: number;
  height: number;
  design: DesignInput;
  font: any;
}) {
  const { page, qrImage, code, x, y, width, height, design, font } = args;

  const shape = normalizeShape(design.shape);
  const safe = getSafeArea(shape);

  const qrScale = parseNumber(design.qrScale, 80, 15, 95);
  const codeScale = parseNumber(design.codeScale, 100, 50, 180);
  const codeGapPercent = parseNumber(design.codeGap, 100, 20, 180);
  const qrOffsetXPercent = parseNumber(design.qrOffsetX, 0, -45, 45);
  const qrOffsetYPercent = parseNumber(design.qrOffsetY, 0, -45, 45);

  const safeX = safe.left;
  const safeY = safe.top;
  const safeWidth = CANVAS_WIDTH - safe.left - safe.right;
  const safeHeight = CANVAS_HEIGHT - safe.top - safe.bottom;

  const codeFontSizeUnit = clamp(12 * (codeScale / 100), 7, 22);
  const codeGapUnit = clamp(10 * (codeGapPercent / 100), 2, 24);
  const codeBlockHeightUnit = design.hideCode === true ? 0 : codeGapUnit + codeFontSizeUnit * 1.5;

  const maxQrBySafeHeight = safeHeight - codeBlockHeightUnit;
  const maxQrBySafeWidth = safeWidth;
  const maxQrSizeUnit = Math.max(80, Math.min(maxQrBySafeWidth, maxQrBySafeHeight));

  const preferredQrSizeUnit = 196 * (qrScale / 76);
  const qrSizeUnit = clamp(preferredQrSizeUnit, 48, maxQrSizeUnit);

  const groupHeightUnit = qrSizeUnit + codeBlockHeightUnit;
  const groupWidthUnit = qrSizeUnit;

  const baseGroupXUnit = safeX + (safeWidth - groupWidthUnit) / 2;
  const baseGroupYUnit = safeY + (safeHeight - groupHeightUnit) / 2;

  const maxOffsetXUnit = Math.max(0, (safeWidth - groupWidthUnit) / 2);
  const maxOffsetYUnit = Math.max(0, (safeHeight - groupHeightUnit) / 2);

  const offsetXUnit = clamp(
    safeWidth * (qrOffsetXPercent / 100),
    -maxOffsetXUnit,
    maxOffsetXUnit
  );

  const offsetYUnit = clamp(
    safeHeight * (qrOffsetYPercent / 100),
    -maxOffsetYUnit,
    maxOffsetYUnit
  );

  const qrXUnit = baseGroupXUnit + offsetXUnit;
  const qrYUnit = baseGroupYUnit + offsetYUnit;

  const unitToPt = Math.min(width / CANVAS_WIDTH, height / CANVAS_HEIGHT);
  const canvasWidthPt = CANVAS_WIDTH * unitToPt;
  const canvasHeightPt = CANVAS_HEIGHT * unitToPt;
  const canvasX = x + (width - canvasWidthPt) / 2;
  const canvasY = y + (height - canvasHeightPt) / 2;

  const qrSizePt = qrSizeUnit * unitToPt;
  const qrX = canvasX + qrXUnit * unitToPt;
  const qrYTopBased = canvasY + qrYUnit * unitToPt;
  const qrY = canvasY + canvasHeightPt - (qrYTopBased - canvasY) - qrSizePt;

const glowColor = hexToRgb(
  parseColorHex(design.qrGlowColor, "#f7f6f2")
);

const glowOpacity =
  clamp(Number(design.qrGlowOpacity ?? 36), 0, 100) / 100;

const glowRatio =
  clamp(Number(design.qrGlowSize ?? 44), 20, 70) / 100;

  if (glowOpacity > 0) {
  page.drawRectangle({
  x: qrX - qrSizePt * 0.10,
  y: qrY - qrSizePt * 0.10,
  width: qrSizePt * 1.20,
  height: qrSizePt * 1.20,
  color: glowColor,
  opacity: glowOpacity
});
  }

  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrSizePt,
    height: qrSizePt
  });

const displayCode = code;

  if (design.hideCode !== true && displayCode) {
    const codeFontSizePt = codeFontSizeUnit * unitToPt;
    const codeGapPt = codeGapUnit * unitToPt;
    const codeWidth = font.widthOfTextAtSize(displayCode, codeFontSizePt);
    const codeColor = hexToRgb(parseColorHex(design.codeColor, design.foregroundColor || "#111111"));

    page.drawText(displayCode, {
      x: qrX + qrSizePt / 2 - codeWidth / 2,
      y: qrY - codeGapPt - codeFontSizePt,
      size: codeFontSizePt,
      font,
      color: codeColor
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const items: BatchItem[] = Array.isArray(body?.items)
      ? body.items.filter((item: BatchItem) => normalizeCode(item?.code))
      : [];

    if (!items.length) {
      return NextResponse.json(
        { error: "PDF için en az 1 ürün gerekir." },
        { status: 400 }
      );
    }

    const design: DesignInput = body?.design || {};
    const templateArtwork: ArtworkInput = body?.templateArtwork || {};
    const frontArtwork: ArtworkInput = body?.frontArtwork || {};
    const options: PdfOptions = body?.options || {};
    const outputMode = normalizeOutputMode(options.outputMode);

    const { widthMm, heightMm } = getPageSize(
      options.pageSize || "A3",
      options.orientation || "landscape",
      Number(options.customWidth) || 420,
      Number(options.customHeight) || 297
    );

    const gapMm = clamp(Number(options.gapMm) || 4, 0, 40);
    const marginMm = clamp(Number(options.marginMm) || 8, 0, 60);
    const showCutMarks = options.showCutMarks !== false;
    const entries = buildPrintEntries(items, outputMode);
    const itemSize = getItemSizeMm(design);

    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.HelveticaBold);
    const overlayFont = await embedUnicodeFont(pdf, "regular");
    const overlayBoldFont = await embedUnicodeFont(pdf, "bold");
    const templateImage = await embedArtworkImage(pdf, templateArtwork);
    const frontImage = await embedArtworkImage(pdf, frontArtwork);
    const nfcIcon = await embedNfcIcon(pdf);

    const pageWidthPt = mmToPt(widthMm);
    const pageHeightPt = mmToPt(heightMm);
    const itemWidthPt = mmToPt(itemSize.width);
    const itemHeightPt = mmToPt(itemSize.height);
    const cellSizePt = Math.max(itemWidthPt, itemHeightPt) + (showCutMarks ? mmToPt(6) : 0);
    const gapPt = mmToPt(gapMm);
    const marginPt = mmToPt(marginMm);
    const usableWidth = Math.max(pageWidthPt - marginPt * 2, cellSizePt);
    const usableHeight = Math.max(pageHeightPt - marginPt * 2, cellSizePt);
    const columns = Math.max(1, Math.floor((usableWidth + gapPt) / (cellSizePt + gapPt)));
    const rows = Math.max(1, Math.floor((usableHeight + gapPt) / (cellSizePt + gapPt)));
    const autoPerPage = Math.max(1, columns * rows);
    const requestedPerPage = Number(options.itemsPerPage);

    const perPage =
      Number.isFinite(requestedPerPage) && requestedPerPage > 0
        ? Math.min(requestedPerPage, autoPerPage)
        : autoPerPage;

    const gridWidth = columns * cellSizePt + Math.max(0, columns - 1) * gapPt;
    const gridHeight = rows * cellSizePt + Math.max(0, rows - 1) * gapPt;
    const startX = (pageWidthPt - gridWidth) / 2;
    const startY = (pageHeightPt - gridHeight) / 2;
    const pages = chunkItems(entries, perPage);
    const baseUrl = getBaseUrl(request);
    const foregroundColor = parseColorHex(design.foregroundColor, "#111111");

    for (const pageEntries of pages) {
      const page = pdf.addPage([pageWidthPt, pageHeightPt]);

      for (let index = 0; index < pageEntries.length; index += 1) {
        const entry = pageEntries[index];
        const code = normalizeCode(entry.item.code);
        if (!code) continue;

        const row = Math.floor(index / columns);
        const col = index % columns;
        const cellX = startX + col * (cellSizePt + gapPt);
        const cellY = pageHeightPt - startY - (row + 1) * cellSizePt - row * gapPt;
        const itemX = cellX + (cellSizePt - itemWidthPt) / 2;
        const itemY = cellY + (cellSizePt - itemHeightPt) / 2;
        if (showCutMarks) {
          drawCutMarks(page, itemX, itemY, itemWidthPt, itemHeightPt);
        }

        if (entry.side === "front") {
          drawArtwork({
            page,
            artworkImage: frontImage,
            artwork: frontArtwork,
            x: itemX,
            y: itemY,
            width: itemWidthPt,
            height: itemHeightPt
          });

          drawOverlay({
            page,
            design,
            side: "front",
            x: itemX,
            y: itemY,
            width: itemWidthPt,
            height: itemHeightPt,
            font: overlayFont,
            boldFont: overlayBoldFont,
            nfcIcon
          });

          continue;
        }

        drawArtwork({
          page,
          artworkImage: templateImage,
          artwork: templateArtwork,
          x: itemX,
          y: itemY,
          width: itemWidthPt,
          height: itemHeightPt
        });

        drawOverlay({
        page,
        design,
        side: "qr",
        x: itemX,
        y: itemY,
        width: itemWidthPt,
        height: itemHeightPt,
        font: overlayFont,
        boldFont: overlayBoldFont,
        nfcIcon
      });

        const targetUrl = `${baseUrl}/t/${code}`;
        const qrBytes = await buildQrPngBytes(targetUrl, foregroundColor);
        const qrImage = await pdf.embedPng(qrBytes);

                drawQrGroup({
          page,
          qrImage,
          code,
          x: itemX,
          y: itemY,
          width: itemWidthPt,
          height: itemHeightPt,
          design,
          font
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

    return NextResponse.json(
      { error: "PDF hazırlanamadı." },
      { status: 500 }
    );
  }
}