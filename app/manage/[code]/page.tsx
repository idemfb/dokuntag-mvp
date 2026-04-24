"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ProductType = "pet" | "item" | "key" | "person" | "other";
type ProductSubtype =
  | "cat"
  | "dog"
  | "bird"
  | "pet_other"
  | "house_key"
  | "car_key"
  | "office_key"
  | "key_other"
  | "girl_child"
  | "boy_child"
  | "woman"
  | "man"
  | "elder"
  | "person_other"
  | "bag"
  | "wallet"
  | "luggage"
  | "phone_item"
  | "tablet"
  | "headphones"
  | "item_other";

type ContactMethod = "phone" | "whatsapp" | "email";
type MessageFilter = "all" | "unread" | "read" | "pinned" | "archived";
type MessageSort = "newest" | "oldest" | "unread-first";
type OpenSection = "basic" | "contact" | "recovery" | "messages" | null;
type TagStatus = "active" | "inactive";

const PRODUCT_SUBTYPE_OPTIONS: Record<
  ProductType,
  Array<{ value: ProductSubtype; label: string }>
> = {
  pet: [
    { value: "cat", label: "Kedi" },
    { value: "dog", label: "Köpek" },
    { value: "bird", label: "Kuş" },
    { value: "pet_other", label: "Diğer" }
  ],
  key: [
    { value: "house_key", label: "Ev anahtarı" },
    { value: "car_key", label: "Araba anahtarı" },
    { value: "office_key", label: "Ofis anahtarı" },
    { value: "key_other", label: "Diğer" }
  ],
  person: [
    { value: "girl_child", label: "Kız çocuk" },
    { value: "boy_child", label: "Erkek çocuk" },
    { value: "woman", label: "Kadın" },
    { value: "man", label: "Erkek" },
    { value: "elder", label: "Yaşlı" },
    { value: "person_other", label: "Diğer" }
  ],
  item: [
    { value: "bag", label: "Çanta" },
    { value: "wallet", label: "Cüzdan" },
    { value: "luggage", label: "Valiz" },
    { value: "phone_item", label: "Telefon" },
    { value: "tablet", label: "Tablet" },
    { value: "headphones", label: "Kulaklık" },
    { value: "item_other", label: "Diğer" }
  ],
  other: [{ value: "item_other", label: "Diğer" }]
};

const ALERT_OPTIONS_BY_TYPE: Record<ProductType, string[]> = {
  pet: [
    "Acil bana ulaşın",
    "Hayvanım hasta",
    "Alerjisi var",
    "Ürkek / yaklaşmayın",
    "Ödül verilecektir"
  ],
  item: [
    "Acil bana ulaşın",
    "Lütfen benimle iletişime geçin",
    "İçinde önemli eşya var",
    "Ödül verilecektir"
  ],
  key: [
    "Acil bana ulaşın",
    "Lütfen benimle iletişime geçin",
    "Önemli anahtar",
    "Ödül verilecektir"
  ],
  person: [
    "Acil yakınıma ulaşın",
    "Sağlık durumu için bilgi verin",
    "Kaybolursa lütfen haber verin",
    "Ödül verilecektir"
  ],
  other: [
    "Acil bana ulaşın",
    "Lütfen benimle iletişime geçin",
    "Önemli bilgi var",
    "Ödül verilecektir"
  ]
};

const TURKIYE_CITIES = [
  "Adana",
  "Adıyaman",
  "Afyonkarahisar",
  "Ağrı",
  "Aksaray",
  "Amasya",
  "Ankara",
  "Antalya",
  "Ardahan",
  "Artvin",
  "Aydın",
  "Balıkesir",
  "Bartın",
  "Batman",
  "Bayburt",
  "Bilecik",
  "Bingöl",
  "Bitlis",
  "Bolu",
  "Burdur",
  "Bursa",
  "Çanakkale",
  "Çankırı",
  "Çorum",
  "Denizli",
  "Diyarbakır",
  "Düzce",
  "Edirne",
  "Elazığ",
  "Erzincan",
  "Erzurum",
  "Eskişehir",
  "Gaziantep",
  "Giresun",
  "Gümüşhane",
  "Hakkâri",
  "Hatay",
  "Iğdır",
  "Isparta",
  "İstanbul",
  "İzmir",
  "Kahramanmaraş",
  "Karabük",
  "Karaman",
  "Kars",
  "Kastamonu",
  "Kayseri",
  "Kırıkkale",
  "Kırklareli",
  "Kırşehir",
  "Kilis",
  "Kocaeli",
  "Konya",
  "Kütahya",
  "Malatya",
  "Manisa",
  "Mardin",
  "Mersin",
  "Muğla",
  "Muş",
  "Nevşehir",
  "Niğde",
  "Ordu",
  "Osmaniye",
  "Rize",
  "Sakarya",
  "Samsun",
  "Siirt",
  "Sinop",
  "Sivas",
  "Şanlıurfa",
  "Şırnak",
  "Tekirdağ",
  "Tokat",
  "Trabzon",
  "Tunceli",
  "Uşak",
  "Van",
  "Yalova",
  "Yozgat",
  "Zonguldak"
] as const;

type ManageResponse = {
  code: string;
  productType?: ProductType;
  productSubtype?: ProductSubtype | "";
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
    status?: "pending" | "used" | "expired" | "cancelled";
    createdAt?: string;
    expiresAt?: string;
    usedAt?: string;
    cancelledAt?: string;
    transferPath?: string;
    transferLink?: string;
  };
  status?: TagStatus;
  managePath: string;
  manageLink: string;
};

type ManageSubmitResponse = {
  success: boolean;
  code: string;
  message: string;
  publicLink: string;
  managePath: string;
  manageLink: string;
  status?: TagStatus;
  warning?: string;
  transfer?: {
    token?: string;
    status?: "pending" | "used" | "expired" | "cancelled";
    createdAt?: string;
    expiresAt?: string;
    usedAt?: string;
    cancelledAt?: string;
    transferPath?: string;
    transferLink?: string;
  };
};

type NotifyLogItem = {
  id: string;
  tagCode: string;
  senderFingerprint: string;
  ip: string;
  createdAt: string;
  readAt?: string;
  pinnedAt?: string;
  archivedAt?: string;
  deletedAt?: string;
  senderName?: string;
  senderPhone?: string;
  senderEmail?: string;
  preferredContactMethods?: ContactMethod[];
  message?: string;
};

type NotifyLogsResponse = {
  items: NotifyLogItem[];
  unreadCount?: number;
};

function getSubtypeLabel(productType: ProductType, value: ProductSubtype | "") {
  if (!value) return "";
  const match = PRODUCT_SUBTYPE_OPTIONS[productType].find(
    (item) => item.value === value
  );
  return match?.label || "";
}

function getProductTypeLabel(productType: ProductType) {
  if (productType === "pet") return "Evcil hayvan";
  if (productType === "item") return "Eşya";
  if (productType === "key") return "Anahtar";
  if (productType === "other") return "Diğer";
  return "Birey";
}

function getPrimaryNameLabel(productType: ProductType) {
  if (productType === "pet") return "Evcil hayvan adı";
  if (productType === "person") return "Kişi adı";
  if (productType === "key") return "Anahtar adı";
  if (productType === "other") return "Ad / başlık";
  return "Eşya adı";
}

function getOwnerNameLabel(productType: ProductType) {
  if (productType === "person") return "Yakını";
  return "Sahibi";
}


