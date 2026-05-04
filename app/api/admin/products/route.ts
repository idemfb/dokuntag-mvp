import { NextResponse } from "next/server";
import { readTagsAsync } from "@/lib/tags";

function normalizeStatus(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const statusFilter = normalizeStatus(searchParams.get("status"));
    const isTest = searchParams.get("test") === "1";

    const tags = await readTagsAsync();

    let items = tags.map((tag) => ({
      code: tag.code,
      status: tag.status || "unclaimed",
      isTest: !!tag.isTest,
      name: tag.profile?.name || tag.profile?.petName || "",
      ownerName: tag.profile?.ownerName || "",
      packed: Boolean(tag.packed),
      shipmentStatus: tag.shipmentStatus || "ready",
      customerName: tag.customerName || "",
      customerPhone: tag.customerPhone || "",
      customerAddress: tag.customerAddress || "",
      orderNo: tag.orderNo || "",
      packedAt: tag.packedAt || "",
      shippedAt: tag.shippedAt || "",
    }));

    if (statusFilter) {
      items = items.filter((item) => item.status === statusFilter);
    }

    if (isTest) {
      items = items.filter((item) => item.isTest);
    }

    items = items.sort((a, b) =>
      a.code.localeCompare(b.code, "tr")
    );

    return NextResponse.json({
      success: true,
      count: items.length,
      items
    });
  } catch (error) {
    console.error("ADMIN_PRODUCTS_ERROR", error);

    return NextResponse.json(
      { success: false, error: "Ürünler alınamadı." },
      { status: 500 }
    );
  }
}