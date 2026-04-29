import { NextResponse } from "next/server";
import QRCode from "qrcode";

type Params = {
  params: Promise<{ code: string }>;
};

type SizeOption = "1cm" | "2cm" | "2.5cm" | "3cm" | "4cm" | "5cm" | "6cm";
type ShapeOption = "round" | "square" | "drop";

type LayoutOverrides = {
  size: SizeOption;
  shape: ShapeOption;
  hasHole: boolean;
  topText: string;
  codeText: string;
  hideCode: boolean;
  qrScale: number;
  topGap: number;
  codeGap: number;
  qrOffsetY: number;
  foregroundColor: string;
  guideColor: string;
  showGuide: boolean;
};

const SIZE_VALUES: Record<SizeOption, { width: string; height: string; physicalMm: number }> = {
  "1cm": { width: "1cm", height: "1cm", physicalMm: 10 },
  "2cm": { width: "2cm", height: "2cm", physicalMm: 20 },
  "2.5cm": { width: "2.5cm", height: "2.5cm", physicalMm: 25 },
  "3cm": { width: "3cm", height: "3cm", physicalMm: 30 },
  "4cm": { width: "4cm", height: "4cm", physicalMm: 40 },
  "5cm": { width: "5cm", height: "5cm", physicalMm: 50 },
  "6cm": { width: "6cm", height: "6cm", physicalMm: 60 }
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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

function normalizeBoolean(value: string | null, fallback: boolean) {
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function normalizeText(value: string | null, fallback: string, maxLength: number) {
  const raw = value;
  const text = String(raw ?? "").trim();

  if (raw === "") {
    return "";
  }

  return (text || fallback).slice(0, maxLength);
}

function normalizeColor(value: string | null, fallback: string) {
  const text = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(text) ? text : fallback;
}

function parsePercent(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return clamp(parsed, min, max);
}

function readLayoutOverrides(searchParams: URLSearchParams, normalizedCode: string): LayoutOverrides {
  const hideCode = normalizeBoolean(searchParams.get("hideCode"), false);
  const rawCodeText = searchParams.get("codeText");
  const resolvedCodeText = hideCode
    ? ""
    : rawCodeText === "" || rawCodeText === null
      ? normalizedCode
      : normalizeText(rawCodeText, normalizedCode, 20);

  return {
    size: normalizeSize(searchParams.get("size")),
    shape: normalizeShape(searchParams.get("shape")),
    hasHole: normalizeBoolean(searchParams.get("hasHole"), true),
    topText: normalizeText(searchParams.get("topText"), "OKUT", 12),
    codeText: resolvedCodeText,
    hideCode,
    qrScale: parsePercent(searchParams.get("qrScale"), 78, 40, 96),
    topGap: parsePercent(searchParams.get("topGap"), 100, 60, 170),
    codeGap: parsePercent(searchParams.get("codeGap"), 100, 60, 170),
    qrOffsetY: parsePercent(searchParams.get("qrOffsetY"), 100, 70, 130),
    foregroundColor: normalizeColor(searchParams.get("foregroundColor"), "#111111"),
    guideColor: normalizeColor(searchParams.get("guideColor"), "#ef4444"),
    showGuide: normalizeBoolean(searchParams.get("showGuide"), false)
  };
}

function getClipMarkup(shape: ShapeOption, viewBoxHeight: number) {
  if (shape === "drop") {
    const dropPath =
      "M128 8 C176 50 242 118 242 198 C242 265 194 312 128 312 C62 312 14 265 14 198 C14 118 80 50 128 8 Z";

    return {
      clip: `<path d="${dropPath}" />`,
      background: `<path d="${dropPath}" fill="#ffffff" />`,
      guide: `<path d="${dropPath}" fill="none" />`
    };
  }

  const rx = shape === "square" ? 20 : 128;

  return {
    clip: `<rect x="0" y="0" width="256" height="${viewBoxHeight}" rx="${rx}" ry="${rx}" />`,
    background: `<rect x="0" y="0" width="256" height="${viewBoxHeight}" rx="${rx}" ry="${rx}" fill="#ffffff" />`,
    guide: `<rect x="0" y="0" width="256" height="${viewBoxHeight}" rx="${rx}" ry="${rx}" fill="none" />`
  };
}

function getHoleMarkup(overrides: LayoutOverrides) {
  if (overrides.shape !== "drop" || !overrides.hasHole) return "";

  return `
    <circle cx="128" cy="42" r="15" fill="#ffffff" stroke="${overrides.foregroundColor}" stroke-width="2.2" opacity="0.9" />
    <circle cx="128" cy="42" r="8" fill="none" stroke="#d4d4d4" stroke-width="1" opacity="0.9" />
  `;
}

function getBaseLayout(overrides: LayoutOverrides) {
  const viewBoxHeight = 256;
  const topFont = overrides.size === "1cm" ? 13 : overrides.size === "2cm" ? 16 : 18;
  const codeFont = overrides.size === "1cm" ? 9 : overrides.size === "2cm" ? 11 : 12.5;
  const topYBase = overrides.shape === "drop" && overrides.hasHole ? 66 : 34;
  const topY = clamp(topYBase + (overrides.topGap - 100) * 0.18, 20, 96);
  const maxQrSize = overrides.shape === "drop" ? 178 : 204;
  const minQrSize = overrides.size === "1cm" ? 82 : 104;
  const qrSize = Math.round(clamp(maxQrSize * (overrides.qrScale / 100), minQrSize, maxQrSize));
  const qrX = Math.round((256 - qrSize) / 2);
  const defaultQrY = overrides.shape === "drop" ? 92 : 66;
  const qrY = Math.round(
    clamp(defaultQrY + (overrides.qrOffsetY - 100) * 0.55, topY + topFont + 8, 242 - qrSize)
  );
const codeY = clamp(
  qrY + qrSize + 12 + (overrides.codeGap - 100) * 0.2,
  qrY + qrSize + 12,
  240
);
  return {
    viewBoxHeight,
    topFont,
    codeFont,
    topY,
    qrSize,
    qrX,
    qrY,
    codeY
  };
}

async function buildQrFaceSvg(code: string, overrides: LayoutOverrides) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "http://localhost:3000";

  const targetUrl = `${baseUrl.replace(/\/+$/, "")}/t/${code}`;
  const qrSvg = await QRCode.toString(targetUrl, {
    type: "svg",
    width: 256,
    margin: 1,
    color: {
      dark: overrides.foregroundColor,
      light: "#ffffff"
    }
  });

  const match = qrSvg.match(/<svg[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*?)<\/svg>/i);
  if (!match) {
    throw new Error("QR SVG oluşturulamadı.");
  }

  const viewBox = match[1];
  const innerSvg = match[2];
  const safeCode = escapeXml(code);
  const layout = getBaseLayout(overrides);
  const clipMarkup = getClipMarkup(overrides.shape, layout.viewBoxHeight);
  const size = SIZE_VALUES[overrides.size];

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 ${layout.viewBoxHeight}" width="${size.width}" height="${size.height}" role="img" aria-label="Dokuntag QR ${safeCode}">
  <defs>
    <clipPath id="shapeClip">
      ${clipMarkup.clip}
    </clipPath>
  </defs>

  ${clipMarkup.background}
  <g clip-path="url(#shapeClip)">
    ${getHoleMarkup(overrides)}

    <text
      x="128"
      y="${layout.topY}"
      text-anchor="middle"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${layout.topFont}"
      font-weight="800"
      letter-spacing="1.4"
      fill="${overrides.foregroundColor}"
    >${escapeXml(overrides.topText)}</text>

    <svg viewBox="${viewBox}" x="${layout.qrX}" y="${layout.qrY}" width="${layout.qrSize}" height="${layout.qrSize}">
      ${innerSvg}
    </svg>

    ${
      overrides.hideCode || !overrides.codeText.trim()
        ? ""
        : `
    <text
      x="128"
      y="${layout.codeY}"
      text-anchor="middle"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${layout.codeFont}"
      font-weight="800"
      letter-spacing="0.9"
      fill="${overrides.foregroundColor}"
    >${escapeXml(overrides.codeText)}</text>`
    }
  </g>

  ${
    overrides.showGuide
      ? `<g opacity="0.95" stroke="${overrides.guideColor}" stroke-width="2" stroke-dasharray="5 4">${clipMarkup.guide}</g>`
      : ""
  }
</svg>`.trim();
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { code } = await params;
    const normalizedCode = String(code || "").trim().toUpperCase();

    if (!normalizedCode) {
      return NextResponse.json({ error: "Kod zorunludur." }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const overrides = readLayoutOverrides(searchParams, normalizedCode);
    const svg = await buildQrFaceSvg(normalizedCode, overrides);

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("QR_GENERATE_ERROR", error);
    return NextResponse.json({ error: "QR oluşturulamadı." }, { status: 500 });
  }
}
