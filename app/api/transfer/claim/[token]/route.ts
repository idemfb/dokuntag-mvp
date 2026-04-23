import { NextResponse } from "next/server";
import { deleteAllNotifyLogsByTagCode } from "@/lib/notify";
import { claimTransferAsync, getTransferByTokenAsync } from "@/lib/tags";

type Params = {
  params: Promise<{
    token: string;
  }>;
};

type ProductType = "pet" | "item" | "key" | "person" | "other";
type ProductSubtype =
  | "cat"
  | "dog"
  | "bird"
  | "pet_other"
  | "house_key"
  | "car_key"
  | "office_key"
  | "key_other"
  | "girl_child"
  | "boy_child"
  | "woman"
  | "man"
  | "elder"
  | "person_other"
  | "bag"
  | "wallet"
  | "luggage"
  | "phone_item"
  | "tablet"
  | "headphones"
  | "item_other";

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: unknown) {
  return getString(value).toLowerCase();
}

function normalizePhone(value: unknown) {
  return getString(value).replace(/[^0-9]/g, "");
}

function normalizeProductType(value: unknown): ProductType {
  if (
    value === "pet" ||
    value === "item" ||
    value === "key" ||
    value === "person" ||
    value === "other"
  ) {
    return value;
  }
  return "item";
}

const PRODUCT_SUBTYPE_OPTIONS: Record<ProductType, ProductSubtype[]> = {
  pet: ["cat", "dog", "bird", "pet_other"],
  key: ["house_key", "car_key", "office_key", "key_other"],
  person: ["girl_child", "boy_child", "woman", "man", "elder", "person_other"],
  item: [
    "bag",
    "wallet",
    "luggage",
    "phone_item",
    "tablet",
    "headphones",
    "item_other"
  ],
  other: ["item_other"]
};

function normalizeProductSubtype(
  value: unknown,
  productType: ProductType
): ProductSubtype | "" {
  if (typeof value !== "string") return "";
  const normalized = value.trim() as ProductSubtype;
  return PRODUCT_SUBTYPE_OPTIONS[productType].includes(normalized)
    ? normalized
    : "";
}

function isValidEmail(value: string) {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { token } = await params;
    const transfer = await getTransferByTokenAsync(token);

    if (!transfer) {
      return NextResponse.json(
        { error: "Devir bağlantısı bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      code: transfer.code,
      productType: transfer.productType,
      productSubtype: transfer.productSubtype || "",
      currentProfile: transfer.currentProfile,
      transfer: transfer.transfer
    });
  } catch (error) {
    console.error("TRANSFER_GET_ERROR", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Devir bilgileri alınamadı."
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { token } = await params;
    const body = await request.json();

    const productType = normalizeProductType(body.productType);
    const productSubtype = normalizeProductSubtype(
      body.productSubtype,
      productType
    );
    const petName = getString(body.petName || body.name || body.tagName);
    const tagName = petName;
    const ownerName = getString(body.ownerName);
    const phone = normalizePhone(body.phone);
    const email = normalizeEmail(body.email);
    const city = productType === "key" ? "" : getString(body.city);
    const addressDetail = "";
    const distinctiveFeature = "";
    const note = getString(body.note);
    const recoveryPhone = normalizePhone(body.recovery?.phone);
    const recoveryEmail = normalizeEmail(body.recovery?.email);
    const recoveryEmailConfirm = normalizeEmail(body.recovery?.emailConfirm);

    const visibility = {
      showName: Boolean(body.visibility?.showName),
      showPhone: Boolean(body.visibility?.showPhone && phone),
      showEmail: false,
      showCity: Boolean(body.visibility?.showCity && city),
      showAddressDetail: false,
      showPetName: Boolean(body.visibility?.showPetName),
      showNote: Boolean(body.visibility?.showNote && note)
    };

    const contactOptions = {
      allowDirectCall: Boolean(body.contactOptions?.allowDirectCall) && Boolean(phone),
      allowDirectWhatsapp:
        Boolean(body.contactOptions?.allowDirectCall) &&
        Boolean(body.contactOptions?.allowDirectWhatsapp) &&
        Boolean(phone)
    };

    if (!petName) {
      return NextResponse.json(
        { error: "İsim zorunludur." },
        { status: 400 }
      );
    }

    if (!phone && !email) {
      return NextResponse.json(
        { error: "Telefon veya e-posta alanlarından en az biri zorunludur." },
        { status: 400 }
      );
    }

    if (!recoveryEmail) {
      return NextResponse.json(
        { error: "Kurtarma e-postası zorunludur." },
        { status: 400 }
      );
    }

    if (!recoveryEmailConfirm) {
      return NextResponse.json(
        { error: "Kurtarma e-postasını tekrar yazın." },
        { status: 400 }
      );
    }

    if (recoveryEmail !== recoveryEmailConfirm) {
      return NextResponse.json(
        { error: "Kurtarma e-postaları aynı olmalıdır." },
        { status: 400 }
      );
    }

    if (!isValidEmail(recoveryEmail)) {
      return NextResponse.json(
        { error: "Geçerli bir kurtarma e-postası girin." },
        { status: 400 }
      );
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Geçerli bir iletişim e-postası girin." },
        { status: 400 }
      );
    }

    const transferBeforeClaim = await getTransferByTokenAsync(token);

    const claimed = await claimTransferAsync({
      transferToken: token,
      productType,
      productSubtype,
      tagName,
      ownerName,
      phone,
      email,
      city,
      addressDetail,
      distinctiveFeature,
      petName,
      note,
      alerts: [],
      allowDirectCall: contactOptions.allowDirectCall,
      allowDirectWhatsapp: contactOptions.allowDirectWhatsapp,
      recoveryPhone,
      recoveryEmail,
      visibility
    });

    if (!claimed) {
      return NextResponse.json(
        { error: "Devir bağlantısı bulunamadı." },
        { status: 404 }
      );
    }

    if (!claimed.success) {
      if (claimed.reason === "used") {
        return NextResponse.json(
          { error: "Bu devir bağlantısı daha önce kullanılmış." },
          { status: 400 }
        );
      }

      if (claimed.reason === "expired") {
        return NextResponse.json(
          { error: "Bu devir bağlantısının süresi dolmuş." },
          { status: 400 }
        );
      }

      if (claimed.reason === "cancelled") {
        return NextResponse.json(
          { error: "Bu devir bağlantısı iptal edilmiş." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Bu devir bağlantısı artık kullanılamaz." },
        { status: 400 }
      );
    }

    if (transferBeforeClaim?.code) {
      await deleteAllNotifyLogsByTagCode(transferBeforeClaim.code);
    }

    return NextResponse.json({
      success: true,
      code: claimed.code,
      managePath: claimed.managePath,
      manageLink: claimed.manageLink,
      message:
        "Devir tamamlandı. Ürün hesabınıza aktarıldı, yeniden aktif edildi ve eski mesajlar temizlendi."
    });
  } catch (error) {
    console.error("TRANSFER_CLAIM_ERROR", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Devir işlemi tamamlanamadı."
      },
      { status: 500 }
    );
  }
}