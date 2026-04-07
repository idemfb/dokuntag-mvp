import { NextResponse } from "next/server";
import { findTagByCode } from "@/lib/tags";
import { isMailConfigured, sendOwnerNotification } from "@/lib/mailer";
import {
  addNotifyLog,
  checkNotifyCooldown,
  createSenderFingerprint
} from "@/lib/notify";

const CONTACT_METHODS = ["phone", "whatsapp", "email"] as const;

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeCode(value: unknown) {
  return getString(value).toUpperCase();
}

function normalizeMessage(value: unknown) {
  return getString(value).replace(/\s+/g, " ").trim();
}

function normalizePhone(value: unknown) {
  return getString(value).replace(/\D/g, "");
}

function normalizeEmail(value: unknown) {
  return getString(value).toLowerCase();
}

function isValidEmail(value: string) {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeMethods(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const filtered = value.filter(
    (item: unknown): item is string =>
      typeof item === "string" &&
      CONTACT_METHODS.includes(item as (typeof CONTACT_METHODS)[number])
  );

  return Array.from(new Set(filtered));
}

function getClientIp(request: Request) {
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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const code = normalizeCode(body.code);
    const senderName = getString(body.senderName);
    const senderPhone = normalizePhone(body.senderPhone);
    const senderEmail = normalizeEmail(body.senderEmail);
    const message = normalizeMessage(body.message);
    const website = getString(body.website);
    const preferredContactMethods = normalizeMethods(body.preferredContactMethods);

    if (website) {
      return NextResponse.json({ success: true });
    }

    if (!code) {
      return NextResponse.json({ error: "Kod zorunludur." }, { status: 400 });
    }

    const tag = findTagByCode(code);

    if (!tag) {
      return NextResponse.json({ error: "Etiket bulunamadı." }, { status: 404 });
    }

    if (tag.status !== "active") {
      return NextResponse.json(
        { error: "Bu etiket henüz aktif değil." },
        { status: 400 }
      );
    }

    if (!senderName) {
      return NextResponse.json({ error: "Ad zorunludur." }, { status: 400 });
    }

    if (senderName.length < 2 || senderName.length > 60) {
      return NextResponse.json(
        { error: "Ad 2 ile 60 karakter arasında olmalı." },
        { status: 400 }
      );
    }

    if (!preferredContactMethods.length) {
      return NextResponse.json(
        { error: "En az 1 iletişim yöntemi seçin." },
        { status: 400 }
      );
    }

    const needsPhone =
      preferredContactMethods.includes("phone") ||
      preferredContactMethods.includes("whatsapp");

    const needsEmail = preferredContactMethods.includes("email");

    if (needsPhone && !senderPhone) {
      return NextResponse.json(
        { error: "Telefon veya WhatsApp seçildiği için telefon zorunlu." },
        { status: 400 }
      );
    }

    if (needsEmail && !senderEmail) {
      return NextResponse.json(
        { error: "Email seçildiği için email zorunlu." },
        { status: 400 }
      );
    }

    if (senderPhone.length > 20) {
      return NextResponse.json(
        { error: "Telefon bilgisi çok uzun." },
        { status: 400 }
      );
    }

    if (senderEmail.length > 120) {
      return NextResponse.json(
        { error: "Email bilgisi çok uzun." },
        { status: 400 }
      );
    }

    if (senderEmail && !isValidEmail(senderEmail)) {
      return NextResponse.json(
        { error: "Geçerli bir email adresi girin." },
        { status: 400 }
      );
    }

    if (!message || message.length < 5) {
      return NextResponse.json({ error: "Mesaj çok kısa." }, { status: 400 });
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { error: "Mesaj çok uzun." },
        { status: 400 }
      );
    }

    if (!tag.profile.email) {
      return NextResponse.json(
        { error: "Bu etiket için alıcı email tanımlı değil." },
        { status: 400 }
      );
    }

    if (!isMailConfigured()) {
      return NextResponse.json(
        {
          error: "Mail sistemi hazır değil. RESEND_API_KEY ve EMAIL_FROM gerekli."
        },
        { status: 500 }
      );
    }

    const ip = getClientIp(request);

    const senderFingerprint = createSenderFingerprint({
      ip,
      code,
      senderPhone,
      senderEmail
    });

    const cooldownCheck = checkNotifyCooldown({
      tagCode: code,
      senderFingerprint,
      ip
    });

    if (!cooldownCheck.allowed) {
      return NextResponse.json(
        {
          error:
            cooldownCheck.error ||
            "Çok sık mesaj gönderiyorsunuz. Lütfen daha sonra tekrar deneyin."
        },
        { status: 429 }
      );
    }

    await sendOwnerNotification({
      to: tag.profile.email,
      tagCode: tag.code,
      ownerName: tag.profile.name,
      petName: tag.profile.petName,
      senderName,
      senderPhone,
      senderEmail,
      preferredContactMethods,
      message
    });

    addNotifyLog({
      tagCode: code,
      senderFingerprint,
      ip
    });

    const methodLabels = preferredContactMethods
      .map((method) => {
        if (method === "whatsapp") return "WhatsApp";
        if (method === "phone") return "Telefon / SMS";
        if (method === "email") return "Email";
        return method;
      })
      .join(", ");

    return NextResponse.json({
      success: true,
      message: `Mesaj iletildi. Etiket sahibi size ${methodLabels} üzerinden dönüş yapabilir.`
    });
  } catch (error) {
    console.error("NOTIFY_ERROR", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Mesaj gönderilemedi. Lütfen tekrar deneyin."
      },
      { status: 500 }
    );
  }
}