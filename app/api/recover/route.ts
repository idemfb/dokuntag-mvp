import { NextResponse } from "next/server";
import { findTagByCode, recoverManageAccess, readTags } from "@/lib/tags";

function normalize(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export async function POST(request: Request) {
  const body = await request.json();

  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
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
        phone &&
        normalize(tag.recovery.phone) === normalize(phone);

      const emailMatch =
        email &&
        normalize(tag.recovery.email) === normalize(email);

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
    return NextResponse.json({ error: "Kod zorunludur." }, { status: 400 });
  }

  const tag = findTagByCode(code);

  if (!tag) {
    return NextResponse.json({ error: "Tag not found" }, { status: 404 });
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

  const origin = request.headers.get("origin") || "";
  const managePath = `/manage/${recovered.code}?token=${recovered.manageToken}`;

  return NextResponse.json({
    success: true,
    code: recovered.code,
    managePath,
    manageLink: origin ? `${origin}${managePath}` : managePath,
    message:
      "Doğrulama başarılı. Eski manage link iptal edildi. Yeni manage link oluşturuldu.",
    warning:
      "Bu size özel yönetim linkidir. Lütfen güvenli şekilde saklayın ve başkalarıyla paylaşmayın."
  });
}