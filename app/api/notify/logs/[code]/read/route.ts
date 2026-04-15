import { NextResponse } from "next/server";
import { markNotifyLogsAsRead } from "@/lib/notify";
import { validateManageToken } from "@/lib/tags";

type Params = {
  params: Promise<{ code: string }>;
};

export async function POST(request: Request, { params }: Params) {
  try {
    const { code } = await params;
    const normalizedCode = code.trim().toUpperCase();
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token") || "";

    if (!token) {
      return NextResponse.json(
        { error: "Yönetim bağlantısı eksik." },
        { status: 400 }
      );
    }

    const tag = validateManageToken(normalizedCode, token);

    if (!tag) {
      return NextResponse.json(
        { error: "Yönetim bağlantısı geçersiz veya süresi dolmuş." },
        { status: 401 }
      );
    }

    const result = await markNotifyLogsAsRead(normalizedCode);

    return NextResponse.json({
      success: true,
      updatedCount: result.updatedCount
    });
  } catch (error) {
    console.error("NOTIFY_LOGS_READ_POST_ERROR", error);

    return NextResponse.json(
      { error: "Mesajlar okundu olarak işaretlenemedi." },
      { status: 500 }
    );
  }
}