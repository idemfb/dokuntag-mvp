import { NextRequest, NextResponse } from "next/server";
import { sendRecoveryMagicLinkEmail, isMailConfigured } from "@/lib/mailer";
import { createRecoverySessionByEmail } from "@/lib/tags";

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function getBaseUrl(request: NextRequest) {
  const envBaseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "";

  if (envBaseUrl) {
    return envBaseUrl.replace(/\/+$/, "");
  }

  return request.nextUrl.origin.replace(/\/+$/, "");
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      entryType?: "my" | "recover";
    };

    const email = normalizeEmail(body?.email);
    const entryType = body?.entryType === "recover" ? "recover" : "my";

    if (!email) {
      return NextResponse.json(
        { error: "E-posta zorunludur." },
        { status: 400 }
      );
    }

    if (!isMailConfigured()) {
      return NextResponse.json(
        { error: "Mail sistemi şu an hazır değil." },
        { status: 500 }
      );
    }

    const session = createRecoverySessionByEmail({
      email,
      entryType
    });

    if (session) {
      const baseUrl = getBaseUrl(request);
      const verifyLink = `${baseUrl}/recover/verify?token=${encodeURIComponent(
        session.token
      )}`;

      await sendRecoveryMagicLinkEmail({
        to: email,
        verifyLink,
        expiresAt: session.expiresAt,
        entryType
      });
    }

    return NextResponse.json({
      success: true,
      message:
        "Bu e-posta sistemde kayıtlıysa, güvenli giriş bağlantısı gönderildi."
    });
  } catch (error) {
    console.error("RECOVER_MAGIC_LINK_REQUEST_ERROR", error);

    return NextResponse.json(
      { error: "İşlem sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}