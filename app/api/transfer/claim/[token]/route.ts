import { NextResponse } from "next/server";
import { deleteAllNotifyLogsByTagCode } from "@/lib/notify";
import { claimTransfer, getTransferByToken } from "@/lib/tags";

type Params = {
  params: Promise<{
    token: string;
  }>;
};

type ProductType = "pet" | "item" | "key" | "person";

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
    const { token } = await params;
    const transfer = getTransferByToken(token);

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
    const tagName = getString(body.name || body.tagName);
    const ownerName = getString(body.ownerName);
    const phone = getString(body.phone);
    const email = getString(body.email);
    const city = getString(body.city);
    const addressDetail = getString(body.addressDetail);
    const distinctiveFeature = getString(body.distinctiveFeature);
    const petName = getString(body.petName || body.name || body.tagName);
    const note = getString(body.note);
    const recoveryPhone = getString(body.recovery?.phone);
    const recoveryEmail = getString(body.recovery?.email);

    const visibility = {
      showName: Boolean(body.visibility?.showName),
      showPhone: Boolean(body.visibility?.showPhone),
      showEmail: Boolean(body.visibility?.showEmail),
      showCity: Boolean(body.visibility?.showCity),
      showAddressDetail: Boolean(body.visibility?.showAddressDetail),
      showPetName: Boolean(body.visibility?.showPetName),
      showNote: Boolean(body.visibility?.showNote)
    };

    const contactOptions = {
      allowDirectCall: Boolean(body.contactOptions?.allowDirectCall) && Boolean(phone),
      allowDirectWhatsapp:
        Boolean(body.contactOptions?.allowDirectCall) &&
        Boolean(body.contactOptions?.allowDirectWhatsapp) &&
        Boolean(phone)
    };

    if (!tagName) {
      return NextResponse.json(
        { error: "İsim / etiket adı zorunludur." },
        { status: 400 }
      );
    }

    if (!petName) {
      return NextResponse.json(
        { error: "Ürün adı / kişi adı zorunludur." },
        { status: 400 }
      );
    }

    if (!phone && !email) {
      return NextResponse.json(
        { error: "Telefon veya e-posta alanlarından en az biri zorunludur." },
        { status: 400 }
      );
    }

    if (!recoveryPhone && !recoveryEmail) {
      return NextResponse.json(
        { error: "Kurtarma için en az bir bilgi girilmelidir." },
        { status: 400 }
      );
    }

    const transferBeforeClaim = getTransferByToken(token);

    const claimed = claimTransfer({
      transferToken: token,
      productType,
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
      deleteAllNotifyLogsByTagCode(transferBeforeClaim.code);
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