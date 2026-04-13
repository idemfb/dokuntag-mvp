import { NextResponse } from "next/server";
import { deleteNotifyLog } from "@/lib/notify";
import { validateManageToken } from "@/lib/tags";

type Params = {
  params: Promise<{ code: string; logId: string }>;
};

export async function POST(request: Request, { params }: Params) {
  try {
    const { code, logId } = await params;
    const normalizedCode = code.trim().toUpperCase();
    const normalizedLogId = logId.trim();
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

    const result = deleteNotifyLog({
      tagCode: normalizedCode,
      logId: normalizedLogId
    });

    return NextResponse.json({
      success: true,
      deleted: result.deleted
    });
  } catch (error) {
    console.error("NOTIFY_LOG_DELETE_POST_ERROR", error);

    return NextResponse.json(
      { error: "Mesaj silinemedi." },
      { status: 500 }
    );
  }
}