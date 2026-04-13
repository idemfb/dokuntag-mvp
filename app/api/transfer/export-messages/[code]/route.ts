import { NextResponse } from "next/server";
import { getNotifyLogsByTagCode } from "@/lib/notify";
import { isMailConfigured, sendTransferMessagesArchiveEmail } from "@/lib/mailer";
import { validateManageToken } from "@/lib/tags";

type Params = {
  params: Promise<{
    code: string;
  }>;
};

export async function POST(request: Request, { params }: Params) {
  try {
    const { code } = await params;
    const normalizedCode = String(code || "").trim().toUpperCase();
    const { searchParams } = new URL(request.url);
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

    if (!tag.profile.email) {
      return NextResponse.json(
        { error: "Bu ürün için kayıtlı e-posta bulunamadı." },
        { status: 400 }
      );
    }

    if (!isMailConfigured()) {
      return NextResponse.json(
        { error: "Mail sistemi hazır değil." },
        { status: 500 }
      );
    }

    const logs = getNotifyLogsByTagCode(normalizedCode);

    await sendTransferMessagesArchiveEmail({
      to: tag.profile.email,
      tagCode: tag.code,
      productName: tag.profile.petName || tag.profile.name || tag.code,
      logs
    });

    return NextResponse.json({
      success: true,
      sentTo: tag.profile.email,
      message:
        "Mesaj arşivi kayıtlı e-posta adresinize gönderildi. Devir tamamlandığında eski mesajlar silinebilir."
    });
  } catch (error) {
    console.error("TRANSFER_EXPORT_MESSAGES_ERROR", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Mesaj arşivi gönderilemedi."
      },
      { status: 500 }
    );
  }
}