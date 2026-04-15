import { NextRequest, NextResponse } from "next/server";
import {
  consumeRecoverySessionToken,
  recoverManageAccess
} from "@/lib/tags";
import {
  consumeRecoverySessionTokenAsync,
  recoverManageAccessAsync
} from "@/lib/tags";

function normalizeCode(value: unknown) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function normalizeToken(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      token?: string;
      code?: string;
    };

    const token = normalizeToken(body?.token);
    const code = normalizeCode(body?.code);

    if (!token || !code) {
      return NextResponse.json(
        { error: "Token ve ürün kodu zorunludur." },
        { status: 400 }
      );
    }

    // 🔥 KRİTİK: önce consume et (atomic kontrol)
    const consumed = await consumeRecoverySessionTokenAsync(token);

    if (!consumed) {
      return NextResponse.json(
        { error: "Doğrulama bağlantısı geçersiz." },
        { status: 404 }
      );
    }

    if ("success" in consumed && consumed.success === false) {
      if (consumed.reason === "expired") {
        return NextResponse.json(
          { error: "Doğrulama bağlantısının süresi doldu." },
          { status: 410 }
        );
      }

      if (consumed.reason === "used") {
        return NextResponse.json(
          { error: "Bu doğrulama bağlantısı daha önce kullanılmış." },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Doğrulama bağlantısı geçersiz." },
        { status: 400 }
      );
    }

    // consume başarılıysa artık session güvenli
    const selectedItem = consumed.items.find(
      (item) => item.code === code
    );

    if (!selectedItem) {
      return NextResponse.json(
        { error: "Seçilen ürün bu doğrulama bağlantısına bağlı değil." },
        { status: 403 }
      );
    }

    const recovered = await recoverManageAccessAsync({
      code,
      email: consumed.email
    });

    if (!recovered) {
      return NextResponse.json(
        { error: "Bu ürün için yeni yönetim bağlantısı oluşturulamadı." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      code: recovered.code,
      managePath: recovered.managePath,
      manageLink: recovered.manageLink,
      message:
        "Yeni yönetim bağlantısı oluşturuldu. Eski bağlantı artık geçersiz."
    });
  } catch (error) {
    console.error("RECOVER_SELECT_POST_ERROR", error);

    return NextResponse.json(
      { error: "İşlem sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}