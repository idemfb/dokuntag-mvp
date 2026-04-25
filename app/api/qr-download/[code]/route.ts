
import { NextResponse } from "next/server";
import QRCode from "qrcode";

type Params = {
  params: Promise<{ code: string }>;
};

type SizeOption = "2.5cm" | "3cm" | "4cm";
type ShapeOption = "round" | "square";
type FontWeightOption = "500" | "600" | "700" | "800";
type FontStyleOption = "normal" | "italic";
type AlignOption = "left" | "center" | "right";
type DesignType = "standard" | "tag" | "card" | "vehicle" | "business";

type LayoutOverrides = {
  size: SizeOption;
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
  brandWeight: FontWeightOption;
  sloganWeight: FontWeightOption;
  brandStyle: FontStyleOption;
  sloganStyle: FontStyleOption;
  codeStyle: FontStyleOption;
  brandColor: string;
  sloganColor: string;
  codeColor: string;
  brandAlign: AlignOption;
  sloganAlign: AlignOption;
  badgeScale: number;
  badgeOffsetX: number;
  badgeOffsetY: number;
};

type LayoutPreset = {
  width: string;
  height: string;
  viewBoxHeight: number;
  outerPadding: number;
  innerPadding: number;
  qrSize: number;
  qrCenterX: number;
  qrCenterY: number;
  brandFontSize: number;
  sloganFontSize: number;
  codeFontSize: number;
  brandY: number;
  sloganY: number;
  codeX: number;
  codeCenterY: number;
  brandWeight: FontWeightOption;
  sloganWeight: FontWeightOption;
  brandStyle: FontStyleOption;
  sloganStyle: FontStyleOption;
  brandColor: string;
  sloganColor: string;
  codeColor: string;
  badgeScale: number;
  badgeOffsetX: number;
  badgeOffsetY: number;
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
  if (value === "2.5cm") return "2.5cm";
  if (value === "4cm") return "4cm";
  return "3cm";
}

function normalizeShape(value: string | null): ShapeOption {
  return value === "square" ? "square" : "round";
}

function normalizeText(value: string | null, fallback: string, maxLength: number) {
  const text = String(value || "").trim();
  return (text || fallback).slice(0, maxLength);
}

function normalizeColor(value: string | null, fallback: string) {
  const text = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(text) ? text : fallback;
}

function normalizeWeight(value: string | null, fallback: FontWeightOption): FontWeightOption {
  return value === "500" || value === "600" || value === "700" || value === "800"
    ? value
    : fallback;
}

function normalizeStyle(value: string | null, fallback: FontStyleOption): FontStyleOption {
  return value === "italic" || value === "normal" ? value : fallback;
}

function normalizeAlign(value: string | null, fallback: AlignOption): AlignOption {
  return value === "left" || value === "center" || value === "right" ? value : fallback;
}

function parsePercent(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return clamp(parsed, min, max);
}

function getBasePreset(size: SizeOption): LayoutPreset {
  if (size === "2.5cm") {
    return {
      width: "2.5cm",
      height: "2.5cm",
      viewBoxHeight: 320,
      outerPadding: 10,
      innerPadding: 10,
      qrSize: 206,
      qrCenterX: 128,
      qrCenterY: 160,
      brandFontSize: 15,
      sloganFontSize: 11.5,
      codeFontSize: 8.5,
      brandY: 26,
      sloganY: 296,
      codeX: 243,
      codeCenterY: 160,
      brandWeight: "800",
      sloganWeight: "700",
      brandStyle: "normal",
      sloganStyle: "italic",
      brandColor: "#111111",
      sloganColor: "#111111",
      codeColor: "#111111",
      badgeScale: 100,
      badgeOffsetX: 100,
      badgeOffsetY: 100
    };
  }

  if (size === "4cm") {
    return {
      width: "4cm",
      height: "4cm",
      viewBoxHeight: 320,
      outerPadding: 10,
      innerPadding: 10,
      qrSize: 206,
      qrCenterX: 128,
      qrCenterY: 160,
      brandFontSize: 18,
      sloganFontSize: 14,
      codeFontSize: 10.5,
      brandY: 24,
      sloganY: 297,
      codeX: 243,
      codeCenterY: 160,
      brandWeight: "800",
      sloganWeight: "700",
      brandStyle: "normal",
      sloganStyle: "italic",
      brandColor: "#111111",
      sloganColor: "#111111",
      codeColor: "#111111",
      badgeScale: 100,
      badgeOffsetX: 100,
      badgeOffsetY: 100
    };
  }

  return {
    width: "3cm",
    height: "3cm",
    viewBoxHeight: 320,
    outerPadding: 10,
    innerPadding: 10,
    qrSize: 206,
    qrCenterX: 128,
    qrCenterY: 160,
    brandFontSize: 16.5,
    sloganFontSize: 12.5,
    codeFontSize: 9.25,
    brandY: 25,
    sloganY: 296,
    codeX: 243,
    codeCenterY: 160,
    brandWeight: "800",
    sloganWeight: "700",
    brandStyle: "normal",
    sloganStyle: "italic",
    brandColor: "#111111",
    sloganColor: "#111111",
    codeColor: "#111111",
    badgeScale: 100,
    badgeOffsetX: 100,
    badgeOffsetY: 100
  };
}

