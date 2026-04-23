import { readDB, readDBAsync, writeDB, writeDBAsync } from "@/lib/db";

export type ProductType = "pet" | "item" | "key" | "person" | "other";
export type TagStatus = "unclaimed" | "active" | "inactive";
export type TransferStatus = "pending" | "used" | "expired" | "cancelled";
export type RecoveryEntryType = "my" | "recover";
export type RecoverySessionStatus = "pending" | "used" | "expired";

export type TagTransfer = {
  token?: string;
  status?: TransferStatus;
  createdAt?: string;
  expiresAt?: string;
  usedAt?: string;
  cancelledAt?: string;
  fromManageToken?: string;
};

export type RecoverySession = {
  token?: string;
  email?: string;
  entryType?: RecoveryEntryType;
  status?: RecoverySessionStatus;
  createdAt?: string;
  expiresAt?: string;
  usedAt?: string;
};

export type TagRecord = {
  publicCode: string;
  oldCode?: string;
  manageToken: string;
  productType?: ProductType;
  productSubtype?: string;
  name?: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  city?: string;
  addressDetail?: string;
  distinctiveFeature?: string;
  petName?: string;
  note?: string;
  alerts?: string[];
  allowDirectCall?: boolean;
  allowDirectWhatsapp?: boolean;
  status?: TagStatus;
  createdAt?: string;
  updatedAt?: string;
  recovery?: {
    phone?: string;
    email?: string;
  };
  recoverySession?: RecoverySession;
  visibility?: {
    showName?: boolean;
    showPhone?: boolean;
    showEmail?: boolean;
    showCity?: boolean;
    showAddressDetail?: boolean;
    showPetName?: boolean;
    showNote?: boolean;
  };

  profile?: {
    name?: string;
    ownerName?: string;
    phone?: string;
    email?: string;
    city?: string;
    addressDetail?: string;
    distinctiveFeature?: string;
    petName?: string;
    note?: string;
    tagName?: string;
  };

  contactOptions?: {
    allowDirectCall?: boolean;
    allowDirectWhatsapp?: boolean;
  };

  transfer?: TagTransfer;

  showName?: boolean;
  showPhone?: boolean;
  showEmail?: boolean;
  showCity?: boolean;
  showAddressDetail?: boolean;
  showPetName?: boolean;
  showNote?: boolean;
};

