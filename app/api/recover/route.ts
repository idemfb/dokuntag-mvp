import { NextRequest, NextResponse } from "next/server";
import { sendRecoveryMagicLinkEmail, isMailConfigured } from "@/lib/mailer";
import { createRecoverySessionByEmailAsync } from "@/lib/tags";
import {
  addRecoverLog,
  checkRecoverCooldown,
  createRecoverFingerprint
} from "@/lib/notify";

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function getBaseUrl() {
  const envBaseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!envBaseUrl) {
    throw new Error("BASE_URL tanımlı değil");
  }

  return envBaseUrl.replace(/\/+$/, "");
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
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

    if (email.length > 120) {
      return NextResponse.json(
        { error: "Geçersiz e-posta." },
        { status: 400 }
      );
    }

    if (!isMailConfigured()) {
      return NextResponse.json(
        { error: "Mail sistemi şu an hazır değil." },
        { status: 500 }
      );
    }

    const ip = getClientIp(request);
    const fingerprint = createRecoverFingerprint({ ip, email });

    const cooldownResult = await checkRecoverCooldown({
      email,
      fingerprint,
      ip
    });

    if (!cooldownResult.allowed) {
      return NextResponse.json(
        { error: cooldownResult.error },
        { status: 429 }
      );
    }

    const session = await createRecoverySessionByEmailAsync({
      email,
      entryType,
      expiresInMinutes: 120
    });

    await addRecoverLog({
      email,
      entryType,
      fingerprint,
      ip
    });

    if (session) {
      const baseUrl = getBaseUrl();
      const verifyLink = `${baseUrl}/my/list?token=${encodeURIComponent(
        session.token
      )}`;

      await sendRecoveryMagicLinkEmail({
  to: email,
  verifyLink,
  expiresAt: session.expiresAt,
  entryType,
  itemCount: session.matchedCount || 0,
  itemPreview: session.codes?.slice(0, 5) || []
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