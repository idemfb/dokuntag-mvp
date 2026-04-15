import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import QRCode from "qrcode";

type BatchZipItem = {
  code?: string;
  label?: string;
};

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

function normalizeLabel(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim();
  if (!normalized) return fallback;
  return normalized.slice(0, 32);
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

async function buildQrSvg(targetUrl: string, label: string) {
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
  const safeLabel = escapeXml(label);

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 320" width="256" height="320" role="img" aria-label="Dokuntag QR ${safeLabel}">
  <rect x="0" y="0" width="256" height="320" fill="#ffffff" />
  <svg viewBox="${viewBox}" x="0" y="0" width="256" height="256">
    ${innerSvg}
  </svg>
  <text
    x="128"
    y="290"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="20"
    font-weight="700"
    fill="#000000"
  >
    ${safeLabel}
  </text>
</svg>`.trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      items?: BatchZipItem[];
      zipName?: string;
    };

    const rawItems = Array.isArray(body?.items) ? body.items : [];

    if (!rawItems.length) {
      return NextResponse.json(
        { error: "ZIP için en az 1 ürün gerekir." },
        { status: 400 }
      );
    }

    if (rawItems.length > 1000) {
      return NextResponse.json(
        { error: "Tek seferde en fazla 1000 QR hazırlanabilir." },
        { status: 400 }
      );
    }

    const baseUrl = getBaseUrl(request);
    const zip = new JSZip();

    for (const rawItem of rawItems) {
      const code = normalizeCode(rawItem?.code);

      if (!code) {
        continue;
      }

      const label = normalizeLabel(rawItem?.label, code);
      const targetUrl = `${baseUrl}/t/${code}`;
      const svg = await buildQrSvg(targetUrl, label);

      zip.file(`${code}.svg`, svg);
    }

    const fileCount = Object.keys(zip.files).length;

    if (!fileCount) {
      return NextResponse.json(
        { error: "ZIP içine eklenecek geçerli QR bulunamadı." },
        { status: 400 }
      );
    }

    const zipName =
      typeof body?.zipName === "string" && body.zipName.trim()
        ? body.zipName.trim().slice(0, 40)
        : "dokuntag-qr-batch";

    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 9 }
    });

    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipName}.zip"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("DOWNLOAD_BATCH_ZIP_ERROR", error);

    return NextResponse.json(
      { error: "Toplu QR ZIP hazırlanamadı." },
      { status: 500 }
    );
  }
}