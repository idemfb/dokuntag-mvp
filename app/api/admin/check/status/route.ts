import { NextResponse } from "next/server";
import { findTagByCodeAsync, updateTagStatusByCodeAsync } from "@/lib/tags";

function normalizeCode(value: unknown) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code = normalizeCode(body.code);
    const action = body.action;

    if (!code || !action) {
      return NextResponse.json({ error: "Eksik veri" }, { status: 400 });
    }

    const tag = await findTagByCodeAsync(code);

    if (!tag) {
      return NextResponse.json({ error: "Kod bulunamadı" }, { status: 404 });
    }
    if (tag.status !== "production_hold") {
  return NextResponse.json(
    { error: "Sadece üretim kontrol bekleyen ürünlerde işlem yapılabilir." },
    { status: 400 }
  );
}
    if (tag.isTest && action === "release") {
      return NextResponse.json(
        { error: "Test kodları aktif edilemez" },
        { status: 400 }
      );
    }

    const nextStatus =
      action === "release" ? "unclaimed" :
      action === "void" ? "void" :
      null;

    if (!nextStatus) {
      return NextResponse.json({ error: "Geçersiz işlem" }, { status: 400 });
    }

    const updated = await updateTagStatusByCodeAsync({
      code,
      status: nextStatus
    });

    return NextResponse.json({
      success: true,
      status: updated?.status
    });

  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}