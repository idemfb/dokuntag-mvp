import { NextResponse } from "next/server";
import {
  getScanNotificationSetting,
  updateScanNotificationSetting
} from "@/lib/scanSettings";
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

    const tag = await validateManageTokenAsync(normalizedCode, token);

    if (!tag) {
      return NextResponse.json(
        { error: "Yönetim bağlantısı geçersiz veya süresi dolmuş." },
        { status: 401 }
      );
    }

    const setting = await getScanNotificationSetting(normalizedCode);

    return NextResponse.json({
      success: true,
      data: setting
    });
  } catch (error) {
    console.error("MANAGE_SCAN_SETTINGS_GET_ERROR", error);

    return NextResponse.json(
      { error: "Görüntülenme bildirim ayarı alınamadı." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { code } = await params;
    const normalizedCode = String(code || "").trim().toUpperCase();
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token") || "";

    const tag = await validateManageTokenAsync(normalizedCode, token);

    if (!tag) {
      return NextResponse.json(
        { error: "Yönetim bağlantısı geçersiz veya süresi dolmuş." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const enabled = Boolean(body.enabled);

    const setting = await updateScanNotificationSetting(normalizedCode, {
      enabled
    });

    return NextResponse.json({
      success: true,
      data: setting,
      message: enabled
        ? "Görüntülenme bildirimi açıldı."
        : "Görüntülenme bildirimi kapatıldı."
    });
  } catch (error) {
    console.error("MANAGE_SCAN_SETTINGS_POST_ERROR", error);

    return NextResponse.json(
      { error: "Görüntülenme bildirim ayarı kaydedilemedi." },
      { status: 500 }
    );
  }
}