import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { addAdminActionLog } from "@/lib/adminActionLog";
import {
  getBackupStorageMode,
  readFullBackupFiles
} from "@/lib/backupData";

const ADMIN_COOKIE_NAME = "dokuntag_admin_session";

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

    const files = await readFullBackupFiles();
    const generatedAt = new Date().toISOString();
    const storage = getBackupStorageMode();

    addAdminActionLog({
      type: "full_backup_download",
      message: "Full backup indirildi.",
      metadata: {
        generatedAt,
        storageMode: storage.mode
      }
    });

    return new NextResponse(
      JSON.stringify(
        {
          success: true,
          generatedAt,
          meta: {
            source: "dokuntag-authoritative-runtime-backup",
            version: 2,
            storage,
            files: files.map((item) => item.fileName)
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
          )}.json"`,
          "Cache-Control": "no-store"
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
