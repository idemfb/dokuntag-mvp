import { readDB, writeDB } from "@/lib/db";

export type ProductType = "pet" | "item" | "key" | "person";

export type TagRecord = {
  publicCode: string;
  oldCode?: string;
  manageToken: string;
  productType?: ProductType;
  name?: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  petName?: string;
  note?: string;
  alerts?: string[];
  allowDirectCall?: boolean;
  allowDirectWhatsapp?: boolean;
  status?: "unclaimed" | "active";
  createdAt?: string;
  updatedAt?: string;
  recovery?: {
    phone?: string;
    email?: string;
  };
};

export type TagView = {
  code: string;
  oldCode?: string;
  manageToken: string;
  status: "unclaimed" | "active";
  productType: ProductType;
  profile: {
    name: string;
    ownerName?: string;
    phone: string;
    email: string;
    petName: string;
    note: string;
    tagName?: string;
  };
  alerts: string[];
  visibility: {
    showName: boolean;
    showPhone: boolean;
    showEmail: boolean;
    showPetName: boolean;
    showNote: boolean;
    allowPhone?: boolean;
    allowEmail?: boolean;
    allowWhatsapp?: boolean;
    allowDirectSms?: boolean;
    allowDirectEmail?: boolean;
  };
  contactOptions: {
    allowDirectCall: boolean;
    allowDirectWhatsapp: boolean;
  };
  recovery: {
    phone: string;
    email: string;
  };
};

type UpsertTagInput = {
  code: string;
  productType?: ProductType;
  tagName?: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  petName?: string;
  note?: string;
  alerts?: string[];
  allowDirectCall?: boolean;
  allowDirectWhatsapp?: boolean;
  recoveryPhone?: string;
  recoveryEmail?: string;
  status?: "unclaimed" | "active";
};

type UpdateByManageTokenInput = {
  manageToken: string;
  productType?: ProductType;
  tagName?: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  petName?: string;
  note?: string;
  alerts?: string[];
  allowPhone?: boolean;
  allowEmail?: boolean;
  allowWhatsapp?: boolean;
  allowDirectSms?: boolean;
  allowDirectEmail?: boolean;
  allowDirectCall?: boolean;
  allowDirectWhatsapp?: boolean;
  recoveryPhone?: string;
  recoveryEmail?: string;
  status?: "unclaimed" | "active";
};

function getProducts(): TagRecord[] {
  const db = readDB();
  return Array.isArray(db.products) ? db.products : [];
}

function saveProducts(products: TagRecord[]) {
  const db = readDB();
  db.products = products;
  writeDB(db);
}

function normalizeCode(value: string) {
  return String(value || "").trim().toUpperCase();
}

function normalizeValue(value: string) {
  return String(value || "").trim().toLowerCase();
}

function mapProductToTagView(product: TagRecord): TagView {
  return {
    code: product.publicCode,
    oldCode: product.oldCode,
    manageToken: product.manageToken,
    status: product.status === "active" ? "active" : "unclaimed",
    productType: product.productType || "item",
    profile: {
      name: product.name || "",
      ownerName: product.ownerName || "",
      phone: product.phone || "",
      email: product.email || "",
      petName: product.petName || product.name || "",
      note: product.note || "",
      tagName: product.name || ""
    },
    alerts: Array.isArray(product.alerts) ? product.alerts : [],
    visibility: {
      showName: true,
      showPhone: true,
      showEmail: true,
      showPetName: true,
      showNote: true,
      allowPhone: Boolean(product.allowDirectCall),
      allowEmail: Boolean(product.email),
      allowWhatsapp: Boolean(product.allowDirectWhatsapp),
      allowDirectSms: false,
      allowDirectEmail: false
    },
    contactOptions: {
      allowDirectCall: Boolean(product.allowDirectCall),
      allowDirectWhatsapp: Boolean(product.allowDirectWhatsapp)
    },
    recovery: {
      phone: product.recovery?.phone || "",
      email: product.recovery?.email || ""
    }
  };
}

