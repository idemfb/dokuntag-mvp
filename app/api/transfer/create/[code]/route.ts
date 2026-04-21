import { NextResponse } from "next/server";
import {
  createTransferByManageTokenAsync,
  validateManageTokenAsync
} from "@/lib/tags";

type Params = {
  params: Promise<{
    code: string;
  }>;
};

export async function POST(request: Request, { params }: Params) {
  try {
    const { code } = await params;
    const normalizedCode = String(code || "").trim().toUpperCase();
    const { searchParams, origin } = new URL(request.url);
    const token = searchParams.get("token") || "";
    const body = await request.json().catch(() => ({}));
    const expiresInHours =
      typeof body?.expiresInHours === "number" ? body.expiresInHours : 48;

    if (!token) {
      return NextResponse.json(
        { error: "Yönetim bağlantısı eksik." },
        { status: 400 }
      );
    }

    const existing = await validateManageTokenAsync(normalizedCode, token);

    if (!existing) {
      return NextResponse.json(
        { error: "Yönetim bağlantısı geçersiz veya süresi dolmuş." },
        { status: 401 }
      );
    }

    const created = await createTransferByManageTokenAsync({
      code: normalizedCode,
      manageToken: token,
      expiresInHours
    });

    if (!created) {
      return NextResponse.json(
        { error: "Devir linki oluşturulamadı." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      code: created.code,
      transferPath: created.transferPath,
      transferLink: `${origin}${created.transferPath}`,
      expiresAt: created.expiresAt,
      status: created.status,
      message:
        "Devir linki oluşturuldu. Ürün güvenlik için pasif duruma alındı."
    });
  } catch (error) {
    console.error("TRANSFER_CREATE_ERROR", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Devir linki oluşturulamadı."
      },
      { status: 500 }
    );
  }
}