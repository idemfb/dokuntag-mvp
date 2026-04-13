import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function getEnv(name: string) {
  return process.env[name]?.trim() || "";
}

export function isMailConfigured() {
  return Boolean(getEnv("RESEND_API_KEY") && getEnv("EMAIL_FROM"));
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizePhoneForLinks(phone: string) {
  return phone.replace(/\D/g, "");
}

function normalizePhoneForWhatsApp(phone: string) {
  const normalized = normalizePhoneForLinks(phone);
  if (!normalized) return "";

  if (normalized.startsWith("0")) {
    return `90${normalized.slice(1)}`;
  }

  if (normalized.startsWith("90")) {
    return normalized;
  }

  return normalized;
}

function buildWhatsAppLink(phone: string, senderName: string, tagCode: string) {
  const normalized = normalizePhoneForWhatsApp(phone);
  if (!normalized) return "";

  const safeSenderName = senderName.trim() || "merhaba";
  const text = `Merhaba ${safeSenderName}, Dokuntag ${tagCode} mesajınız için size ulaşıyorum.`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
}

function buildTelLink(phone: string) {
  const normalized = normalizePhoneForLinks(phone);
  if (!normalized) return "";
  return `tel:${normalized}`;
}

function button(href: string, label: string) {
  return `
    <a
      href="${href}"
      style="
        display:inline-block;
        margin:6px 8px 6px 0;
        padding:10px 14px;
        border-radius:8px;
        background:#111;
        color:#fff;
        text-decoration:none;
        font-weight:600;
      "
    >
      ${label}
    </a>
  `;
}

function getContactMethodLabel(method: string) {
  if (method === "whatsapp") return "WhatsApp";
  if (method === "phone") return "Telefon / SMS";
  if (method === "email") return "E-posta";
  return method;
}

function infoRow(label: string, value: string) {
  if (!value.trim()) return "";

  return `
    <p style="margin:4px 0;">
      <strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}
    </p>
  `;
}

function buildSmartSubject(input: {
  itemName: string;
  tagName: string;
  tagCode: string;
}) {
  const itemName = input.itemName.trim();
  const tagName = input.tagName.trim();
  const tagCode = input.tagCode.trim();

  if (itemName) {
    return `Dokuntag mesajı - ${itemName}`;
  }

  if (tagName) {
    return `Dokuntag mesajı - ${tagName}`;
  }

  if (tagCode) {
    return `Dokuntag mesajı - ${tagCode}`;
  }

  return "Dokuntag mesajı";
}

type SendOwnerNotificationInput = {
  to: string;
  tagCode: string;
  ownerName: string;
  tagName: string;
  itemName: string;
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  preferredContactMethods: string[];
  allowDirectCall?: boolean;
  allowDirectWhatsapp?: boolean;
  message: string;
  showOwnerName?: boolean;
  showSecondaryTitle?: boolean;
};

export async function sendOwnerNotification(input: SendOwnerNotificationInput) {
  const from = getEnv("EMAIL_FROM");

  if (!from) {
    throw new Error("EMAIL_FROM eksik");
  }

  const subject = buildSmartSubject({
    itemName: input.itemName,
    tagName: input.tagName,
    tagCode: input.tagCode
  });

  const preferredMethodsText =
    input.preferredContactMethods.length > 0
      ? input.preferredContactMethods.map(getContactMethodLabel).join(", ")
      : "-";

  const canShowCallButton =
    Boolean(input.allowDirectCall) &&
    input.preferredContactMethods.includes("phone") &&
    Boolean(input.senderPhone);

  const canShowWhatsappButton =
    Boolean(input.allowDirectWhatsapp) &&
    input.preferredContactMethods.includes("whatsapp") &&
    Boolean(input.senderPhone);

  const whatsappLink = canShowWhatsappButton
    ? buildWhatsAppLink(input.senderPhone, input.senderName, input.tagCode)
    : "";

  const telLink = canShowCallButton ? buildTelLink(input.senderPhone) : "";

  const actionButtons: string[] = [];

  if (whatsappLink) {
    actionButtons.push(button(whatsappLink, "WhatsApp"));
  }

  if (telLink) {
    actionButtons.push(button(telLink, "Ara"));
  }

  const showPhone =
    input.preferredContactMethods.includes("phone") ||
    input.preferredContactMethods.includes("whatsapp");

  const showEmail = input.preferredContactMethods.includes("email");

  const profileInfoRows = [
    infoRow("Etiket kodu", input.tagCode),
    infoRow("Ana isim", input.itemName),
    input.showOwnerName && input.ownerName
      ? infoRow("Profil sahibi", input.ownerName)
      : "",
    input.showSecondaryTitle ? infoRow("Etiket başlığı", input.tagName) : ""
  ]
    .filter(Boolean)
    .join("");

  const contactInfoRows = [
    showPhone ? infoRow("Telefon", input.senderPhone) : "",
    showEmail ? infoRow("E-posta", input.senderEmail) : ""
  ]
    .filter(Boolean)
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif; line-height:1.6; color:#111;">
      <h2>Dokuntag profiliniz için yeni bir mesaj var</h2>

      <div style="margin-top:14px; padding:12px; border:1px solid #e5e5e5; border-radius:8px; background:#fafafa;">
        <p style="margin:0 0 8px 0;"><strong>Profil bilgileri</strong></p>
        ${profileInfoRows || `<p style="margin:4px 0;">Bilgi bulunamadı.</p>`}
      </div>

      <hr style="margin:20px 0;" />

      <p><strong>Gönderen:</strong> ${escapeHtml(input.senderName || "-")}</p>
      <p><strong>Tercih edilen iletişim yolu:</strong> ${escapeHtml(preferredMethodsText)}</p>

      ${
        actionButtons.length > 0
          ? `
        <div style="margin:18px 0;">
          <p><strong>Hızlı yanıt</strong></p>
          ${actionButtons.join("")}
        </div>
      `
          : ""
      }

      ${
        contactInfoRows
          ? `
        <div style="margin-top:14px; padding:12px; border:1px solid #e5e5e5; border-radius:8px; background:#fafafa;">
          <p style="margin:0 0 8px 0;"><strong>İletişim bilgileri</strong></p>
          ${contactInfoRows}
        </div>
      `
          : ""
      }

      <p style="margin-top:16px;"><strong>Mesaj</strong></p>
      <div style="white-space:pre-wrap; border:1px solid #ddd; padding:12px; border-radius:8px;">
        ${escapeHtml(input.message || "-")}
      </div>

      <div style="margin-top:18px; padding:12px; border:1px solid #ececec; border-radius:8px; background:#fff;">
        <p style="margin:0; font-size:12px; color:#666;">
          Bu mesaj Dokuntag profiliniz üzerinden iletildi.
        </p>
      </div>
    </div>
  `;

  const text = [
    "Dokuntag profiliniz için yeni bir mesaj var.",
    "",
    input.tagCode ? `Etiket kodu: ${input.tagCode}` : "",
    input.itemName ? `Ana isim: ${input.itemName}` : "",
    input.showOwnerName && input.ownerName
      ? `Profil sahibi: ${input.ownerName}`
      : "",
    input.showSecondaryTitle && input.tagName
      ? `Etiket başlığı: ${input.tagName}`
      : "",
    "",
    `Gönderen: ${input.senderName || "-"}`,
    `Tercih edilen iletişim yolu: ${preferredMethodsText}`,
    showPhone && input.senderPhone ? `Telefon: ${input.senderPhone}` : "",
    showEmail && input.senderEmail ? `E-posta: ${input.senderEmail}` : "",
    whatsappLink ? `WhatsApp: ${whatsappLink}` : "",
    telLink ? `Ara: ${telLink}` : "",
    "",
    "Mesaj:",
    input.message || "-"
  ]
    .filter(Boolean)
    .join("\n");

  const result = await resend.emails.send({
    from,
    to: input.to,
    subject,
    html,
    text
  });

  if ("error" in result && result.error) {
    console.error("RESEND_SEND_ERROR", result.error);
    throw new Error("Mail gönderimi başarısız.");
  }

  console.log("RESEND_SEND_SUCCESS", result);
}