export function readTags(): TagView[] {
  return getProducts().map(mapProductToTagView);
}

export function getAllTags(): TagView[] {
  return readTags();
}

export function findTagByCode(code: string): TagView | null {
  const normalized = normalizeCode(code);
  if (!normalized) return null;

  const product = getProducts().find((item) => {
    return (
      normalizeCode(item.publicCode) === normalized ||
      normalizeCode(item.oldCode || "") === normalized
    );
  });

  return product ? mapProductToTagView(product) : null;
}

export function findTagByManageToken(token: string): TagView | null {
  const normalized = String(token || "").trim();
  if (!normalized) return null;

  const product = getProducts().find((item) => {
    return String(item.manageToken || "").trim() === normalized;
  });

  return product ? mapProductToTagView(product) : null;
}

export function validateManageToken(codeOrToken: string, maybeToken?: string) {
  const products = getProducts();

  // 1) Sadece token geldiyse
  if (maybeToken === undefined) {
    const token = String(codeOrToken || "").trim();

    if (!token) return null;

    const product = products.find((item) => {
      return String(item.manageToken || "").trim() === token;
    });

    return product ? mapProductToTagView(product) : null;
  }

  // 2) code + token geldiyse
  const code = normalizeCode(codeOrToken);
  const token = String(maybeToken || "").trim();

  if (!code || !token) return null;

  const product = products.find((item) => {
    const sameCode =
      normalizeCode(item.publicCode) === code ||
      normalizeCode(item.oldCode || "") === code;

    const sameToken = String(item.manageToken || "").trim() === token;

    return sameCode && sameToken;
  });

  return product ? mapProductToTagView(product) : null;
}

export function upsertTag(input: UpsertTagInput) {
  const normalizedCode = normalizeCode(input.code);
  if (!normalizedCode) {
    throw new Error("Code zorunlu");
  }

  const products = getProducts();

  const index = products.findIndex((item) => {
    return normalizeCode(item.publicCode) === normalizedCode;
  });

  const now = new Date().toISOString();

  if (index === -1) {
    const newProduct: TagRecord = {
      publicCode: normalizedCode,
      manageToken: crypto.randomUUID(),
      productType: input.productType || "item",
      name: input.tagName || "",
      ownerName: input.ownerName || "",
      phone: input.phone || "",
      email: input.email || "",
      petName: input.petName || "",
      note: input.note || "",
      alerts: Array.isArray(input.alerts) ? input.alerts : [],
      allowDirectCall: Boolean(input.allowDirectCall),
      allowDirectWhatsapp: Boolean(input.allowDirectWhatsapp),
      status: input.status || "active",
      createdAt: now,
      updatedAt: now,
      recovery: {
        phone: input.recoveryPhone || "",
        email: input.recoveryEmail || ""
      }
    };

    products.push(newProduct);
    saveProducts(products);
    return mapProductToTagView(newProduct);
  }

  const current = products[index];

  products[index] = {
    ...current,
    productType: input.productType ?? current.productType ?? "item",
    name: input.tagName ?? current.name ?? "",
    ownerName: input.ownerName ?? current.ownerName ?? "",
    phone: input.phone ?? current.phone ?? "",
    email: input.email ?? current.email ?? "",
    petName: input.petName ?? current.petName ?? "",
    note: input.note ?? current.note ?? "",
    alerts: Array.isArray(input.alerts) ? input.alerts : (current.alerts ?? []),
    allowDirectCall:
      input.allowDirectCall !== undefined
        ? Boolean(input.allowDirectCall)
        : Boolean(current.allowDirectCall),
    allowDirectWhatsapp:
      input.allowDirectWhatsapp !== undefined
        ? Boolean(input.allowDirectWhatsapp)
        : Boolean(current.allowDirectWhatsapp),
    status: input.status ?? current.status ?? "active",
    updatedAt: now,
    recovery: {
      phone: input.recoveryPhone ?? current.recovery?.phone ?? "",
      email: input.recoveryEmail ?? current.recovery?.email ?? ""
    }
  };

  saveProducts(products);
  return mapProductToTagView(products[index]);
}

