import { NextResponse } from "next/server";
import { Resend } from "resend";

function escapeHtml(value: string) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = getString(body?.name);
    const email = getString(body?.email).toLowerCase();
    const phone = getString(body?.phone);
    const note = getString(body?.note);
    const source = getString(body?.source) || "satis";

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Geçerli e-posta girin." },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;

    if (!apiKey || !from) {
      return NextResponse.json(
        { success: false, error: "E-posta servisi yapılandırılmamış." },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    const result = await resend.emails.send({
      from,
      to: "dokuntag@gmail.com",
      subject: "🔥 Yeni Talep (Dokuntag İlk Üretim)",
      html: `
        <h2>Yeni Dokuntag ilk üretim talebi</h2>
        <p><strong>Kaynak:</strong> ${escapeHtml(source)}</p>
        <p><strong>Ad:</strong> ${escapeHtml(name || "-")}</p>
        <p><strong>E-posta:</strong> ${escapeHtml(email)}</p>
        <p><strong>Telefon:</strong> ${escapeHtml(phone || "-")}</p>
        <p><strong>Not:</strong> ${escapeHtml(note || "-")}</p>
        <hr />
        <p>Bu kişi Dokuntag® ilk üretim hazır olduğunda haber almak istiyor.</p>
      `,
      text: [
        "Yeni Dokuntag ilk üretim talebi",
        "",
        `Kaynak: ${source}`,
        `Ad: ${name || "-"}`,
        `E-posta: ${email}`,
        `Telefon: ${phone || "-"}`,
        `Not: ${note || "-"}`,
      ].join("\n"),
    });

    if ("error" in result && result.error) {
      console.error("LEAD_EMAIL_ERROR", result.error);

      return NextResponse.json(
        { success: false, error: "Talep gönderilemedi." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Talebiniz alındı.",
    });
  } catch (error) {
    console.error("LEAD_POST_ERROR", error);

    return NextResponse.json(
      { success: false, error: "Talep alınamadı." },
      { status: 500 }
    );
  }
}