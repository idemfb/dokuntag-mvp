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
  city?: string;
  addressDetail?: string;
  distinctiveFeature?: string;
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
  status: "unclaimed" | "active";
  productType: ProductType;
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
};

type UpsertTagInput = {
  code: string;
  productType?: ProductType;
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
  status?: "unclaimed" | "active";
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
  status?: "unclaimed" | "active";
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
    status: product.status === "active" ? "active" : "unclaimed",
    productType: product.productType || "item",
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
    recovery: getRecovery(product)
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

  const product = getProducts().find((item) => {
    return String(item.manageToken || "").trim() === normalized;
  });

  return product ? mapProductToTagView(product) : null;
}

export function validateManageToken(codeOrToken: string, maybeToken?: string) {
  const products = getProducts();

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

  const products = getProducts();
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