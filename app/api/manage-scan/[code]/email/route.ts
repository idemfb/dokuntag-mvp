import { NextResponse } from "next/server";
import { getScanSummaryByTagCode } from "@/lib/scan";
import { sendScanSummaryEmail } from "@/lib/mailer";
import { validateManageTokenAsync } from "@/lib/tags";

type Params = {
  params: Promise<{ code: string }>;
};

function getProductName(tag: Awaited<ReturnType<typeof validateManageTokenAsync>>) {
  if (!tag) return "";

  return (
    tag.profile?.petName ||
    tag.profile?.name ||
    tag.profile?.tagName ||
    tag.code ||
    ""
  );
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { code } = await params;
    const normalizedCode = String(code || "").trim().toUpperCase();
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token") || "";

    if (!normalizedCode || !token) {
      return NextResponse.json(
        { error: "Kod veya yönetim bağlantısı eksik." },
        { status: 400 }
      );
    }

    const tag = await validateManageTokenAsync(normalizedCode, token);

    if (!tag) {
      return NextResponse.json(
        { error: "Yönetim bağlantısı geçersiz veya süresi dolmuş." },
        { status: 401 }
      );
    }

    const email = tag.recovery?.email || tag.profile?.email || "";

    if (!email) {
      return NextResponse.json(
        { error: "Bu ürün için e-posta tanımlı değil." },
        { status: 400 }
      );
    }

    const summary = await getScanSummaryByTagCode(normalizedCode);

    await sendScanSummaryEmail({
      to: email,
      tagCode: normalizedCode,
      productName: getProductName(tag),
      totalCount: summary.totalCount,
      lastSeenAt: summary.lastSeenAt,
      recent: summary.recent
    });

    return NextResponse.json({
      success: true,
      message: "Son görüntülenme özeti e-posta adresinize gönderildi."
    });
  } catch (error) {
    console.error("MANAGE_SCAN_EMAIL_POST_ERROR", error);

return NextResponse.json(
  {
    error:
      error instanceof Error
        ? error.message
        : "Görüntülenme özeti e-posta ile gönderilemedi."
  },
  { status: 500 }
);
  }
}