function readLayoutOverrides(searchParams: URLSearchParams, normalizedCode: string): LayoutOverrides {
  return {
    size: normalizeSize(searchParams.get("size")),
    shape: normalizeShape(searchParams.get("shape")),
    brandText: normalizeText(searchParams.get("brandText"), "DOKUNTAG", 24),
    sloganText: normalizeText(searchParams.get("sloganText"), "Bul • Buluştur", 28),
    codeText: normalizeText(searchParams.get("codeText"), normalizedCode, 20),
    brandScale: parsePercent(searchParams.get("brandScale"), 100, 40, 500),
    sloganScale: parsePercent(searchParams.get("sloganScale"), 100, 40, 500),
    codeScale: parsePercent(searchParams.get("codeScale"), 100, 40, 500),
    qrScale: parsePercent(searchParams.get("qrScale"), 100, 85, 115),
    verticalBalance: parsePercent(searchParams.get("verticalBalance"), 100, 50, 150),
    horizontalBalance: parsePercent(searchParams.get("horizontalBalance"), 100, 50, 150),
    brandGap: parsePercent(searchParams.get("brandGap"), 100, 50, 220),
    sloganGap: parsePercent(searchParams.get("sloganGap"), 100, 50, 220),
    codeInset: parsePercent(searchParams.get("codeInset"), 100, 50, 180),
    innerSafe: parsePercent(searchParams.get("innerSafe"), 100, 80, 160),
    outerSafe: parsePercent(searchParams.get("outerSafe"), 100, 80, 180),
    brandWeight: normalizeWeight(searchParams.get("brandWeight"), "800"),
    sloganWeight: normalizeWeight(searchParams.get("sloganWeight"), "700"),
    brandStyle: normalizeStyle(searchParams.get("brandStyle"), "normal"),
    sloganStyle: normalizeStyle(searchParams.get("sloganStyle"), "italic"),
    codeStyle: normalizeStyle(searchParams.get("codeStyle"), "normal"),
    brandColor: normalizeColor(searchParams.get("brandColor"), "#111111"),
    sloganColor: normalizeColor(searchParams.get("sloganColor"), "#111111"),
    codeColor: normalizeColor(searchParams.get("codeColor"), "#111111"),
    brandAlign: normalizeAlign(searchParams.get("brandAlign"), "center"),
    sloganAlign: normalizeAlign(searchParams.get("sloganAlign"), "center"),
    badgeScale: parsePercent(searchParams.get("badgeScale"), 100, 50, 300),
    badgeOffsetX: parsePercent(searchParams.get("badgeOffsetX"), 100, 0, 220),
    badgeOffsetY: parsePercent(searchParams.get("badgeOffsetY"), 100, 0, 220)
  };
}

function getTextAnchor(align: AlignOption) {
  if (align === "left") return "start";
  if (align === "right") return "end";
  return "middle";
}

