import { NextRequest, NextResponse } from "next/server";
import { readDBAsync, writeDBAsync } from "@/lib/db";

type BatchItem = {
  code?: string;
  label?: string;
  setupLink?: string;
  qrPageLink?: string;
  qrDownloadLink?: string;
  status?: string;
};

type ProductionBatch = {
  id: string;
  name: string;
  status: "printing" | "received" | "completed";
  createdAt: string;
  updatedAt: string;
  items: BatchItem[];
};

function normalizeCode(value: unknown) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);
}

function normalizeItems(items: unknown): BatchItem[] {
  if (!Array.isArray(items)) return [];

  const seen = new Set<string>();

  return items
    .map((item) => {
      const row = item as BatchItem;
      const code = normalizeCode(row.code);
      if (!code || seen.has(code)) return null;

      seen.add(code);

      return {
        code,
        label: String(row.label || code),
        setupLink: String(row.setupLink || ""),
        qrPageLink: String(row.qrPageLink || ""),
        qrDownloadLink: String(row.qrDownloadLink || ""),
        status: String(row.status || "production_hold")
      };
    })
    .filter(Boolean) as BatchItem[];
}

function getBatches(db: any): ProductionBatch[] {
  return Array.isArray(db?.productionBatches) ? db.productionBatches : [];
}

function summarize(items: BatchItem[]) {
  return {
    total: items.length,
    production_hold: items.filter((item) => item.status === "production_hold").length,
    unclaimed: items.filter((item) => item.status === "unclaimed").length,
    active: items.filter((item) => item.status === "active").length,
    inactive: items.filter((item) => item.status === "inactive").length,
    void: items.filter((item) => item.status === "void").length
  };
}

export async function GET() {
  try {
    const db = await readDBAsync();
    const products = Array.isArray(db?.products) ? db.products : [];

const statusByCode = new Map<string, string>(
  products.map((item: any) => [
    normalizeCode(item.publicCode),
    String(item.status || "unclaimed")
  ])
);

const batches = getBatches(db)
  .map((batch) => {
const liveItems: BatchItem[] = (batch.items || []).map((item) => {
  const code = normalizeCode(item.code);

  return {
    ...item,
    code,
    status: String(statusByCode.get(code) || item.status || "production_hold")
  };
});

    return {
      ...batch,
      items: liveItems,
      summary: summarize(liveItems)
    };
  })
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

    return NextResponse.json({
      success: true,
      batches
    });
  } catch (error) {
    console.error("ADMIN_PRODUCTION_BATCHES_GET_ERROR", error);

    return NextResponse.json(
      { success: false, error: "Üretim listesi alınamadı." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: string;
      items?: BatchItem[];
    };

    const items = normalizeItems(body.items);

    if (!items.length) {
      return NextResponse.json(
        { success: false, error: "Üretime gönderilecek ürün listesi boş." },
        { status: 400 }
      );
    }

    const db = await readDBAsync();
    const batches = getBatches(db);
    const batchName = String(body.name || `Üretim ${batches.length + 1}`)
  .trim()
  .slice(0, 80);

const nameExists = batches.some(
  (batch) => batch.name.trim().toLowerCase() === batchName.toLowerCase()
);

if (nameExists) {
  return NextResponse.json(
    { success: false, error: "Bu isimle daha önce üretim listesi oluşturulmuş." },
    { status: 409 }
  );
}
    const existingCodes = new Set(
      batches.flatMap((batch) =>
        (batch.items || []).map((item) => normalizeCode(item.code))
      )
    );

    const duplicateCodes = items
      .map((item) => normalizeCode(item.code))
      .filter((code) => existingCodes.has(code));

    if (duplicateCodes.length) {
      return NextResponse.json(
        {
          success: false,
          error: `Bu kodlar zaten üretim listesinde: ${duplicateCodes.slice(0, 10).join(", ")}`
        },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const batch: ProductionBatch = {
      id: `BATCH-${now.slice(0, 10).replaceAll("-", "")}-${String(batches.length + 1).padStart(3, "0")}`,
      name: batchName,
      status: "printing",
      createdAt: now,
      updatedAt: now,
      items
    };

    await writeDBAsync({
      ...(db && typeof db === "object" ? db : {}),
      productionBatches: [batch, ...batches]
    });

    return NextResponse.json({
      success: true,
      batch,
      summary: summarize(batch.items)
    });
  } catch (error) {
    console.error("ADMIN_PRODUCTION_BATCHES_POST_ERROR", error);

    return NextResponse.json(
      { success: false, error: "Üretim listesi kaydedilemedi." },
      { status: 500 }
    );
  }
}