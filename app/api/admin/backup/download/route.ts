import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { addAdminActionLog } from "@/lib/adminActionLog";
import {
  BACKUP_FILE_MAP,
  type BackupFileKey,
  getBackupStorageMode,
  readBackupFile
} from "@/lib/backupData";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminCookie = cookieStore.get("dokuntag_admin_session")?.value;

    if (!adminCookie || adminCookie !== process.env.ADMIN_ACCESS_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Yetkisiz erişim."
        },
        { status: 401 }
      );
    }

    const fileKey = request.nextUrl.searchParams.get("file") || "";

    if (!Object.prototype.hasOwnProperty.call(BACKUP_FILE_MAP, fileKey)) {
      return NextResponse.json(
        {
          success: false,
          error: "Geçersiz dosya."
        },
        { status: 400 }
      );
    }

    const key = fileKey as BackupFileKey;
    const fileName = BACKUP_FILE_MAP[key];
    const fileContent = await readBackupFile(key);
    const storage = getBackupStorageMode();

    addAdminActionLog({
      type: "backup_download",
      message: "Backup dosyası indirildi.",
      metadata: {
        file: fileName,
        storageMode: storage.mode
      }
    });

    return new NextResponse(JSON.stringify(fileContent, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("ADMIN_BACKUP_DOWNLOAD_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        error: "Backup indirilemedi."
      },
      { status: 500 }
    );
  }
}
