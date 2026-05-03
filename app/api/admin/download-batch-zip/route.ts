import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import QRCode from "qrcode";

type BatchItem = {
  code?: string;
  label?: string;
};

type ShapeOption = "round" | "square" | "drop";

type DesignInput = {
  size?: "1cm" | "2cm" | "2.5cm" | "3cm" | "4cm" | "5cm" | "6cm";
  shape?: ShapeOption;
  qrScale?: number;
  codeScale?: number;
  qrOffsetX?: number;
  qrOffsetY?: number;
  codeGap?: number;
  foregroundColor?: string;
  codeColor?: string;
  showGuide?: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function escapeXml(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function normalizeCode(value: unknown) {
  return typeof value === "string"
    ? value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10)
    : "";
}

function normalizeShape(value: unknown): ShapeOption {
  if (value === "square") return "square";
  if (value === "drop") return "drop";
  return "round";
}

function normalizeColor(value: unknown, fallback: string) {
  const text = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(text) ? text : fallback;
}

function parseNumber(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return clamp(parsed, min, max);
}

function getBaseUrl(request: NextRequest) {
  const envBaseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "";

  if (envBaseUrl) return envBaseUrl.replace(/\/+$/, "");

  return request.nextUrl.origin.replace(/\/+$/, "");
}

function getSizeValue(size: DesignInput["size"]) {
  if (
    size === "1cm" ||
    size === "2cm" ||
    size === "2.5cm" ||
    size === "3cm" ||
    size === "4cm" ||
    size === "5cm" ||
    size === "6cm"
  ) {
    return size;
  }

  return "3cm";
}

function getShapeMarkup(shape: ShapeOption) {
  if (shape === "drop") {
    const path =
      "M128 8 C176 50 242 118 242 198 C242 265 194 312 128 312 C62 312 14 265 14 198 C14 118 80 50 128 8 Z";

    return {
      clip: `<path d="${path}" />`,
      background: `<path d="${path}" fill="#ffffff" />`,
      guide: `<path d="${path}" fill="none" stroke="#ef4444" stroke-width="1.4" stroke-dasharray="6 5" opacity="0.75" />`
    };
  }

  if (shape === "square") {
    return {
      clip: `<rect x="0" y="0" width="256" height="320" rx="22" ry="22" />`,
      background: `<rect x="0" y="0" width="256" height="320" rx="22" ry="22" fill="#ffffff" />`,
      guide: `<rect x="0" y="0" width="256" height="320" rx="22" ry="22" fill="none" stroke="#ef4444" stroke-width="1.4" stroke-dasharray="6 5" opacity="0.75" />`
    };
  }

  return {
    clip: `<rect x="0" y="0" width="256" height="320" rx="128" ry="128" />`,
    background: `<rect x="0" y="0" width="256" height="320" rx="128" ry="128" fill="#ffffff" />`,
    guide: `<rect x="0" y="0" width="256" height="320" rx="128" ry="128" fill="none" stroke="#ef4444" stroke-width="1.4" stroke-dasharray="6 5" opacity="0.75" />`
  };
}

function getSafeArea(shape: ShapeOption) {
  if (shape === "drop") {
    return {
      left: 26,
      right: 26,
      top: 40,
      bottom: 34
    };
  }

  if (shape === "square") {
    return {
      left: 18,
      right: 18,
      top: 24,
      bottom: 24
    };
  }

  return {
    left: 24,
    right: 24,
    top: 32,
    bottom: 32
  };
}

async function buildSvg(targetUrl: string, code: string, design: DesignInput) {
  const shape = normalizeShape(design.shape);
  const size = getSizeValue(design.size);
  const foregroundColor = normalizeColor(design.foregroundColor, "#111111");
  const codeColor = normalizeColor(design.codeColor, foregroundColor);

  const qrScale = parseNumber(design.qrScale, 76, 35, 95);
  const codeScale = parseNumber(design.codeScale, 100, 50, 180);
  const qrOffsetX = parseNumber(design.qrOffsetX, 0, -45, 45);
  const qrOffsetY = parseNumber(design.qrOffsetY, 0, -45, 45);
  const codeGapPercent = parseNumber(design.codeGap, 100, 20, 180);
  const showGuide = design.showGuide === true;

  const qrSvg = await QRCode.toString(targetUrl, {
    type: "svg",
    width: 256,
    margin: 1,
    errorCorrectionLevel: "M",
    color: {
      dark: foregroundColor,
      light: "#ffffff"
    }
  });

  const match = qrSvg.match(/<svg[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*?)<\/svg>/i);

  if (!match) {
    throw new Error("QR SVG oluşturulamadı.");
  }

  const qrViewBox = match[1];
  const qrInner = match[2];
  const shapeMarkup = getShapeMarkup(shape);
  const safe = getSafeArea(shape);

  const canvasWidth = 256;
  const canvasHeight = 320;

  const safeX = safe.left;
  const safeY = safe.top;
  const safeWidth = canvasWidth - safe.left - safe.right;
  const safeHeight = canvasHeight - safe.top - safe.bottom;

  const codeFontSize = clamp(12 * (codeScale / 100), 7, 22);
  const codeGap = clamp(10 * (codeGapPercent / 100), 2, 24);

  const maxQrBySafeHeight = safeHeight - codeGap - codeFontSize * 1.5;
  const maxQrBySafeWidth = safeWidth;
  const maxQrSize = Math.max(80, Math.min(maxQrBySafeWidth, maxQrBySafeHeight));

  const preferredQrSize = 196 * (qrScale / 76);
  const qrSize = clamp(preferredQrSize, 70, maxQrSize);

  const groupHeight = qrSize + codeGap + codeFontSize * 1.5;
  const groupWidth = qrSize;

  const baseGroupX = safeX + (safeWidth - groupWidth) / 2;
  const baseGroupY = safeY + (safeHeight - groupHeight) / 2;

  const maxOffsetX = Math.max(0, (safeWidth - groupWidth) / 2);
  const maxOffsetY = Math.max(0, (safeHeight - groupHeight) / 2);

  const offsetX = clamp(
    safeWidth * (qrOffsetX / 100),
    -maxOffsetX,
    maxOffsetX
  );

  const offsetY = clamp(
    safeHeight * (qrOffsetY / 100),
    -maxOffsetY,
    maxOffsetY
  );

  const qrX = baseGroupX + offsetX;
  const qrY = baseGroupY + offsetY;
  const codeY = qrY + qrSize + codeGap + codeFontSize;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 320" width="${size}" height="${size}" role="img" aria-label="Dokuntag QR ${escapeXml(code)}">
  <defs>
    <clipPath id="dokuntagShapeClip">${shapeMarkup.clip}</clipPath>
  </defs>
  ${shapeMarkup.background}
  <g clip-path="url(#dokuntagShapeClip)">
    <svg viewBox="${escapeXml(qrViewBox)}" x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}">${qrInner}</svg>
    <text
      x="${qrX + qrSize / 2}"
      y="${codeY}"
      text-anchor="middle"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${codeFontSize}"
      font-weight="800"
      letter-spacing="1.2"
      fill="${codeColor}"
    >${escapeXml(code)}</text>
  </g>
  ${showGuide ? shapeMarkup.guide : ""}
</svg>`.trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      items?: BatchItem[];
      design?: DesignInput;
      zipName?: string;
    };

    const items = Array.isArray(body?.items)
      ? body.items.filter((item) => normalizeCode(item?.code))
      : [];

    if (!items.length) {
      return NextResponse.json(
        { error: "ZIP için en az 1 ürün gerekir." },
        { status: 400 }
      );
    }

    const baseUrl = getBaseUrl(request);
    const design = body?.design || {};
    const zip = new JSZip();

    for (const item of items) {
      const code = normalizeCode(item.code);
      const targetUrl = `${baseUrl}/t/${code}`;
      const svg = await buildSvg(targetUrl, code, design);
      zip.file(`${code}.svg`, svg);
    }

    const buffer = await zip.generateAsync({ type: "nodebuffer" });
    const safeZipName = String(body?.zipName || "dokuntag-batch")
      .trim()
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .slice(0, 60);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${safeZipName || "dokuntag-batch"}.zip"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("DOWNLOAD_BATCH_ZIP_ERROR", error);

    return NextResponse.json(
      { error: "ZIP hazırlanamadı." },
      { status: 500 }
    );
  }
}