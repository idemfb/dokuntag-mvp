import { NextResponse } from "next/server";
import QRCode from "qrcode";

type Params = {
  params: Promise<{ code: string }>;
};

type SizeOption = "2cm" | "2.5cm" | "3cm" | "4cm" | "5cm";
type ShapeOption = "round" | "square";

type Layout = {
  size: SizeOption;
  shape: ShapeOption;
  topText: string;
  codeText: string;
  hideCode: boolean;
  qrScale: number;
  codeScale: number;
  foregroundColor: string;
};

const SIZE_MAP: Record<SizeOption, { width: string; height: string }> = {
  "2cm": { width: "2cm", height: "2cm" },
  "2.5cm": { width: "2.5cm", height: "2.5cm" },
  "3cm": { width: "3cm", height: "3cm" },
  "4cm": { width: "4cm", height: "4cm" },
  "5cm": { width: "5cm", height: "5cm" }
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

function normalizeSize(value: string | null): SizeOption {
  if (value === "2cm") return "2cm";
  if (value === "2.5cm") return "2.5cm";
  if (value === "4cm") return "4cm";
  if (value === "5cm") return "5cm";
  return "3cm";
}

function normalizeShape(value: string | null): ShapeOption {
  return value === "square" ? "square" : "round";
}

function normalizeText(value: string | null, fallback: string, maxLength: number) {
  const raw = value;
  const text = String(raw ?? "").trim();

  if (raw === "") {
    return "";
  }

  return (text || fallback).slice(0, maxLength);
}

function normalizeColor(value: string | null) {
  const text = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(text) ? text : "#111111";
}

function parsePercent(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return clamp(parsed, min, max);
}

function readLayout(searchParams: URLSearchParams, normalizedCode: string): Layout {
  const hideCode = searchParams.get("hideCode") === "true";
  const rawCodeText = searchParams.get("codeText");

  return {
    size: normalizeSize(searchParams.get("size")),
    shape: normalizeShape(searchParams.get("shape")),
    topText: normalizeText(searchParams.get("topText"), "OKUT", 12),
    codeText: hideCode
      ? ""
      : rawCodeText === "" || rawCodeText === null
        ? normalizedCode
        : normalizeText(rawCodeText, normalizedCode, 20),
    hideCode,
    qrScale: parsePercent(searchParams.get("qrScale"), 80, 40, 95),
    codeScale: parsePercent(searchParams.get("codeScale"), 100, 60, 180),
    foregroundColor: normalizeColor(searchParams.get("foregroundColor"))
  };
}

function getClip(shape: ShapeOption) {
  if (shape === "square") {
    return `<rect x="0" y="0" width="256" height="256" rx="18" ry="18" />`;
  }

  return `<circle cx="128" cy="128" r="124" />`;
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
    color: {
      dark: layout.foregroundColor,
      light: "#ffffff"
    }
  });

  const inner = qrSvg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i)?.[1];

  if (!inner) {
    throw new Error("QR SVG oluşturulamadı.");
  }

  const size = SIZE_MAP[layout.size];
  const safeCode = escapeXml(code);
  const safeTopText = escapeXml(layout.topText);
  const safeCodeText = escapeXml(layout.codeText);

  const qrSize = clamp(256 * (layout.qrScale / 100), 90, 200);
  const qrX = (256 - qrSize) / 2;
  const qrY = (256 - qrSize) / 2;

  const topFont = layout.size === "2cm" ? 14 : 16;
  const codeFont = Number((12 * (layout.codeScale / 100)).toFixed(2));

  return `
<svg xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 256 256"
  width="${size.width}"
  height="${size.height}"
  role="img"
  aria-label="Dokuntag QR ${safeCode}">

  <defs>
    <clipPath id="shapeClip">
      ${getClip(layout.shape)}
    </clipPath>
  </defs>

  <g clip-path="url(#shapeClip)">
    <rect x="0" y="0" width="256" height="256" fill="#ffffff" />

    <text
      x="128"
      y="32"
      text-anchor="middle"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${topFont}"
      font-weight="800"
      letter-spacing="1.2"
      fill="${layout.foregroundColor}"
    >${safeTopText}</text>

    <svg viewBox="0 0 256 256" x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}">
      ${inner}
    </svg>

    ${
      layout.hideCode || !layout.codeText.trim()
        ? ""
        : `
    <text
      x="128"
      y="238"
      text-anchor="middle"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${codeFont}"
      font-weight="800"
      letter-spacing="0.8"
      fill="${layout.foregroundColor}"
    >${safeCodeText}</text>`
    }
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
    const layout = readLayout(searchParams, normalizedCode);
    const svg = await buildSvg(normalizedCode, layout);

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="dokuntag-${normalizedCode}.svg"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("QR_DOWNLOAD_ERROR", error);

    return NextResponse.json(
      { error: "QR indirilemedi." },
      { status: 500 }
    );
  }
}
