import { NextResponse } from "next/server";
import { updateShipmentByCodeAsync } from "@/lib/tags";

type ShipmentStatus = "ready" | "packed" | "shipped";

type Body = {
  code?: string;
  packed?: boolean;
  shipmentStatus?: ShipmentStatus;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  orderNo?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const code = String(body.code || "").trim().toUpperCase();
    const shipmentStatus = body.shipmentStatus || "packed";

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Kod zorunlu." },
        { status: 400 }
      );
    }

    if (shipmentStatus === "packed") {
      if (!String(body.customerName || "").trim()) {
        return NextResponse.json(
          { success: false, error: "Müşteri adı zorunlu." },
          { status: 400 }
        );
      }

      if (
        !String(body.customerPhone || "").trim() &&
        !String(body.orderNo || "").trim()
      ) {
        return NextResponse.json(
          { success: false, error: "Telefon veya sipariş numarası zorunlu." },
          { status: 400 }
        );
      }

      if (!String(body.customerAddress || "").trim()) {
        return NextResponse.json(
          { success: false, error: "Kargo adresi zorunlu." },
          { status: 400 }
        );
      }
    }

    const updated = await updateShipmentByCodeAsync({
      code,
      packed: Boolean(body.packed),
      shipmentStatus,
      customerName: String(body.customerName || "").trim(),
      customerPhone: String(body.customerPhone || "").trim(),
      customerAddress: String(body.customerAddress || "").trim(),
      orderNo: String(body.orderNo || "").trim()
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Ürün bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      item: updated
    });
  } catch (error) {
    console.error("ADMIN_MARK_PACKED_ERROR", error);

    return NextResponse.json(
      { success: false, error: "Kargo durumu güncellenemedi." },
      { status: 500 }
    );
  }
}