import { NextRequest, NextResponse } from "next/server";
import { upsertTag } from "@/lib/tags";

type SetupBody = {
  code?: string;
  tagName?: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  note?: string;
  allowPhone?: boolean;
  allowEmail?: boolean;
  allowWhatsapp?: boolean;
  allowDirectSms?: boolean;
  allowDirectEmail?: boolean;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SetupBody;

    const code = String(body.code ?? "").trim().toUpperCase();

    if (!code) {
      return NextResponse.json(
        { ok: false, error: "Kod gerekli." },
        { status: 400 }
      );
    }

    const saved = upsertTag({
      code,
      profile: {
        tagName: String(body.tagName ?? "").trim(),
        ownerName: String(body.ownerName ?? "").trim(),
        phone: String(body.phone ?? "").trim(),
        email: String(body.email ?? "").trim(),
        note: String(body.note ?? "").trim(),
      },
      visibility: {
        allowPhone: Boolean(body.allowPhone),
        allowEmail: Boolean(body.allowEmail),
        allowWhatsapp: Boolean(body.allowWhatsapp),
        allowDirectSms: Boolean(body.allowDirectSms),
        allowDirectEmail: Boolean(body.allowDirectEmail),
      },
    });

    return NextResponse.json({
      ok: true,
      tag: saved,
    });
  } catch (error) {
    console.error("SETUP_POST_ERROR", error);

    return NextResponse.json(
      { ok: false, error: "Kayıt sırasında hata oluştu." },
      { status: 500 }
    );
  }
}