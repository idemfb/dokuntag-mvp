import { NextResponse } from "next/server";
import QRCode from "qrcode";

type Params = {
  params: Promise<{ code: string }>;
};

type SizeOption = "1cm" | "2cm" | "2.5cm" | "3cm" | "4cm" | "5cm" | "6cm";
type ShapeOption = "round" | "square" | "drop";

type Layout = {
  size: SizeOption;
  shape: ShapeOption;
  qrScale: number;
  codeScale: number;
  qrOffsetX: number;
  qrOffsetY: number;
  codeGap: number;
  foregroundColor: string;
  codeColor: string;
  showGuide: boolean;
  transparent: boolean;
};

const SIZE_VALUES: Record<SizeOption, { width: string; height: string }> = {
  "1cm": { width: "1cm", height: "1cm" },
  "2cm": { width: "2cm", height: "2cm" },
  "2.5cm": { width: "2.5cm", height: "2.5cm" },
  "3cm": { width: "3cm", height: "3cm" },
  "4cm": { width: "4cm", height: "4cm" },
  "5cm": { width: "5cm", height: "5cm" },
  "6cm": { width: "6cm", height: "6cm" }
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

function normalizeCode(value: string) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);
}

function normalizeSize(value: string | null): SizeOption {
  if (
    value === "1cm" ||
    value === "2cm" ||
    value === "2.5cm" ||
    value === "3cm" ||
    value === "4cm" ||
    value === "5cm" ||
    value === "6cm"
  ) {
    return value;
  }

  return "3cm";
}

function normalizeShape(value: string | null): ShapeOption {
  if (value === "square") return "square";
  if (value === "drop") return "drop";
  return "round";
}

function normalizeColor(value: string | null, fallback: string) {
  const text = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(text) ? text : fallback;
}

function normalizeBoolean(value: string | null, fallback: boolean) {
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function parseNumber(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return clamp(parsed, min, max);
}

function readLayout(searchParams: URLSearchParams): Layout {
  const foregroundColor = normalizeColor(searchParams.get("foregroundColor"), "#111111");

  return {
    size: normalizeSize(searchParams.get("size")),
    transparent: normalizeBoolean(searchParams.get("transparent"), false),
    shape: normalizeShape(searchParams.get("shape")),
    qrScale: parseNumber(searchParams.get("qrScale"), 76, 35, 95),
    codeScale: parseNumber(searchParams.get("codeScale"), 100, 50, 180),
    qrOffsetX: parseNumber(searchParams.get("qrOffsetX"), 0, -45, 45),
    qrOffsetY: parseNumber(searchParams.get("qrOffsetY"), 0, -45, 45),
    codeGap: parseNumber(searchParams.get("codeGap"), 100, 20, 180),
    foregroundColor,
    codeColor: normalizeColor(searchParams.get("codeColor"), foregroundColor),
    showGuide: normalizeBoolean(searchParams.get("showGuide"), false)
  };
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

async function buildSvg(code: string, layout: Layout) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "http://localhost:3000";

  const targetUrl = `${baseUrl.replace(/\/+$/, "")}/t/${code}`;

  const qrSvg = await QRCode.toString(targetUrl, {
    type: "svg",
    width: 256,
    margin: 1,
    errorCorrectionLevel: "M",
    color: {
      dark: layout.foregroundColor,
      light: layout.transparent ? "#00000000" : "#ffffff"
    }
  });

  const match = qrSvg.match(/<svg[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*?)<\/svg>/i);

  if (!match) {
    throw new Error("QR SVG oluşturulamadı.");
  }

  const qrViewBox = match[1];
  const qrInner = match[2];
  const size = SIZE_VALUES[layout.size];
  const shape = getShapeMarkup(layout.shape);
  const safe = getSafeArea(layout.shape);

  const canvasWidth = 256;
  const canvasHeight = 320;

  const safeX = safe.left;
  const safeY = safe.top;
  const safeWidth = canvasWidth - safe.left - safe.right;
  const safeHeight = canvasHeight - safe.top - safe.bottom;

  const codeFontSize = clamp(12 * (layout.codeScale / 100), 7, 22);
  const codeGap = clamp(10 * (layout.codeGap / 100), 2, 24);

  const maxQrBySafeHeight = safeHeight - codeGap - codeFontSize * 1.5;
  const maxQrBySafeWidth = safeWidth;
  const maxQrSize = Math.max(80, Math.min(maxQrBySafeWidth, maxQrBySafeHeight));

  const preferredQrSize = 196 * (layout.qrScale / 76);
  const qrSize = clamp(preferredQrSize, 70, maxQrSize);

  const groupHeight = qrSize + codeGap + codeFontSize * 1.5;
  const groupWidth = qrSize;

  const baseGroupX = safeX + (safeWidth - groupWidth) / 2;
  const baseGroupY = safeY + (safeHeight - groupHeight) / 2;

  const maxOffsetX = Math.max(0, (safeWidth - groupWidth) / 2);
  const maxOffsetY = Math.max(0, (safeHeight - groupHeight) / 2);

  const offsetX = clamp(
    safeWidth * (layout.qrOffsetX / 100),
    -maxOffsetX,
    maxOffsetX
  );

  const offsetY = clamp(
    safeHeight * (layout.qrOffsetY / 100),
    -maxOffsetY,
    maxOffsetY
  );

  const qrX = baseGroupX + offsetX;
  const qrY = baseGroupY + offsetY;
  const codeY = qrY + qrSize + codeGap + codeFontSize;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 320" width="${size.width}" height="${size.height}" role="img" aria-label="Dokuntag QR ${escapeXml(code)}">
  <defs>
    <clipPath id="dokuntagShapeClip">${shape.clip}</clipPath>
  </defs>
  ${layout.transparent ? "" : shape.background}
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
      fill="${layout.codeColor}"
    >${escapeXml(code)}</text>
  </g>
  ${layout.showGuide ? shape.guide : ""}
</svg>`.trim();
}

export async function GET(request: Request, context: Params) {
  try {
    const { code } = await context.params;
    const normalizedCode = normalizeCode(code);

    if (normalizedCode.length < 3) {
      return NextResponse.json({ error: "Geçersiz kod." }, { status: 400 });
    }

    const url = new URL(request.url);
    const layout = readLayout(url.searchParams);
    const svg = await buildSvg(normalizedCode, layout);

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("QR_ROUTE_ERROR", error);

    return NextResponse.json(
      { error: "QR oluşturulamadı." },
      { status: 500 }
    );
  }
}