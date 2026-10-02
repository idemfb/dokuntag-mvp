import { addAbuseLog } from "@/lib/security/abuseLog";
import { NextResponse } from "next/server";
import { findTagByCodeAsync, readTagsAsync } from "@/lib/tags";
import { isMailConfigured, sendOwnerNotification } from "@/lib/mailer";
import {
  isMaintenanceMode,
  isNotifyDisabled
} from "@/lib/productionFlags";
import {
  containsBlockedContent
} from "@/lib/security/messageFilter";
import {
  checkRateLimit
} from "@/lib/security/rateLimit";
import {
  normalizeApproxLocation
} from "@/lib/security/location";
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

async function shouldShowOwnerNameInEmail(ownerEmail: string) {
  const normalizedOwnerEmail = normalizeEmail(ownerEmail);
  if (!normalizedOwnerEmail) return false;

  const allTags = await readTagsAsync();

  const sameOwnerCount = allTags.filter((tag) => {
    return normalizeEmail(tag.profile.email) === normalizedOwnerEmail;
  }).length;

  return sameOwnerCount > 1;
}

function shouldShowSecondaryTitle(itemName: string, tagName: string) {
  const normalizedItemName = getString(itemName).toLocaleLowerCase("tr-TR");
  const normalizedTagName = getString(tagName).toLocaleLowerCase("tr-TR");

  if (!normalizedTagName) return false;
  if (!normalizedItemName) return true;

  return normalizedItemName !== normalizedTagName;
}

