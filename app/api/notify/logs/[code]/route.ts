import { NextResponse } from "next/server";
import { getUnreadNotifyCount, readNotifyLog } from "@/lib/notify";
import { validateManageToken } from "@/lib/tags";

type Params = {
  params: Promise<{ code: string }>;
};

export async function GET(request: Request, { params }: Params) {
  try {
    const { code } = await params;
    const normalized = code.trim().toUpperCase();
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token") || "";

    if (!token) {
      return NextResponse.json(
        { error: "Yönetim bağlantısı eksik." },
        { status: 400 }
      );
    }

    const tag = validateManageToken(normalized, token);

    if (!tag) {
      return NextResponse.json(
        { error: "Yönetim bağlantısı geçersiz veya süresi dolmuş." },
        { status: 401 }
      );
    }

    const logs = (await readNotifyLog())
      .filter((item) => item.tagCode === normalized && !item.deletedAt)
      .sort((a, b) => {
        const aPinned = a.pinnedAt ? 1 : 0;
        const bPinned = b.pinnedAt ? 1 : 0;

        if (aPinned !== bPinned) {
          return bPinned - aPinned;
        }

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 100);

    return NextResponse.json({
      items: logs,
      unreadCount: await getUnreadNotifyCount(normalized)
    });
  } catch (error) {
    console.error("NOTIFY_LOGS_GET_ERROR", error);

    return NextResponse.json(
      { error: "Mesajlar alınamadı." },
      { status: 500 }
    );
  }
}