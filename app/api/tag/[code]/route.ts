import { NextResponse } from "next/server";
import { findTagByCodeAsync } from "@/lib/tags";

type RouteContext = {
  params: Promise<{
    code: string;
  }>;
};

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { code } = await context.params;
    const normalizedCode = String(code ?? "").trim().toUpperCase();

    if (!normalizedCode) {
      return NextResponse.json(
        { ok: false, error: "Kod gerekli." },
        { status: 400 }
      );
    }

    const tag = await findTagByCodeAsync(normalizedCode);

    if (!tag) {
      return NextResponse.json(
        { ok: false, error: "Etiket bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      tag
    });
  } catch (error) {
    console.error("TAG_GET_ERROR", error);

    return NextResponse.json(
      { ok: false, error: "Etiket bilgisi alınamadı." },
      { status: 500 }
    );
  }
}