export function updateTagByManageToken(input: UpdateByManageTokenInput) {
  const normalizedToken = String(input.manageToken || "").trim();
  if (!normalizedToken) {
    throw new Error("manageToken zorunlu");
  }

  const products = getProducts();
  const index = products.findIndex((item) => {
    return String(item.manageToken || "").trim() === normalizedToken;
  });

  if (index === -1) {
    return null;
  }

  const current = products[index];
  const now = new Date().toISOString();

  const resolvedAllowDirectCall =
    input.allowDirectCall !== undefined
      ? Boolean(input.allowDirectCall)
      : input.allowPhone !== undefined
        ? Boolean(input.allowPhone)
        : Boolean(current.allowDirectCall);

  const resolvedAllowDirectWhatsapp =
    input.allowDirectWhatsapp !== undefined
      ? Boolean(input.allowDirectWhatsapp)
      : input.allowWhatsapp !== undefined
        ? Boolean(input.allowWhatsapp)
        : Boolean(current.allowDirectWhatsapp);

  products[index] = {
    ...current,
    productType: input.productType ?? current.productType ?? "item",
    name: input.tagName ?? current.name ?? "",
    ownerName: input.ownerName ?? current.ownerName ?? "",
    phone: input.phone ?? current.phone ?? "",
    email: input.email ?? current.email ?? "",
    petName: input.petName ?? current.petName ?? "",
    note: input.note ?? current.note ?? "",
    alerts: Array.isArray(input.alerts) ? input.alerts : (current.alerts ?? []),
    allowDirectCall: resolvedAllowDirectCall,
    allowDirectWhatsapp: resolvedAllowDirectWhatsapp,
    status: input.status ?? current.status ?? "active",
    updatedAt: now,
    recovery: {
      phone: input.recoveryPhone ?? current.recovery?.phone ?? current.phone ?? "",
      email: input.recoveryEmail ?? current.recovery?.email ?? current.email ?? ""
    }
  };

  saveProducts(products);
  return mapProductToTagView(products[index]);
}

export function recoverManageAccess(input: {
  code: string;
  phone?: string;
  email?: string;
}) {
  const normalizedCodeInput = normalizeCode(input.code);
  const normalizedPhoneInput = normalizeValue(input.phone || "");
  const normalizedEmailInput = normalizeValue(input.email || "");

  if (!normalizedCodeInput) {
    return null;
  }

  const products = getProducts();

  const index = products.findIndex((item) => {
    const sameCode =
      normalizeCode(item.publicCode) === normalizedCodeInput ||
      normalizeCode(item.oldCode || "") === normalizedCodeInput;

    if (!sameCode) return false;

    const recoveryPhone = normalizeValue(item.recovery?.phone || "");
    const recoveryEmail = normalizeValue(item.recovery?.email || "");
    const profilePhone = normalizeValue(item.phone || "");
    const profileEmail = normalizeValue(item.email || "");

    const phoneMatched =
      Boolean(normalizedPhoneInput) &&
      (normalizedPhoneInput === recoveryPhone ||
        normalizedPhoneInput === profilePhone);

    const emailMatched =
      Boolean(normalizedEmailInput) &&
      (normalizedEmailInput === recoveryEmail ||
        normalizedEmailInput === profileEmail);

    return phoneMatched || emailMatched;
  });

  if (index === -1) {
    return null;
  }

  const current = products[index];
  const newManageToken = crypto.randomUUID();

  products[index] = {
    ...current,
    manageToken: newManageToken,
    updatedAt: new Date().toISOString()
  };

  saveProducts(products);

  return {
    success: true,
    code: products[index].publicCode,
    manageToken: newManageToken,
    managePath: `/manage/${products[index].publicCode}?token=${newManageToken}`,
    manageLink: `http://localhost:3000/manage/${products[index].publicCode}?token=${newManageToken}`
  };
}