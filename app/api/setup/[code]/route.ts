import { NextRequest, NextResponse } from "next/server";
import { findTagByCodeAsync, upsertTagAsync } from "@/lib/tags";

type ProductType = "pet" | "item" | "key" | "person";

type SetupBody = {
  productType?: ProductType;
  petName?: string;
  tagName?: string;
  ownerName?: string;
  phone?: string;
  city?: string;
  addressDetail?: string;
  distinctiveFeature?: string;
  note?: string;
  alerts?: string[];
  allowPhone?: boolean;
  allowWhatsapp?: boolean;
  showName?: boolean;
  showPhone?: boolean;
  showCity?: boolean;
  showAddressDetail?: boolean;
  showPetName?: boolean;
  showNote?: boolean;
  recoveryPhone?: string;
  recoveryEmail?: string;
  useRecoveryEmailAsContact?: boolean;
};

type RouteContext = {
  params: Promise<{
    code: string;
  }>;
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

function normalizePhone(value: unknown) {
  return normalizeString(value).replace(/[^0-9]/g, "");
}

function normalizeEmail(value: unknown) {
  return normalizeString(value).toLowerCase();
}

function isValidEmail(value: string) {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { code } = await context.params;
    const normalizedCode = normalizeString(code).toUpperCase();

    const tag = await findTagByCodeAsync(normalizedCode);

    if (!tag) {
      return NextResponse.json(
        { ok: false, error: "Etiket bulunamadı." },
        { status: 404 }
      );
    }

    const isLocked = tag.status === "active";

    return NextResponse.json({
      ok: true,
      isLocked,
      message: isLocked
        ? "Bu ürün zaten aktif. Eğer size aitse alttan yönetim erişimi alabilirsiniz."
        : "",
      tag: {
        code: tag.code,
        status: tag.status,
        productType: tag.productType,
        profile: tag.profile,
        alerts: tag.alerts,
        visibility: tag.visibility,
        contactOptions: tag.contactOptions,
        recovery: tag.recovery
      }
    });
  } catch (error) {
    console.error("SETUP_CODE_GET_ERROR", error);

    return NextResponse.json(
      { ok: false, error: "Veri alınamadı." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { code } = await context.params;
    const normalizedCode = normalizeString(code).toUpperCase();

    const existing = await findTagByCodeAsync(normalizedCode);

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Etiket bulunamadı." },
        { status: 404 }
      );
    }

    if (existing.status === "active") {
      return NextResponse.json(
        {
          ok: false,
          locked: true,
          error:
            "Bu ürün zaten aktif. Kurulum bağlantısı yalnızca ilk aktivasyon içindir. Eğer size aitse kurtarma veya ürünlerim alanından yönetim erişimi alabilirsiniz."
        },
        { status: 409 }
      );
    }

    const body = (await req.json()) as SetupBody;

    const productType = normalizeProductType(body.productType);
    const petName = normalizeString(body.petName);
    const tagName = normalizeString(body.tagName);
    const ownerName = normalizeString(body.ownerName);
    const phone = normalizePhone(body.phone);
    const city = normalizeString(body.city);
    const addressDetail = "";
    const distinctiveFeature = normalizeString(body.distinctiveFeature);
    const note = normalizeString(body.note);

    const recoveryPhone = normalizePhone(body.recoveryPhone);
    const recoveryEmail = normalizeEmail(body.recoveryEmail);
    const useRecoveryEmailAsContact = Boolean(body.useRecoveryEmailAsContact);

    if (!petName) {
      return NextResponse.json(
        { ok: false, error: "Ana isim zorunludur." },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { ok: false, error: "İletişim telefonu zorunludur." },
        { status: 400 }
      );
    }

    if (!recoveryPhone && !recoveryEmail) {
      return NextResponse.json(
        {
          ok: false,
          error: "Kurtarma için telefon veya e-posta alanlarından en az biri zorunludur."
        },
        { status: 400 }
      );
    }

    if (recoveryEmail && !isValidEmail(recoveryEmail)) {
      return NextResponse.json(
        { ok: false, error: "Geçerli bir kurtarma e-posta adresi girin." },
        { status: 400 }
      );
    }

    if (useRecoveryEmailAsContact && !recoveryEmail) {
      return NextResponse.json(
        {
          ok: false,
          error: "İletişim maili olarak kullanmak için kurtarma e-postası girilmelidir."
        },
        { status: 400 }
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

    const saved = await upsertTagAsync({
      code: normalizedCode,
      productType,
      tagName,
      petName,
      ownerName,
      phone,
      email: recoveryEmail || "",
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
        showEmail: false,
        showCity: Boolean(body.showCity && city),
        showAddressDetail: false,
        showPetName: Boolean(body.showPetName ?? true),
        showNote: Boolean(body.showNote && note)
      },
      recoveryPhone,
      recoveryEmail,
      status: "active"
    });

    return NextResponse.json({
      ok: true,
      tag: saved,
      publicPath: `/p/${saved.code}`,
      managePath: `/manage/${saved.code}?token=${saved.manageToken}`
    });
  } catch (error) {
    console.error("SETUP_CODE_PUT_ERROR", error);

    return NextResponse.json(
      { ok: false, error: "Güncelleme sırasında hata oluştu." },
      { status: 500 }
    );
  }
}