function getAlignedX(align: AlignOption, preset: LayoutPreset, horizontalFactor: number, outerSafePx: number) {
  const minX = preset.outerPadding + outerSafePx + 6;
  const maxX = 256 - preset.outerPadding - outerSafePx - 6;
  if (align === "left") {
    return clamp(minX, minX, maxX);
  }
  if (align === "right") {
    return clamp(maxX, minX, maxX);
  }
  return clamp(128 + (horizontalFactor - 1) * 26, minX, maxX);
}

function fitTextFontSize({
  text,
  requestedFontSize,
  maxWidth
}: {
  text: string;
  requestedFontSize: number;
  maxWidth: number;
}) {
  if (!text) return requestedFontSize;
  const estimatedWidth = requestedFontSize * Math.max(text.length, 1) * 0.62;
  if (estimatedWidth <= maxWidth) return requestedFontSize;
  const fitted = requestedFontSize * (maxWidth / estimatedWidth);
  return Number(clamp(fitted, 7, requestedFontSize).toFixed(2));
}

function computeLayout(preset: LayoutPreset, overrides: LayoutOverrides) {
  const outerSafePx = Math.round((overrides.outerSafe - 100) * 0.22);
  const innerSafePx = Math.round((overrides.innerSafe - 100) * 0.18);
  const horizontalFactor = overrides.horizontalBalance / 100;
  const verticalFactor = overrides.verticalBalance / 100;

  const qrSize = Math.round(preset.qrSize * (overrides.qrScale / 100));
  const qrHalf = Math.round(qrSize / 2);
  const qrCenterX = clamp(
    Math.round(preset.qrCenterX + (horizontalFactor - 1) * 20),
    preset.outerPadding + outerSafePx + qrHalf,
    256 - preset.outerPadding - outerSafePx - qrHalf
  );
  const qrCenterY = clamp(
    Math.round(preset.qrCenterY + (verticalFactor - 1) * 14),
    preset.outerPadding + outerSafePx + qrHalf,
    preset.viewBoxHeight - preset.outerPadding - outerSafePx - qrHalf
  );

  const qrX = qrCenterX - qrHalf;
  const qrY = qrCenterY - qrHalf;
  const qrTop = qrY;
  const qrBottom = qrY + qrSize;
  const qrLeft = qrX;
  const qrRight = qrX + qrSize;

  const brandRequestedFont = Number((preset.brandFontSize * overrides.brandScale / 100).toFixed(2));
  const sloganRequestedFont = Number((preset.sloganFontSize * overrides.sloganScale / 100).toFixed(2));
  const codeRequestedFont = Number((preset.codeFontSize * overrides.codeScale / 100).toFixed(2));
  const badgeRequestedFont = Number((5.3 * overrides.badgeScale / 100).toFixed(2));

  const availableTextWidth =
    256 - (preset.outerPadding + outerSafePx + 10) * 2;

  const brandFontSize = fitTextFontSize({
    text: overrides.brandText,
    requestedFontSize: brandRequestedFont,
    maxWidth: availableTextWidth
  });
  const sloganFontSize = fitTextFontSize({
    text: overrides.sloganText,
    requestedFontSize: sloganRequestedFont,
    maxWidth: availableTextWidth
  });

  const brandGapPx = Math.round((overrides.brandGap - 100) * 0.7);
  const sloganGapPx = Math.round((overrides.sloganGap - 100) * 0.7);

  const minBrandY = preset.outerPadding + outerSafePx + brandFontSize;
  const maxBrandY = qrTop - innerSafePx - 6;
  let brandY = clamp(qrTop - innerSafePx - 8 - brandGapPx, minBrandY, maxBrandY);

  const minSloganY = qrBottom + innerSafePx + sloganFontSize + 2;
  const maxSloganY = preset.viewBoxHeight - preset.outerPadding - outerSafePx - 2;
  let sloganY = clamp(qrBottom + innerSafePx + 10 + sloganGapPx, minSloganY, maxSloganY);

  const brandX = getAlignedX(overrides.brandAlign, preset, horizontalFactor, outerSafePx);
  const sloganX = getAlignedX(overrides.sloganAlign, preset, horizontalFactor, outerSafePx);

  const codeInsetPx = Math.round((overrides.codeInset - 100) * 0.6);
  const codeFontSize = Number(clamp(codeRequestedFont, 7, 28).toFixed(2));
  const codeCenterY = clamp(
    qrCenterY,
    preset.outerPadding + outerSafePx + 24,
    preset.viewBoxHeight - preset.outerPadding - outerSafePx - 24
  );
  const codeX = clamp(
    256 - preset.outerPadding - outerSafePx - 6 - codeInsetPx,
    qrRight + innerSafePx + 14,
    256 - preset.outerPadding - outerSafePx - 6
  );

  const brandTextAnchor = getTextAnchor(overrides.brandAlign);
  const sloganTextAnchor = getTextAnchor(overrides.sloganAlign);

  const badgeFontSize = Number(clamp(badgeRequestedFont, 4.2, 14).toFixed(2));
  const badgeOffsetX = (overrides.badgeOffsetX - 100) * 0.55;
  const badgeOffsetY = (overrides.badgeOffsetY - 100) * 0.45;
  const estimatedBrandWidth = brandFontSize * overrides.brandText.length * 0.58;
  let badgeX = brandX + estimatedBrandWidth / 2 + 2 + badgeOffsetX;
  let badgeY = brandY - brandFontSize * 0.6 + badgeOffsetY;
  badgeX = clamp(badgeX, brandX + 4, 256 - preset.outerPadding - outerSafePx - 4);
  badgeY = clamp(badgeY, preset.outerPadding + outerSafePx + 3, qrTop - innerSafePx - 3);

  return {
    qrSize,
    qrX,
    qrY,
    qrCenterX,
    qrCenterY,
    brandFontSize,
    sloganFontSize,
    codeFontSize,
    brandX,
    brandY,
    sloganX,
    sloganY,
    codeX,
    codeCenterY,
    badgeFontSize,
    badgeX,
    badgeY,
    outerSafePx,
    brandTextAnchor,
    sloganTextAnchor
  };
}

