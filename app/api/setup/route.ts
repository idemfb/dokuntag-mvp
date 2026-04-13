import { NextRequest, NextResponse } from "next/server";
import { findTagByCode, upsertTag } from "@/lib/tags";

type ProductType = "pet" | "item" | "key" | "person";

type SetupBody = {
  code?: string;
  productType?: ProductType;
  petName?: string;
  tagName?: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  city?: string;
  addressDetail?: string;
  distinctiveFeature?: string;
  note?: string;
  alerts?: string[];
  allowPhone?: boolean;
  allowWhatsapp?: boolean;
  showName?: boolean;
  showPhone?: boolean;
  showEmail?: boolean;
  showCity?: boolean;
  showAddressDetail?: boolean;
  showPetName?: boolean;
  showNote?: boolean;
};

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

function normalizeProductType(value: unknown): ProductType {
  if (value === "pet" || value === "item" || value === "key" || value === "person") {
    return value;
  }

  return "item";
}

function normalizeString(value: unknown) {
  return String(value ?? "").trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SetupBody;

    const code = normalizeString(body.code).toUpperCase();
    const productType = normalizeProductType(body.productType);

    const petName = normalizeString(body.petName);
    const tagName = normalizeString(body.tagName);
    const ownerName = normalizeString(body.ownerName);
    const phone = normalizeString(body.phone);
    const email = normalizeString(body.email);
    const city = normalizeString(body.city);
    const addressDetail = normalizeString(body.addressDetail);
    const distinctiveFeature = normalizeString(body.distinctiveFeature);
    const note = normalizeString(body.note);

    if (!code) {
      return NextResponse.json(
        { ok: false, error: "Kod zorunludur." },
        { status: 400 }
      );
    }

    if (!petName) {
      return NextResponse.json(
        { ok: false, error: "Ana isim zorunludur." },
        { status: 400 }
      );
    }

    const existing = findTagByCode(code);

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Bu kod sistemde bulunamadı." },
        { status: 404 }
      );
    }

    if (existing.status === "active") {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Bu ürün zaten aktif. Eğer size aitse kurtarma veya ürünlerim alanından yönetim erişimi alabilirsiniz."
        },
        { status: 409 }
      );
    }

    const allowDirectCall = Boolean(body.allowPhone && phone);
    const allowDirectWhatsapp = Boolean(body.allowWhatsapp && allowDirectCall && phone);

    const allowedAlerts = ALERT_OPTIONS_BY_TYPE[productType];
    const alerts = Array.isArray(body.alerts)
      ? body.alerts.filter(
          (item): item is string =>
            typeof item === "string" && allowedAlerts.includes(item)
        )
      : [];

    const saved = upsertTag({
      code,
      productType,
      tagName,
      petName,
      ownerName,
      phone,
      email,
      city,
      addressDetail,
      distinctiveFeature,
      note,
      alerts,
      allowDirectCall,
      allowDirectWhatsapp,
      visibility: {
        showName: Boolean(body.showName ?? true),
        showPhone: Boolean(body.showPhone && allowDirectCall && phone),
        showEmail: Boolean(body.showEmail && email),
        showCity: Boolean(body.showCity && city),
        showAddressDetail: Boolean(body.showAddressDetail && addressDetail),
        showPetName: Boolean(body.showPetName ?? true),
        showNote: Boolean(body.showNote && note)
      },
      recoveryPhone: phone,
      recoveryEmail: email,
      status: "active"
    });

    return NextResponse.json({
      ok: true,
      tag: saved,
      publicPath: `/p/${saved.code}`,
      managePath: `/manage/${saved.code}?token=${saved.manageToken}`
    });
  } catch (error) {
    console.error("SETUP_POST_ERROR", error);

    return NextResponse.json(
      { ok: false, error: "Kurulum kaydedilemedi." },
      { status: 500 }
    );
  }
}