export async function POST(request: Request) {
  try {
    if (isMaintenanceMode()) {
  return NextResponse.json(
    {
      error:
        "Sistem kısa süreli bakım modunda. Lütfen daha sonra tekrar deneyin."
    },
    { status: 503 }
  );
}
    if (isNotifyDisabled()) {
      return NextResponse.json(
        {
          error:
            "Mesaj iletimi geçici olarak duraklatıldı. Lütfen daha sonra tekrar deneyin."
        },
        { status: 503 }
      );
    }

    const body = await request.json();

    const code = normalizeCode(body.code);
    const senderName = getString(body.senderName);
    const senderPhone = normalizePhone(body.senderPhone);
    const senderEmail = normalizeEmail(body.senderEmail);
    const rawMessage = normalizeMessage(body.message);
    const message = rawMessage.slice(0, 500);
    const approximateLocation =
  normalizeApproxLocation(
    body.approximateLocation
  );
    const website = getString(body.website);
    const preferredContactMethods = normalizeMethods(body.preferredContactMethods);
    const clientIp =
  getClientIp(request);

    if (["DKNTG", "DEMO01", "DEMO02", "DEMO03"].includes(code)) {
  return NextResponse.json({
    success: true,
    message: "Bu bir demo profildir. Gerçek mesaj gönderilmez."
  });
}
    if (website) {
      return NextResponse.json({ success: true });
    }
   const rateLimitPassed =
  checkRateLimit(`notify:${clientIp}:${code}`);

if (!rateLimitPassed) {
  addAbuseLog({
    reason: "rate_limit",
    code,
    ip: clientIp,
    senderName,
    message
  });

  return NextResponse.json(
    {
      error:
        "Çok fazla mesaj gönderildi. Lütfen daha sonra tekrar deneyin."
    },
    { status: 429 }
  );
}
    if (!code) {
      return NextResponse.json({ error: "Kod zorunludur." }, { status: 400 });
    }

    const tag = await findTagByCodeAsync(code);

    if (!tag) {
      return NextResponse.json(
        { error: "Etiket bulunamadı." },
        { status: 404 }
      );
    }

    if (tag.status === "inactive") {
      return NextResponse.json(
        {
          error:
            "Bu ürün şu an aktif değil. İletişim geçici olarak kapatılmıştır."
        },
        { status: 400 }
      );
    }

    if (tag.status !== "active") {
      return NextResponse.json(
        { error: "Bu etiket henüz aktif değil." },
        { status: 400 }
      );
    }

    if (
  senderName &&
  (senderName.length < 2 ||
    senderName.length > 60)
) {
  return NextResponse.json(
    {
      error:
        "Ad bilgisi geçersiz."
    },
    { status: 400 }
  );
}

   if (
  containsBlockedContent(message) ||
  containsBlockedContent(senderName)
) {
  addAbuseLog({
    reason: "blocked_content",
    code,
    ip: clientIp,
    senderName,
    message
  });

  return NextResponse.json(
    {
      error:
        "Mesajınız güvenlik kuralları nedeniyle gönderilemedi. Lütfen daha uygun bir dil kullanın."
    },
    { status: 400 }
  );
}

    if (
  preferredContactMethods.length > 0
) {
  const needsPhone =
    preferredContactMethods.includes(
      "phone"
    ) ||
    preferredContactMethods.includes(
      "whatsapp"
    );

  const needsEmail =
    preferredContactMethods.includes(
      "email"
    );

  if (needsPhone && !senderPhone) {
    return NextResponse.json(
      {
        error:
          "Telefon bilgisi gerekli."
      },
      { status: 400 }
    );
  }

  if (needsEmail && !senderEmail) {
    return NextResponse.json(
      {
        error:
          "E-posta bilgisi gerekli."
      },
      { status: 400 }
    );
  }
}

    
    if (senderPhone.length > 20) {
      return NextResponse.json(
        { error: "Telefon bilgisi çok uzun." },
        { status: 400 }
      );
    }

    if (senderEmail.length > 120) {
      return NextResponse.json(
        { error: "E-posta bilgisi çok uzun." },
        { status: 400 }
      );
    }

    if (senderEmail && !isValidEmail(senderEmail)) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi girin." },
        { status: 400 }
      );
    }

    if (!message || message.length < 5) {
      return NextResponse.json(
        { error: "Mesaj çok kısa." },
        { status: 400 }
      );
    }

    if (rawMessage.length > 500) {
      return NextResponse.json(
        { error: "Mesaj en fazla 500 karakter olabilir." },
        { status: 400 }
      );
    }

    if (!tag.profile.email) {
      return NextResponse.json(
        { error: "Bu etiket için alıcı e-posta tanımlı değil." },
        { status: 400 }
      );
    }

    if (!isMailConfigured()) {
      return NextResponse.json(
        {
          error:
            "Mail sistemi hazır değil. RESEND_API_KEY ve EMAIL_FROM gerekli."
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

    const cooldownCheck = await checkNotifyCooldown({
      tagCode: code,
      senderFingerprint,
      ip
    });

    if (!cooldownCheck.allowed) {
  addAbuseLog({
    reason: "cooldown",
    code,
    ip,
    senderName,
    message
  });

  return NextResponse.json(
        {
          error:
            cooldownCheck.error ||
            "Çok sık mesaj gönderiyorsunuz. Lütfen daha sonra tekrar deneyin."
        },
        { status: 429 }
      );
    }

    await addNotifyLog({
      tagCode: code,
      senderFingerprint,
      ip,
      senderName,
      senderPhone,
      senderEmail,
      preferredContactMethods,
      approximateLocation,
      message
    });

    const showOwnerNameInEmail = await shouldShowOwnerNameInEmail(
      tag.profile.email
    );
    const itemName = getString(tag.profile.petName || "");
    const tagName = getString(tag.profile.name || "");
    const ownerName = getString(tag.profile.ownerName || "");

    await sendOwnerNotification({
      to: tag.profile.email,
      tagCode: tag.code,
      ownerName,
      tagName,
      itemName,
      senderName,
      senderPhone,
      senderEmail,
      preferredContactMethods,  
      allowDirectCall: Boolean(tag.contactOptions?.allowDirectCall),
      allowDirectWhatsapp: Boolean(tag.contactOptions?.allowDirectWhatsapp),
      approximateLocation,
      message,
      showOwnerName: showOwnerNameInEmail,
      showSecondaryTitle: shouldShowSecondaryTitle(itemName, tagName)
    });

    const methodLabels = preferredContactMethods
      .map((method) => {
        if (method === "whatsapp") return "WhatsApp";
        if (method === "phone") return "Telefon / SMS";
        if (method === "email") return "E-posta";
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