async function buildTagQrSvg(code: string, overrides: LayoutOverrides) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "http://localhost:3000";

  const targetUrl = `${baseUrl.replace(/\/+$/, "")}/t/${code}`;
  const qrSvg = await QRCode.toString(targetUrl, {
    type: "svg",
    width: 256,
    margin: 1
  });

  const match = qrSvg.match(/<svg[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*?)<\/svg>/i);
  if (!match) {
    throw new Error("QR SVG oluşturulamadı.");
  }

  const viewBox = match[1];
  const innerSvg = match[2];
  const preset = getBasePreset(overrides.size);
  const safeCode = escapeXml(code);
  const brandText = escapeXml(overrides.brandText || "DOKUNTAG");
  const sloganText = escapeXml(overrides.sloganText || "Dokun • Bul • Buluştur");
  const codeText = escapeXml(overrides.codeText || code);
  const brandFontSize = overrides.size === "2.5cm" ? 16 : overrides.size === "4cm" ? 20 : 18;
  const sloganFontSize = overrides.size === "2.5cm" ? 9.2 : overrides.size === "4cm" ? 11.5 : 10.2;
  const codeFontSize = overrides.size === "2.5cm" ? 8.4 : overrides.size === "4cm" ? 10.6 : 9.3;
  const qrSize = overrides.size === "2.5cm" ? 208 : overrides.size === "4cm" ? 220 : 214;
  const qrX = Math.round((256 - qrSize) / 2);
  const qrY = overrides.size === "2.5cm" ? 55 : 52;
  const rx = overrides.shape === "square" ? 20 : 128;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 ${preset.viewBoxHeight}" width="${preset.width}" height="${preset.height}" role="img" aria-label="Dokuntag QR ${safeCode}">
  <defs>
    <clipPath id="shapeClip">
      <rect x="0" y="0" width="256" height="${preset.viewBoxHeight}" rx="${rx}" ry="${rx}" />
    </clipPath>
  </defs>

  <rect x="0" y="0" width="256" height="${preset.viewBoxHeight}" rx="${rx}" ry="${rx}" fill="#ffffff" />
  <g clip-path="url(#shapeClip)">
    <text x="128" y="28" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${brandFontSize}" font-weight="800" letter-spacing="1.15" fill="${overrides.brandColor}">${brandText}</text>
    <path d="M116 39 C121 34, 135 34, 140 39" fill="none" stroke="${overrides.brandColor}" stroke-width="2.2" stroke-linecap="round" opacity="0.9" />
    <path d="M121 43 C125 40, 131 40, 135 43" fill="none" stroke="${overrides.brandColor}" stroke-width="2" stroke-linecap="round" opacity="0.9" />
    <svg viewBox="${viewBox}" x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}">${innerSvg}</svg>
    <text x="128" y="${qrY + qrSize + 17}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${sloganFontSize}" font-weight="700" letter-spacing="0.25" fill="${overrides.sloganColor}">${sloganText}</text>
    <text x="128" y="${qrY + qrSize + 34}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${codeFontSize}" font-weight="800" letter-spacing="0.8" fill="${overrides.codeColor}">${codeText}</text>
  </g>
