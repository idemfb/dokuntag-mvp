import { NextRequest, NextResponse } from "next/server";
import { generateUniqueCode } from "@/lib/code";
import { upsertTag } from "@/lib/tags";
import { upsertTagAsync } from "@/lib/tags";

type BatchItem = {
  code: string;
  label: string;
  setupLink: string;
  qrPageLink: string;
  qrDownloadLink: string;
};

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

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getSafeLabelTemplate(value: string) {
  return value.trim().slice(0, 24);
}

function buildLabel(labelTemplate: string, code: string, index: number) {
  if (!labelTemplate) {
    return code;
  }

  const safeTemplate = getSafeLabelTemplate(labelTemplate);
  const nextNumber = String(index + 1).padStart(3, "0");
  return `${safeTemplate}-${nextNumber}`.slice(0, 32);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      count?: number;
      labelTemplate?: string;
    };

    const count =
      typeof body?.count === "number" && Number.isFinite(body.count)
        ? Math.floor(body.count)
        : 0;

    const labelTemplate = getString(body?.labelTemplate);

    if (!count || count < 1) {
      return NextResponse.json(
        { error: "Adet en az 1 olmalıdır." },
        { status: 400 }
      );
    }

    if (count > 500) {
      return NextResponse.json(
        { error: "Tek seferde en fazla 500 kod üretilebilir." },
        { status: 400 }
      );
    }

    const baseUrl = getBaseUrl(request);
    const items: BatchItem[] = [];

    for (let i = 0; i < count; i += 1) {
      const code = generateUniqueCode();

      await upsertTagAsync({
        code,
        productType: "item",
        tagName: code,
        petName: code,
        status: "unclaimed",
        visibility: {
          showName: true,
          showPhone: false,
          showEmail: false,
          showCity: false,
          showAddressDetail: false,
          showPetName: true,
          showNote: false
        }
      });

      const label = buildLabel(labelTemplate, code, i);

      items.push({
        code,
        label,
        setupLink: `${baseUrl}/setup/${code}`,
        qrPageLink: `${baseUrl}/qr/${code}?label=${encodeURIComponent(label)}`,
        qrDownloadLink: `${baseUrl}/api/qr-download/${code}?label=${encodeURIComponent(label)}`
      });
    }

    return NextResponse.json({
      success: true,
      count: items.length,
      items
    });
  } catch (error) {
    console.error("GENERATE_BATCH_ERROR", error);

    return NextResponse.json(
      { error: "Toplu üretim sırasında hata oluştu." },
      { status: 500 }
    );
  }
}