function getManageTheme(productType: ProductType) {
  if (productType === "pet") {
    return {
      wrapper:
        "border-emerald-200 bg-[linear-gradient(180deg,#f4fbf7_0%,#ffffff_100%)]",
      badge: "border-emerald-200 bg-emerald-50 text-emerald-700"
    };
  }

  if (productType === "key") {
    return {
      wrapper:
        "border-amber-200 bg-[linear-gradient(180deg,#fffaf1_0%,#ffffff_100%)]",
      badge: "border-amber-200 bg-amber-50 text-amber-700"
    };
  }

  if (productType === "person") {
    return {
      wrapper:
        "border-blue-200 bg-[linear-gradient(180deg,#f5f9ff_0%,#ffffff_100%)]",
      badge: "border-blue-200 bg-blue-50 text-blue-700"
    };
  }

  if (productType === "other") {
    return {
      wrapper:
        "border-violet-200 bg-[linear-gradient(180deg,#faf7ff_0%,#ffffff_100%)]",
      badge: "border-violet-200 bg-violet-50 text-violet-700"
    };
  }

  return {
    wrapper:
      "border-neutral-200 bg-[linear-gradient(180deg,#fafafa_0%,#ffffff_100%)]",
    badge: "border-neutral-200 bg-neutral-50 text-neutral-700"
  };
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.24.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M19.05 4.94A9.86 9.86 0 0 0 12.03 2C6.57 2 2.13 6.44 2.13 11.9c0 1.75.46 3.46 1.33 4.97L2 22l5.28-1.38a9.86 9.86 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.44 9.9-9.9a9.82 9.82 0 0 0-2.88-6.99Zm-7.02 15.22h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.13.82.84-3.05-.2-.31a8.18 8.18 0 0 1-1.26-4.4c0-4.53 3.69-8.22 8.24-8.22a8.15 8.15 0 0 1 5.82 2.42 8.16 8.16 0 0 1 2.4 5.81c0 4.54-3.69 8.23-8.22 8.23Zm4.51-6.16c-.25-.13-1.49-.73-1.72-.81-.23-.09-.4-.13-.57.12-.17.25-.66.81-.8.98-.15.17-.29.19-.54.06-.25-.13-1.04-.38-1.99-1.22-.74-.66-1.24-1.47-1.39-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.29.38-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.57-1.37-.78-1.88-.2-.49-.41-.42-.57-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.09s.9 2.42 1.03 2.59c.13.17 1.77 2.7 4.28 3.79.6.26 1.07.42 1.43.53.6.19 1.14.16 1.57.1.48-.07 1.49-.61 1.7-1.2.21-.59.21-1.1.15-1.2-.06-.1-.23-.17-.48-.29Z" />
    </svg>
  );
}

function IconToggle({
  checked,
  disabled,
  label,
  tone,
  icon,
  onChange
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  tone: "phone" | "whatsapp";
  icon: React.ReactNode;
  onChange: (value: boolean) => void;
}) {
  const activeClass =
    tone === "whatsapp"
      ? "border-[#25D366] bg-[#25D366] text-white shadow-sm hover:bg-[#1ebe5d]"
      : "border-neutral-900 bg-neutral-900 text-white shadow-sm hover:bg-neutral-800";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`inline-flex min-w-0 items-center justify-center gap-1.5 rounded-2xl border px-2.5 py-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        checked
          ? activeClass
          : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50"
      }`}
      title={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}


function getMethodLabel(method: ContactMethod) {
  if (method === "whatsapp") return "WhatsApp";
  if (method === "phone") return "Telefon";
  return "E-posta";
}

function buildSearchText(log: NotifyLogItem) {
  return [
    log.senderName || "",
    log.senderPhone || "",
    log.senderEmail || "",
    log.message || "",
    ...(log.preferredContactMethods || []).map((method) =>
      getMethodLabel(method)
    ),
    new Date(log.createdAt).toLocaleString("tr-TR")
  ]
    .join(" ")
    .toLocaleLowerCase("tr-TR");
}

function buildFormSnapshot(input: {
  productType: ProductType;
  productSubtype: ProductSubtype | "";
  status: TagStatus;
  name: string;
  ownerName: string;
  phone: string;
  email: string;
  city: string;
  addressDetail: string;
  distinctiveFeature: string;
  petName: string;
  note: string;
  alerts: string[];
  showName: boolean;
  showPhone: boolean;
  showEmail: boolean;
  showCity: boolean;
  showAddressDetail: boolean;
  showPetName: boolean;
  showNote: boolean;
  allowDirectCall: boolean;
  allowDirectWhatsapp: boolean;
  recoveryPhone: string;
  recoveryEmail: string;
  useRecoveryPhoneAsContact: boolean;
  useRecoveryEmailAsContact: boolean;
}) {
  return JSON.stringify({
    productType: input.productType,
    productSubtype: input.productSubtype,
    status: input.status,
    name: input.name.trim(),
    ownerName: input.ownerName.trim(),
    phone: input.phone.trim(),
    email: input.email.trim(),
    city: input.city.trim(),
    addressDetail: input.addressDetail.trim(),
    distinctiveFeature: input.distinctiveFeature.trim(),
    petName: input.petName.trim(),
    note: input.note.trim(),
    alerts: [...input.alerts].sort(),
    showName: input.showName,
    showPhone: input.showPhone,
    showEmail: input.showEmail,
    showCity: input.showCity,
    showAddressDetail: input.showAddressDetail,
    showPetName: input.showPetName,
    showNote: input.showNote,
    allowDirectCall: input.allowDirectCall,
    allowDirectWhatsapp: input.allowDirectWhatsapp,
    recoveryPhone: input.recoveryPhone.trim(),
    recoveryEmail: input.recoveryEmail.trim(),
    useRecoveryPhoneAsContact: input.useRecoveryPhoneAsContact,
    useRecoveryEmailAsContact: input.useRecoveryEmailAsContact
  });
}

function SectionCard({
  id,
  title,
  description,
  isOpen,
  onToggle,
  children,
  right,
  sectionRef
}: {
  id: Exclude<OpenSection, null>;
  title: string;
  description?: string;
  isOpen: boolean;
  onToggle: (id: Exclude<OpenSection, null>) => void;
  children: React.ReactNode;
  right?: React.ReactNode;
  sectionRef?: React.RefObject<HTMLElement | null>;
}) {
  return (
    <section
      ref={sectionRef}
      className="scroll-mt-24 rounded-[1.75rem] border border-neutral-200 bg-white shadow-sm"
    >
      <button
  type="button"
  onClick={() => onToggle(id)}
  className="flex w-full items-center justify-between px-4 py-3 text-left sm:px-5"
>
  <div>
    <h2 className="text-base font-semibold tracking-tight text-neutral-900">
      {title}
    </h2>
    {description ? (
      <p className="mt-1 text-xs leading-5 text-neutral-600">
        {description}
      </p>
    ) : null}
  </div>

  <div className="ml-4 flex items-center gap-2">
    {right}
    <span className="text-lg text-neutral-500">
      {isOpen ? "−" : "+"}
    </span>
  </div>
</button>

      {isOpen ? (
        <div className="border-t border-neutral-200 px-5 py-5 sm:px-6">
          {children}
        </div>
      ) : null}
    </section>
  );
}

