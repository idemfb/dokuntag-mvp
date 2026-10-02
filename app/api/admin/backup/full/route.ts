import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { addAdminActionLog } from "@/lib/adminActionLog";

const ADMIN_COOKIE_NAME = "dokuntag_admin_session";

const FILES = [
  "db.json",
  "tags.json",
  "notify-log.json",
  "recover-log.json",
  "admin-actions.json",
  "abuse-log.json",
  "sms-analytics.json"
];
const MAX_EXPORT_ITEMS = 5000;
export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

    if (!adminCookie || adminCookie !== process.env.ADMIN_ACCESS_KEY) {
      return NextResponse.json(
        { success: false, error: "Yetkisiz erişim." },
        { status: 401 }
      );
    }

    const dataDir = path.join(process.cwd(), "data");

    const files = await Promise.all(
      FILES.map(async (fileName) => {
        try {
  const raw = await fs.readFile(
    path.join(dataDir, fileName),
    "utf8"
  );

  const parsed = JSON.parse(raw);

  return {
    fileName,
    exists: true,
    content: Array.isArray(parsed)
      ? parsed.slice(-MAX_EXPORT_ITEMS)
      : parsed
  };
} catch {
  return {
    fileName,
    exists: false,
    content: null
  };
}
      })
    );

    const generatedAt = new Date().toISOString();
    addAdminActionLog({
  type: "full_backup_download",
  message: "Full backup indirildi.",
  metadata: {
    generatedAt
  }
});
  return new NextResponse(
  JSON.stringify(
    {
      success: true,
      generatedAt,
      meta: {
        source: "dokuntag-admin-backup",
        version: 1,
        files: FILES
      },
      files
    },
    null,
    2
  ),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="dokuntag-full-backup-${generatedAt.slice(
            0,
            10
          )}.json"`
        }
      }
    );
  } catch (error) {
    console.error("ADMIN_FULL_BACKUP_ERROR", error);

    return NextResponse.json(
      { success: false, error: "Full backup indirilemedi." },
      { status: 500 }
    );
  }
}