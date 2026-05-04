import { NextRequest, NextResponse } from "next/server";
import { generateUniqueCode } from "@/lib/code";
import { readDBAsync, writeDBAsync } from "@/lib/db";
import { findTagByCodeAsync, updateTagStatusByCodeAsync, upsertTagAsync } from "@/lib/tags";

type BatchItem = {
  code: string;
  label: string;
  setupLink: string;
  qrPageLink: string;
  qrDownloadLink: string;
  status?: "production_hold" | "unclaimed" | "active" | "inactive" | "void";
};

type DesignState = Record<string, string | number | boolean>;

function getBaseUrl(request: NextRequest) {
  const envBaseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "";

  if (envBaseUrl) {
    return envBaseUrl.replace(/\/+$/, "");
  }

  return request.nextUrl.origin.replace(/\/+$/, "");
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSpecialCode(value: unknown) {
  return getString(value).toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function getSafeLabelTemplate(value: string) {
  return value.trim().slice(0, 24);
}

function buildLabel(labelTemplate: string, code: string, index: number) {
  if (!labelTemplate) {
    return code;
  }

  const safeTemplate = getSafeLabelTemplate(labelTemplate);
  const nextNumber = String(index + 1).padStart(3, "0");
  return `${safeTemplate}-${nextNumber}`.slice(0, 32);
}

function buildDesignQuery(design?: DesignState) {
  const params = new URLSearchParams();

  if (!design) return "";

  Object.entries(design).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });

  return params.toString();
}

function buildItem({
  baseUrl,
  code,
  label,
  designQuery
}: {
  baseUrl: string;
  code: string;
  label: string;
  designQuery: string;
}): BatchItem {
  const query = designQuery ? `?${designQuery}` : "";

  return {
    code,
    label,
    setupLink: `${baseUrl}/t/${code}`,
    qrPageLink: `${baseUrl}/qr/${code}${query}`,
    qrDownloadLink: `${baseUrl}/api/qr-download/${code}${query}`,
    status: "production_hold"
  };
}

async function createProductionHoldTag(code: string) {
  await upsertTagAsync({
    code,
    productType: "item",
    tagName: code,
    petName: code,
    status: "production_hold",
    visibility: {
      showName: true,
      showPhone: false,
      showEmail: false,
      showCity: false,
      showAddressDetail: false,
      showPetName: true,
      showNote: false
    }
  });
}
function buildTestCode(index: number) {
  return `TEST${String(index).padStart(3, "0")}`;
}

function isTestCode(code: string) {
  return /^TEST\d{3}$/.test(code);
}

function createBlankTestProduct(code: string) {
  const now = new Date().toISOString();

  return {
    publicCode: code,
    manageToken: crypto.randomUUID(),
    productType: "item",
    productSubtype: "",
    name: code,
    ownerName: "",
    phone: "",
    email: "",
    city: "",
    addressDetail: "",
    distinctiveFeature: "",
    petName: code,
    note: "",
    alerts: [],
    allowDirectCall: false,
    allowDirectWhatsapp: false,
    status: "production_hold",
    isTest: true,
    createdAt: now,
    updatedAt: now,
    recovery: {
      phone: "",
      email: ""
    },
    visibility: {
      showName: true,
      showPhone: false,
      showEmail: false,
      showCity: false,
      showAddressDetail: false,
      showPetName: true,
      showNote: false
    },
    profile: {
      name: code,
      ownerName: "",
      phone: "",
      email: "",
      city: "",
      addressDetail: "",
      distinctiveFeature: "",
      petName: code,
      note: "",
      tagName: code
    },
    contactOptions: {
      allowDirectCall: false,
      allowDirectWhatsapp: false
    },
    showName: true,
    showPhone: false,
    showEmail: false,
    showCity: false,
    showAddressDetail: false,
    showPetName: true,
    showNote: false
  };
}

async function upsertTestPool(count: number) {
  const db = await readDBAsync();
  const products = Array.isArray(db?.products) ? db.products : [];
  const nextProducts = products.filter((item: any) => !item?.isTest);

  const testProducts = Array.from({ length: count }, (_, index) =>
    createBlankTestProduct(buildTestCode(index + 1))
  );

  await writeDBAsync({
    ...(db && typeof db === "object" ? db : {}),
    products: [...nextProducts, ...testProducts]
  });

  return testProducts;
}
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      count?: number;
      labelTemplate?: string;
      design?: DesignState;
      customCode?: string;
      action?: string;
    };

    const customCode = normalizeSpecialCode(body?.customCode);
    const count =
      typeof body?.count === "number" && Number.isFinite(body.count)
        ? Math.floor(body.count)
        : 0;

    const labelTemplate = getString(body?.labelTemplate);
    const baseUrl = getBaseUrl(request);
    const designQuery = buildDesignQuery(body.design);
    const items: BatchItem[] = [];

    const action = getString((body as { action?: string })?.action);
const actionCode = normalizeSpecialCode((body as { code?: string })?.code);

if (action === "release" || action === "void") {
  if (!actionCode) {
    return NextResponse.json({ error: "Kod zorunludur." }, { status: 400 });
  }

  const existing = await findTagByCodeAsync(actionCode);

  if (existing?.isTest && action === "release") {
    return NextResponse.json(
      {
        error:
          "Test kodları satışa/kuruluma açılamaz. Sadece sıfırlanabilir veya iptal edilebilir."
      },
      { status: 400 }
    );
  }

  const nextStatus = action === "release" ? "unclaimed" : "void";

  const updated = await updateTagStatusByCodeAsync({
    code: actionCode,
    status: nextStatus
  });

  if (!updated) {
    return NextResponse.json({ error: "Kod bulunamadı." }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    code: updated.code,
    status: updated.status
  });
}

if (action === "create-test-pool" || action === "reset-test-pool") {
  const testCount =
    typeof body?.count === "number" && Number.isFinite(body.count)
      ? Math.floor(body.count)
      : 200;

  const safeCount = Math.min(Math.max(testCount, 1), 200);
  const testProducts = await upsertTestPool(safeCount);

  const testItems = testProducts.map((item: any, index: number) =>
    buildItem({
      baseUrl,
      code: item.publicCode,
      label: `Test-${String(index + 1).padStart(3, "0")}`,
      designQuery
    })
  );

  return NextResponse.json({
    success: true,
    count: testItems.length,
    items: testItems
  });
}

    if (!count || count < 1) {
      return NextResponse.json(
        { error: "Adet en az 1 olmalıdır." },
        { status: 400 }
      );
    }

    if (count > 500) {
      return NextResponse.json(
        { error: "Tek seferde en fazla 500 kod üretilebilir." },
        { status: 400 }
      );
    }

    for (let i = 0; i < count; i += 1) {
      const code = generateUniqueCode();
      await createProductionHoldTag(code);

      items.push(
        buildItem({
          baseUrl,
          code,
          label: buildLabel(labelTemplate, code, i),
          designQuery
        })
      );
    }

    return NextResponse.json({ success: true, count: items.length, items });
  } catch (error) {
    console.error("GENERATE_BATCH_ERROR", error);

    return NextResponse.json(
      { error: "Toplu üretim sırasında hata oluştu." },
      { status: 500 }
    );
  }
}
