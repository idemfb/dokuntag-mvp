import { NextRequest, NextResponse } from "next/server";
import { findTagByCode, upsertTag } from "@/lib/tags";

type SetupBody = {
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

type RouteContext = {
  params: Promise<{
    code: string;
  }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { code } = await context.params;
    const normalizedCode = String(code ?? "").trim().toUpperCase();

    const tag = findTagByCode(normalizedCode);

    if (!tag) {
      return NextResponse.json(
        { ok: false, error: "Etiket bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      tag,
    });
  } catch (error) {
    console.error("SETUP_CODE_GET_ERROR", error);

    return NextResponse.json(
      { ok: false, error: "Veri alınamadı." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { code } = await context.params;
    const normalizedCode = String(code ?? "").trim().toUpperCase();

    const existing = findTagByCode(normalizedCode);

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Etiket bulunamadı." },
        { status: 404 }
      );
    }

    const body = (await req.json()) as SetupBody;

    const saved = upsertTag({
      code: normalizedCode,

      // 🔥 DÜZELTME BURASI
      tagName: body.tagName,
      ownerName: body.ownerName,
      phone: body.phone,
      email: body.email,
      note: body.note,

      allowDirectCall: body.allowPhone,
      allowDirectWhatsapp: body.allowWhatsapp,

      recoveryPhone: body.phone,
      recoveryEmail: body.email,

      status: "active"
    });

    return NextResponse.json({
      ok: true,
      tag: saved,
    });
  } catch (error) {
    console.error("SETUP_CODE_PUT_ERROR", error);

    return NextResponse.json(
      { ok: false, error: "Güncelleme sırasında hata oluştu." },
      { status: 500 }
    );
  }
}