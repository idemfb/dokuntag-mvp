import { NextResponse } from "next/server";
import QRCode from "qrcode";

type Params = {
  params: Promise<{ code: string }>;
};

type SizeOption = "2.5cm" | "3cm" | "4cm";

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

function getSvgConfig(size: SizeOption) {
  if (size === "2.5cm") {
    return {
      width: "2.5cm",
      height: "2.5cm",
      viewBoxHeight: 340
    };
  }

  if (size === "4cm") {
    return {
      width: "4cm",
      height: "4cm",
      viewBoxHeight: 340
    };
  }

  return {
    width: "3cm",
    height: "3cm",
    viewBoxHeight: 340
  };
}

async function buildQrSvg(code: string, size: SizeOption) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "http://localhost:3000";

  const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
  const targetUrl = `${cleanBaseUrl}/t/${code}`;

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
  const safeCode = escapeXml(code);
  const config = getSvgConfig(size);

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 ${config.viewBoxHeight}" width="${config.width}" height="${config.height}" role="img" aria-label="Dokuntag QR ${safeCode}">
  <rect x="0" y="0" width="256" height="${config.viewBoxHeight}" fill="#ffffff" />

  <text
    x="128"
    y="28"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="16"
    font-weight="600"
    fill="#000000"
  >
    Dokuntag
  </text>

  <svg viewBox="${viewBox}" x="0" y="40" width="256" height="256">
    ${innerSvg}
  </svg>

  <text
    x="128"
    y="314"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="18"
    font-weight="700"
    fill="#000000"
  >
    ${safeCode}
  </text>
</svg>`.trim();
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { code } = await params;
    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      return NextResponse.json(
        { error: "Kod zorunludur." },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const size = normalizeSize(searchParams.get("size"));

    const svg = await buildQrSvg(normalizedCode, size);

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("QR_GENERATE_ERROR", error);

    return NextResponse.json(
      { error: "QR oluşturulamadı." },
      { status: 500 }
    );
  }
}