export type TagView = {
  code: string;
  oldCode?: string;
  manageToken: string;
  status: TagStatus;
  productType: ProductType;
  productSubtype?: string;
  profile: {
    name: string;
    ownerName?: string;
    phone: string;
    email: string;
    city: string;
    addressDetail: string;
    distinctiveFeature: string;
    petName: string;
    note: string;
    tagName?: string;
  };
  alerts: string[];
  visibility: {
    showName: boolean;
    showPhone: boolean;
    showEmail: boolean;
    showCity: boolean;
    showAddressDetail: boolean;
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
  transfer?: {
    token?: string;
    status?: TransferStatus | null;
    createdAt?: string;
    expiresAt?: string;
    usedAt?: string;
    cancelledAt?: string;
  };
};

export type RecoveryListedItem = {
  code: string;
  productType: ProductType;
  status: TagStatus;
  petName: string;
  ownerName?: string;
};

type UpsertTagInput = {
  code: string;
  productType?: ProductType;
  productSubtype?: string;
  tagName?: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  city?: string;
  addressDetail?: string;
  distinctiveFeature?: string;
  petName?: string;
  note?: string;
  alerts?: string[];
  allowDirectCall?: boolean;
  allowDirectWhatsapp?: boolean;
  recoveryPhone?: string;
  recoveryEmail?: string;
  status?: TagStatus;
  visibility?: {
    showName?: boolean;
    showPhone?: boolean;
    showEmail?: boolean;
    showCity?: boolean;
    showAddressDetail?: boolean;
    showPetName?: boolean;
    showNote?: boolean;
  };
  showName?: boolean;
  showPhone?: boolean;
  showEmail?: boolean;
  showCity?: boolean;
  showAddressDetail?: boolean;
  showPetName?: boolean;
  showNote?: boolean;
};

type UpdateByManageTokenInput = {
  manageToken: string;
  productType?: ProductType;
  productSubtype?: string;
  tagName?: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  city?: string;
  addressDetail?: string;
  distinctiveFeature?: string;
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
  status?: TagStatus;
  visibility?: {
    showName?: boolean;
    showPhone?: boolean;
    showEmail?: boolean;
    showCity?: boolean;
    showAddressDetail?: boolean;
    showPetName?: boolean;
    showNote?: boolean;
  };
  showName?: boolean;
  showPhone?: boolean;
  showEmail?: boolean;
  showCity?: boolean;
  showAddressDetail?: boolean;
  showPetName?: boolean;
  showNote?: boolean;
};

type ClaimTransferInput = {
  transferToken: string;
  productType?: ProductType;
  productSubtype?: string;
  tagName: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  city?: string;
  addressDetail?: string;
  distinctiveFeature?: string;
  petName: string;
  note?: string;
  alerts?: string[];
  allowDirectCall?: boolean;
  allowDirectWhatsapp?: boolean;
  recoveryPhone?: string;
  recoveryEmail?: string;
  visibility?: {
    showName?: boolean;
    showPhone?: boolean;
    showEmail?: boolean;
    showCity?: boolean;
    showAddressDetail?: boolean;
    showPetName?: boolean;
    showNote?: boolean;
  };
};

function getProducts(): TagRecord[] {
  const db = readDB();

  if (Array.isArray((db as { products?: TagRecord[] }).products)) {
    return (db as { products: TagRecord[] }).products;
  }

  if (Array.isArray(db)) {
    return db as unknown as TagRecord[];
  }

  return [];
}

function saveProducts(products: TagRecord[]) {
  const db = readDB();

  if (Array.isArray(db)) {
    writeDB(products as unknown as Record<string, unknown>);
    return;
  }

  const nextDb =
    db && typeof db === "object"
      ? { ...(db as Record<string, unknown>), products }
      : { products };

  writeDB(nextDb);
}

async function getProductsAsync(): Promise<TagRecord[]> {
  const db = await readDBAsync();

  if (Array.isArray((db as { products?: TagRecord[] }).products)) {
    return (db as { products: TagRecord[] }).products;
  }

  if (Array.isArray(db)) {
    return db as unknown as TagRecord[];
  }

  return [];
}

async function saveProductsAsync(products: TagRecord[]) {
  const db = await readDBAsync();

  if (Array.isArray(db)) {
    await writeDBAsync(products as unknown as Record<string, unknown>);
    return;
  }

  const nextDb =
    db && typeof db === "object"
      ? { ...(db as Record<string, unknown>), products }
      : { products };

  await writeDBAsync(nextDb);
}

function normalizeCode(value: string) {
  return String(value || "").trim().toUpperCase();
}

function normalizeValue(value: string) {
  return String(value || "").trim().toLowerCase();
}

function pickString(...values: Array<unknown>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function getProfileName(product: TagRecord) {
  return pickString(product.name, product.profile?.name, product.profile?.tagName);
}

function getOwnerName(product: TagRecord) {
  return pickString(product.ownerName, product.profile?.ownerName);
}

function getPhone(product: TagRecord) {
  return pickString(product.phone, product.profile?.phone);
}

function getEmail(product: TagRecord) {
  return pickString(product.email, product.profile?.email);
}

function getCity(product: TagRecord) {
  return pickString(product.city, product.profile?.city);
}

function getAddressDetail(product: TagRecord) {
  return pickString(product.addressDetail, product.profile?.addressDetail);
}

function getDistinctiveFeature(product: TagRecord) {
  return pickString(
    product.distinctiveFeature,
    product.profile?.distinctiveFeature
  );
}

function getPetName(product: TagRecord) {
  return pickString(
    product.petName,
    product.profile?.petName,
    product.name,
    product.profile?.name
  );
}

function getNote(product: TagRecord) {
  return pickString(product.note, product.profile?.note);
}

function getAlerts(product: TagRecord) {
  return Array.isArray(product.alerts) ? product.alerts : [];
}

function getRecovery(product: TagRecord) {
  return {
    phone: pickString(product.recovery?.phone, getPhone(product)),
    email: pickString(product.recovery?.email, getEmail(product))
  };
}

function resolveAllowDirectCall(product: TagRecord) {
  if (typeof product.allowDirectCall === "boolean") return product.allowDirectCall;
  if (typeof product.contactOptions?.allowDirectCall === "boolean") {
    return product.contactOptions.allowDirectCall;
  }
  return false;
}

function resolveAllowDirectWhatsapp(product: TagRecord) {
  if (typeof product.allowDirectWhatsapp === "boolean") {
    return product.allowDirectWhatsapp;
  }
  if (typeof product.contactOptions?.allowDirectWhatsapp === "boolean") {
    return product.contactOptions.allowDirectWhatsapp;
  }
  return false;
}

function resolveStatus(product: TagRecord): TagStatus {
  if (product.status === "inactive") return "inactive";
  if (product.status === "active") return "active";
  return "unclaimed";
}

function resolveVisibility(product: TagRecord) {
  return {
    showName:
      typeof product.visibility?.showName === "boolean"
        ? product.visibility.showName
        : typeof product.showName === "boolean"
          ? product.showName
          : true,
    showPhone:
      typeof product.visibility?.showPhone === "boolean"
        ? product.visibility.showPhone
        : typeof product.showPhone === "boolean"
          ? product.showPhone
          : false,
    showEmail:
      typeof product.visibility?.showEmail === "boolean"
        ? product.visibility.showEmail
        : typeof product.showEmail === "boolean"
          ? product.showEmail
          : false,
    showCity:
      typeof product.visibility?.showCity === "boolean"
        ? product.visibility.showCity
        : typeof product.showCity === "boolean"
          ? product.showCity
          : false,
    showAddressDetail:
      typeof product.visibility?.showAddressDetail === "boolean"
        ? product.visibility.showAddressDetail
        : typeof product.showAddressDetail === "boolean"
          ? product.showAddressDetail
          : false,
    showPetName:
      typeof product.visibility?.showPetName === "boolean"
        ? product.visibility.showPetName
        : typeof product.showPetName === "boolean"
          ? product.showPetName
          : true,
    showNote:
      typeof product.visibility?.showNote === "boolean"
        ? product.visibility.showNote
        : typeof product.showNote === "boolean"
          ? product.showNote
          : false
  };
}

function buildProfile(input: {
  tagName?: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  city?: string;
  addressDetail?: string;
  distinctiveFeature?: string;
  petName?: string;
  note?: string;
}) {
  const name = pickString(input.tagName);
  const ownerName = pickString(input.ownerName);
  const phone = pickString(input.phone);
  const email = pickString(input.email);
  const city = pickString(input.city);
  const addressDetail = pickString(input.addressDetail);
  const distinctiveFeature = pickString(input.distinctiveFeature);
  const petName = pickString(input.petName, input.tagName);
  const note = pickString(input.note);

  return {
    name,
    ownerName,
    phone,
    email,
    city,
    addressDetail,
    distinctiveFeature,
    petName,
    note,
    tagName: name
  };
}

function mapProductToTagView(product: TagRecord): TagView {
  const visibility = resolveVisibility(product);
  const allowDirectCall = resolveAllowDirectCall(product);
  const allowDirectWhatsapp = resolveAllowDirectWhatsapp(product);

  return {
    code: product.publicCode,
    oldCode: product.oldCode,
    manageToken: product.manageToken,
    status: resolveStatus(product),
    productType: product.productType || "item",
    productSubtype: product.productSubtype || "",
    profile: {
      name: getProfileName(product),
      ownerName: getOwnerName(product),
      phone: getPhone(product),
      email: getEmail(product),
      city: getCity(product),
      addressDetail: getAddressDetail(product),
      distinctiveFeature: getDistinctiveFeature(product),
      petName: getPetName(product),
      note: getNote(product),
      tagName: getProfileName(product)
    },
    alerts: getAlerts(product),
    visibility: {
      ...visibility,
      allowPhone: allowDirectCall,
      allowEmail: Boolean(getEmail(product)),
      allowWhatsapp: allowDirectWhatsapp,
      allowDirectSms: false,
      allowDirectEmail: false
    },
    contactOptions: {
      allowDirectCall,
      allowDirectWhatsapp
    },
    recovery: getRecovery(product),
    transfer: product.transfer?.token
      ? {
          token: product.transfer.token,
          status: getTransferStatus(product),
          createdAt: product.transfer.createdAt || "",
          expiresAt: product.transfer.expiresAt || "",
          usedAt: product.transfer.usedAt || "",
          cancelledAt: product.transfer.cancelledAt || ""
        }
      : undefined
  };
}

function getTransferStatus(product: TagRecord): TransferStatus | null {
  const transfer = product.transfer;
  if (!transfer?.token) return null;

  if (transfer.status === "used") return "used";
  if (transfer.status === "cancelled") return "cancelled";

  const expiresAt = transfer.expiresAt ? new Date(transfer.expiresAt).getTime() : 0;
  if (expiresAt && expiresAt < Date.now()) return "expired";

  return "pending";
}

function getRecoverySessionStatus(product: TagRecord): RecoverySessionStatus | null {
  const session = product.recoverySession;
  if (!session?.token) return null;

  if (session.status === "used") return "used";

  const expiresAt = session.expiresAt ? new Date(session.expiresAt).getTime() : 0;
  if (expiresAt && expiresAt < Date.now()) return "expired";

  return "pending";
}

function mapProductToRecoveryListedItem(product: TagRecord): RecoveryListedItem {
  return {
    code: product.publicCode,
    productType: product.productType || "item",
    status: resolveStatus(product),
    petName: getPetName(product),
    ownerName: getOwnerName(product)
  };
}

function shouldClearRecoverySession(session?: RecoverySession) {
  if (!session?.token) return false;
  if (session.status === "used") return true;

  const expiresAt = session.expiresAt ? new Date(session.expiresAt).getTime() : 0;
  return Boolean(expiresAt && expiresAt < Date.now());
}

function shouldClearTransfer(transfer?: TagTransfer) {
  if (!transfer?.token) return false;
  if (transfer.status === "used" || transfer.status === "cancelled") return true;

  const expiresAt = transfer.expiresAt ? new Date(transfer.expiresAt).getTime() : 0;
  return Boolean(expiresAt && expiresAt < Date.now());
}

function cleanupProductRuntimeState(product: TagRecord): TagRecord {
  const next: TagRecord = { ...product };
  let changed = false;

  if (shouldClearRecoverySession(next.recoverySession)) {
    delete next.recoverySession;
    changed = true;
  }

  if (shouldClearTransfer(next.transfer)) {
    delete next.transfer;
    changed = true;
  }

  if (changed) {
    next.updatedAt = new Date().toISOString();
  }

  return next;
}

function cleanupTransientStates() {
  const products = getProducts();
  let changed = false;

  const nextProducts = products.map((product) => {
    const next = cleanupProductRuntimeState(product);

    if (
      next.recoverySession !== product.recoverySession ||
      next.transfer !== product.transfer ||
      next.updatedAt !== product.updatedAt
    ) {
      changed = true;
    }

    return next;
  });

  if (changed) {
    saveProducts(nextProducts);
  }

  return nextProducts;
}

async function cleanupTransientStatesAsync() {
  const products = await getProductsAsync();
  let changed = false;

  const nextProducts = products.map((product) => {
    const next = cleanupProductRuntimeState(product);

    if (
      next.recoverySession !== product.recoverySession ||
      next.transfer !== product.transfer ||
      next.updatedAt !== product.updatedAt
    ) {
      changed = true;
    }

    return next;
  });

  if (changed) {
    await saveProductsAsync(nextProducts);
  }

  return nextProducts;
}

export function readTags(): TagView[] {
  return cleanupTransientStates().map(mapProductToTagView);
}
export async function readTagsAsync(): Promise<TagView[]> {
  return (await cleanupTransientStatesAsync()).map(mapProductToTagView);
}
export function getAllTags(): TagView[] {
  return readTags();
}

export function findTagByCode(code: string): TagView | null {
  const normalized = normalizeCode(code);
  if (!normalized) return null;

  const product = cleanupTransientStates().find((item) => {
    return (
      normalizeCode(item.publicCode) === normalized ||
      normalizeCode(item.oldCode || "") === normalized ||
      normalizeCode((item as { code?: string }).code || "") === normalized
    );
  });

  if (!product) {
    return null;
  }

  if (!product.publicCode && (product as { code?: string }).code) {
    product.publicCode = normalizeCode((product as { code?: string }).code || "");
  }

  return mapProductToTagView(product);
}

export async function findTagByCodeAsync(code: string): Promise<TagView | null> {
  const normalized = normalizeCode(code);
  if (!normalized) return null;

  const product = (await cleanupTransientStatesAsync()).find((item) => {
    return (
      normalizeCode(item.publicCode) === normalized ||
      normalizeCode(item.oldCode || "") === normalized ||
      normalizeCode((item as { code?: string }).code || "") === normalized
    );
  });

  if (!product) {
    return null;
  }

  if (!product.publicCode && (product as { code?: string }).code) {
    product.publicCode = normalizeCode((product as { code?: string }).code || "");
  }

  return mapProductToTagView(product);
}

export function findTagByManageToken(token: string): TagView | null {
  const normalized = String(token || "").trim();
  if (!normalized) return null;

  const product = cleanupTransientStates().find((item) => {
    return String(item.manageToken || "").trim() === normalized;
  });

  return product ? mapProductToTagView(product) : null;
}

export function validateManageToken(codeOrToken: string, maybeToken?: string) {
  const products = cleanupTransientStates();

  if (maybeToken === undefined) {
    const token = String(codeOrToken || "").trim();
    if (!token) return null;

    const product = products.find((item) => {
      return String(item.manageToken || "").trim() === token;
    });

    return product ? mapProductToTagView(product) : null;
  }

  const code = normalizeCode(codeOrToken);
  const token = String(maybeToken || "").trim();

  if (!code || !token) return null;

  const product = products.find((item) => {
    const recordCode = normalizeCode(
      item.publicCode || (item as { code?: string }).code || ""
    );

    const sameCode =
      recordCode === code || normalizeCode(item.oldCode || "") === code;

    const sameToken = String(item.manageToken || "").trim() === token;

    return sameCode && sameToken;
  });

  return product ? mapProductToTagView(product) : null;
}

export async function validateManageTokenAsync(
  codeOrToken: string,
  maybeToken?: string
): Promise<TagView | null> {
  const products = await cleanupTransientStatesAsync();

  if (maybeToken === undefined) {
    const token = String(codeOrToken || "").trim();
    if (!token) return null;

    const product = products.find((item) => {
      return String(item.manageToken || "").trim() === token;
    });

    return product ? mapProductToTagView(product) : null;
  }

  const code = normalizeCode(codeOrToken);
  const token = String(maybeToken || "").trim();

  if (!code || !token) return null;

  const product = products.find((item) => {
    const recordCode = normalizeCode(
      item.publicCode || (item as { code?: string }).code || ""
    );

    const sameCode =
      recordCode === code || normalizeCode(item.oldCode || "") === code;

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

  const products = cleanupTransientStates();
  const index = products.findIndex((item) => {
    return normalizeCode(
      item.publicCode || (item as { code?: string }).code || ""
    ) === normalizedCode;
  });

  const now = new Date().toISOString();

  const incomingVisibility = {
    showName:
      typeof input.visibility?.showName === "boolean"
        ? input.visibility.showName
        : typeof input.showName === "boolean"
          ? input.showName
          : true,
    showPhone:
      typeof input.visibility?.showPhone === "boolean"
        ? input.visibility.showPhone
        : typeof input.showPhone === "boolean"
          ? input.showPhone
          : false,
    showEmail:
      typeof input.visibility?.showEmail === "boolean"
        ? input.visibility.showEmail
        : typeof input.showEmail === "boolean"
          ? input.showEmail
          : false,
    showCity:
      typeof input.visibility?.showCity === "boolean"
        ? input.visibility.showCity
        : typeof input.showCity === "boolean"
          ? input.showCity
          : false,
    showAddressDetail:
      typeof input.visibility?.showAddressDetail === "boolean"
        ? input.visibility.showAddressDetail
        : typeof input.showAddressDetail === "boolean"
          ? input.showAddressDetail
          : false,
    showPetName:
      typeof input.visibility?.showPetName === "boolean"
        ? input.visibility.showPetName
        : typeof input.showPetName === "boolean"
          ? input.showPetName
          : true,
    showNote:
      typeof input.visibility?.showNote === "boolean"
        ? input.visibility.showNote
        : typeof input.showNote === "boolean"
          ? input.showNote
          : false
  };

  const nextProfile = buildProfile({
    tagName: input.tagName,
    ownerName: input.ownerName,
    phone: input.phone,
    email: input.email,
    city: input.city,
    addressDetail: input.addressDetail,
    distinctiveFeature: input.distinctiveFeature,
    petName: input.petName,
    note: input.note
  });

  if (index === -1) {
    const newProduct: TagRecord = {
      publicCode: normalizedCode,
      manageToken: crypto.randomUUID(),
      productType: input.productType || "item",
      productSubtype: input.productSubtype || "",
      name: nextProfile.name,
      ownerName: nextProfile.ownerName,
      phone: nextProfile.phone,
      email: nextProfile.email,
      city: nextProfile.city,
      addressDetail: nextProfile.addressDetail,
      distinctiveFeature: nextProfile.distinctiveFeature,
      petName: nextProfile.petName,
      note: nextProfile.note,
      alerts: Array.isArray(input.alerts) ? input.alerts : [],
      allowDirectCall: Boolean(input.allowDirectCall),
      allowDirectWhatsapp: Boolean(input.allowDirectWhatsapp),
      status: input.status || "active",
      createdAt: now,
      updatedAt: now,
      recovery: {
        phone: input.recoveryPhone || nextProfile.phone,
        email: input.recoveryEmail || nextProfile.email
      },
      visibility: incomingVisibility,
      profile: nextProfile,
      contactOptions: {
        allowDirectCall: Boolean(input.allowDirectCall),
        allowDirectWhatsapp: Boolean(input.allowDirectWhatsapp)
      },
      ...incomingVisibility
    };

    products.push(newProduct);
    saveProducts(products);
    return mapProductToTagView(newProduct);
  }

  const current = products[index];
  const currentVisibility = resolveVisibility(current);

  const nextVisibility = {
    showName:
      typeof input.visibility?.showName === "boolean"
        ? input.visibility.showName
        : typeof input.showName === "boolean"
          ? input.showName
          : currentVisibility.showName,
    showPhone:
      typeof input.visibility?.showPhone === "boolean"
        ? input.visibility.showPhone
        : typeof input.showPhone === "boolean"
          ? input.showPhone
          : currentVisibility.showPhone,
    showEmail:
      typeof input.visibility?.showEmail === "boolean"
        ? input.visibility.showEmail
        : typeof input.showEmail === "boolean"
          ? input.showEmail
          : currentVisibility.showEmail,
    showCity:
      typeof input.visibility?.showCity === "boolean"
        ? input.visibility.showCity
        : typeof input.showCity === "boolean"
          ? input.showCity
          : currentVisibility.showCity,
    showAddressDetail:
      typeof input.visibility?.showAddressDetail === "boolean"
        ? input.visibility.showAddressDetail
        : typeof input.showAddressDetail === "boolean"
          ? input.showAddressDetail
          : currentVisibility.showAddressDetail,
    showPetName:
      typeof input.visibility?.showPetName === "boolean"
        ? input.visibility.showPetName
        : typeof input.showPetName === "boolean"
          ? input.showPetName
          : currentVisibility.showPetName,
    showNote:
      typeof input.visibility?.showNote === "boolean"
        ? input.visibility.showNote
        : typeof input.showNote === "boolean"
          ? input.showNote
          : currentVisibility.showNote
  };

  const mergedProfile = buildProfile({
    tagName: input.tagName ?? getProfileName(current),
    ownerName: input.ownerName ?? getOwnerName(current),
    phone: input.phone ?? getPhone(current),
    email: input.email ?? getEmail(current),
    city: input.city ?? getCity(current),
    addressDetail: input.addressDetail ?? getAddressDetail(current),
    distinctiveFeature: input.distinctiveFeature ?? getDistinctiveFeature(current),
    petName: input.petName ?? getPetName(current),
    note: input.note ?? getNote(current)
  });

  products[index] = {
    ...current,
    publicCode: current.publicCode || normalizedCode,
    productType: input.productType ?? current.productType ?? "item",
    productSubtype: input.productSubtype ?? current.productSubtype ?? "",
    name: mergedProfile.name,
    ownerName: mergedProfile.ownerName,
    phone: mergedProfile.phone,
    email: mergedProfile.email,
    city: mergedProfile.city,
    addressDetail: mergedProfile.addressDetail,
    distinctiveFeature: mergedProfile.distinctiveFeature,
    petName: mergedProfile.petName,
    note: mergedProfile.note,
    alerts: Array.isArray(input.alerts) ? input.alerts : getAlerts(current),
    allowDirectCall:
      input.allowDirectCall !== undefined
        ? Boolean(input.allowDirectCall)
        : resolveAllowDirectCall(current),
    allowDirectWhatsapp:
      input.allowDirectWhatsapp !== undefined
        ? Boolean(input.allowDirectWhatsapp)
        : resolveAllowDirectWhatsapp(current),
    status: input.status ?? current.status ?? "active",
    updatedAt: now,
    recovery: {
      phone: input.recoveryPhone ?? current.recovery?.phone ?? mergedProfile.phone,
      email: input.recoveryEmail ?? current.recovery?.email ?? mergedProfile.email
    },
    visibility: nextVisibility,
    profile: mergedProfile,
    contactOptions: {
      allowDirectCall:
        input.allowDirectCall !== undefined
          ? Boolean(input.allowDirectCall)
          : resolveAllowDirectCall(current),
      allowDirectWhatsapp:
        input.allowDirectWhatsapp !== undefined
          ? Boolean(input.allowDirectWhatsapp)
          : resolveAllowDirectWhatsapp(current)
    },
    ...nextVisibility
  };

  saveProducts(products);
  return mapProductToTagView(products[index]);
}

export async function upsertTagAsync(input: UpsertTagInput) {
  const normalizedCode = normalizeCode(input.code);
  if (!normalizedCode) {
    throw new Error("Code zorunlu");
  }

  const products = await cleanupTransientStatesAsync();
  const index = products.findIndex((item) => {
    return normalizeCode(
      item.publicCode || (item as { code?: string }).code || ""
    ) === normalizedCode;
  });

  const now = new Date().toISOString();

  const incomingVisibility = {
    showName:
      typeof input.visibility?.showName === "boolean"
        ? input.visibility.showName
        : typeof input.showName === "boolean"
          ? input.showName
          : true,
    showPhone:
      typeof input.visibility?.showPhone === "boolean"
        ? input.visibility.showPhone
        : typeof input.showPhone === "boolean"
          ? input.showPhone
          : false,
    showEmail:
      typeof input.visibility?.showEmail === "boolean"
        ? input.visibility.showEmail
        : typeof input.showEmail === "boolean"
          ? input.showEmail
          : false,
    showCity:
      typeof input.visibility?.showCity === "boolean"
        ? input.visibility.showCity
        : typeof input.showCity === "boolean"
          ? input.showCity
          : false,
    showAddressDetail:
      typeof input.visibility?.showAddressDetail === "boolean"
        ? input.visibility.showAddressDetail
        : typeof input.showAddressDetail === "boolean"
          ? input.showAddressDetail
          : false,
    showPetName:
      typeof input.visibility?.showPetName === "boolean"
        ? input.visibility.showPetName
        : typeof input.showPetName === "boolean"
          ? input.showPetName
          : true,
    showNote:
      typeof input.visibility?.showNote === "boolean"
        ? input.visibility.showNote
        : typeof input.showNote === "boolean"
          ? input.showNote
          : false
  };

  const nextProfile = buildProfile({
    tagName: input.tagName,
    ownerName: input.ownerName,
    phone: input.phone,
    email: input.email,
    city: input.city,
    addressDetail: input.addressDetail,
    distinctiveFeature: input.distinctiveFeature,
    petName: input.petName,
    note: input.note
  });

  if (index === -1) {
    const newProduct: TagRecord = {
      publicCode: normalizedCode,
      manageToken: crypto.randomUUID(),
      productType: input.productType || "item",
      productSubtype: input.productSubtype || "",
      name: nextProfile.name,
      ownerName: nextProfile.ownerName,
      phone: nextProfile.phone,
      email: nextProfile.email,
      city: nextProfile.city,
      addressDetail: nextProfile.addressDetail,
      distinctiveFeature: nextProfile.distinctiveFeature,
      petName: nextProfile.petName,
      note: nextProfile.note,
      alerts: Array.isArray(input.alerts) ? input.alerts : [],
      allowDirectCall: Boolean(input.allowDirectCall),
      allowDirectWhatsapp: Boolean(input.allowDirectWhatsapp),
      status: input.status || "active",
      createdAt: now,
      updatedAt: now,
      recovery: {
        phone: input.recoveryPhone || nextProfile.phone,
        email: input.recoveryEmail || nextProfile.email
      },
      visibility: incomingVisibility,
      profile: nextProfile,
      contactOptions: {
        allowDirectCall: Boolean(input.allowDirectCall),
        allowDirectWhatsapp: Boolean(input.allowDirectWhatsapp)
      },
      ...incomingVisibility
    };

    products.push(newProduct);
    await saveProductsAsync(products);
    return mapProductToTagView(newProduct);
  }

  const current = products[index];
  const currentVisibility = resolveVisibility(current);

  const nextVisibility = {
    showName:
      typeof input.visibility?.showName === "boolean"
        ? input.visibility.showName
        : typeof input.showName === "boolean"
          ? input.showName
          : currentVisibility.showName,
    showPhone:
      typeof input.visibility?.showPhone === "boolean"
        ? input.visibility.showPhone
        : typeof input.showPhone === "boolean"
          ? input.showPhone
          : currentVisibility.showPhone,
    showEmail:
      typeof input.visibility?.showEmail === "boolean"
        ? input.visibility.showEmail
        : typeof input.showEmail === "boolean"
          ? input.showEmail
          : currentVisibility.showEmail,
    showCity:
      typeof input.visibility?.showCity === "boolean"
        ? input.visibility.showCity
        : typeof input.showCity === "boolean"
          ? input.showCity
          : currentVisibility.showCity,
    showAddressDetail:
      typeof input.visibility?.showAddressDetail === "boolean"
        ? input.visibility.showAddressDetail
        : typeof input.showAddressDetail === "boolean"
          ? input.showAddressDetail
          : currentVisibility.showAddressDetail,
    showPetName:
      typeof input.visibility?.showPetName === "boolean"
        ? input.visibility.showPetName
        : typeof input.showPetName === "boolean"
          ? input.showPetName
          : currentVisibility.showPetName,
    showNote:
      typeof input.visibility?.showNote === "boolean"
        ? input.visibility.showNote
        : typeof input.showNote === "boolean"
          ? input.showNote
          : currentVisibility.showNote
  };

  const mergedProfile = buildProfile({
    tagName: input.tagName ?? getProfileName(current),
    ownerName: input.ownerName ?? getOwnerName(current),
    phone: input.phone ?? getPhone(current),
    email: input.email ?? getEmail(current),
    city: input.city ?? getCity(current),
    addressDetail: input.addressDetail ?? getAddressDetail(current),
    distinctiveFeature: input.distinctiveFeature ?? getDistinctiveFeature(current),
    petName: input.petName ?? getPetName(current),
    note: input.note ?? getNote(current)
  });

  products[index] = {
    ...current,
    publicCode: current.publicCode || normalizedCode,
    productType: input.productType ?? current.productType ?? "item",
    productSubtype: input.productSubtype ?? current.productSubtype ?? "",
    name: mergedProfile.name,
    ownerName: mergedProfile.ownerName,
    phone: mergedProfile.phone,
    email: mergedProfile.email,
    city: mergedProfile.city,
    addressDetail: mergedProfile.addressDetail,
    distinctiveFeature: mergedProfile.distinctiveFeature,
    petName: mergedProfile.petName,
    note: mergedProfile.note,
    alerts: Array.isArray(input.alerts) ? input.alerts : getAlerts(current),
    allowDirectCall:
      input.allowDirectCall !== undefined
        ? Boolean(input.allowDirectCall)
        : resolveAllowDirectCall(current),
    allowDirectWhatsapp:
      input.allowDirectWhatsapp !== undefined
        ? Boolean(input.allowDirectWhatsapp)
        : resolveAllowDirectWhatsapp(current),
    status: input.status ?? current.status ?? "active",
    updatedAt: now,
    recovery: {
      phone: input.recoveryPhone ?? current.recovery?.phone ?? mergedProfile.phone,
      email: input.recoveryEmail ?? current.recovery?.email ?? mergedProfile.email
    },
    visibility: nextVisibility,
    profile: mergedProfile,
    contactOptions: {
      allowDirectCall:
        input.allowDirectCall !== undefined
          ? Boolean(input.allowDirectCall)
          : resolveAllowDirectCall(current),
      allowDirectWhatsapp:
        input.allowDirectWhatsapp !== undefined
          ? Boolean(input.allowDirectWhatsapp)
          : resolveAllowDirectWhatsapp(current)
    },
    ...nextVisibility
  };

  await saveProductsAsync(products);
  return mapProductToTagView(products[index]);
}

export function updateTagByManageToken(input: UpdateByManageTokenInput) {
  const normalizedToken = String(input.manageToken || "").trim();
  if (!normalizedToken) {
    throw new Error("manageToken zorunlu");
  }

  const products = cleanupTransientStates();
  const index = products.findIndex((item) => {
    return String(item.manageToken || "").trim() === normalizedToken;
  });

  if (index === -1) {
    return null;
  }

  const current = products[index];
  const now = new Date().toISOString();
  const currentVisibility = resolveVisibility(current);

  const resolvedAllowDirectCall =
    input.allowDirectCall !== undefined
      ? Boolean(input.allowDirectCall)
      : input.allowPhone !== undefined
        ? Boolean(input.allowPhone)
        : resolveAllowDirectCall(current);

  const resolvedAllowDirectWhatsapp =
    input.allowDirectWhatsapp !== undefined
      ? Boolean(input.allowDirectWhatsapp)
      : input.allowWhatsapp !== undefined
        ? Boolean(input.allowWhatsapp)
        : resolveAllowDirectWhatsapp(current);

  const nextVisibility = {
    showName:
      typeof input.visibility?.showName === "boolean"
        ? input.visibility.showName
        : typeof input.showName === "boolean"
          ? input.showName
          : currentVisibility.showName,
    showPhone:
      typeof input.visibility?.showPhone === "boolean"
        ? input.visibility.showPhone
        : typeof input.showPhone === "boolean"
          ? input.showPhone
          : currentVisibility.showPhone,
    showEmail:
      typeof input.visibility?.showEmail === "boolean"
        ? input.visibility.showEmail
        : typeof input.showEmail === "boolean"
          ? input.showEmail
          : currentVisibility.showEmail,
    showCity:
      typeof input.visibility?.showCity === "boolean"
        ? input.visibility.showCity
        : typeof input.showCity === "boolean"
          ? input.showCity
          : currentVisibility.showCity,
    showAddressDetail:
      typeof input.visibility?.showAddressDetail === "boolean"
        ? input.visibility.showAddressDetail
        : typeof input.showAddressDetail === "boolean"
          ? input.showAddressDetail
          : currentVisibility.showAddressDetail,
    showPetName:
      typeof input.visibility?.showPetName === "boolean"
        ? input.visibility.showPetName
        : typeof input.showPetName === "boolean"
          ? input.showPetName
          : currentVisibility.showPetName,
    showNote:
      typeof input.visibility?.showNote === "boolean"
        ? input.visibility.showNote
        : typeof input.showNote === "boolean"
          ? input.showNote
          : currentVisibility.showNote
  };

  const mergedProfile = buildProfile({
    tagName: input.tagName ?? getProfileName(current),
    ownerName: input.ownerName ?? getOwnerName(current),
    phone: input.phone ?? getPhone(current),
    email: input.email ?? getEmail(current),
    city: input.city ?? getCity(current),
    addressDetail: input.addressDetail ?? getAddressDetail(current),
    distinctiveFeature: input.distinctiveFeature ?? getDistinctiveFeature(current),
    petName: input.petName ?? getPetName(current),
    note: input.note ?? getNote(current)
  });

  products[index] = {
    ...current,
    productType: input.productType ?? current.productType ?? "item",
    productSubtype: input.productSubtype ?? current.productSubtype ?? "",
    name: mergedProfile.name,
    ownerName: mergedProfile.ownerName,
    phone: mergedProfile.phone,
    email: mergedProfile.email,
    city: mergedProfile.city,
    addressDetail: mergedProfile.addressDetail,
    distinctiveFeature: mergedProfile.distinctiveFeature,
    petName: mergedProfile.petName,
    note: mergedProfile.note,
    alerts: Array.isArray(input.alerts) ? input.alerts : getAlerts(current),
    allowDirectCall: resolvedAllowDirectCall,
    allowDirectWhatsapp: resolvedAllowDirectWhatsapp,
    status: input.status ?? current.status ?? "active",
    updatedAt: now,
    recovery: {
      phone: input.recoveryPhone ?? current.recovery?.phone ?? mergedProfile.phone,
      email: input.recoveryEmail ?? current.recovery?.email ?? mergedProfile.email
    },
    visibility: nextVisibility,
    profile: mergedProfile,
    contactOptions: {
      allowDirectCall: resolvedAllowDirectCall,
      allowDirectWhatsapp: resolvedAllowDirectWhatsapp
    },
    ...nextVisibility
  };

  saveProducts(products);
  return mapProductToTagView(products[index]);
}

export async function updateTagByManageTokenAsync(input: UpdateByManageTokenInput) {
  const normalizedToken = String(input.manageToken || "").trim();
  if (!normalizedToken) {
    throw new Error("manageToken zorunlu");
  }

  const products = await cleanupTransientStatesAsync();
  const index = products.findIndex((item) => {
    return String(item.manageToken || "").trim() === normalizedToken;
  });

  if (index === -1) {
    return null;
  }

  const current = products[index];
  const now = new Date().toISOString();
  const currentVisibility = resolveVisibility(current);

  const resolvedAllowDirectCall =
    input.allowDirectCall !== undefined
      ? Boolean(input.allowDirectCall)
      : input.allowPhone !== undefined
        ? Boolean(input.allowPhone)
        : resolveAllowDirectCall(current);

  const resolvedAllowDirectWhatsapp =
    input.allowDirectWhatsapp !== undefined
      ? Boolean(input.allowDirectWhatsapp)
      : input.allowWhatsapp !== undefined
        ? Boolean(input.allowWhatsapp)
        : resolveAllowDirectWhatsapp(current);

  const nextVisibility = {
    showName:
      typeof input.visibility?.showName === "boolean"
        ? input.visibility.showName
        : typeof input.showName === "boolean"
          ? input.showName
          : currentVisibility.showName,
    showPhone:
      typeof input.visibility?.showPhone === "boolean"
        ? input.visibility.showPhone
        : typeof input.showPhone === "boolean"
          ? input.showPhone
          : currentVisibility.showPhone,
    showEmail:
      typeof input.visibility?.showEmail === "boolean"
        ? input.visibility.showEmail
        : typeof input.showEmail === "boolean"
          ? input.showEmail
          : currentVisibility.showEmail,
    showCity:
      typeof input.visibility?.showCity === "boolean"
        ? input.visibility.showCity
        : typeof input.showCity === "boolean"
          ? input.showCity
          : currentVisibility.showCity,
    showAddressDetail:
      typeof input.visibility?.showAddressDetail === "boolean"
        ? input.visibility.showAddressDetail
        : typeof input.showAddressDetail === "boolean"
          ? input.showAddressDetail
          : currentVisibility.showAddressDetail,
    showPetName:
      typeof input.visibility?.showPetName === "boolean"
        ? input.visibility.showPetName
        : typeof input.showPetName === "boolean"
          ? input.showPetName
          : currentVisibility.showPetName,
    showNote:
      typeof input.visibility?.showNote === "boolean"
        ? input.visibility.showNote
        : typeof input.showNote === "boolean"
          ? input.showNote
          : currentVisibility.showNote
  };

  const mergedProfile = buildProfile({
    tagName: input.tagName ?? getProfileName(current),
    ownerName: input.ownerName ?? getOwnerName(current),
    phone: input.phone ?? getPhone(current),
    email: input.email ?? getEmail(current),
    city: input.city ?? getCity(current),
    addressDetail: input.addressDetail ?? getAddressDetail(current),
    distinctiveFeature: input.distinctiveFeature ?? getDistinctiveFeature(current),
    petName: input.petName ?? getPetName(current),
    note: input.note ?? getNote(current)
  });

  products[index] = {
    ...current,
    productType: input.productType ?? current.productType ?? "item",
    productSubtype: input.productSubtype ?? current.productSubtype ?? "",
    name: mergedProfile.name,
    ownerName: mergedProfile.ownerName,
    phone: mergedProfile.phone,
    email: mergedProfile.email,
    city: mergedProfile.city,
    addressDetail: mergedProfile.addressDetail,
    distinctiveFeature: mergedProfile.distinctiveFeature,
    petName: mergedProfile.petName,
    note: mergedProfile.note,
    alerts: Array.isArray(input.alerts) ? input.alerts : getAlerts(current),
    allowDirectCall: resolvedAllowDirectCall,
    allowDirectWhatsapp: resolvedAllowDirectWhatsapp,
    status: input.status ?? current.status ?? "active",
    updatedAt: now,
    recovery: {
      phone: input.recoveryPhone ?? current.recovery?.phone ?? mergedProfile.phone,
      email: input.recoveryEmail ?? current.recovery?.email ?? mergedProfile.email
    },
    visibility: nextVisibility,
    profile: mergedProfile,
    contactOptions: {
      allowDirectCall: resolvedAllowDirectCall,
      allowDirectWhatsapp: resolvedAllowDirectWhatsapp
    },
    ...nextVisibility
  };

  await saveProductsAsync(products);
  return mapProductToTagView(products[index]);
}

export function createTransferByManageToken(input: {
  code: string;
  manageToken: string;
  expiresInHours?: number;
}) {
  const normalizedCode = normalizeCode(input.code);
  const normalizedToken = String(input.manageToken || "").trim();

  if (!normalizedCode || !normalizedToken) {
    throw new Error("Geçersiz devir isteği.");
  }

  const products = cleanupTransientStates();
  const index = products.findIndex((item) => {
    const itemCode = normalizeCode(
      item.publicCode || (item as { code?: string }).code || ""
    );

    return (
      itemCode === normalizedCode &&
      String(item.manageToken || "").trim() === normalizedToken
    );
  });

  if (index === -1) {
    return null;
  }

  const now = new Date();
  const expiresInHours =
    typeof input.expiresInHours === "number" &&
    Number.isFinite(input.expiresInHours) &&
    input.expiresInHours > 0
      ? input.expiresInHours
      : 48;

  const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);
  const transferToken = crypto.randomUUID();
  const current = products[index];

  products[index] = {
    ...current,
    status: "inactive",
    updatedAt: now.toISOString(),
    transfer: {
      token: transferToken,
      status: "pending",
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      fromManageToken: current.manageToken
    }
  };

  saveProducts(products);

  return {
    success: true,
    code: products[index].publicCode,
    transferToken,
    transferPath: `/transfer/${transferToken}`,
    transferLink: `http://localhost:3000/transfer/${transferToken}`,
    expiresAt: expiresAt.toISOString(),
    status: "inactive" as const
  };
}
export async function createTransferByManageTokenAsync(input: {
  code: string;
  manageToken: string;
  expiresInHours?: number;
}) {
  const normalizedCode = normalizeCode(input.code);
  const normalizedToken = String(input.manageToken || "").trim();

  if (!normalizedCode || !normalizedToken) {
    throw new Error("Geçersiz devir isteği.");
  }

  const products = await cleanupTransientStatesAsync();
  const index = products.findIndex((item) => {
    const itemCode = normalizeCode(
      item.publicCode || (item as { code?: string }).code || ""
    );

    return (
      itemCode === normalizedCode &&
      String(item.manageToken || "").trim() === normalizedToken
    );
  });

  if (index === -1) {
    return null;
  }

  const now = new Date();
  const expiresInHours =
    typeof input.expiresInHours === "number" &&
    Number.isFinite(input.expiresInHours) &&
    input.expiresInHours > 0
      ? input.expiresInHours
      : 48;

  const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);
  const transferToken = crypto.randomUUID();
  const current = products[index];

  products[index] = {
    ...current,
    status: "inactive",
    updatedAt: now.toISOString(),
    transfer: {
      token: transferToken,
      status: "pending",
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      fromManageToken: current.manageToken
    }
  };

  await saveProductsAsync(products);

  return {
    success: true,
    code: products[index].publicCode,
    transferToken,
    transferPath: `/transfer/${transferToken}`,
    transferLink: `http://localhost:3000/transfer/${transferToken}`,
    expiresAt: expiresAt.toISOString(),
    status: "inactive" as const
  };
}
export function getTransferByToken(token: string) {
  const normalizedToken = String(token || "").trim();
  if (!normalizedToken) return null;

  const products = cleanupTransientStates();
  const product = products.find((item) => {
    return String(item.transfer?.token || "").trim() === normalizedToken;
  });

  if (!product || !product.transfer?.token) {
    return null;
  }

  const transferStatus = getTransferStatus(product);

  return {
    code: product.publicCode,
    productType: product.productType || "item",
    currentProfile: {
      name: getProfileName(product),
      ownerName: getOwnerName(product),
      phone: getPhone(product),
      email: getEmail(product),
      city: getCity(product),
      addressDetail: getAddressDetail(product),
      distinctiveFeature: getDistinctiveFeature(product),
      petName: getPetName(product),
      note: getNote(product)
    },
    transfer: {
      token: product.transfer.token,
      status: transferStatus,
      createdAt: product.transfer.createdAt || "",
      expiresAt: product.transfer.expiresAt || "",
      usedAt: product.transfer.usedAt || ""
    }
  };
}

export async function getTransferByTokenAsync(token: string) {
  const normalizedToken = String(token || "").trim();
  if (!normalizedToken) return null;

  const products = await cleanupTransientStatesAsync();
  const product = products.find((item) => {
    return String(item.transfer?.token || "").trim() === normalizedToken;
  });

  if (!product || !product.transfer?.token) {
    return null;
  }

  const transferStatus = getTransferStatus(product);

  return {
    code: product.publicCode,
    productType: product.productType || "item",
    currentProfile: {
      name: getProfileName(product),
      ownerName: getOwnerName(product),
      phone: getPhone(product),
      email: getEmail(product),
      city: getCity(product),
      addressDetail: getAddressDetail(product),
      distinctiveFeature: getDistinctiveFeature(product),
      petName: getPetName(product),
      note: getNote(product)
    },
    transfer: {
      token: product.transfer.token,
      status: transferStatus,
      createdAt: product.transfer.createdAt || "",
      expiresAt: product.transfer.expiresAt || "",
      usedAt: product.transfer.usedAt || ""
    }
  };
}

export function claimTransfer(input: ClaimTransferInput) {
  const normalizedToken = String(input.transferToken || "").trim();
  if (!normalizedToken) {
    throw new Error("Geçersiz devir bağlantısı.");
  }

  const products = cleanupTransientStates();
  const index = products.findIndex((item) => {
    return String(item.transfer?.token || "").trim() === normalizedToken;
  });

  if (index === -1) {
    return null;
  }

  const current = products[index];
  const transferStatus = getTransferStatus(current);

  if (transferStatus !== "pending") {
    return {
      success: false,
      reason: transferStatus
    } as const;
  }

  const nextVisibility = {
    showName: Boolean(input.visibility?.showName),
    showPhone: Boolean(input.visibility?.showPhone),
    showEmail: Boolean(input.visibility?.showEmail),
    showCity: Boolean(input.visibility?.showCity),
    showAddressDetail: Boolean(input.visibility?.showAddressDetail),
    showPetName: Boolean(input.visibility?.showPetName),
    showNote: Boolean(input.visibility?.showNote)
  };

  const nextProfile = buildProfile({
    tagName: input.tagName,
    ownerName: input.ownerName,
    phone: input.phone,
    email: input.email,
    city: input.city,
    addressDetail: input.addressDetail,
    distinctiveFeature: input.distinctiveFeature,
    petName: input.petName,
    note: input.note
  });

  const now = new Date().toISOString();
  const newManageToken = crypto.randomUUID();

  products[index] = {
    ...current,
    manageToken: newManageToken,
    productType: input.productType ?? current.productType ?? "item",
    productSubtype: input.productSubtype ?? current.productSubtype ?? "",
    name: nextProfile.name,
    ownerName: nextProfile.ownerName,
    phone: nextProfile.phone,
    email: nextProfile.email,
    city: nextProfile.city,
    addressDetail: nextProfile.addressDetail,
    distinctiveFeature: nextProfile.distinctiveFeature,
    petName: nextProfile.petName,
    note: nextProfile.note,
    alerts: Array.isArray(input.alerts) ? input.alerts : [],
    allowDirectCall: Boolean(input.allowDirectCall),
    allowDirectWhatsapp: Boolean(input.allowDirectWhatsapp),
    status: "active",
    updatedAt: now,
    recovery: {
      phone: input.recoveryPhone || nextProfile.phone,
      email: input.recoveryEmail || nextProfile.email
    },
    visibility: nextVisibility,
    profile: nextProfile,
    contactOptions: {
      allowDirectCall: Boolean(input.allowDirectCall),
      allowDirectWhatsapp: Boolean(input.allowDirectWhatsapp)
    },
    transfer: {
      ...current.transfer,
      status: "used",
      usedAt: now
    },
    ...nextVisibility
  };

  saveProducts(products);

  return {
    success: true,
    code: products[index].publicCode,
    manageToken: newManageToken,
    managePath: `/manage/${products[index].publicCode}?token=${newManageToken}`,
    manageLink: `http://localhost:3000/manage/${products[index].publicCode}?token=${newManageToken}`
  } as const;
}

export async function claimTransferAsync(input: ClaimTransferInput) {
  const normalizedToken = String(input.transferToken || "").trim();
  if (!normalizedToken) {
    throw new Error("Geçersiz devir bağlantısı.");
  }

  const products = await cleanupTransientStatesAsync();
  const index = products.findIndex((item) => {
    return String(item.transfer?.token || "").trim() === normalizedToken;
  });

  if (index === -1) {
    return null;
  }

  const current = products[index];
  const transferStatus = getTransferStatus(current);

  if (transferStatus !== "pending") {
    return {
      success: false,
      reason: transferStatus
    } as const;
  }

  const nextVisibility = {
    showName: Boolean(input.visibility?.showName),
    showPhone: Boolean(input.visibility?.showPhone),
    showEmail: Boolean(input.visibility?.showEmail),
    showCity: Boolean(input.visibility?.showCity),
    showAddressDetail: Boolean(input.visibility?.showAddressDetail),
    showPetName: Boolean(input.visibility?.showPetName),
    showNote: Boolean(input.visibility?.showNote)
  };

  const nextProfile = buildProfile({
    tagName: input.tagName,
    ownerName: input.ownerName,
    phone: input.phone,
    email: input.email,
    city: input.city,
    addressDetail: input.addressDetail,
    distinctiveFeature: input.distinctiveFeature,
    petName: input.petName,
    note: input.note
  });

  const now = new Date().toISOString();
  const newManageToken = crypto.randomUUID();

  products[index] = {
    ...current,
    manageToken: newManageToken,
    productType: input.productType ?? current.productType ?? "item",
    productSubtype: input.productSubtype ?? current.productSubtype ?? "",
    name: nextProfile.name,
    ownerName: nextProfile.ownerName,
    phone: nextProfile.phone,
    email: nextProfile.email,
    city: nextProfile.city,
    addressDetail: nextProfile.addressDetail,
    distinctiveFeature: nextProfile.distinctiveFeature,
    petName: nextProfile.petName,
    note: nextProfile.note,
    alerts: Array.isArray(input.alerts) ? input.alerts : [],
    allowDirectCall: Boolean(input.allowDirectCall),
    allowDirectWhatsapp: Boolean(input.allowDirectWhatsapp),
    status: "active",
    updatedAt: now,
    recovery: {
      phone: input.recoveryPhone || nextProfile.phone,
      email: input.recoveryEmail || nextProfile.email
    },
    visibility: nextVisibility,
    profile: nextProfile,
    contactOptions: {
      allowDirectCall: Boolean(input.allowDirectCall),
      allowDirectWhatsapp: Boolean(input.allowDirectWhatsapp)
    },
    transfer: {
      ...current.transfer,
      status: "used",
      usedAt: now
    },
    ...nextVisibility
  };

  await saveProductsAsync(products);

  return {
    success: true,
    code: products[index].publicCode,
    manageToken: newManageToken,
    managePath: `/manage/${products[index].publicCode}?token=${newManageToken}`,
    manageLink: `http://localhost:3000/manage/${products[index].publicCode}?token=${newManageToken}`
  } as const;
}

export function cancelTransferByManageToken(input: {
  code: string;
  manageToken: string;
}) {
  const normalizedCode = normalizeCode(input.code);
  const normalizedToken = String(input.manageToken || "").trim();

  if (!normalizedCode || !normalizedToken) {
    throw new Error("Geçersiz iptal isteği.");
  }

  const products = cleanupTransientStates();
  const index = products.findIndex((item) => {
    const itemCode = normalizeCode(
      item.publicCode || (item as { code?: string }).code || ""
    );

    return (
      itemCode === normalizedCode &&
      String(item.manageToken || "").trim() === normalizedToken
    );
  });

  if (index === -1) {
    return null;
  }

  const current = products[index];
  if (!current.transfer?.token) {
    return null;
  }

  const now = new Date().toISOString();

  products[index] = {
    ...current,
    status: "active",
    updatedAt: now,
    transfer: {
      ...current.transfer,
      status: "cancelled",
      cancelledAt: now
    }
  };

  saveProducts(products);

  return {
    success: true,
    code: products[index].publicCode,
    status: "active" as const
  };
}
export async function cancelTransferByManageTokenAsync(input: {
  code: string;
  manageToken: string;
}) {
  const normalizedCode = normalizeCode(input.code);
  const normalizedToken = String(input.manageToken || "").trim();

  if (!normalizedCode || !normalizedToken) {
    throw new Error("Geçersiz iptal isteği.");
  }

  const products = await cleanupTransientStatesAsync();
  const index = products.findIndex((item) => {
    const itemCode = normalizeCode(
      item.publicCode || (item as { code?: string }).code || ""
    );

    return (
      itemCode === normalizedCode &&
      String(item.manageToken || "").trim() === normalizedToken
    );
  });

  if (index === -1) {
    return null;
  }

  const current = products[index];
  if (!current.transfer?.token) {
    return null;
  }

  const now = new Date().toISOString();

  products[index] = {
    ...current,
    status: "active",
    updatedAt: now,
    transfer: {
      ...current.transfer,
      status: "cancelled",
      cancelledAt: now
    }
  };

  await saveProductsAsync(products);

  return {
    success: true,
    code: products[index].publicCode,
    status: "active" as const
  };
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

  const products = cleanupTransientStates();

  const index = products.findIndex((item) => {
    const recordCode = normalizeCode(
      item.publicCode || (item as { code?: string }).code || ""
    );

    const sameCode =
      recordCode === normalizedCodeInput ||
      normalizeCode(item.oldCode || "") === normalizedCodeInput;

    if (!sameCode) return false;

    const recoveryPhone = normalizeValue(item.recovery?.phone || "");
    const recoveryEmail = normalizeValue(item.recovery?.email || "");
    const profilePhone = normalizeValue(getPhone(item));
    const profileEmail = normalizeValue(getEmail(item));

    const hasRecoveryPhone = Boolean(recoveryPhone);
    const hasRecoveryEmail = Boolean(recoveryEmail);

    const phoneMatched =
      Boolean(normalizedPhoneInput) &&
      (
        (hasRecoveryPhone && normalizedPhoneInput === recoveryPhone) ||
        (!hasRecoveryPhone && normalizedPhoneInput === profilePhone)
      );

    const emailMatched =
      Boolean(normalizedEmailInput) &&
      (
        (hasRecoveryEmail && normalizedEmailInput === recoveryEmail) ||
        (!hasRecoveryEmail && normalizedEmailInput === profileEmail)
      );

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

export async function recoverManageAccessAsync(input: {
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

  const products = await cleanupTransientStatesAsync();

  const index = products.findIndex((item) => {
    const recordCode = normalizeCode(
      item.publicCode || (item as { code?: string }).code || ""
    );

    const sameCode =
      recordCode === normalizedCodeInput ||
      normalizeCode(item.oldCode || "") === normalizedCodeInput;

    if (!sameCode) return false;

    const recoveryPhone = normalizeValue(item.recovery?.phone || "");
    const recoveryEmail = normalizeValue(item.recovery?.email || "");
    const profilePhone = normalizeValue(getPhone(item));
    const profileEmail = normalizeValue(getEmail(item));

    const hasRecoveryPhone = Boolean(recoveryPhone);
    const hasRecoveryEmail = Boolean(recoveryEmail);

    const phoneMatched =
      Boolean(normalizedPhoneInput) &&
      (
        (hasRecoveryPhone && normalizedPhoneInput === recoveryPhone) ||
        (!hasRecoveryPhone && normalizedPhoneInput === profilePhone)
      );

    const emailMatched =
      Boolean(normalizedEmailInput) &&
      (
        (hasRecoveryEmail && normalizedEmailInput === recoveryEmail) ||
        (!hasRecoveryEmail && normalizedEmailInput === profileEmail)
      );

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

  await saveProductsAsync(products);

  return {
    success: true,
    code: products[index].publicCode,
    manageToken: newManageToken,
    managePath: `/manage/${products[index].publicCode}?token=${newManageToken}`,
    manageLink: `http://localhost:3000/manage/${products[index].publicCode}?token=${newManageToken}`
  };
}

export function createRecoverySessionByEmail(input: {
  email: string;
  entryType: RecoveryEntryType;
  expiresInMinutes?: number;
}) {
  const normalizedEmail = normalizeValue(input.email);
  if (!normalizedEmail) {
    throw new Error("E-posta zorunlu.");
  }

  const products = cleanupTransientStates();
  const matches = products.filter((item) => {
    const recoveryEmail = normalizeValue(getRecovery(item).email);
    return Boolean(recoveryEmail) && recoveryEmail === normalizedEmail;
  });

  if (matches.length === 0) {
    return null;
  }

  const token = crypto.randomUUID();
  const now = new Date();
  const expiresInMinutes =
    typeof input.expiresInMinutes === "number" &&
    Number.isFinite(input.expiresInMinutes) &&
    input.expiresInMinutes > 0
      ? input.expiresInMinutes
      : 20;
  const expiresAt = new Date(now.getTime() + expiresInMinutes * 60 * 1000).toISOString();

  const touchedCodes: string[] = [];

  for (let i = 0; i < products.length; i += 1) {
    const recoveryEmail = normalizeValue(getRecovery(products[i]).email);
    if (recoveryEmail !== normalizedEmail) continue;

    touchedCodes.push(products[i].publicCode);
    products[i] = {
      ...products[i],
      updatedAt: now.toISOString(),
      recoverySession: {
        token,
        email: normalizedEmail,
        entryType: input.entryType,
        status: "pending",
        createdAt: now.toISOString(),
        expiresAt
      }
    };
  }

  saveProducts(products);

  return {
    success: true,
    token,
    email: normalizedEmail,
    entryType: input.entryType,
    expiresAt,
    matchedCount: touchedCodes.length,
    codes: touchedCodes
  };
}

export async function createRecoverySessionByEmailAsync(input: {
  email: string;
  entryType: RecoveryEntryType;
  expiresInMinutes?: number;
}) {
  const normalizedEmail = normalizeValue(input.email);
  if (!normalizedEmail) {
    throw new Error("E-posta zorunlu.");
  }

  const products = await cleanupTransientStatesAsync();
  const matches = products.filter((item) => {
    const recoveryEmail = normalizeValue(getRecovery(item).email);
    return Boolean(recoveryEmail) && recoveryEmail === normalizedEmail;
  });

  if (matches.length === 0) {
    return null;
  }

  const token = crypto.randomUUID();
  const now = new Date();
  const expiresInMinutes =
    typeof input.expiresInMinutes === "number" &&
    Number.isFinite(input.expiresInMinutes) &&
    input.expiresInMinutes > 0
      ? input.expiresInMinutes
      : 20;
  const expiresAt = new Date(now.getTime() + expiresInMinutes * 60 * 1000).toISOString();

  const touchedCodes: string[] = [];

  for (let i = 0; i < products.length; i += 1) {
    const recoveryEmail = normalizeValue(getRecovery(products[i]).email);
    if (recoveryEmail !== normalizedEmail) continue;

    touchedCodes.push(products[i].publicCode);
    products[i] = {
      ...products[i],
      updatedAt: now.toISOString(),
      recoverySession: {
        token,
        email: normalizedEmail,
        entryType: input.entryType,
        status: "pending",
        createdAt: now.toISOString(),
        expiresAt
      }
    };
  }

  await saveProductsAsync(products);

  return {
    success: true,
    token,
    email: normalizedEmail,
    entryType: input.entryType,
    expiresAt,
    matchedCount: touchedCodes.length,
    codes: touchedCodes
  };
}

export function verifyRecoverySessionToken(token: string) {
  const normalizedToken = String(token || "").trim();
  if (!normalizedToken) {
    return null;
  }

  const products = cleanupTransientStates();
  const matchedProducts = products.filter((item) => {
    return String(item.recoverySession?.token || "").trim() === normalizedToken;
  });

  if (matchedProducts.length === 0) {
    return null;
  }

  const session = matchedProducts[0].recoverySession;
  if (!session?.token || !session.email || !session.entryType) {
    return null;
  }

  const status = getRecoverySessionStatus(matchedProducts[0]);

  return {
    token: session.token,
    email: session.email,
    entryType: session.entryType,
    status,
    expiresAt: session.expiresAt || "",
    items: matchedProducts.map(mapProductToRecoveryListedItem)
  };
}

export async function verifyRecoverySessionTokenAsync(token: string) {
  const normalizedToken = String(token || "").trim();
  if (!normalizedToken) {
    return null;
  }

  const products = await cleanupTransientStatesAsync();
  const matchedProducts = products.filter((item) => {
    return String(item.recoverySession?.token || "").trim() === normalizedToken;
  });

  if (matchedProducts.length === 0) {
    return null;
  }

  const session = matchedProducts[0].recoverySession;
  if (!session?.token || !session.email || !session.entryType) {
    return null;
  }

  const status = getRecoverySessionStatus(matchedProducts[0]);

  return {
    token: session.token,
    email: session.email,
    entryType: session.entryType,
    status,
    expiresAt: session.expiresAt || "",
    items: matchedProducts.map(mapProductToRecoveryListedItem)
  };
}

export function consumeRecoverySessionToken(token: string) {
  const normalizedToken = String(token || "").trim();
  if (!normalizedToken) {
    return null;
  }

  const products = cleanupTransientStates();
  const matchingIndexes: number[] = [];

  for (let i = 0; i < products.length; i += 1) {
    if (String(products[i].recoverySession?.token || "").trim() === normalizedToken) {
      matchingIndexes.push(i);
    }
  }

  if (matchingIndexes.length === 0) {
    return null;
  }

  const first = products[matchingIndexes[0]];
  const session = first.recoverySession;
  if (!session?.token || !session.email || !session.entryType) {
    return null;
  }

  const status = getRecoverySessionStatus(first);

  if (status !== "pending") {
    return {
      success: false,
      reason: status
    } as const;
  }

  const usedAt = new Date().toISOString();

  for (const index of matchingIndexes) {
    products[index] = {
      ...products[index],
      updatedAt: usedAt,
      recoverySession: {
        ...products[index].recoverySession,
        status: "used",
        usedAt
      }
    };
  }

  saveProducts(products);

  return {
    success: true,
    token: session.token,
    email: session.email,
    entryType: session.entryType,
    usedAt,
    items: matchingIndexes.map((index) => mapProductToRecoveryListedItem(products[index]))
  } as const;
}

export async function consumeRecoverySessionTokenAsync(token: string) {
  const normalizedToken = String(token || "").trim();
  if (!normalizedToken) {
    return null;
  }

  const products = await cleanupTransientStatesAsync();
  const matchingIndexes: number[] = [];

  for (let i = 0; i < products.length; i += 1) {
    if (String(products[i].recoverySession?.token || "").trim() === normalizedToken) {
      matchingIndexes.push(i);
    }
  }

  if (matchingIndexes.length === 0) {
    return null;
  }

  const first = products[matchingIndexes[0]];
  const session = first.recoverySession;
  if (!session?.token || !session.email || !session.entryType) {
    return null;
  }

  const status = getRecoverySessionStatus(first);

  if (status !== "pending") {
    return {
      success: false,
      reason: status
    } as const;
  }

  const usedAt = new Date().toISOString();

  for (const index of matchingIndexes) {
    products[index] = {
      ...products[index],
      updatedAt: usedAt,
      recoverySession: {
        ...products[index].recoverySession,
        status: "used",
        usedAt
      }
    };
  }

  await saveProductsAsync(products);

  return {
    success: true,
    token: session.token,
    email: session.email,
    entryType: session.entryType,
    usedAt,
    items: matchingIndexes.map((index) => mapProductToRecoveryListedItem(products[index]))
  } as const;
}

export function listRecoveryItemsByEmail(email: string): RecoveryListedItem[] {
  const normalizedEmail = normalizeValue(email);
  if (!normalizedEmail) {
    return [];
  }

  return cleanupTransientStates()
    .filter((item) => {
      const recoveryEmail = normalizeValue(getRecovery(item).email);
      return Boolean(recoveryEmail) && recoveryEmail === normalizedEmail;
    })
    .map(mapProductToRecoveryListedItem);
}

export function runFullCleanup() {
  const products = getProducts();
  let changed = false;

  const nextProducts = products.map((product) => {
    const next = cleanupProductRuntimeState(product);

    if (
      next.recoverySession !== product.recoverySession ||
      next.transfer !== product.transfer ||
      next.updatedAt !== product.updatedAt
    ) {
      changed = true;
    }

    return next;
  });

  if (changed) {
    saveProducts(nextProducts);
  }

  return {
    cleaned: changed,
    count: nextProducts.length
  };
}