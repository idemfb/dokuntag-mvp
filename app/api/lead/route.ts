import { NextResponse } from "next/server";
import { Resend } from "resend";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || "").trim().toLowerCase();

    if (!email || !email.includes("@")) {
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
        <h2>Yeni ilk üretim talebi</h2>
        <p><strong>E-posta:</strong> ${escapeHtml(email)}</p>
        <p>Bu kişi Dokuntag® ilk üretim hazır olduğunda haber almak istiyor.</p>
      `,
      text: `Yeni ilk üretim talebi\nE-posta: ${email}`,
    });

    if ("error" in result && result.error) {
      return NextResponse.json(
        { success: false, error: "Talep gönderilemedi." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Talep alınamadı." },
      { status: 500 }
    );
  }
}