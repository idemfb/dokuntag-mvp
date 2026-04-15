import { NextResponse } from "next/server";
import { updateTagByManageToken, validateManageToken } from "@/lib/tags";

type Params = {
  params: Promise<{
    code: string;
  }>;
};

type ProductType = "pet" | "item" | "key" | "person";
type TagStatus = "active" | "inactive";

const ALERT_OPTIONS_BY_TYPE: Record<ProductType, string[]> = {
  pet: [
    "Acil bana ulaşın",
    "Hayvanım hasta",
    "Alerjisi var",
    "Ürkek / yaklaşmayın",
    "Ödül verilecektir"
  ],
  item: [
    "Acil bana ulaşın",
    "Lütfen benimle iletişime geçin",
    "İçinde önemli eşya var",
    "Ödül verilecektir"
  ],
  key: [
    "Acil bana ulaşın",
    "Lütfen benimle iletişime geçin",
    "Önemli anahtar",
    "Ödül verilecektir"
  ],
  person: [
    "Acil yakınıma ulaşın",
    "Sağlık durumu için bilgi verin",
    "Kaybolursa lütfen haber verin",
    "Ödül verilecektir"
  ]
};

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeProductType(value: unknown): ProductType {
  if (value === "pet" || value === "item" || value === "key" || value === "person") {
    return value;
  }
  return "item";
}

function normalizeStatus(value: unknown, fallback: TagStatus = "active"): TagStatus {
  if (value === "inactive") return "inactive";
  if (value === "active") return "active";
  return fallback;
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { code } = await params;
    const normalizedCode = code.trim().toUpperCase();
    const { searchParams, origin } = new URL(request.url);
    const token = searchParams.get("token") || "";

    if (!token) {
      return NextResponse.json(
        { error: "Yönetim bağlantısı eksik." },
        { status: 400 }
      );
    }

    const tag = validateManageToken(normalizedCode, token);

    if (!tag) {
      return NextResponse.json(
        { error: "Yönetim bağlantısı geçersiz veya süresi dolmuş." },
        { status: 401 }
      );
    }

    // 🔥 TOKEN ROTATE (KRİTİK)
    const updated = updateTagByManageToken({
      manageToken: token
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Token yenilenemedi." },
        { status: 500 }
      );
    }

    const managePath = `/manage/${updated.code}?token=${updated.manageToken}`;

    return NextResponse.json({
      code: updated.code,
      productType: updated.productType || "item",
      profile: updated.profile,
      alerts: updated.alerts,
      alertOptions: ALERT_OPTIONS_BY_TYPE[updated.productType || "item"],
      visibility: updated.visibility,
      contactOptions: {
        allowDirectCall: Boolean(updated.contactOptions?.allowDirectCall),
        allowDirectWhatsapp: Boolean(updated.contactOptions?.allowDirectWhatsapp)
      },
      recovery: updated.recovery,
      status: updated.status === "inactive" ? "inactive" : "active",
      managePath,
      manageLink: `${origin}${managePath}`,
      qrLink: `${origin}/api/qr/${updated.code}`,
      qrDownloadLink: `${origin}/api/qr-download/${updated.code}`,
    });
  } catch (error) {
    console.error("MANAGE_GET_ERROR", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Bilgiler alınamadı."
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
        { error: "Yönetim bağlantısı eksik." },
        { status: 400 }
      );
    }

    const existing = validateManageToken(normalizedCode, token);

    if (!existing) {
      return NextResponse.json(
        { error: "Yönetim bağlantısı geçersiz veya süresi dolmuş." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const productType = normalizeProductType(body.productType);
    const allowedAlerts = ALERT_OPTIONS_BY_TYPE[productType];

    const name = getString(body.name || body.tagName);
    const ownerName = getString(body.ownerName);
    const phone = getString(body.phone);
    const email = getString(body.email);
    const city = getString(body.city);
    const addressDetail = getString(body.addressDetail);
    const distinctiveFeature = getString(body.distinctiveFeature);
    const petName = getString(body.petName || body.name || body.tagName);
    const note = getString(body.note);

    const alerts = Array.isArray(body.alerts)
      ? body.alerts.filter(
          (item: unknown): item is string =>
            typeof item === "string" && allowedAlerts.includes(item)
        )
      : [];

    const rawVisibility = {
      showName: Boolean(body.visibility?.showName),
      showPhone: Boolean(body.visibility?.showPhone),
      showEmail: Boolean(body.visibility?.showEmail),
      showCity: Boolean(body.visibility?.showCity),
      showAddressDetail: Boolean(body.visibility?.showAddressDetail),
      showPetName: Boolean(body.visibility?.showPetName),
      showNote: Boolean(body.visibility?.showNote)
    };

    const rawContactOptions = {
      allowDirectCall: Boolean(body.contactOptions?.allowDirectCall),
      allowDirectWhatsapp: Boolean(body.contactOptions?.allowDirectWhatsapp)
    };

    const recovery = {
      phone: getString(body.recovery?.phone),
      email: getString(body.recovery?.email)
    };

    const nextStatus = normalizeStatus(
      body.status,
      existing.status === "inactive" ? "inactive" : "active"
    );

    if (!name) {
      return NextResponse.json(
        { error: "İsim / etiket adı zorunludur." },
        { status: 400 }
      );
    }

    if (!phone && !email) {
      return NextResponse.json(
        { error: "Telefon veya e-posta zorunlu." },
        { status: 400 }
      );
    }

    if (!petName) {
      return NextResponse.json(
        { error: "Ürün adı zorunludur." },
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
      city,
      addressDetail,
      distinctiveFeature,
      petName,
      note,
      alerts,
      allowDirectCall: rawContactOptions.allowDirectCall,
      allowDirectWhatsapp: rawContactOptions.allowDirectWhatsapp,
      recoveryPhone: recovery.phone,
      recoveryEmail: recovery.email,
      status: nextStatus,
      visibility: rawVisibility
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Güncelleme başarısız." },
        { status: 500 }
      );
    }

    const managePath = `/manage/${updated.code}?token=${updated.manageToken}`;

    return NextResponse.json({
      success: true,
      managePath,
      manageLink: `${origin}${managePath}`,
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