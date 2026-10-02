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

type ProductionBatchStatus =
  | "preparing"
  | "sent_to_print"
  | "received"
  | "checking"
  | "completed"
  | "archived";

type ProductionBatch = {
  id: string;
  name: string;
  status: ProductionBatchStatus;
  createdAt: string;
  updatedAt: string;
  sentToPrintAt?: string;
  receivedAt?: string;
  checkingAt?: string;
  completedAt?: string;
  archivedAt?: string;
  items: BatchItem[];
  history?: Array<{
  action: string;
  label: string;
  at: string;
}>;
};

function normalizeCode(value: unknown) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);
}

function normalizeBatchStatus(value: unknown): ProductionBatchStatus {
  if (value === "preparing") return "preparing";
  if (value === "sent_to_print") return "sent_to_print";
  if (value === "received") return "received";
  if (value === "checking") return "checking";
  if (value === "completed") return "completed";
  if (value === "archived") return "archived";

  // Eski kayıt uyumluluğu
  if (value === "printing") return "sent_to_print";

  return "preparing";
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
  const rows = Array.isArray(db?.productionBatches)
    ? db.productionBatches
    : [];

  return rows.map((batch: any) => {
    const status = normalizeBatchStatus(batch?.status);

    return {
      id: String(batch?.id || ""),
      name: String(batch?.name || "Üretim listesi"),
      status,
      createdAt: String(batch?.createdAt || new Date().toISOString()),
      updatedAt: String(batch?.updatedAt || batch?.createdAt || new Date().toISOString()),
      sentToPrintAt:
        batch?.sentToPrintAt ||
        (batch?.status === "printing" ? batch?.updatedAt || batch?.createdAt : undefined),
      receivedAt: batch?.receivedAt,
      checkingAt: batch?.checkingAt,
      completedAt: batch?.completedAt,
      archivedAt: batch?.archivedAt,
      items: normalizeItems(batch?.items),
      history: Array.isArray(batch?.history) ? batch.history : []
    };
  });
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

function getBatchStatusLabel(status: ProductionBatchStatus) {
  if (status === "preparing") return "Hazırlanıyor";
  if (status === "sent_to_print") return "Matbaaya gönderildi";
  if (status === "received") return "Matbaadan geldi";
  if (status === "checking") return "Kontrol ediliyor";
  if (status === "completed") return "Tamamlandı";
  if (status === "archived") return "Arşivlendi";
  return "Hazırlanıyor";
}

function getActionLabel(action: string) {
  if (action === "send_to_print") return "Matbaaya gönderildi";
  if (action === "mark_received") return "Matbaadan geldi";
  if (action === "start_checking") return "Kontrole alındı";
  if (action === "complete") return "Tamamlandı";
  if (action === "archive") return "Arşivlendi";
  if (action === "rename") return "Yeniden adlandırıldı";
  if (action === "remove_item") return "Ürün listeden çıkarıldı";
  return "İşlem yapıldı";
}

function appendHistory(batch: ProductionBatch, action: string, at: string) {
  return {
    ...(batch as any),
    history: [
      ...(Array.isArray((batch as any).history) ? (batch as any).history : []),
      {
        action,
        label: getActionLabel(action),
        at
      }
    ]
  };
}

function enrichBatch(batch: ProductionBatch, liveItems: BatchItem[]) {
  const summary = summarize(liveItems);

  return {
    ...batch,
    items: liveItems,
    summary,
    statusLabel: getBatchStatusLabel(batch.status),
    isLocked:
      batch.status === "sent_to_print" ||
      batch.status === "received" ||
      batch.status === "checking" ||
      batch.status === "completed" ||
      batch.status === "archived",
    canEdit: batch.status === "preparing",
    canSendToPrint: batch.status === "preparing",
    canMarkReceived: batch.status === "sent_to_print",
    canStartChecking: batch.status === "received",
    canComplete: batch.status === "checking",
    canArchive: batch.status === "completed"
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

        return enrichBatch(batch, liveItems);
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
          error: `Bu kodlar zaten üretim listesinde: ${duplicateCodes
            .slice(0, 10)
            .join(", ")}`
        },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();

    const batch: ProductionBatch = {
      id: `BATCH-${now.slice(0, 10).replaceAll("-", "")}-${String(
        batches.length + 1
      ).padStart(3, "0")}`,
      name: batchName,
      status: "preparing",
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
      batch: enrichBatch(batch, batch.items),
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
export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      id?: string;
      action?:
        | "send_to_print"
        | "mark_received"
        | "start_checking"
        | "complete"
        | "archive"
        | "rename"
        | "remove_item";
      name?: string;
      code?: string;
    };

    const id = String(body.id || "").trim();
    const action = body.action;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Batch ID zorunlu." },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { success: false, error: "İşlem zorunlu." },
        { status: 400 }
      );
    }

    const db = await readDBAsync();
    const batches = getBatches(db);
    const now = new Date().toISOString();
    const products = Array.isArray(db?.products) ? db.products : [];

    const liveStatusByCode = new Map<string, string>(
      products.map((item: any) => [
        normalizeCode(item.publicCode),
        String(item.status || "production_hold")
      ])
    );

    const nextBatches = batches.map((batch) => {
      if (batch.id !== id) return batch;

      if (action === "rename") {
        if (batch.status !== "preparing") {
          throw new Error("Sadece hazırlık aşamasındaki liste yeniden adlandırılabilir.");
        }

        const nextName = String(body.name || "").trim().slice(0, 80);

        if (!nextName) {
          throw new Error("Liste adı boş olamaz.");
        }

        return appendHistory(
          {
            ...batch,
            name: nextName,
            updatedAt: now
          },
          action,
          now
        );
      }

      if (action === "remove_item") {
  if (batch.status !== "preparing") {
    throw new Error("Sadece hazırlık aşamasındaki listeden ürün çıkarılabilir.");
  }

  const removeCode = normalizeCode(body.code);

  if (!removeCode) {
    throw new Error("Çıkarılacak ürün kodu zorunlu.");
  }

  const nextItems = (batch.items || []).filter(
    (item) => normalizeCode(item.code) !== removeCode
  );

  if (nextItems.length === batch.items.length) {
    throw new Error("Bu kod üretim listesinde bulunamadı.");
  }

  if (!nextItems.length) {
    throw new Error("Üretim listesi boş bırakılamaz.");
  }

  return appendHistory(
    {
      ...batch,
      items: nextItems,
      updatedAt: now
    },
    action,
    now
  );
}

      if (action === "send_to_print") {
        if (batch.status !== "preparing") {
          throw new Error("Sadece hazırlık aşamasındaki liste matbaaya gönderilebilir.");
        }

        return appendHistory(
          {
            ...batch,
            status: "sent_to_print" as const,
            sentToPrintAt: now,
            updatedAt: now
          },
          action,
          now
        );
      }

      if (action === "mark_received") {
        if (batch.status !== "sent_to_print") {
          throw new Error("Sadece matbaaya gönderilen liste matbaadan geldi olarak işaretlenebilir.");
        }

        return appendHistory(
          {
            ...batch,
            status: "received" as const,
            receivedAt: now,
            updatedAt: now
          },
          action,
          now
        );
      }

      if (action === "start_checking") {
        if (batch.status !== "received") {
          throw new Error("Sadece matbaadan gelen liste kontrole alınabilir.");
        }

        return appendHistory(
          {
            ...batch,
            status: "checking" as const,
            checkingAt: now,
            updatedAt: now
          },
          action,
          now
        );
      }

      if (action === "complete") {
  if (batch.status !== "checking") {
    throw new Error("Sadece kontrol edilen liste tamamlanabilir.");
  }

  const pendingCodes = (batch.items || [])
    .map((item) => normalizeCode(item.code))
    .filter((code) => {
      const liveStatus = liveStatusByCode.get(code);
      const fallbackStatus =
        (batch.items || []).find((item) => normalizeCode(item.code) === code)?.status ||
        "production_hold";

      const status = liveStatus || fallbackStatus;

      return status === "production_hold";
    });

  if (pendingCodes.length) {
    throw new Error(
      `${pendingCodes.length} ürün hâlâ kontrol bekliyor. Önce QR/NFC eşleştirme ile kontrolü tamamlayın. İlk kodlar: ${pendingCodes
        .slice(0, 10)
        .join(", ")}`
    );
  }

  return appendHistory(
    {
      ...batch,
      status: "completed" as const,
      completedAt: now,
      updatedAt: now
    },
    action,
    now
  );
}

      if (action === "archive") {
        if (batch.status !== "completed") {
          throw new Error("Sadece tamamlanan liste arşivlenebilir.");
        }

        return appendHistory(
          {
            ...batch,
            status: "archived" as const,
            archivedAt: now,
            updatedAt: now
          },
          action,
          now
        );
      }

      throw new Error("Geçersiz işlem.");
    });

    const updatedBatch = nextBatches.find((batch) => batch.id === id) || null;

    if (!updatedBatch) {
      return NextResponse.json(
        { success: false, error: "Üretim listesi bulunamadı." },
        { status: 404 }
      );
    }

    await writeDBAsync({
      ...(db && typeof db === "object" ? db : {}),
      productionBatches: nextBatches
    });

    return NextResponse.json({
      success: true,
      batch: updatedBatch,
      summary: summarize(updatedBatch.items)
    });
  } catch (error) {
    console.error("ADMIN_PRODUCTION_BATCHES_PATCH_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Üretim listesi güncellenemedi."
      },
      { status: 500 }
    );
  }
}