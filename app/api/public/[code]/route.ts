import { NextRequest, NextResponse } from "next/server";
import { readDB } from "@/lib/db";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Code missing" },
        { status: 400 }
      );
    }

    const normalizedCode = String(code).trim().toUpperCase();

    const db = readDB();
    const products = Array.isArray(db.products) ? db.products : [];

    const product = products.find((p: any) => {
      return (
        String(p.publicCode || "").trim().toUpperCase() === normalizedCode ||
        String(p.oldCode || "").trim().toUpperCase() === normalizedCode
      );
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Profil bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        publicCode: product.publicCode,
        oldCode: product.oldCode || "",
        productType: product.productType || "item",
        name: product.name || "",
        ownerName: product.ownerName || "",
        phone: product.phone || "",
        email: product.email || "",
        note: product.note || "",
        alerts: Array.isArray(product.alerts) ? product.alerts : [],
        allowDirectCall: Boolean(product.allowDirectCall),
        allowDirectWhatsapp: Boolean(product.allowDirectWhatsapp),
        status: product.status || "unclaimed"
      }
    });
  } catch (error) {
    console.error("PUBLIC_PROFILE_GET_ERROR", error);

    return NextResponse.json(
      { success: false, message: "Public fetch failed" },
      { status: 500 }
    );
  }
}