import { NextResponse } from "next/server";
import { getScanSummaryByTagCode } from "@/lib/scan";
import { validateManageTokenAsync } from "@/lib/tags";

type Params = {
  params: Promise<{ code: string }>;
};

export async function GET(request: Request, { params }: Params) {
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

    const summary = await getScanSummaryByTagCode(normalizedCode);

    return NextResponse.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error("MANAGE_SCAN_GET_ERROR", error);

    return NextResponse.json(
      { error: "Görüntülenme bilgileri alınamadı." },
      { status: 500 }
    );
  }
}