
import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import QRCode from "qrcode";

type BatchItem = {
  code?: string;
};

type SizeOption = "2.5cm" | "3cm" | "4cm";
type ShapeOption = "round" | "square";
type FontWeightOption = "500" | "600" | "700" | "800";
type FontStyleOption = "normal" | "italic";
type AlignOption = "left" | "center" | "right";
type DesignType = "standard" | "tag" | "card" | "vehicle" | "business";

type DesignInput = {
  size?: SizeOption;
  shape?: ShapeOption;
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
  brandWeight?: FontWeightOption;
  sloganWeight?: FontWeightOption;
  brandStyle?: FontStyleOption;
  sloganStyle?: FontStyleOption;
  codeStyle?: FontStyleOption;
  brandColor?: string;
  sloganColor?: string;
  codeColor?: string;
  brandAlign?: AlignOption;
  sloganAlign?: AlignOption;
  badgeScale?: number;
  badgeOffsetX?: number;
  badgeOffsetY?: number;
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

function normalizeCode(value: unknown) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function normalizeColor(value: unknown, fallback: string) {
  const text = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(text) ? text : fallback;
}

function normalizeText(value: unknown, fallback: string, maxLength: number) {
  const text = String(value || "").trim();
  return (text || fallback).slice(0, maxLength);
}

function parsePercent(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return clamp(parsed, min, max);
}

function getBaseUrl(request: NextRequest) {
  const envBaseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "";
  if (envBaseUrl) {
    return envBaseUrl.replace(/\/+$/, "");
  }
  return request.nextUrl.origin.replace(/\/+$/, "");
}

async function buildTagSvg(targetUrl: string, code: string, design: DesignInput) {
  const size = design.size === "2.5cm" || design.size === "4cm" ? design.size : "3cm";
  const shape = design.shape === "square" ? "square" : "round";
  const brandText = normalizeText(design.brandText, "DOKUNTAG", 24);
  const sloganText = normalizeText(design.sloganText, "Dokun • Bul • Buluştur", 28);
  const codeText = normalizeText(design.codeText, code, 20);
  const brandColor = normalizeColor(design.brandColor, "#111111");
  const sloganColor = normalizeColor(design.sloganColor, "#111111");
  const codeColor = normalizeColor(design.codeColor, "#111111");
  const qrSvg = await QRCode.toString(targetUrl, { type: "svg", width: 256, margin: 1 });
  const match = qrSvg.match(/<svg[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*?)<\/svg>/i);
  if (!match) throw new Error("QR SVG oluşturulamadı.");
  const viewBox = match[1];
  const innerSvg = match[2];
  const width = size;
  const height = size;
  const qrSize = size === "2.5cm" ? 208 : size === "4cm" ? 220 : 214;
  const qrX = Math.round((256 - qrSize) / 2);
  const qrY = size === "2.5cm" ? 55 : 52;
  const brandFontSize = size === "2.5cm" ? 16 : size === "4cm" ? 20 : 18;
  const sloganFontSize = size === "2.5cm" ? 9.2 : size === "4cm" ? 11.5 : 10.2;
  const codeFontSize = size === "2.5cm" ? 8.4 : size === "4cm" ? 10.6 : 9.3;
  const rx = shape === "square" ? 20 : 128;
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 320" width="${width}" height="${height}" role="img" aria-label="Dokuntag QR ${escapeXml(code)}">
  <rect x="0" y="0" width="256" height="320" rx="${rx}" ry="${rx}" fill="#ffffff" />
  <text x="128" y="28" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${brandFontSize}" font-weight="800" letter-spacing="1.15" fill="${brandColor}">${escapeXml(brandText)}</text>
  <path d="M116 39 C121 34, 135 34, 140 39" fill="none" stroke="${brandColor}" stroke-width="2.2" stroke-linecap="round" opacity="0.9" />
  <path d="M121 43 C125 40, 131 40, 135 43" fill="none" stroke="${brandColor}" stroke-width="2" stroke-linecap="round" opacity="0.9" />
  <svg viewBox="${viewBox}" x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}">${innerSvg}</svg>
  <text x="128" y="${qrY + qrSize + 17}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${sloganFontSize}" font-weight="700" letter-spacing="0.25" fill="${sloganColor}">${escapeXml(sloganText)}</text>
  <text x="128" y="${qrY + qrSize + 34}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${codeFontSize}" font-weight="800" letter-spacing="0.8" fill="${codeColor}">${escapeXml(codeText)}</text>
</svg>`.trim();
}

async function buildSvg(targetUrl: string, code: string, design: DesignInput) {
  const size = design.size === "2.5cm" || design.size === "4cm" ? design.size : "3cm";
  const shape = design.shape === "square" ? "square" : "round";
  const brandText = normalizeText(design.brandText, "DOKUNTAG", 24);
  const sloganText = normalizeText(design.sloganText, "Bul • Buluştur", 28);
  const codeText = normalizeText(design.codeText, code, 20);

  const qrSvg = await QRCode.toString(targetUrl, { type: "svg", width: 256, margin: 1 });
  const match = qrSvg.match(/<svg[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*?)<\/svg>/i);
  if (!match) throw new Error("QR SVG oluşturulamadı.");

  const baseBrand = size === "2.5cm" ? 15 : size === "4cm" ? 18 : 16.5;
  const baseSlogan = size === "2.5cm" ? 11.5 : size === "4cm" ? 14 : 12.5;
  const baseCode = size === "2.5cm" ? 8.5 : size === "4cm" ? 10.5 : 9.25;

  const qrSize = 206;
  const qrX = 25;
  const qrY = 57;

  const brandScale = parsePercent(design.brandScale, 100, 40, 500);
  const sloganScale = parsePercent(design.sloganScale, 100, 40, 500);
  const codeScale = parsePercent(design.codeScale, 100, 40, 500);
  const brandGap = parsePercent(design.brandGap, 100, 50, 220);
  const sloganGap = parsePercent(design.sloganGap, 100, 50, 220);
  const codeInset = parsePercent(design.codeInset, 100, 50, 180);
  const innerSafe = parsePercent(design.innerSafe, 100, 80, 160);
  const outerSafe = parsePercent(design.outerSafe, 100, 80, 180);
  const horizontalBalance = parsePercent(design.horizontalBalance, 100, 50, 150);
  const verticalBalance = parsePercent(design.verticalBalance, 100, 50, 150);

  const outerSafePx = Math.round((outerSafe - 100) * 0.22);
  const innerSafePx = Math.round((innerSafe - 100) * 0.18);
  const qrCenterX = clamp(128 + Math.round((horizontalBalance - 100) * 0.2), 25 + qrSize / 2, 231 - qrSize / 2);
  const qrCenterY = clamp(160 + Math.round((verticalBalance - 100) * 0.14), 57 + qrSize / 2, 263 - qrSize / 2);

  const realQrX = Math.round(qrCenterX - qrSize / 2);
  const realQrY = Math.round(qrCenterY - qrSize / 2);
  const qrTop = realQrY;
  const qrBottom = realQrY + qrSize;
  const qrRight = realQrX + qrSize;

  const brandFontSize = clamp(baseBrand * brandScale / 100, 7, 38);
  const sloganFontSize = clamp(baseSlogan * sloganScale / 100, 7, 32);
  const codeFontSize = clamp(baseCode * codeScale / 100, 7, 28);
  const badgeFontSize = clamp(5.3 * parsePercent(design.badgeScale, 140, 50, 300) / 100, 4.2, 14);

  const brandY = clamp(qrTop - innerSafePx - 8 - Math.round((brandGap - 100) * 0.7), 14 + brandFontSize, qrTop - innerSafePx - 4);
  const sloganY = clamp(qrBottom + innerSafePx + 10 + Math.round((sloganGap - 100) * 0.7), qrBottom + innerSafePx + sloganFontSize + 2, 320 - outerSafePx - 8);

  const brandAlign = design.brandAlign === "left" || design.brandAlign === "right" ? design.brandAlign : "center";
  const sloganAlign = design.sloganAlign === "left" || design.sloganAlign === "right" ? design.sloganAlign : "center";
  const brandX = brandAlign === "left" ? 18 + outerSafePx : brandAlign === "right" ? 238 - outerSafePx : 128 + Math.round((horizontalBalance - 100) * 0.26);
  const sloganX = sloganAlign === "left" ? 18 + outerSafePx : sloganAlign === "right" ? 238 - outerSafePx : 128 + Math.round((horizontalBalance - 100) * 0.26);
  const brandAnchor = brandAlign === "left" ? "start" : brandAlign === "right" ? "end" : "middle";
  const sloganAnchor = sloganAlign === "left" ? "start" : sloganAlign === "right" ? "end" : "middle";

  const codeX = clamp(240 - outerSafePx - Math.round((codeInset - 100) * 0.6), qrRight + innerSafePx + 14, 242 - outerSafePx);
  const codeCenterY = qrCenterY;

  const badgeX = clamp(brandX + brandText.length * brandFontSize * 0.30 + (parsePercent(design.badgeOffsetX, 130, 0, 220) - 100) * 0.55, brandX + 4, 248 - outerSafePx);
  const badgeY = clamp(brandY - brandFontSize * 0.6 + (parsePercent(design.badgeOffsetY, 100, 0, 220) - 100) * 0.45, 8 + outerSafePx, qrTop - innerSafePx - 2);

  const safeCode = escapeXml(code);
  const safeBrandText = escapeXml(brandText);
  const safeSloganText = escapeXml(sloganText);
  const safeCodeText = escapeXml(codeText);
  const viewBox = match[1];
  const innerSvg = match[2];
  const rx = shape === "round" ? 128 : 20;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 320" width="${size}" height="${size}" role="img" aria-label="Dokuntag QR ${safeCode}">
  <rect x="0" y="0" width="256" height="320" rx="${rx}" ry="${rx}" fill="#ffffff" />
  <text x="${brandX}" y="${brandY}" text-anchor="${brandAnchor}" font-family="Arial, Helvetica, sans-serif" font-size="${brandFontSize}" font-weight="${design.brandWeight || "800"}" font-style="${design.brandStyle || "normal"}" fill="${normalizeColor(design.brandColor, "#111111")}">${safeBrandText}</text>
  <text x="${badgeX}" y="${badgeY}" text-anchor="start" font-family="Arial, Helvetica, sans-serif" font-size="${badgeFontSize}" font-weight="800" fill="${normalizeColor(design.brandColor, "#111111")}">®</text>
  <svg viewBox="${viewBox}" x="${realQrX}" y="${realQrY}" width="${qrSize}" height="${qrSize}">${innerSvg}</svg>
  <text x="${codeX}" y="${codeCenterY}" transform="rotate(90 ${codeX} ${codeCenterY})" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${codeFontSize}" font-weight="700" font-style="${design.codeStyle || "normal"}" fill="${normalizeColor(design.codeColor, "#111111")}">${safeCodeText}</text>
  <text x="${sloganX}" y="${sloganY}" text-anchor="${sloganAnchor}" font-family="Arial, Helvetica, sans-serif" font-size="${sloganFontSize}" font-weight="${design.sloganWeight || "700"}" font-style="${design.sloganStyle || "italic"}" fill="${normalizeColor(design.sloganColor, "#111111")}">${safeSloganText}</text>
</svg>`.trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      items?: BatchItem[];
      design?: DesignInput;
      zipName?: string;
    };

    const items = Array.isArray(body?.items) ? body.items : [];
    if (!items.length) {
      return NextResponse.json({ error: "ZIP için en az 1 ürün gerekir." }, { status: 400 });
    }

    const baseUrl = getBaseUrl(request);
    const zip = new JSZip();

    for (const item of items) {
      const code = normalizeCode(item?.code);
      if (!code) continue;
      const targetUrl = `${baseUrl}/t/${code}`;
      const svg = await buildSvg(targetUrl, code, body?.design || {});
      zip.file(`${code}.svg`, svg);
    }

    const fileCount = Object.keys(zip.files).length;
    if (!fileCount) {
      return NextResponse.json({ error: "ZIP içine eklenecek geçerli QR bulunamadı." }, { status: 400 });
    }

    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 9 }
    });

    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${(body?.zipName || "dokuntag-batch").slice(0, 40)}.zip"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("DOWNLOAD_BATCH_ZIP_ERROR", error);
    return NextResponse.json({ error: "ZIP hazırlanamadı." }, { status: 500 });
  }
}
