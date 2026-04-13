import { NextResponse } from "next/server";
import { findTagByCode, recoverManageAccess, readTags } from "@/lib/tags";

function normalize(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizePhone(value: unknown) {
  return typeof value === "string" ? value.replace(/[^0-9]/g, "") : "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const code =
      typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
    const phone = normalizePhone(body.phone);
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const mode = body.mode === "list" ? "list" : "single";

    if (!phone && !email) {
      return NextResponse.json(
        { error: "Telefon veya email ile doğrulama yapmalısınız." },
        { status: 400 }
      );
    }

    if (mode === "list") {
      const tags = readTags();

      const matched = tags.filter((tag) => {
        const phoneMatch =
          phone && normalizePhone(tag.recovery.phone) === normalizePhone(phone);

        const emailMatch =
          email && normalize(tag.recovery.email) === normalize(email);

        return phoneMatch || emailMatch;
      });

      if (!matched.length) {
        return NextResponse.json(
          { error: "Eşleşen ürün bulunamadı." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        count: matched.length,
        items: matched.map((tag) => ({
          code: tag.code,
          petName: tag.profile?.petName || "",
          status: tag.status,
          productType: tag.productType || "item"
        }))
      });
    }

    if (!code) {
      return NextResponse.json(
        { error: "Kod zorunludur." },
        { status: 400 }
      );
    }

    const tag = findTagByCode(code);

    if (!tag) {
      return NextResponse.json(
        { error: "Ürün bulunamadı." },
        { status: 404 }
      );
    }

    const recovered = recoverManageAccess({
      code,
      phone,
      email
    });

    if (!recovered) {
      return NextResponse.json(
        { error: "Doğrulama başarısız. Bilgileri kontrol edin." },
        { status: 401 }
      );
    }

    const fallbackOrigin = new URL(request.url).origin;
    const origin = request.headers.get("origin") || fallbackOrigin;
    const managePath = `/manage/${recovered.code}?token=${recovered.manageToken}`;

    return NextResponse.json({
      success: true,
      code: recovered.code,
      managePath,
      manageLink: `${origin}${managePath}`,
      message:
        "Doğrulama başarılı. Eski yönetim bağlantısı geçersiz hale getirildi. Yeni bir yönetim bağlantısı oluşturuldu.",
      warning:
        "Bu size özel yönetim bağlantısıdır. Lütfen güvenli şekilde saklayın ve başkalarıyla paylaşmayın."
    });
  } catch (error) {
    console.error("RECOVER_POST_ERROR", error);

    return NextResponse.json(
      { error: "İşlem sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}