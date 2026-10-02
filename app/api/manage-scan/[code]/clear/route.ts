import { NextResponse } from "next/server";
import { clearScanLogsByTagCode } from "@/lib/scan";
import { validateManageTokenAsync } from "@/lib/tags";
import { resetScanNotificationLimits } from "@/lib/scanSettings";

type Params = {
  params: Promise<{ code: string }>;
};

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

    const result = await clearScanLogsByTagCode(normalizedCode);
    await resetScanNotificationLimits(normalizedCode);

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      message: "Görüntülenme geçmişi ve bildirim limitleri sıfırlandı."
    });

  } catch (error) {
    console.error("MANAGE_SCAN_CLEAR_POST_ERROR", error);

    return NextResponse.json(
      { error: "Görüntülenme geçmişi sıfırlanamadı." },
      { status: 500 }
    );
  }
}