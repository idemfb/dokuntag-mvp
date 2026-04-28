import { NextResponse } from "next/server";
import QRCode from "qrcode";

type Params = {
  params: Promise<{ code: string }>;
};

type SizeOption = "2.5cm" | "3cm" | "4cm";
type ShapeOption = "round" | "square" | "drop";
type FontWeightOption = "500" | "600" | "700" | "800";
type FontStyleOption = "normal" | "italic";
type AlignOption = "left" | "center" | "right";
type DesignType = "standard" | "tag" | "card" | "vehicle" | "business";

type LayoutOverrides = {
  size: SizeOption;
  shape: ShapeOption;
  hasHole: boolean;
  brandText: string;
  sloganText: string;
  codeText: string;
  hideCode: boolean;
  showLogo: boolean;
  logoScale: number;
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
  codeAlign: AlignOption;
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
  if (value === "square") return "square";
  if (value === "drop") return "drop";
  return "round";
}

function normalizeBoolean(value: string | null, fallback: boolean) {
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function normalizeDesignType(value: string | null): DesignType {
  if (value === "standard" || value === "card" || value === "vehicle" || value === "business") {
    return value;
  }

  return "tag";
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

function getPhysicalSizeMm(size: SizeOption) {
  if (size === "2.5cm") return 25;
  if (size === "4cm") return 40;
  return 30;
}

function getQrSizePx({
  basePx,
  size,
  qrScale,
  outerSafePx = 0
}: {
  basePx: number;
  size: SizeOption;
  qrScale: number;
  outerSafePx?: number;
}) {
  const physicalSizeMm = getPhysicalSizeMm(size);
  const pxPerMm = 256 / physicalSizeMm;
  const minPx = 10 * pxPerMm;
  const maxPhysicalMm = Math.max(10, Math.min(35, physicalSizeMm - 4));
  const maxPx = Math.min(maxPhysicalMm * pxPerMm, 256 - outerSafePx * 2 - 4);

  return Math.round(clamp(basePx * (qrScale / 100), minPx, maxPx));
}

function getCodeXByAlign(align: AlignOption) {
  if (align === "left") return 58;
  if (align === "right") return 198;
  return 128;
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
    brandText: normalizeText(searchParams.get("brandText"), "dokuntag", 24),
    sloganText: normalizeText(searchParams.get("sloganText"), "", 28),
    codeText: resolvedCodeText,
    hideCode,
    showLogo: normalizeBoolean(searchParams.get("showLogo"), true),
    logoScale: parsePercent(searchParams.get("logoScale"), 18, 10, 30),
    brandScale: parsePercent(searchParams.get("brandScale"), 100, 40, 500),
    sloganScale: parsePercent(searchParams.get("sloganScale"), 100, 40, 500),
    codeScale: parsePercent(searchParams.get("codeScale"), 100, 40, 500),
    qrScale: parsePercent(searchParams.get("qrScale"), 100, 35, 300),
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
    codeAlign: normalizeAlign(searchParams.get("codeAlign"), "center"),
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

  const qrSize = getQrSizePx({
    basePx: preset.qrSize,
    size: overrides.size,
    qrScale: overrides.qrScale,
    outerSafePx
  });
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
  const qrRight = qrX + qrSize;

  const brandRequestedFont = Number((preset.brandFontSize * overrides.brandScale / 100).toFixed(2));
  const sloganRequestedFont = Number((preset.sloganFontSize * overrides.sloganScale / 100).toFixed(2));
  const codeRequestedFont = Number((preset.codeFontSize * overrides.codeScale / 100).toFixed(2));
  const badgeRequestedFont = Number((8.5 * overrides.badgeScale / 100).toFixed(2));

  const availableTextWidth = 256 - (preset.outerPadding + outerSafePx + 10) * 2;

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
  const brandY = clamp(qrTop - innerSafePx - 8 - brandGapPx, minBrandY, maxBrandY);

  const minSloganY = qrBottom + innerSafePx + sloganFontSize + 2;
  const maxSloganY = preset.viewBoxHeight - preset.outerPadding - outerSafePx - 2;
  const sloganY = clamp(qrBottom + innerSafePx + 10 + sloganGapPx, minSloganY, maxSloganY);

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
  const badgeX = clamp(
    brandX + estimatedBrandWidth / 2 + 2 + badgeOffsetX,
    brandX + 4,
    256 - preset.outerPadding - outerSafePx - 4
  );
  const badgeY = clamp(
    brandY - brandFontSize * 0.6 + badgeOffsetY,
    preset.outerPadding + outerSafePx + 3,
    qrTop - innerSafePx - 3
  );

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
    brandTextAnchor,
    sloganTextAnchor
  };
}

function getClipMarkup(shape: ShapeOption, viewBoxHeight: number) {
  if (shape === "drop") {
    const dropPath =
      "M128 8 C176 50 242 118 242 198 C242 265 194 312 128 312 C62 312 14 265 14 198 C14 118 80 50 128 8 Z";

    return {
      clip: `<path d="${dropPath}" />`,
      background: `<path d="${dropPath}" fill="#ffffff" />`
    };
  }

  const rx = shape === "square" ? 20 : 128;

  return {
    clip: `<rect x="0" y="0" width="256" height="${viewBoxHeight}" rx="${rx}" ry="${rx}" />`,
    background: `<rect x="0" y="0" width="256" height="${viewBoxHeight}" rx="${rx}" ry="${rx}" fill="#ffffff" />`
  };
}

function getHoleMarkup(overrides: LayoutOverrides) {
  if (overrides.shape !== "drop" || !overrides.hasHole) return "";

  return `
    <circle cx="128" cy="42" r="15" fill="#ffffff" stroke="#111111" stroke-width="2.2" opacity="0.9" />
    <circle cx="128" cy="42" r="8" fill="none" stroke="#d4d4d4" stroke-width="1" opacity="0.9" />
  `;

}

function renderOptionalText({
  x,
  y,
  text,
  anchor,
  fontSize,
  weight,
  style,
  letterSpacing,
  color,
  extra = ""
}: {
  x: number;
  y: number;
  text: string;
  anchor: string;
  fontSize: number;
  weight: string;
  style: string;
  letterSpacing: number;
  color: string;
  extra?: string;
}) {
  if (!text.trim()) return "";

  return `
    <text
      ${extra}
      x="${x}"
      y="${y}"
      text-anchor="${anchor}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${fontSize}"
      font-weight="${weight}"
      font-style="${style}"
      letter-spacing="${letterSpacing}"
      fill="${color}"
    >${escapeXml(text)}</text>
  `;
}

function getDropTextLayout(overrides: LayoutOverrides, qrY: number, qrSize: number) {
  const brandText = overrides.brandText.trim();
  const sloganText = overrides.sloganText.trim();
  const codeText = overrides.hideCode ? "" : overrides.codeText.trim();

  const brandFontSize = clamp(
    (overrides.size === "2.5cm" ? 9.8 : overrides.size === "4cm" ? 13 : 11.2) *
      (overrides.brandScale / 100),
    7,
    18
  );

  const sloganFontSize = clamp(
    (overrides.size === "2.5cm" ? 6.9 : overrides.size === "4cm" ? 9.2 : 7.8) *
      (overrides.sloganScale / 100),
    5.5,
    14
  );

  const codeFontSize = clamp(
    (overrides.size === "2.5cm" ? 7.6 : overrides.size === "4cm" ? 10.2 : 8.8) *
      (overrides.codeScale / 100),
    6,
    16
  );

  const textGapOffset = Math.round((overrides.codeInset - 100) * 0.55);
  const minAfterQr = qrY + qrSize + codeFontSize + 5;
  const baseY = qrY + qrSize + 13;
  const brandY = clamp(baseY, qrY + qrSize + 10, 282);
  const symbolScale = clamp(brandFontSize / 12, 0.75, 1.35);
  const symbolY = brandY - brandFontSize + 3;

  let sloganY = brandText ? brandY + (sloganText ? sloganFontSize + 6 : 0) : qrY + qrSize + sloganFontSize + 7;
  let codeY = brandText
    ? sloganText
      ? sloganY + codeFontSize + 7 + textGapOffset
      : brandY + codeFontSize + 8 + textGapOffset
    : sloganText
      ? sloganY + codeFontSize + 7 + textGapOffset
      : minAfterQr + textGapOffset;

  sloganY = clamp(sloganY, qrY + qrSize + sloganFontSize + 5, 298);
  codeY = clamp(codeY, minAfterQr, 309);

  const codeAnchor = getTextAnchor(overrides.codeAlign);
  const codeX = getCodeXByAlign(overrides.codeAlign);

  return {
    brandText,
    sloganText,
    codeText,
    brandFontSize,
    sloganFontSize,
    codeFontSize,
    brandY,
    sloganY,
    codeY,
    codeX,
    codeAnchor,
    symbolY,
    symbolScale
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
  const isDrop = overrides.shape === "drop";
  const clipMarkup = getClipMarkup(overrides.shape, preset.viewBoxHeight);
  const holeMarkup = getHoleMarkup(overrides);

  if (isDrop) {
    const baseQrSize =
      overrides.size === "2.5cm" ? 178 : overrides.size === "4cm" ? 198 : 188;
    const qrSize = getQrSizePx({
      basePx: baseQrSize,
      size: overrides.size,
      qrScale: overrides.qrScale,
      outerSafePx: Math.round((overrides.outerSafe - 100) * 0.22)
    });
    const qrX = clamp(
      Math.round((256 - qrSize) / 2 + (overrides.horizontalBalance - 100) * 0.22),
      12,
      244 - qrSize
    );
    const qrYBase = overrides.hasHole ? 69 : 48;
    const qrY = clamp(
      Math.round(qrYBase + (overrides.verticalBalance - 100) * 0.22),
      overrides.hasHole ? 56 : 30,
      230 - qrSize
    );
    const textLayout = getDropTextLayout(overrides, qrY, qrSize);

    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 ${preset.viewBoxHeight}" width="${preset.width}" height="${preset.height}" role="img" aria-label="Dokuntag QR ${safeCode}">
  <defs>
    <clipPath id="shapeClip">
      ${clipMarkup.clip}
    </clipPath>
  </defs>

  ${clipMarkup.background}
  <g clip-path="url(#shapeClip)">
    ${holeMarkup}
    <svg viewBox="${viewBox}" x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}">${innerSvg}</svg>

    ${
      textLayout.brandText
        ? `
    <text x="128" y="${textLayout.brandY}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${textLayout.brandFontSize}" font-weight="${overrides.brandWeight}" font-style="${overrides.brandStyle}" letter-spacing="0.55" fill="${overrides.brandColor}">${escapeXml(textLayout.brandText)}</text>
    <text x="${128 + textLayout.brandText.length * textLayout.brandFontSize * 0.31 + 3}" y="${textLayout.brandY - textLayout.brandFontSize * 0.52}" text-anchor="start" font-family="Arial, Helvetica, sans-serif" font-size="${clamp(textLayout.brandFontSize * 0.52, 4, 8)}" font-weight="800" fill="${overrides.brandColor}">®</text>
  
        `
        : ""
    }

    ${renderOptionalText({
      x: 128,
      y: textLayout.sloganY,
      text: textLayout.sloganText,
      anchor: "middle",
      fontSize: textLayout.sloganFontSize,
      weight: overrides.sloganWeight,
      style: overrides.sloganStyle,
      letterSpacing: 0.18,
      color: overrides.sloganColor
    })}

    ${renderOptionalText({
      x: textLayout.codeX,
      y: textLayout.codeY,
      text: textLayout.codeText,
      anchor: textLayout.codeAnchor,
      fontSize: textLayout.codeFontSize,
      weight: "800",
      style: overrides.codeStyle,
      letterSpacing: 0.7,
      color: overrides.codeColor
    })}
  </g>
</svg>`.trim();
  }

  const brandText = overrides.brandText.trim();
  const sloganText = overrides.sloganText.trim();
  const codeText = overrides.hideCode ? "" : overrides.codeText.trim() || code;
  const baseQrSize = overrides.size === "2.5cm" ? 208 : overrides.size === "4cm" ? 220 : 214;
  const qrSize = getQrSizePx({
    basePx: baseQrSize,
    size: overrides.size,
    qrScale: overrides.qrScale,
    outerSafePx: Math.round((overrides.outerSafe - 100) * 0.22)
  });
  const qrX = clamp(
    Math.round((256 - qrSize) / 2 + (overrides.horizontalBalance - 100) * 0.22),
    8,
    248 - qrSize
  );
  const qrY = clamp(
    Math.round((overrides.size === "2.5cm" ? 55 : 52) + (overrides.verticalBalance - 100) * 0.22),
    36,
    260 - qrSize
  );
  const baseBrandFontSize = overrides.size === "2.5cm" ? 16 : overrides.size === "4cm" ? 20 : 18;
  const baseSloganFontSize = overrides.size === "2.5cm" ? 9.2 : overrides.size === "4cm" ? 11.5 : 10.2;
  const baseCodeFontSize = overrides.size === "2.5cm" ? 8.4 : overrides.size === "4cm" ? 10.6 : 9.3;
  const brandFontSize = clamp(baseBrandFontSize * (overrides.brandScale / 100), 7, 42);
  const sloganFontSize = clamp(baseSloganFontSize * (overrides.sloganScale / 100), 5.5, 30);
  const codeFontSize = clamp(baseCodeFontSize * (overrides.codeScale / 100), 5.5, 30);
  const brandY = 28;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 ${preset.viewBoxHeight}" width="${preset.width}" height="${preset.height}" role="img" aria-label="Dokuntag QR ${safeCode}">
  <defs>
    <clipPath id="shapeClip">
      ${clipMarkup.clip}
    </clipPath>
  </defs>

  ${clipMarkup.background}
  <g clip-path="url(#shapeClip)">
    ${
      brandText
        ? `
    <text x="128" y="${brandY}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${brandFontSize}" font-weight="800" letter-spacing="1.15" fill="${overrides.brandColor}">${escapeXml(brandText)}</text>
        `
        : ""
    }
    <svg viewBox="${viewBox}" x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}">${innerSvg}</svg>
    ${renderOptionalText({
      x: 128,
      y: qrY + qrSize + 17,
      text: sloganText,
      anchor: "middle",
      fontSize: sloganFontSize,
      weight: "700",
      style: overrides.sloganStyle,
      letterSpacing: 0.25,
      color: overrides.sloganColor
    })}
    ${renderOptionalText({
      x: 128,
      y: qrY + qrSize + (sloganText ? 34 : 20),
      text: codeText,
      anchor: "middle",
      fontSize: codeFontSize,
      weight: "800",
      style: overrides.codeStyle,
      letterSpacing: 0.8,
      color: overrides.codeColor
    })}
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
  const safeBrandText = overrides.brandText;
  const safeSloganText = overrides.sloganText;
  const safeCodeText = overrides.hideCode ? "" : overrides.codeText || code;
  const clipMarkup = getClipMarkup(overrides.shape, preset.viewBoxHeight);
  const holeMarkup = getHoleMarkup(overrides);

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 ${preset.viewBoxHeight}" width="${preset.width}" height="${preset.height}" role="img" aria-label="Dokuntag QR ${safeCode}">
  <defs>
    <clipPath id="shapeClip">
      ${clipMarkup.clip}
    </clipPath>
  </defs>

  ${clipMarkup.background}
  <g clip-path="url(#shapeClip)">
    ${holeMarkup}
    ${renderOptionalText({
      x: layout.brandX,
      y: layout.brandY,
      text: safeBrandText,
      anchor: layout.brandTextAnchor,
      fontSize: layout.brandFontSize,
      weight: overrides.brandWeight,
      style: overrides.brandStyle,
      letterSpacing: 0.5,
      color: overrides.brandColor
    })}

    ${
      overrides.brandText.trim()
        ? `
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
        `
        : ""
    }
<svg viewBox="${viewBox}" x="${layout.qrX}" y="${layout.qrY}" width="${layout.qrSize}" height="${layout.qrSize}">
  ${innerSvg}

  ${
  overrides.showLogo
    ? (() => {
        const size = layout.qrSize * (overrides.logoScale / 100);
      const half = size / 2;
      const center = 128;

      return `
        <rect
          x="${center - half}"
          y="${center - half}"
          width="${size}"
          height="${size}"
          rx="${size * 0.25}"
          fill="#ffffff"
        />

        <text
          x="${center}"
          y="${center + 1}"
          text-anchor="middle"
          dominant-baseline="middle"
          font-family="Arial"
          font-size="${size * 0.55}"
          font-weight="800"
          fill="#000000"
        >
          ))
        </text>
      `;
          })()
    : ""
}
</svg>

    ${renderOptionalText({
      x: layout.codeX,
      y: layout.codeCenterY,
      text: safeCodeText,
      anchor: "middle",
      fontSize: layout.codeFontSize,
      weight: "700",
      style: overrides.codeStyle,
      letterSpacing: 0.45,
      color: overrides.codeColor,
      extra: `transform="rotate(90 ${layout.codeX} ${layout.codeCenterY})"`
    })}

    ${renderOptionalText({
      x: layout.sloganX,
      y: layout.sloganY,
      text: safeSloganText,
      anchor: layout.sloganTextAnchor,
      fontSize: layout.sloganFontSize,
      weight: overrides.sloganWeight,
      style: overrides.sloganStyle,
      letterSpacing: 0.25,
      color: overrides.sloganColor
    })}
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
    const designType = normalizeDesignType(searchParams.get("designType"));
    const svg =
      designType === "standard"
        ? await buildQrSvg(normalizedCode, overrides)
        : await buildTagQrSvg(normalizedCode, overrides);

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
