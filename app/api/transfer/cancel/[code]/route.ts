import { NextResponse } from "next/server";
import { cancelTransferByManageToken, validateManageTokenAsync } from "@/lib/tags";

type Params = {
  params: Promise<{
    code: string;
  }>;
};

export async function POST(request: Request, { params }: Params) {
  try {
    const { code } = await params;
    const normalizedCode = String(code || "").trim().toUpperCase();
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token") || "";

    if (!token) {
      return NextResponse.json({ error: "Yönetim bağlantısı eksik." }, { status: 400 });
    }

    const existing = await validateManageTokenAsync(normalizedCode, token);
    if (!existing) {
      return NextResponse.json(
        { error: "Yönetim bağlantısı geçersiz veya süresi dolmuş." },
        { status: 401 }
      );
    }

    const cancelled = cancelTransferByManageToken({ code: normalizedCode, manageToken: token });
    if (!cancelled) {
      return NextResponse.json(
        { error: "İptal edilecek aktif devir bağlantısı bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      code: cancelled.code,
      status: cancelled.status,
      message: "Devir bağlantısı iptal edildi. Ürün yeniden aktif duruma alındı."
    });
  } catch (error) {
    console.error("TRANSFER_CANCEL_ERROR", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Devir bağlantısı iptal edilemedi." },
      { status: 500 }
    );
  }
}
