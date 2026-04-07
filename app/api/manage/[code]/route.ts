import { NextResponse } from "next/server";
import { updateTagByManageToken, validateManageToken } from "@/lib/tags";

type Params = {
  params: Promise<{
    code: string;
  }>;
};

type ProductType = "pet" | "item" | "key" | "person";

const ALERT_OPTIONS = [
  "Acil bana ulaşın",
  "Hayvanım hasta",
  "Alerjisi var",
  "Ürkek / yaklaşmayın",
  "Ödül verilecektir"
];

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeProductType(value: unknown): ProductType {
  if (value === "pet" || value === "item" || value === "key" || value === "person") {
    return value;
  }

  return "item";
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { code } = await params;
    const normalizedCode = code.trim().toUpperCase();
    const { searchParams, origin } = new URL(request.url);
    const token = searchParams.get("token") || "";

    if (!token) {
      return NextResponse.json(
        { error: "Manage token eksik." },
        { status: 400 }
      );
    }

    const tag = validateManageToken(normalizedCode, token);

    if (!tag) {
      return NextResponse.json(
        { error: "Geçersiz veya süresi dolmuş manage link." },
        { status: 401 }
      );
    }

    const managePath = `/manage/${tag.code}?token=${tag.manageToken}`;

    return NextResponse.json({
      code: tag.code,
      productType: tag.productType || "item",
      profile: tag.profile,
      alerts: tag.alerts,
      visibility: tag.visibility,
      contactOptions: {
        allowDirectCall: Boolean(tag.contactOptions?.allowDirectCall),
        allowDirectWhatsapp: Boolean(tag.contactOptions?.allowDirectWhatsapp)
      },
      recovery: tag.recovery,
      managePath,
      manageLink: `${origin}${managePath}`
    });
  } catch (error) {
    console.error("MANAGE_GET_ERROR", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Manage verisi alınamadı."
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { code } = await params;
    const normalizedCode = code.trim().toUpperCase();
    const { searchParams, origin } = new URL(request.url);
    const token = searchParams.get("token") || "";

    if (!token) {
      return NextResponse.json(
        { error: "Manage token eksik." },
        { status: 400 }
      );
    }

    const existing = validateManageToken(normalizedCode, token);

    if (!existing) {
      return NextResponse.json(
        { error: "Geçersiz veya süresi dolmuş manage link." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const productType = normalizeProductType(body.productType);
    const name = getString(body.name);
    const ownerName = getString(body.ownerName);
    const phone = getString(body.phone);
    const email = getString(body.email);
    const petName = getString(body.petName);
    const note = getString(body.note);

    const alerts = Array.isArray(body.alerts)
      ? body.alerts.filter(
          (item: unknown): item is string =>
            typeof item === "string" && ALERT_OPTIONS.includes(item)
        )
      : [];

    const visibility = {
      showName: Boolean(body.visibility?.showName),
      showPhone: Boolean(body.visibility?.showPhone),
      showEmail: Boolean(body.visibility?.showEmail),
      showPetName: Boolean(body.visibility?.showPetName),
      showNote: Boolean(body.visibility?.showNote)
    };

    const contactOptions = {
      allowDirectCall: Boolean(body.contactOptions?.allowDirectCall),
      allowDirectWhatsapp: Boolean(body.contactOptions?.allowDirectWhatsapp)
    };

    const recovery = {
      phone: getString(body.recovery?.phone),
      email: getString(body.recovery?.email)
    };

    if (!name) {
      return NextResponse.json(
        { error: "İsim / etiket adı zorunludur." },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { error: "Telefon zorunludur." },
        { status: 400 }
      );
    }

    if (!petName) {
      return NextResponse.json(
        { error: "Evcil hayvan adı / ürün adı zorunludur." },
        { status: 400 }
      );
    }

    if (!recovery.phone && !recovery.email) {
      return NextResponse.json(
        { error: "En az bir recovery alanı girilmelidir." },
        { status: 400 }
      );
    }

    const updated = updateTagByManageToken({
      manageToken: token,
      productType,
      tagName: name,
      ownerName,
      phone,
      email,
      petName,
      note,
      alerts,
      allowPhone: visibility.showPhone,
      allowEmail: visibility.showEmail,
      allowWhatsapp: contactOptions.allowDirectWhatsapp,
      allowDirectCall: contactOptions.allowDirectCall,
      allowDirectWhatsapp: contactOptions.allowDirectWhatsapp,
      recoveryPhone: recovery.phone,
      recoveryEmail: recovery.email,
      status: "active"
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Güncelleme yapılamadı." },
        { status: 400 }
      );
    }

    const managePath = `/manage/${updated.code}?token=${updated.manageToken}`;

    return NextResponse.json({
      success: true,
      code: updated.code,
      message: "Profil başarıyla güncellendi.",
      publicLink: `${origin}/p/${updated.code}`,
      managePath,
      manageLink: `${origin}${managePath}`,
      warning:
        "Bu size özel yönetim linkidir. Lütfen güvenli şekilde saklayın ve başkalarıyla paylaşmayın."
    });
  } catch (error) {
    console.error("MANAGE_POST_ERROR", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Güncelleme sırasında hata oluştu."
      },
      { status: 500 }
    );
  }
}