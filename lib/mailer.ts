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
  return phone.replace(/[^\d+]/g, "");
}

function buildWhatsAppLink(phone: string, senderName: string, tagCode: string) {
  const normalized = normalizePhoneForLinks(phone);
  if (!normalized) return "";

  const text = `Merhaba ${senderName}, Dokuntag ${tagCode} mesajınız için size ulaşıyorum.`;
  return `https://wa.me/${encodeURIComponent(
    normalized.replace(/^\+/, "")
  )}?text=${encodeURIComponent(text)}`;
}

function buildSmsLink(phone: string, senderName: string, tagCode: string) {
  const normalized = normalizePhoneForLinks(phone);
  if (!normalized) return "";

  const body = `Merhaba ${senderName}, Dokuntag ${tagCode} mesajınız için size ulaşıyorum.`;
  return `sms:${normalized}?body=${encodeURIComponent(body)}`;
}

function buildMailtoLink(email: string, senderName: string, tagCode: string) {
  if (!email) return "";

  const subject = `Dokuntag ${tagCode} mesajınız hakkında`;
  const body = `Merhaba ${senderName}, Dokuntag ${tagCode} mesajınız için size ulaşıyorum.`;
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

export async function sendOwnerNotification(input: {
  to: string;
  tagCode: string;
  ownerName: string;
  petName: string;
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  preferredContactMethods: string[];
  message: string;
}) {
  const from = getEnv("EMAIL_FROM");

  if (!from) {
    throw new Error("EMAIL_FROM eksik");
  }

  const subject = `Dokuntag mesajı - ${input.tagCode}`;

  const preferredMethodsText =
    input.preferredContactMethods.length > 0
      ? input.preferredContactMethods.join(", ")
      : "-";

  const whatsappLink = input.preferredContactMethods.includes("whatsapp")
    ? buildWhatsAppLink(input.senderPhone, input.senderName, input.tagCode)
    : "";

  const smsLink = input.preferredContactMethods.includes("phone")
    ? buildSmsLink(input.senderPhone, input.senderName, input.tagCode)
    : "";

  const mailtoLink = input.preferredContactMethods.includes("email")
    ? buildMailtoLink(input.senderEmail, input.senderName, input.tagCode)
    : "";

  const actionButtons: string[] = [];

  if (whatsappLink) {
    actionButtons.push(`
      <a href="${whatsappLink}" style="display:inline-block; margin:6px 8px 6px 0; padding:10px 14px; border-radius:8px; background:#111; color:#fff; text-decoration:none;">
        WhatsApp ile yanıtla
      </a>
    `);
  }

  if (smsLink) {
    actionButtons.push(`
      <a href="${smsLink}" style="display:inline-block; margin:6px 8px 6px 0; padding:10px 14px; border-radius:8px; background:#111; color:#fff; text-decoration:none;">
        Mesaj gönder
      </a>
    `);
  }

  if (mailtoLink) {
    actionButtons.push(`
      <a href="${mailtoLink}" style="display:inline-block; margin:6px 8px 6px 0; padding:10px 14px; border-radius:8px; background:#111; color:#fff; text-decoration:none;">
        Email gönder
      </a>
    `);
  }

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <h2>Dokuntag etiketiniz için yeni bir mesaj var</h2>

      <p><strong>Etiket:</strong> ${escapeHtml(input.tagCode)}</p>
      <p><strong>Ad:</strong> ${escapeHtml(input.petName || "-")}</p>
      <p><strong>Profil sahibi:</strong> ${escapeHtml(input.ownerName || "-")}</p>

      <hr style="margin:20px 0;" />

      <p><strong>Gönderen:</strong> ${escapeHtml(input.senderName)}</p>
      <p><strong>Tercih edilen iletişim yolu:</strong> ${escapeHtml(
        preferredMethodsText
      )}</p>
      <p><strong>Telefon:</strong> ${escapeHtml(input.senderPhone || "-")}</p>
      <p><strong>Email:</strong> ${escapeHtml(input.senderEmail || "-")}</p>

      ${
        actionButtons.length > 0
          ? `
        <div style="margin: 18px 0;">
          <p><strong>Hızlı yanıt:</strong></p>
          ${actionButtons.join("")}
        </div>
      `
          : ""
      }

      <p><strong>Mesaj:</strong></p>
      <div style="white-space: pre-wrap; border:1px solid #ddd; padding:12px; border-radius:8px;">
        ${escapeHtml(input.message)}
      </div>
    </div>
  `;

  const text = [
    "Dokuntag etiketiniz için yeni bir mesaj var.",
    "",
    `Etiket: ${input.tagCode}`,
    `Ad: ${input.petName || "-"}`,
    `Profil sahibi: ${input.ownerName || "-"}`,
    "",
    `Gönderen: ${input.senderName}`,
    `Tercih edilen iletişim yolu: ${preferredMethodsText}`,
    `Telefon: ${input.senderPhone || "-"}`,
    `Email: ${input.senderEmail || "-"}`,
    whatsappLink ? `WhatsApp linki: ${whatsappLink}` : "",
    smsLink ? `Mesaj linki: ${smsLink}` : "",
    mailtoLink ? `Email linki: ${mailtoLink}` : "",
    "",
    "Mesaj:",
    input.message
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
    throw new Error(
      typeof result.error === "object" && result.error !== null && "message" in result.error
        ? String(result.error.message)
        : "Mail gönderimi başarısız."
    );
  }

  console.log("RESEND_SEND_SUCCESS", result);
}