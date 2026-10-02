import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { addAdminActionLog } from "@/lib/adminActionLog";

const FILE_MAP: Record<string, string> = {
  tags: "tags.json",
  notify: "notify-log.json",
  recover: "recover-log.json",
  db: "db.json",
  adminActions: "admin-actions.json",
  abuse: "abuse-log.json",
  smsAnalytics: "sms-analytics.json"
};

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();

const adminCookie =
  cookieStore.get("dokuntag_admin_session")?.value;

if (
  !adminCookie ||
  adminCookie !== process.env.ADMIN_ACCESS_KEY
) {
  return NextResponse.json(
    {
      success: false,
      error: "Yetkisiz erişim."
    },
    { status: 401 }
  );
}
    const fileKey =
      request.nextUrl.searchParams.get("file") || "";

    const fileName = FILE_MAP[fileKey];

    if (!fileName) {
      return NextResponse.json(
        {
          success: false,
          error: "Geçersiz dosya."
        },
        { status: 400 }
      );
    }

    const filePath = path.join(
      process.cwd(),
      "data",
      fileName
    );

    const fileContent =
      await fs.readFile(filePath, "utf8");

      addAdminActionLog({
  type: "backup_download",
  message: "Backup dosyası indirildi.",
  metadata: {
    file: fileName
  }
});
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        "Content-Type":
          "application/json; charset=utf-8",
        "Content-Disposition":
          `attachment; filename="${fileName}"`
      }
    });
  } catch (error) {
    console.error(
      "ADMIN_BACKUP_DOWNLOAD_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Backup indirilemedi."
      },
      { status: 500 }
    );
  }
}