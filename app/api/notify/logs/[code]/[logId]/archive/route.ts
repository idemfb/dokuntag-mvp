import { NextResponse } from "next/server";
import { toggleNotifyLogArchived } from "@/lib/notify";
import { validateManageToken } from "@/lib/tags";

type Params = {
  params: Promise<{
    code: string;
    logId: string;
  }>;
};

function getTokenFromRequest(request: Request) {
  const url = new URL(request.url);
  return url.searchParams.get("token")?.trim() || "";
}

function normalizeCode(value: unknown) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function normalizeLogId(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request, { params }: Params) {
  try {
    const resolvedParams = await params;
    const code = normalizeCode(resolvedParams.code);
    const logId = normalizeLogId(resolvedParams.logId);
    const token = getTokenFromRequest(request);

    if (!code || !logId) {
      return NextResponse.json(
        { error: "Kod ve kayıt kimliği zorunludur." },
        { status: 400 }
      );
    }

    const validated = validateManageToken(code, token);

    if (!validated) {
      return NextResponse.json(
        { error: "Yetkisiz erişim." },
        { status: 401 }
      );
    }

    const result = await toggleNotifyLogArchived({
      tagCode: code,
      logId
    });

    return NextResponse.json({
      success: true,
      updated: result.updated,
      archived: result.archived
    });
  } catch (error) {
    console.error("NOTIFY_LOG_ARCHIVE_POST_ERROR", error);

    return NextResponse.json(
      { error: "İşlem sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}