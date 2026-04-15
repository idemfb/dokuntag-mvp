import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "dokuntag_admin_session";

function getAdminAccessKey() {
  return process.env.ADMIN_ACCESS_KEY?.trim() || "";
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      key?: string;
    };

    const providedKey = normalizeString(body?.key);
    const adminKey = getAdminAccessKey();

    if (!adminKey) {
      return NextResponse.json(
        { ok: false, error: "Admin erişimi yapılandırılmamış." },
        { status: 500 }
      );
    }

    if (!providedKey) {
      return NextResponse.json(
        { ok: false, error: "Erişim anahtarı zorunludur." },
        { status: 400 }
      );
    }

    if (providedKey !== adminKey) {
      return NextResponse.json(
        { ok: false, error: "Erişim anahtarı hatalı." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      ok: true,
      message: "Admin girişi başarılı."
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: adminKey,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12
    });

    return response;
  } catch (error) {
    console.error("ADMIN_LOGIN_POST_ERROR", error);

    return NextResponse.json(
      { ok: false, error: "Giriş sırasında hata oluştu." },
      { status: 500 }
    );
  }
}