function Field({
  label,
  children,
  optional
}: {
  label: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <label className="text-sm font-medium text-neutral-900 leading-tight">
          {label}
        </label>
        {optional ? (
          <span className="text-xs text-neutral-400">Opsiyonel</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function InlineToggle({
  checked,
  disabled,
  label,
  onChange
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <label
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition ${
        disabled
          ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
          : checked
            ? "cursor-pointer border-neutral-800 bg-neutral-800 text-white"
            : "cursor-pointer border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4"
      />
      <span>{label}</span>
    </label>
  );
}

function SectionNavButton({
  label,
  isActive,
  onClick,
  badge
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  badge?: string | number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
        isActive
          ? "border-neutral-900 bg-neutral-900 text-white shadow-sm"
          : badge !== undefined
            ? "border-amber-300 bg-amber-50 text-amber-900 hover:border-amber-400 hover:bg-amber-100"
            : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50"
      }`}
    >
      <span>{label}</span>
      {badge !== undefined ? (
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            isActive
              ? "bg-white/15 text-white"
              : "border border-amber-200 bg-white text-amber-800"
          }`}
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function maskPhone(phone: string) {
  const cleaned = String(phone || "").trim();
  if (!cleaned) return "-";
  if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}**`;
  return `${cleaned.slice(0, 3)}***${cleaned.slice(-2)}`;
}

function maskEmail(email: string) {
  const value = String(email || "").trim();
  if (!value || !value.includes("@")) return "-";

  const [name, domain] = value.split("@");
  if (!name || !domain) return "-";

  const safeName =
    name.length <= 2 ? `${name[0] || ""}*` : `${name.slice(0, 2)}***`;

  return `${safeName}@${domain}`;
}

export default function ManagePage({
  params
}: {
  params: Promise<{ code: string }>;
}) {
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [manageLink, setManageLink] = useState("");
  const [initialSnapshot, setInitialSnapshot] = useState("");
  const [openSection, setOpenSection] = useState<OpenSection>("basic");

  const [productType, setProductType] = useState<ProductType>("item");
  const [productSubtype, setProductSubtype] = useState<ProductSubtype | "">("");
  const [status, setStatus] = useState<TagStatus>("active");
  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [distinctiveFeature, setDistinctiveFeature] = useState("");
  const [petName, setPetName] = useState("");
  const [note, setNote] = useState("");
  const [alerts, setAlerts] = useState<string[]>([]);
  const [showName, setShowName] = useState(true);
  const [showPhone, setShowPhone] = useState(true);
  const [showEmail] = useState(false);
  const [showCity, setShowCity] = useState(false);
  const [showAddressDetail, setShowAddressDetail] = useState(false);
  const [showPetName, setShowPetName] = useState(true);
  const [showNote, setShowNote] = useState(true);
  const [allowDirectCall, setAllowDirectCall] = useState(false);
  const [allowDirectWhatsapp, setAllowDirectWhatsapp] = useState(false);
  const [recoveryPhone, setRecoveryPhone] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryEmailConfirm, setRecoveryEmailConfirm] = useState("");
  const [useRecoveryPhoneAsContact, setUseRecoveryPhoneAsContact] =
    useState(false);
  const [useRecoveryEmailAsContact, setUseRecoveryEmailAsContact] =
    useState(false);
  const [copiedManage, setCopiedManage] = useState(false);
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferLink, setTransferLink] = useState("");
  const [transferError, setTransferError] = useState("");
  const [transferSuccess, setTransferSuccess] = useState("");
  const [transferExpiresAt, setTransferExpiresAt] = useState("");
  const [copiedTransfer, setCopiedTransfer] = useState(false);
  const [transferCancelLoading, setTransferCancelLoading] = useState(false);

  const [logs, setLogs] = useState<NotifyLogItem[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingRead, setMarkingRead] = useState(false);
  const [readingLogId, setReadingLogId] = useState("");
  const [actingLogId, setActingLogId] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState("");
  const [messageFilter, setMessageFilter] = useState<MessageFilter>("all");
  const [messageSort, setMessageSort] = useState<MessageSort>("newest");
  const [messageSearch, setMessageSearch] = useState("");

  const basicRef = useRef<HTMLElement | null>(null);
  const contactRef = useRef<HTMLElement | null>(null);
  const recoveryRef = useRef<HTMLElement | null>(null);
  const messagesRef = useRef<HTMLElement | null>(null);

  function getSectionRef(section: Exclude<OpenSection, null>) {
    if (section === "basic") return basicRef;
    if (section === "contact") return contactRef;
    if (section === "recovery") return recoveryRef;
    return messagesRef;
  }

  function toggleSection(id: Exclude<OpenSection, null>) {
    setOpenSection((prev) => (prev === id ? null : id));
  }

  function openAndScrollToSection(section: Exclude<OpenSection, null>) {
    setOpenSection(section);

    window.setTimeout(() => {
      const targetRef = getSectionRef(section);
      targetRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 50);
  }

  useEffect(() => {
    params.then((resolved) => setCode(resolved.code));
  }, [params]);
useEffect(() => {
  if (productType === "key") {
    if (city) {
      setCity("");
    }
    if (showCity) {
      setShowCity(false);
    }
  }
}, [productType, city, showCity]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    setToken(url.searchParams.get("token") || "");
  }, []);

  async function loadLogs(currentCode: string, currentToken: string) {
    try {
      setLogsLoading(true);

      const logsRes = await fetch(
        `/api/notify/logs/${currentCode}?token=${encodeURIComponent(currentToken)}`,
        { cache: "no-store" }
      );
      const logsData = (await logsRes.json()) as NotifyLogsResponse;

      if (logsRes.ok) {
        setLogs(Array.isArray(logsData.items) ? logsData.items : []);
        setUnreadCount(Number(logsData.unreadCount || 0));
      } else {
        setLogs([]);
        setUnreadCount(0);
      }
    } catch {
      setLogs([]);
      setUnreadCount(0);
    } finally {
      setLogsLoading(false);
    }
  }

  useEffect(() => {
    if (!code) return;

    if (!token) {
      setLoading(false);
      setError("Düzenleme bağlantısı eksik.");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        
      const res = await fetch(
          `/api/manage/${code}?token=${encodeURIComponent(token)}`,
          { cache: "no-store" }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Bilgiler alınamadı.");
        }

        const manageData = data as ManageResponse;

        const nextProductType = manageData.productType || "item";
        const nextProductSubtype = (manageData.productSubtype || "") as
          | ProductSubtype
          | "";
        const nextStatus =
          manageData.status === "inactive" ? "inactive" : "active";
        const nextName = manageData.profile.name || "";
        const nextOwnerName = manageData.profile.ownerName || "";
        const nextPhone = manageData.profile.phone || "";
        const nextEmail = manageData.recovery?.email || manageData.profile.email || "";
        const nextCity = manageData.profile.city || "";
        const nextAddressDetail = manageData.profile.addressDetail || "";
        const nextDistinctiveFeature =
          manageData.profile.distinctiveFeature || "";
        const nextPetName = manageData.profile.petName || "";
        const nextNote = manageData.profile.note || "";
        const nextAlerts = Array.isArray(manageData.alerts)
          ? manageData.alerts
          : [];
        const nextShowName = Boolean(manageData.visibility?.showName);
        const nextShowPhone = Boolean(manageData.visibility?.showPhone);
        const nextShowCity = Boolean(manageData.visibility?.showCity);
        const nextShowAddressDetail = Boolean(
          manageData.visibility?.showAddressDetail
        );
        const nextShowPetName = Boolean(manageData.visibility?.showPetName);
        const nextShowNote = Boolean(manageData.visibility?.showNote);
        const nextAllowDirectCall = Boolean(
          manageData.contactOptions?.allowDirectCall
        );
        const nextAllowDirectWhatsapp = Boolean(
          manageData.contactOptions?.allowDirectWhatsapp
        );
        const nextRecoveryPhone = "";
        const nextRecoveryEmail = manageData.recovery?.email || "";
        const nextUseRecoveryPhoneAsContact = false;
        const nextUseRecoveryEmailAsContact = false;

        setProductType(nextProductType);
        setProductSubtype(nextProductSubtype);
        setStatus(nextStatus);
        setName(nextName);
        setOwnerName(nextOwnerName);
        setPhone(nextPhone);
        setEmail(nextEmail);
        setCity(nextCity);
        setAddressDetail(nextAddressDetail);
        setDistinctiveFeature(nextDistinctiveFeature);
        setPetName(nextPetName);
        setNote(nextNote);
        setAlerts(nextAlerts);
        setShowName(nextShowName);
        setShowPhone(nextShowPhone);
        setShowCity(nextShowCity);
        setShowAddressDetail(nextShowAddressDetail);
        setShowPetName(nextShowPetName);
        setShowNote(nextShowNote);
        setAllowDirectCall(nextAllowDirectCall);
        setAllowDirectWhatsapp(nextAllowDirectWhatsapp);
        setRecoveryPhone("");
        setRecoveryEmail(nextRecoveryEmail);
        setRecoveryEmailConfirm(nextRecoveryEmail);
        setUseRecoveryPhoneAsContact(false);
        setUseRecoveryEmailAsContact(false);
        setManageLink(manageData.manageLink || "");

        const activeTransfer =
          manageData.transfer?.status === "pending" &&
          manageData.transfer?.transferLink
            ? manageData.transfer
            : null;

        setTransferLink(activeTransfer?.transferLink || "");
        setTransferExpiresAt(activeTransfer?.expiresAt || "");
        setTransferError("");
        setTransferSuccess("");
        setConfirmDeactivate(false);

        setInitialSnapshot(
          buildFormSnapshot({
            productType: nextProductType,
            productSubtype: nextProductSubtype,
            status: nextStatus,
            name: nextName,
            ownerName: nextOwnerName,
            phone: nextPhone,
            email: nextEmail,
            city: nextCity,
            addressDetail: nextAddressDetail,
            distinctiveFeature: nextDistinctiveFeature,
            petName: nextPetName,
            note: nextNote,
            alerts: nextAlerts,
            showName: nextShowName,
            showPhone: nextShowPhone,
            showEmail: false,
            showCity: nextShowCity,
            showAddressDetail: nextShowAddressDetail,
            showPetName: nextShowPetName,
            showNote: nextShowNote,
            allowDirectCall: nextAllowDirectCall,
            allowDirectWhatsapp: nextAllowDirectWhatsapp,
            recoveryPhone: nextRecoveryPhone,
            recoveryEmail: nextRecoveryEmail,
            useRecoveryPhoneAsContact: nextUseRecoveryPhoneAsContact,
            useRecoveryEmailAsContact: nextUseRecoveryEmailAsContact
          })
        );

        await loadLogs(code, token);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [code, token]);

  useEffect(() => {
    if (!allowDirectCall && !allowDirectWhatsapp && showPhone) {
      setShowPhone(false);
    }
  }, [allowDirectCall, allowDirectWhatsapp, showPhone]);

  useEffect(() => {
    if ((allowDirectCall || allowDirectWhatsapp) && phone.trim()) {
      setShowPhone(true);
    }
  }, [allowDirectCall, allowDirectWhatsapp, phone]);
  useEffect(() => {
    if (!phone.trim()) {
      setAllowDirectCall(false);
      setAllowDirectWhatsapp(false);
      setShowPhone(false);
    }
  }, [phone]);





useEffect(() => {
  if (productType === "key") {
    if (city) {
      setCity("");
    }
    if (showCity) {
      setShowCity(false);
    }
  }
}, [productType, city, showCity]);
  useEffect(() => {
    if (!city.trim() && showCity) {
      setShowCity(false);
    }
  }, [city, showCity]);

  useEffect(() => {
    if (!addressDetail.trim() && showAddressDetail) {
      setShowAddressDetail(false);
    }
  }, [addressDetail, showAddressDetail]);

  useEffect(() => {
    if (showAddressDetail) {
      setShowAddressDetail(false);
    }
  }, [showAddressDetail]);

  useEffect(() => {
    if (!note.trim() && showNote) {
      setShowNote(false);
    }
  }, [note, showNote]);

  useEffect(() => {
    if (!productSubtype) return;
    const isValid = PRODUCT_SUBTYPE_OPTIONS[productType].some(
      (item) => item.value === productSubtype
    );
    if (!isValid) {
      setProductSubtype("");
    }
  }, [productType, productSubtype]);

  const allowedAlerts = useMemo(() => {
    return ALERT_OPTIONS_BY_TYPE[productType];
  }, [productType]);

  const allowedSubtypeOptions = useMemo(() => {
    return PRODUCT_SUBTYPE_OPTIONS[productType];
  }, [productType]);

  useEffect(() => {
    setAlerts((prev) => prev.filter((item) => allowedAlerts.includes(item)));
  }, [allowedAlerts]);

  const shareLink = useMemo(() => {
    if (!code) return "";
    if (typeof window === "undefined") return `/p/${code}`;
    return `${window.location.origin}/p/${code}`;
  }, [code]);

  const formattedTransferExpiry = useMemo(() => {
    if (!transferExpiresAt) return "";
    const parsed = new Date(transferExpiresAt);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toLocaleString("tr-TR");
  }, [transferExpiresAt]);

  const transferShareText = useMemo(() => {
    if (!transferLink) return "";
    const expiryText = formattedTransferExpiry
      ? `Bu bağlantı ${formattedTransferExpiry} tarihine kadar geçerlidir.`
      : "Bu bağlantı sınırlı süreyle geçerlidir.";

    return [
      "Dokuntag ürün devri bağlantısı",
      "",
      transferLink,
      "",
      expiryText,
      "Bağlantıyı açan kişi ürünü kendi hesabına aktarabilir."
    ].join("\n");
  }, [formattedTransferExpiry, transferLink]);

  const transferWhatsappHref = useMemo(() => {
    if (!transferShareText) return "";
    return `https://wa.me/?text=${encodeURIComponent(transferShareText)}`;
  }, [transferShareText]);

  const transferEmailHref = useMemo(() => {
    if (!transferShareText) return "";
    return `mailto:?subject=${encodeURIComponent("Dokuntag ürün devri")}&body=${encodeURIComponent(transferShareText)}`;
  }, [transferShareText]);

  const publicPreviewItems = useMemo(() => {
    const items: Array<{ label: string; value: string }> = [];

    if (showPetName && petName.trim()) {
      items.push({
        label: getPrimaryNameLabel(productType),
        value: petName.trim()
      });
    }

    if (showName && ownerName.trim()) {
      items.push({
        label: getOwnerNameLabel(productType),
        value: ownerName.trim()
      });
    }

    const subtypeLabel = getSubtypeLabel(productType, productSubtype);
    if (subtypeLabel) {
      items.push({ label: "Kategori", value: subtypeLabel });
    }

    if (phone.trim() && (allowDirectCall || allowDirectWhatsapp)) {
      items.push({ label: "Telefon", value: phone.trim() });
    }

    if (showCity && city.trim()) {
      items.push({ label: "Şehir", value: city.trim() });
    }

    return items;
  }, [
    productType,
    productSubtype,
    petName,
    ownerName,
    phone,
    city,
    showPetName,
    showName,
    showPhone,
    showCity,
    allowDirectCall,
    allowDirectWhatsapp
  ]);

  const publicPreviewNote = useMemo(() => {
    if (!showNote || !note.trim()) return "";
    return note.trim();
  }, [note, showNote]);

  const currentSnapshot = useMemo(() => {
    return buildFormSnapshot({
      productType,
      productSubtype,
      status,
      name: petName,
      ownerName,
      phone,
      email,
      city,
      addressDetail,
      distinctiveFeature,
      petName,
      note,
      alerts,
      showName,
      showPhone,
      showEmail: false,
      showCity,
      showAddressDetail,
      showPetName,
      showNote,
      allowDirectCall,
      allowDirectWhatsapp,
      recoveryPhone: "",
      recoveryEmail,
      useRecoveryPhoneAsContact: false,
      useRecoveryEmailAsContact: false
    });
  }, [
    productType,
    productSubtype,
    status,
    name,
    ownerName,
    phone,
    email,
    city,
    addressDetail,
    distinctiveFeature,
    petName,
    note,
    alerts,
    showName,
    showPhone,
    showCity,
    showAddressDetail,
    showPetName,
    showNote,
    allowDirectCall,
    allowDirectWhatsapp,
    recoveryPhone,
    recoveryEmail,
    useRecoveryPhoneAsContact,
    useRecoveryEmailAsContact
  ]);

  const isDirty = Boolean(initialSnapshot) && currentSnapshot !== initialSnapshot;

  const displayPrimaryName = useMemo(() => {
    return petName.trim() || "İsimsiz profil";
  }, [petName]);

  const manageTheme = useMemo(() => getManageTheme(productType), [productType]);

  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  const filteredLogs = useMemo(() => {
    let base = logs;

    if (messageFilter === "archived") {
      base = base.filter((item) => Boolean(item.archivedAt));
    } else {
      base = base.filter((item) => !item.archivedAt);

      if (messageFilter === "unread") {
        base = base.filter((item) => !item.readAt);
      } else if (messageFilter === "read") {
        base = base.filter((item) => Boolean(item.readAt));
      } else if (messageFilter === "pinned") {
        base = base.filter((item) => Boolean(item.pinnedAt));
      }
    }

    const query = messageSearch.trim().toLocaleLowerCase("tr-TR");

    if (query) {
      base = base.filter((item) => buildSearchText(item).includes(query));
    }

    const sorted = [...base];

    if (messageSort === "oldest") {
      sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else if (messageSort === "unread-first") {
      sorted.sort((a, b) => {
        const aUnread = a.readAt ? 1 : 0;
        const bUnread = b.readAt ? 1 : 0;

        if (aUnread !== bUnread) {
          return aUnread - bUnread;
        }

        const aPinned = a.pinnedAt ? 1 : 0;
        const bPinned = b.pinnedAt ? 1 : 0;

        if (aPinned !== bPinned) {
          return bPinned - aPinned;
        }

        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    } else {
      sorted.sort((a, b) => {
        const aPinned = a.pinnedAt ? 1 : 0;
        const bPinned = b.pinnedAt ? 1 : 0;

        if (aPinned !== bPinned) {
          return bPinned - aPinned;
        }

        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    }

    return sorted;
  }, [logs, messageFilter, messageSearch, messageSort]);

  function toggleAlert(value: string) {
    if (!allowedAlerts.includes(value)) return;

    setAlerts((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  }

  async function copyManageLink() {
    if (!manageLink) return;
    await navigator.clipboard.writeText(manageLink);
    setCopiedManage(true);
    setTimeout(() => setCopiedManage(false), 1500);
  }

  async function copyShareLink() {
    if (!shareLink) return;
    await navigator.clipboard.writeText(shareLink);
    setCopiedPublic(true);
    setTimeout(() => setCopiedPublic(false), 1500);
  }

  async function copyTransferLink() {
    if (!transferLink) return;
    await navigator.clipboard.writeText(transferLink);
    setCopiedTransfer(true);
    setTimeout(() => setCopiedTransfer(false), 1500);
  }

  async function handleCreateTransfer() {
    if (!code || !token || transferLoading || isDirty) return;

    try {
      setTransferLoading(true);
      setTransferError("");
      setTransferSuccess("");
      setTransferExpiresAt("");

      const res = await fetch(
        `/api/transfer/create/${code}?token=${encodeURIComponent(token)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Devir bağlantısı oluşturulamadı.");
      }

      const nextTransferLink =
        typeof data?.transferLink === "string" ? data.transferLink : "";
      const nextTransferExpiresAt =
        typeof data?.expiresAt === "string" ? data.expiresAt : "";

      setTransferLink(nextTransferLink);
      setTransferExpiresAt(nextTransferExpiresAt);
      setTransferSuccess(
        data?.message ||
          "Devir bağlantısı oluşturuldu. Ürün güvenlik için pasif duruma alındı."
      );
      setStatus("inactive");
      setConfirmDeactivate(false);

      setInitialSnapshot(
        buildFormSnapshot({
          productType,
          productSubtype,
          status: "inactive",
          name: petName,
          ownerName,
          phone,
          email: recoveryEmail,
          city,
          addressDetail,
          distinctiveFeature,
          petName,
          note,
          alerts,
          showName,
          showPhone,
          showEmail: false,
          showCity,
          showAddressDetail,
          showPetName,
          showNote,
          allowDirectCall,
          allowDirectWhatsapp,
          recoveryPhone: "",
          recoveryEmail,
          useRecoveryPhoneAsContact: false,
          useRecoveryEmailAsContact: false
        })
      );

      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setTransferError(
        err instanceof Error ? err.message : "Devir bağlantısı oluşturulamadı."
      );
    } finally {
      setTransferLoading(false);
    }
  }

  async function handleCancelTransfer() {
    if (!code || !token || transferCancelLoading || !transferLink) return;

    try {
      setTransferCancelLoading(true);
      setTransferError("");
      setTransferSuccess("");

      const res = await fetch(
        `/api/transfer/cancel/${code}?token=${encodeURIComponent(token)}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Devir bağlantısı iptal edilemedi.");
      }

      setTransferLink("");
      setTransferExpiresAt("");
      setStatus("active");
      setConfirmDeactivate(false);
      setTransferSuccess(
        data?.message ||
          "Devir bağlantısı iptal edildi. Ürün yeniden aktif duruma alındı."
      );

      setInitialSnapshot(
        buildFormSnapshot({
          productType,
          productSubtype,
          status: "active",
          name: petName,
          ownerName,
          phone,
          email: recoveryEmail,
          city,
          addressDetail,
          distinctiveFeature,
          petName,
          note,
          alerts,
          showName,
          showPhone,
          showEmail: false,
          showCity,
          showAddressDetail,
          showPetName,
          showNote,
          allowDirectCall,
          allowDirectWhatsapp,
          recoveryPhone: "",
          recoveryEmail,
          useRecoveryPhoneAsContact: false,
          useRecoveryEmailAsContact: false
        })
      );
    } catch (err) {
      setTransferError(
        err instanceof Error ? err.message : "Devir bağlantısı iptal edilemedi."
      );
    } finally {
      setTransferCancelLoading(false);
    }
  }

  async function markAllAsRead() {
    if (!code || !token || markingRead || unreadCount === 0) return;

    try {
      setMarkingRead(true);
      setError("");

      const res = await fetch(
        `/api/notify/logs/${code}/read?token=${encodeURIComponent(token)}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Mesajlar okundu olarak işaretlenemedi.");
      }

      await loadLogs(code, token);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Mesajlar okundu olarak işaretlenemedi."
      );
    } finally {
      setMarkingRead(false);
    }
  }

  async function markSingleAsRead(logId: string) {
    if (!code || !token || !logId || readingLogId) return;

    try {
      setReadingLogId(logId);
      setError("");

      const res = await fetch(
        `/api/notify/logs/${code}/${logId}/read?token=${encodeURIComponent(token)}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Mesaj okundu olarak işaretlenemedi.");
      }

      await loadLogs(code, token);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Mesaj okundu olarak işaretlenemedi."
      );
    } finally {
      setReadingLogId("");
    }
  }

  async function runLogAction(
    logId: string,
    action: "pin" | "archive" | "delete"
  ) {
    if (!code || !token || !logId || actingLogId) return;

    try {
      setActingLogId(logId);
      setError("");

      const res = await fetch(
        `/api/notify/logs/${code}/${logId}/${action}?token=${encodeURIComponent(token)}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "İşlem tamamlanamadı.");
      }

      await loadLogs(code, token);
      setPendingDeleteId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setActingLogId("");
    }
  }

  async function handleStatusToggle() {
    if (!code || !token || statusSaving) return;

    const nextStatus: TagStatus =
      status === "inactive" ? "active" : "inactive";

    if (status === "active" && !confirmDeactivate) {
      setConfirmDeactivate(true);
      setError("");
      setSuccess("");
      return;
    }

    try {
      setStatusSaving(true);
      setError("");
      setSuccess("");

      const res = await fetch(
        `/api/manage/${code}?token=${encodeURIComponent(token)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            productType,
            productSubtype,
            name: petName,
            ownerName,
            phone,
            email: recoveryEmail,
            city,
            addressDetail,
            distinctiveFeature,
            petName,
            note,
            alerts,
            status: nextStatus,
            visibility: {
              showName,
              showPhone,
              showEmail: false,
              showCity,
              showAddressDetail,
              showPetName,
              showNote
            },
            contactOptions: {
              allowDirectCall,
              allowDirectWhatsapp
            },
            recovery: {
              phone: "",
              email: recoveryEmail
            }
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Durum güncellenemedi.");
      }

      const submitData = data as ManageSubmitResponse;
      const resolvedStatus =
        submitData.status === "inactive" ? "inactive" : nextStatus;

      setStatus(resolvedStatus);
      setManageLink(submitData.manageLink || "");
      setConfirmDeactivate(false);

      const nextSnapshot = buildFormSnapshot({
        productType,
        productSubtype,
        status: resolvedStatus,
        name: petName,
        ownerName,
        phone,
        email: recoveryEmail,
        city,
        addressDetail,
        distinctiveFeature,
        petName,
        note,
        alerts,
        showName,
        showPhone,
        showEmail: false,
        showCity,
        showAddressDetail,
        showPetName,
        showNote,
        allowDirectCall,
        allowDirectWhatsapp,
        recoveryPhone: "",
        recoveryEmail,
        useRecoveryPhoneAsContact: false,
        useRecoveryEmailAsContact: false
      });

      setInitialSnapshot(nextSnapshot);
      setSuccess(
        resolvedStatus === "inactive"
          ? "Ürün pasif duruma alındı. Herkese açık sayfada iletişim ve görünür profil kapatıldı."
          : "Ürün yeniden aktif edildi. Herkese açık sayfa ve iletişim seçenekleri tekrar açıldı."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setStatusSaving(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");
      if (!petName.trim()) {
  throw new Error("İsim zorunludur.");
}

if (!recoveryEmail.trim()) {
  throw new Error("Kurtarma e-postası zorunludur.");
}

if (!recoveryEmailConfirm.trim()) {
  throw new Error("Kurtarma e-postasını tekrar yazın.");
}

if (
  recoveryEmail.trim().toLowerCase() !==
  recoveryEmailConfirm.trim().toLowerCase()
) {
  throw new Error("Kurtarma e-postaları aynı olmalıdır.");
}
      const res = await fetch(
        `/api/manage/${code}?token=${encodeURIComponent(token)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            productType,
            productSubtype,
            name: petName,
            ownerName,
            phone,
            email: recoveryEmail,
            city,
            addressDetail,
            distinctiveFeature,
            petName,
            note,
            alerts,
            status,
            visibility: {
              showName,
              showPhone,
              showEmail: false,
              showCity,
              showAddressDetail,
              showPetName,
              showNote
            },
            contactOptions: {
              allowDirectCall,
              allowDirectWhatsapp
            },
            recovery: {
              phone: "",
              email: recoveryEmail
            }
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Güncelleme başarısız.");
      }

      const submitData = data as ManageSubmitResponse;
      const resolvedStatus =
        submitData.status === "inactive" ? "inactive" : status;

      setStatus(resolvedStatus);
      setManageLink(submitData.manageLink || "");
      setConfirmDeactivate(false);

      setSuccess(
        submitData.message ||
          "Değişiklikler kaydedildi. Herkese açık profil otomatik olarak güncellendi."
      );

      setInitialSnapshot(
        buildFormSnapshot({
          productType,
          productSubtype,
          status: resolvedStatus,
          name: petName,
          ownerName,
          phone,
          email: recoveryEmail,
          city,
          addressDetail,
          distinctiveFeature,
          petName,
          note,
          alerts,
          showName,
          showPhone,
          showEmail: false,
          showCity,
          showAddressDetail,
          showPetName,
          showNote,
          allowDirectCall,
          allowDirectWhatsapp,
          recoveryPhone: "",
          recoveryEmail,
          useRecoveryPhoneAsContact: false,
          useRecoveryEmailAsContact: false
        })
      );

      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#fbfbfa_0%,#fdfdfc_55%,#ffffff_100%)] px-4 py-6 text-neutral-900">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[2rem] border border-neutral-200 bg-white px-6 py-7 shadow-sm">
            <p className="text-sm text-neutral-600">Yükleniyor...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error && (error.includes("Geçersiz") || error.includes("eksik"))) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#fbfbfa_0%,#fdfdfc_55%,#ffffff_100%)] px-4 py-6 text-neutral-900">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Dokuntag
              <span className="ml-2 text-neutral-500">Profil Yönetimi</span>
            </h1>
          </div>

          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-5 shadow-sm">
            <p className="text-sm text-red-700">{error}</p>

            <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
              Düzenleme bağlantınızı kaybettiyseniz{" "}
              <a
                href="/recover"
                className="font-medium underline underline-offset-4"
              >
                kurtarma sayfasından yeni bağlantı oluşturabilirsiniz
              </a>
              .
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fbfbfa_0%,#fdfdfc_55%,#ffffff_100%)] px-4 py-6 text-neutral-900">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <a
            href="/my"
            className="inline-flex items-center text-sm text-neutral-500 transition hover:text-neutral-900 hover:underline"
          >
            ← Ürünlerim
          </a>

          <div className="mt-4 overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-neutral-100/80 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
                    Dokuntag
                    <span className="ml-2 text-neutral-500">Profil Yönetimi</span>
                  </h1>
                </div>
              </div>

              <div className={`mt-5 rounded-[1.5rem] border p-4 sm:p-5 ${manageTheme.wrapper}`}>
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <p className="min-w-0 truncate text-xl font-semibold text-neutral-900">
                    {displayPrimaryName}
                  </p>

                  <span className={`rounded-full border px-3 py-1 text-xs font-medium ${manageTheme.badge}`}>
                    {code || "-"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => void handleStatusToggle()}
                    disabled={statusSaving}
                    className={`w-full rounded-2xl px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      status === "inactive"
                        ? "border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                        : confirmDeactivate
                          ? "border border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                          : "border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                    }`}
                  >
                    {statusSaving
                      ? "İşleniyor..."
                      : status === "inactive"
                        ? "Yeniden aktifleştir"
                        : confirmDeactivate
                          ? "Pasife almayı onayla"
                          : "Ürünü pasife al"}
                  </button>

                  <a
                    href={shareLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-neutral-900 bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    Profili görüntüle
                  </a>
                </div>
                    <p className="mt-3 text-xs text-neutral-500">
                      Değişiklikler herkese açık profilde anında görünür.
                  </p>
                {status === "active" && confirmDeactivate ? (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                    Pasife alındığında herkese açık profilde bilgiler ve
                    iletişim seçenekleri kapanır.
                  </div>
                ) : null}

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <SectionNavButton
                    label="Bilgiler"
                    isActive={openSection === "basic"}
                    onClick={() => openAndScrollToSection("basic")}
                  />
                  <SectionNavButton
                    label="İletişim"
                    isActive={openSection === "contact"}
                    onClick={() => openAndScrollToSection("contact")}
                  />
                  <SectionNavButton
                    label="Hesap Kurtarma"
                    isActive={openSection === "recovery"}
                    onClick={() => openAndScrollToSection("recovery")}
                  />
                  <SectionNavButton
                    label="Mesajlar"
                    isActive={openSection === "messages"}
                    onClick={() => openAndScrollToSection("messages")}
                    badge={unreadCount > 0 ? unreadCount : undefined}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mb-5 rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mb-5 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
            <p className="text-sm font-semibold text-emerald-900">
              Kaydedildi
            </p>
            <p className="mt-1 text-sm leading-6 text-emerald-700">
              {success}
            </p>
          </div>
        ) : null}
        {isDirty ? (
  <div className="sticky top-3 z-30 mb-4 flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm backdrop-blur">
    <span>
      Kaydedilmemiş değişiklikler var.
    </span>

    <button
  type="submit"
  form="manage-form"
  disabled={saving}
  className="shrink-0 rounded-xl bg-neutral-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
>
  {saving ? "Kaydediliyor..." : "Kaydet"}
</button>
  </div>
) : null} 
        <form id="manage-form" noValidate onSubmit={handleSubmit} className="space-y-4">
          <SectionCard
            id="basic"
            title="Profil bilgileri"
            description="Görünen temel bilgileri buradan düzenleyin."
            isOpen={openSection === "basic"}
            onToggle={toggleSection}
            sectionRef={basicRef}
          >
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Profil Türü">
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value as ProductType)}
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                  >
                    <option value="item">Eşya</option>
                    <option value="key">Anahtar</option>
                    <option value="pet">Evcil hayvan</option>
                    <option value="person">Birey</option>
                    <option value="other">Diğer</option>
                  </select>
                </Field>

                <Field label="Kategori" optional>
                  <select
                    value={productSubtype}
                    onChange={(e) =>
                      setProductSubtype(e.target.value as ProductSubtype | "")
                    }
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                  >
                    <option value="">Seçmek istemiyorum</option>
                    {allowedSubtypeOptions.map((item) => (
                      <option
                        key={`${productType}-${item.value}`}
                        value={item.value}
                      >
                        {item.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="mb-2 flex min-h-[44px] items-center justify-between gap-2">
                    <label className="text-sm font-medium text-neutral-900 leading-tight">
                      {getPrimaryNameLabel(productType)}
                    </label>

                    <InlineToggle
                      checked={showPetName}
                      label="Görünsün"
                      onChange={setShowPetName}
                    />
                  </div>

                  <input
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                    placeholder="Ana görünen isim"
                    required
                  />
                </div>

                <div>
                  <div className="mb-2 flex min-h-[44px] items-center justify-between gap-2">
                    <label className="text-sm font-medium text-neutral-900 leading-tight">
                      {getOwnerNameLabel(productType)}
                    </label>

                    <InlineToggle
                      checked={showName}
                      label="Görünsün"
                      onChange={setShowName}
                    />
                  </div>

                  <input
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                    placeholder="İsteğe bağlı"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="mb-2 grid grid-cols-[1fr_auto] items-center gap-2">
                    <div className="flex items-center gap-1.5">
                    <label className="text-sm font-medium text-neutral-900">
                      Not
                    </label>
                    <span className="text-xs text-neutral-400">(opsiyonel)</span>
                  </div>

                    <InlineToggle
                      checked={showNote}
                      disabled={!note.trim()}
                      label="Görünsün"
                      onChange={setShowNote}
                    />
                  </div>

                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="min-h-[84px] w-full rounded-2xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                    placeholder={`Bulana göstermek için Kısa not yazın\nGüvenlik için açık adres paylaşmayın.`}
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <label className="text-sm font-medium text-neutral-900 leading-tight">
                      Hızlı notlar
                    </label>
                    <span className="text-xs text-neutral-400">Opsiyonel</span>
                  </div>

                  <div className="grid gap-2">
                    {allowedAlerts.map((item) => {
                      const isActive = alerts.includes(item);

                      return (
                        <button
                          key={`${productType}-${item}`}
                          type="button"
                          onClick={() => toggleAlert(item)}
                          className={`flex min-h-[46px] w-full items-center justify-center rounded-2xl border px-3 py-2.5 text-center text-sm font-medium transition ${
                            isActive
                              ? "border-neutral-900 bg-neutral-900 text-white"
                              : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50"
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            id="contact"
            title="İletişim"
            description="Bulan kişinin size nasıl ulaşabileceğini buradan seçin."
            isOpen={openSection === "contact"}
            onToggle={toggleSection}
            sectionRef={contactRef}
          >
            <div className="grid gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-900">
                  Telefon
                </label>

                <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr] gap-2">
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="min-w-0 rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                    placeholder="05xxxxxxxxx"
                  />

                  <IconToggle
                    checked={allowDirectCall}
                    disabled={!phone.trim()}
                    label="Telefon"
                    tone="phone"
                    icon={<PhoneIcon />}
                    onChange={(checked) => {
                      setAllowDirectCall(checked);
                      setShowPhone(Boolean((checked || allowDirectWhatsapp) && phone.trim()));
                    }}
                  />

                  <IconToggle
                    checked={allowDirectWhatsapp}
                    disabled={!phone.trim()}
                    label="WhatsApp"
                    tone="whatsapp"
                    icon={<WhatsAppIcon />}
                    onChange={(checked) => {
                      setAllowDirectWhatsapp(checked);
                      setShowPhone(Boolean((allowDirectCall || checked) && phone.trim()));
                    }}
                  />
                </div>

                <p className="mt-2 text-xs leading-5 text-neutral-500">
                  Telefon girilirse arama ve WhatsApp seçeneklerini ayrı ayrı açabilirsiniz.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-neutral-900">
                    Profil önizleme
                  </p>
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-neutral-500">
                    Public görünüm
                  </span>
                </div>

                {publicPreviewItems.length > 0 || alerts.length > 0 || publicPreviewNote ? (
                  <div className="mt-3 grid gap-3">
                    <div className="grid grid-cols-2 gap-2">
                      {publicPreviewItems.map((item) => (
                        <div
                          key={`${item.label}-${item.value}`}
                          className="rounded-2xl border border-neutral-200 bg-white px-4 py-3"
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                            {item.label}
                          </p>
                          <p className="mt-1 truncate text-sm text-neutral-900">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {alerts.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {alerts.map((alert) => (
                          <span
                            key={alert}
                            className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-700"
                          >
                            {alert}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {publicPreviewNote ? (
                      <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                          Not
                        </p>
                        <p className="mt-1 text-sm leading-7 text-neutral-900">
                          {publicPreviewNote}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-neutral-600">
                    Şu an herkese açık profilde bilgi görünmüyor. İsterseniz görünürlük seçeneklerinden bazı alanları açabilirsiniz.
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
  <div className="mb-2 grid grid-cols-[auto_1fr_auto] items-center gap-2">
    <div className="flex items-center gap-1.5">
      <label className="text-sm font-medium text-neutral-900">
        Şehir
      </label>
      <span className="text-xs text-neutral-400">Opsiyonel</span>
    </div>

    <select
      value={city}
      onChange={(e) => setCity(e.target.value)}
      disabled={productType === "key"}
      className={`min-w-0 rounded-2xl border px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
        productType === "key"
          ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
          : "border-neutral-300 bg-white text-neutral-900 focus:border-neutral-500 focus:ring-neutral-200"
      }`}
    >
      <option value="">Seçiniz</option>
      {TURKIYE_CITIES.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>

    <InlineToggle
      checked={showCity}
      disabled={!city.trim() || productType === "key"}
      label="Görünsün"
      onChange={setShowCity}
    />
  </div>

  {productType === "key" ? (
    <p className="mt-2 text-xs leading-5 text-amber-700">
      Anahtar ürünlerinde konum paylaşımı güvenlik riski oluşturabilir. Bu yüzden şehir bilgisi kapalı tutulmuştur.
    </p>
  ) : null}
</div>
             
              </div>
            </div>
          </SectionCard>

          <SectionCard
            id="recovery"
            title="Hesap kurtarma ve bağlantılar"
            description="Yönetim erişimi ve ürün devri işlemlerini burada yönetin."
            isOpen={openSection === "recovery"}
            onToggle={toggleSection}
            sectionRef={recoveryRef}
          >
            <p className="text-sm text-center text-neutral-600">
              Bu e-posta kimseye gösterilmez. Yönetim erişimi ve sistem bildirimleri için kullanılır.
            </p>

            <div className="mt-4 grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-center text-sm font-medium text-neutral-700">
                    Kurtarma e-postası
                  </label>

                  <input
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value.trim())}
                    className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                      error.toLowerCase().includes("kurtarma")
                        ? "border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-100"
                        : "border-neutral-300 bg-white focus:border-neutral-500 focus:ring-neutral-200"
                    }`}
                    placeholder="ornek@mail.com"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-center text-sm font-medium text-neutral-700">
                    E-postayı tekrar yazın
                  </label>

                  <input
                    type="email"
                    value={recoveryEmailConfirm}
                    onChange={(e) => setRecoveryEmailConfirm(e.target.value.trim())}
                    className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                      error.toLowerCase().includes("kurtarma")
                        ? "border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-100"
                        : "border-neutral-300 bg-white focus:border-neutral-500 focus:ring-neutral-200"
                    }`}
                    placeholder="ornek@mail.com"
                  />
                </div>
              </div>

              <p className="text-center text-xs text-neutral-500">
                Yanlış yazımı önlemek için kurtarma e-postasını iki kez girin.
              </p>
              <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 px-4 py-3">
                <div className="grid gap-3">
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    Ürünü başkasına devret
                  </p>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">
                    Devir bağlantısı oluşturduğunuzda ürün pasif duruma alınır.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void handleCreateTransfer()}
                  disabled={transferLoading || isDirty}
                  className="w-full rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {transferLoading ? "Oluşturuluyor..." : "Devir bağlantısı oluştur"}
                </button>
              </div>

                {isDirty ? (
                  <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Önce değişiklikleri kaydedin.
                  </div>
                ) : null}

                {transferError ? (
                  <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {transferError}
                  </div>
                ) : null}

                {transferSuccess ? (
                  <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {transferSuccess}
                  </div>
                ) : null}

                {transferLink ? (
                  <div className="mt-3 rounded-2xl border border-neutral-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                      Devir bağlantısı
                    </p>
                    <p className="mt-2 break-all text-sm leading-6 text-neutral-800">
                      {transferLink}
                    </p>

                    <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
                      <p className="font-medium">
                        Bu bağlantı güvenlik nedeniyle süreli ve tek kullanımlıktır.
                      </p>
                      <p className="mt-1">
                        {formattedTransferExpiry
                          ? `Son kullanım: ${formattedTransferExpiry}`
                          : "Son kullanım tarihi bağlantı oluşturulduktan sonra otomatik belirlenir."}
                      </p>
                      <p className="mt-1">
                        Bağlantıyı açan kişi ürünü kendi hesabına aktarabilir.
                      </p>
                    </div>

                    <div className="mt-2.5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => void copyTransferLink()}
                      className="w-full rounded-2xl border border-neutral-300 bg-white px-3 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
                    >
                      {copiedTransfer ? "Kopyalandı" : "Devir linki"}
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleCancelTransfer()}
                      disabled={transferCancelLoading}
                      className="w-full rounded-2xl border border-red-300 bg-red-50 px-3 py-3 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {transferCancelLoading ? "İptal..." : "Deviri iptal et"}
                    </button>

                    <a
                      href={transferWhatsappHref || undefined}
                      target="_blank"
                      rel="noreferrer"
                      className={`inline-flex w-full items-center justify-center rounded-2xl border px-3 py-3 text-sm font-medium transition ${
                        transferWhatsappHref
                          ? "border-neutral-300 bg-white hover:border-neutral-400 hover:bg-neutral-50"
                          : "pointer-events-none cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                      }`}
                    >
                      WhatsApp ile Paylaş
                    </a>

                    <a
                      href={transferEmailHref || undefined}
                      className={`inline-flex w-full items-center justify-center rounded-2xl border px-3 py-3 text-sm font-medium transition ${
                        transferEmailHref
                          ? "border-neutral-300 bg-white hover:border-neutral-400 hover:bg-neutral-50"
                          : "pointer-events-none cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                      }`}
                    >
                      E-posta İle Paylaş
                    </a>
                  </div>
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => void copyManageLink()}
                className="w-full rounded-2xl border border-neutral-300 bg-white px-3 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
              >
                {copiedManage ? "Kopyalandı" : "Düzenleme linki"}
              </button>

              <button
                type="button"
                onClick={() => void copyShareLink()}
                className="w-full rounded-2xl border border-neutral-300 bg-white px-3 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
              >
                {copiedPublic ? "Kopyalandı" : "Herkese Açık profil linki"}
              </button>
            </div>
            </div>
          </SectionCard>

          <SectionCard
            id="messages"
            title="Bildirimler"
            description="Gelen mesajları buradan yönetin."
            isOpen={openSection === "messages"}
            onToggle={toggleSection}
            right={
              unreadCount > 0 ? (
                <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                  {unreadCount} yeni
                </span>
              ) : null
            }
            sectionRef={messagesRef}
          >
            <section>
              <div className="mb-4 grid gap-3">
                <p className="text-sm leading-6 text-neutral-600">
                  Gelen mesajları buradan görüntüleyebilir ve yönetebilirsiniz.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => void loadLogs(code, token)}
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-3 py-2.5 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
                  >
                    Yenile
                  </button>

                  <button
                    type="button"
                    onClick={() => void markAllAsRead()}
                    disabled={markingRead || unreadCount === 0}
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-3 py-2.5 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {markingRead ? "İşleniyor..." : "Tümünü okundu yap"}
                  </button>
                </div>
              </div>

              <div className="mb-4 grid gap-2">
  <input
    value={messageSearch}
    onChange={(e) => setMessageSearch(e.target.value)}
    className="rounded-2xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
    placeholder="Mesaj ara"
  />

      <div className="grid grid-cols-2 gap-2">
        <select
          value={messageFilter}
          onChange={(e) => setMessageFilter(e.target.value as MessageFilter)}
          className="rounded-2xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
        >
          <option value="all">Tümü</option>
          <option value="unread">Okunmamış</option>
          <option value="read">Okunmuş</option>
          <option value="pinned">Sabitlenen</option>
          <option value="archived">Arşiv</option>
        </select>

        <select
          value={messageSort}
          onChange={(e) => setMessageSort(e.target.value as MessageSort)}
          className="rounded-2xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
        >
          <option value="newest">En yeni</option>
          <option value="oldest">En eski</option>
          <option value="unread-first">Önce okunmamış</option>
        </select>
      </div>
    </div>

              {logsLoading ? (
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
                  Mesajlar yükleniyor...
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
                  Bu filtrede mesaj bulunmuyor.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLogs.map((log) => {
                    const isArchived = Boolean(log.archivedAt);
                    const isPinned = Boolean(log.pinnedAt);
                    const isBusy =
                      actingLogId === log.id || readingLogId === log.id;

                    return (
                    <div
                      key={log.id}
                      className="rounded-xl border border-neutral-200 bg-white p-2.5"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-700">
                          {new Date(log.createdAt).toLocaleString("tr-TR")}
                        </span>

                        {Array.isArray(log.preferredContactMethods) &&
                        log.preferredContactMethods.length > 0 ? (
                          <span className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-700">
                            {log.preferredContactMethods
                              .map((method) => getMethodLabel(method))
                              .join(", ")}
                          </span>
                        ) : null}

                        {isPinned ? (
                          <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                            Sabitlendi
                          </span>
                        ) : null}

                        {isArchived ? (
                          <span className="rounded-full border border-neutral-300 bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                            Arşivde
                          </span>
                        ) : log.readAt ? (
                          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                            Okundu
                          </span>
                        ) : (
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                            Yeni
                          </span>
                        )}
                      </div>

                      <div className="mt-2.5 grid gap-2">
                        <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5">
                          <p className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                            Gönderen
                          </p>
                          <p className="mt-1 text-sm font-medium text-neutral-900">
                            {log.senderName || "-"}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5">
                            <p className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                              Telefon
                            </p>
                            <p className="mt-1 text-sm text-neutral-700">
                              {maskPhone(log.senderPhone || "")}
                            </p>
                          </div>

                          <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5">
                            <p className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                              E-posta
                            </p>
                            <p className="mt-1 break-all text-sm text-neutral-700">
                              {maskEmail(log.senderEmail || "")}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                          Mesaj
                        </p>
                        <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-5 text-neutral-800">
                          {log.message || "-"}
                        </p>
                      </div>

                      <div className="mt-2.5 grid grid-cols-2 gap-2">
                        {!log.readAt && !isArchived ? (
                          <button
                            type="button"
                            onClick={() => void markSingleAsRead(log.id)}
                            disabled={isBusy}
                            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {readingLogId === log.id ? "İşleniyor..." : "Okundu yap"}
                          </button>
                        ) : null}

                        {!isArchived ? (
                          <button
                            type="button"
                            onClick={() => void runLogAction(log.id, "pin")}
                            disabled={isBusy}
                            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {actingLogId === log.id
                              ? "İşleniyor..."
                              : isPinned
                                ? "Sabiti kaldır"
                                : "Sabitle"}
                          </button>
                        ) : null}

                        {!isArchived ? (
                          <button
                            type="button"
                            onClick={() => void runLogAction(log.id, "archive")}
                            disabled={isBusy}
                            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {actingLogId === log.id ? "İşleniyor..." : "Arşivle"}
                          </button>
                        ) : null}

                        {pendingDeleteId === log.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => void runLogAction(log.id, "delete")}
                              disabled={isBusy}
                              className="w-full rounded-xl border border-red-300 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {actingLogId === log.id ? "Siliniyor..." : "Onayla"}
                            </button>

                            <button
                              type="button"
                              onClick={() => setPendingDeleteId("")}
                              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
                            >
                              Vazgeç
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPendingDeleteId(log.id)}
                            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
                          >
                            Sil
                          </button>
                        )}
                      </div>
                    </div>
                  );
                  })}
                </div>
              )}
            </section>
          </SectionCard>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="submit"
              disabled={saving || statusSaving}
              className="w-full rounded-2xl bg-neutral-800 px-5 py-4 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Kaydediliyor..."
                : isDirty
                  ? "Değişiklikleri kaydet"
                  : "Kaydedilecek değişiklik yok"}
            </button>

            <a
              href={shareLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-neutral-300 bg-white px-5 py-4 text-center text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
            >
              Profili görüntüle
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}