</svg>`.trim();
}

async function buildQrSvg(code: string, overrides: LayoutOverrides) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "http://localhost:3000";

  const targetUrl = `${baseUrl.replace(/\/+$/, "")}/t/${code}`;

  const qrSvg = await QRCode.toString(targetUrl, {
    type: "svg",
    width: 256,
    margin: 1
  });

  const match = qrSvg.match(/<svg[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*?)<\/svg>/i);
  if (!match) {
    throw new Error("QR SVG oluşturulamadı.");
  }

  const preset = getBasePreset(overrides.size);
  const layout = computeLayout(preset, overrides);
  const viewBox = match[1];
  const innerSvg = match[2];
  const safeCode = escapeXml(code);
  const safeBrandText = escapeXml(overrides.brandText);
  const safeSloganText = escapeXml(overrides.sloganText);
  const safeCodeText = escapeXml(overrides.codeText || code);
  const rx = overrides.shape === "round" ? 128 : 20;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 ${preset.viewBoxHeight}" width="${preset.width}" height="${preset.height}" role="img" aria-label="Dokuntag QR ${safeCode}">
  <defs>
    <clipPath id="shapeClip">
      <rect x="0" y="0" width="256" height="${preset.viewBoxHeight}" rx="${rx}" ry="${rx}" />
    </clipPath>
  </defs>

  <rect x="0" y="0" width="256" height="${preset.viewBoxHeight}" rx="${rx}" ry="${rx}" fill="#ffffff" />
  <g clip-path="url(#shapeClip)">
    <text
      x="${layout.brandX}"
      y="${layout.brandY}"
      text-anchor="${layout.brandTextAnchor}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${layout.brandFontSize}"
      font-weight="${overrides.brandWeight}"
      font-style="${overrides.brandStyle}"
      letter-spacing="0.5"
      fill="${overrides.brandColor}"
    >${safeBrandText}</text>

    <text
      x="${layout.badgeX}"
      y="${layout.badgeY}"
      text-anchor="start"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${layout.badgeFontSize}"
      font-weight="800"
      font-style="normal"
      fill="${overrides.brandColor}"
    >®</text>

    <svg viewBox="${viewBox}" x="${layout.qrX}" y="${layout.qrY}" width="${layout.qrSize}" height="${layout.qrSize}">
      ${innerSvg}
    </svg>

    <text
      x="${layout.codeX}"
      y="${layout.codeCenterY}"
      transform="rotate(90 ${layout.codeX} ${layout.codeCenterY})"
      text-anchor="middle"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${layout.codeFontSize}"
      font-weight="700"
      font-style="${overrides.codeStyle}"
      letter-spacing="0.45"
      fill="${overrides.codeColor}"
    >${safeCodeText}</text>

    <text
      x="${layout.sloganX}"
      y="${layout.sloganY}"
      text-anchor="${layout.sloganTextAnchor}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${layout.sloganFontSize}"
      font-weight="${overrides.sloganWeight}"
      font-style="${overrides.sloganStyle}"
      letter-spacing="0.25"
      fill="${overrides.sloganColor}"
    >${safeSloganText}</text>
  </g>
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
    const svg = await buildQrSvg(normalizedCode, overrides);

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="qr-${normalizedCode}-${overrides.size}.svg"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("QR_DOWNLOAD_ERROR", error);
    return NextResponse.json({ error: "QR indirilemedi." }, { status: 500 });
  }
}
