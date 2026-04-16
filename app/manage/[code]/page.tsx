"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ProductType = "pet" | "item" | "key" | "person";
type ContactMethod = "phone" | "whatsapp" | "email";
type MessageFilter = "all" | "unread" | "read" | "pinned" | "archived";
type MessageSort = "newest" | "oldest" | "unread-first";
type OpenSection = "basic" | "contact" | "alerts" | "recovery" | "messages" | null;
type TagStatus = "active" | "inactive";

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
  ]
};


const TURKIYE_CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin",
  "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur",
  "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan",
  "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkâri", "Hatay", "Iğdır", "Isparta", "İstanbul",
  "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli", "Kırşehir",
  "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş",
  "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas",
  "Şanlıurfa", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"
] as const;

const DISTINCTIVE_FEATURE_PLACEHOLDERS: Record<ProductType, string> = {
  pet: "Örn: sağ kulağında beyaz leke, mavi tasma",
  item: "Örn: siyah sırt çantası, köşesi hafif çizik",
  key: "Örn: kırmızı anahtarlık, metal halka",
  person: "Örn: mavi mont, siyah sırt çantası"
};

type ManageResponse = {
  code: string;
  productType?: ProductType;
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

function getProductTypeLabel(productType: ProductType) {
  if (productType === "pet") return "Evcil hayvan";
  if (productType === "item") return "Ürün";
  if (productType === "key") return "Anahtar";
  return "Birey";
}

function getPrimaryNameLabel(productType: ProductType) {
  if (productType === "pet") return "Evcil hayvan adı";
  if (productType === "person") return "Kişi adı";
  if (productType === "key") return "Anahtar adı";
  return "Ürün adı";
}

function getOwnerNameLabel(productType: ProductType) {
  if (productType === "person") return "Yakını / sorumlusu";
  return "Sahibi";
}

function getSecondaryNameLabel(productType: ProductType) {
  if (productType === "pet") return "Etiket başlığı";
  if (productType === "person") return "Profil başlığı";
  if (productType === "key") return "Etiket / kısa başlık";
  return "Etiket / kısa başlık";
}

function getMethodLabel(method: ContactMethod) {
  if (method === "whatsapp") return "WhatsApp";
  if (method === "phone") return "Telefon / SMS";
  return "E-posta";
}

function buildSearchText(log: NotifyLogItem) {
  return [
    log.senderName || "",
    log.senderPhone || "",
    log.senderEmail || "",
    log.message || "",
    ...(log.preferredContactMethods || []).map((method) => getMethodLabel(method)),
    new Date(log.createdAt).toLocaleString("tr-TR")
  ]
    .join(" ")
    .toLocaleLowerCase("tr-TR");
}

function buildFormSnapshot(input: {
  productType: ProductType;
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
  useRecoveryEmailAsContact: boolean;
}) {
  return JSON.stringify({
    productType: input.productType,
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
        className="flex w-full items-center justify-between px-5 py-5 text-left sm:px-6"
      >
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-neutral-600">
              {description}
            </p>
          ) : null}
        </div>

        <div className="ml-4 flex items-center gap-3">
          {right}
          <span className="text-xl text-neutral-500">
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
        <label className="block text-sm font-medium text-neutral-900">
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

function AlertOption({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-neutral-200 px-4 py-3 transition hover:border-neutral-300 hover:bg-neutral-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-0.5"
      />
      <span className="text-sm text-neutral-900">{label}</span>
    </label>
  );
}

function InfoCard({
  title,
  value,
  subtext
}: {
  title: string;
  value: string | number;
  subtext: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-neutral-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-neutral-900">{value}</p>
      <p className="mt-1 text-xs text-neutral-500">{subtext}</p>
    </div>
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
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
        isActive
          ? "border-neutral-900 bg-neutral-900 text-white shadow-sm"
          : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50"
      }`}
    >
      <span>{label}</span>
      {badge !== undefined ? (
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            isActive
              ? "bg-white/15 text-white"
              : "border border-neutral-200 bg-neutral-50 text-neutral-600"
          }`}
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
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
  const [warning, setWarning] = useState(
    "Bu size özel yönetim bağlantısıdır. Şifre gibi düşünün, güvenli şekilde saklayın. Kaybederseniz recover alanından yenisini oluşturabilirsiniz."
  );
  const [initialSnapshot, setInitialSnapshot] = useState("");
  const [openSection, setOpenSection] = useState<OpenSection>("basic");

  const [productType, setProductType] = useState<ProductType>("item");
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
  const [useRecoveryEmailAsContact, setUseRecoveryEmailAsContact] = useState(false);
  const [copiedManage, setCopiedManage] = useState(false);
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferLink, setTransferLink] = useState("");
  const [transferError, setTransferError] = useState("");
  const [transferSuccess, setTransferSuccess] = useState("");
  const [copiedTransfer, setCopiedTransfer] = useState(false);

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
  const alertsRef = useRef<HTMLElement | null>(null);
  const recoveryRef = useRef<HTMLElement | null>(null);
  const messagesRef = useRef<HTMLElement | null>(null);

  function getSectionRef(section: Exclude<OpenSection, null>) {
    if (section === "basic") return basicRef;
    if (section === "contact") return contactRef;
    if (section === "alerts") return alertsRef;
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
      setError("Yönetim bağlantısı eksik.");
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
        const nextStatus = manageData.status === "inactive" ? "inactive" : "active";
        const nextName = manageData.profile.name || "";
        const nextOwnerName = manageData.profile.ownerName || "";
        const nextPhone = manageData.profile.phone || "";
        const nextEmail = manageData.profile.email || "";
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
        const nextRecoveryPhone = manageData.recovery?.phone || "";
        const nextRecoveryEmail = manageData.recovery?.email || "";
        const nextUseRecoveryEmailAsContact =
          Boolean(nextRecoveryEmail) &&
          nextEmail.trim().toLocaleLowerCase("tr-TR") ===
            nextRecoveryEmail.trim().toLocaleLowerCase("tr-TR");

        setProductType(nextProductType);
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
        setRecoveryPhone(nextRecoveryPhone);
        setRecoveryEmail(nextRecoveryEmail);
        setUseRecoveryEmailAsContact(nextUseRecoveryEmailAsContact);
        setManageLink(manageData.manageLink || "");
        setConfirmDeactivate(false);

        setInitialSnapshot(
          buildFormSnapshot({
            productType: nextProductType,
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
    if (!allowDirectCall && showPhone) {
      setShowPhone(false);
    }
  }, [allowDirectCall, showPhone]);

  useEffect(() => {
    if (!allowDirectCall && allowDirectWhatsapp) {
      setAllowDirectWhatsapp(false);
    }
  }, [allowDirectCall, allowDirectWhatsapp]);
  useEffect(() => {
    if (!useRecoveryEmailAsContact) return;
    setEmail(recoveryEmail.trim());
  }, [useRecoveryEmailAsContact, recoveryEmail]);


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

  const allowedAlerts = useMemo(() => {
    return ALERT_OPTIONS_BY_TYPE[productType];
  }, [productType]);

  useEffect(() => {
    setAlerts((prev) => prev.filter((item) => allowedAlerts.includes(item)));
  }, [allowedAlerts]);

  const shareLink = useMemo(() => {
    if (!code) return "";
    if (typeof window === "undefined") return `/p/${code}`;
    return `${window.location.origin}/p/${code}`;
  }, [code]);

  const visibleFieldCount = useMemo(() => {
    return [
      showName,
      showPhone,
      showCity,
      showAddressDetail,
      showPetName,
      showNote
    ].filter(Boolean).length;
  }, [
    showName,
    showPhone,
    showCity,
    showAddressDetail,
    showPetName,
    showNote
  ]);

  const enabledQuickActionsCount = useMemo(() => {
    return [allowDirectCall, allowDirectWhatsapp].filter(Boolean).length;
  }, [allowDirectCall, allowDirectWhatsapp]);

  const currentSnapshot = useMemo(() => {
    return buildFormSnapshot({
      productType,
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
      showEmail: false,
      showCity,
      showAddressDetail,
      showPetName,
      showNote,
      allowDirectCall,
      allowDirectWhatsapp,
      recoveryPhone,
      recoveryEmail,
      useRecoveryEmailAsContact
    });
  }, [
    productType,
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
    useRecoveryEmailAsContact
  ]);

  const isDirty = Boolean(initialSnapshot) && currentSnapshot !== initialSnapshot;

  const displayPrimaryName = useMemo(() => {
    return petName.trim() || "İsimsiz ürün";
  }, [petName]);

  const displaySecondaryName = useMemo(() => {
    const primary = petName.trim().toLocaleLowerCase("tr-TR");
    const secondary = name.trim();
    if (!secondary) return "";
    if (secondary.toLocaleLowerCase("tr-TR") === primary) return "";
    return secondary;
  }, [name, petName]);

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

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } else {
      sorted.sort((a, b) => {
        const aPinned = a.pinnedAt ? 1 : 0;
        const bPinned = b.pinnedAt ? 1 : 0;

        if (aPinned !== bPinned) {
          return bPinned - aPinned;
        }

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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
        throw new Error(data?.error || "Devir linki oluşturulamadı.");
      }

      const nextTransferLink =
        typeof data?.transferLink === "string" ? data.transferLink : "";

      setTransferLink(nextTransferLink);
      setTransferSuccess(
        data?.message ||
          "Devir linki oluşturuldu. Ürün güvenlik için pasif duruma alındı."
      );
      setStatus("inactive");
      setConfirmDeactivate(false);

      setInitialSnapshot(
        buildFormSnapshot({
          productType,
          status: "inactive",
          name,
          ownerName,
          phone,
          email: useRecoveryEmailAsContact ? recoveryEmail : email,
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
          recoveryPhone,
          recoveryEmail,
          useRecoveryEmailAsContact
        })
      );

      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setTransferError(
        err instanceof Error ? err.message : "Devir linki oluşturulamadı."
      );
    } finally {
      setTransferLoading(false);
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

    const nextStatus: TagStatus = status === "inactive" ? "active" : "inactive";

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
            name,
            ownerName,
            phone,
            email: useRecoveryEmailAsContact ? recoveryEmail : email,
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
              phone: recoveryPhone,
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
      const resolvedStatus = submitData.status === "inactive" ? "inactive" : nextStatus;

      setStatus(resolvedStatus);
      setManageLink(submitData.manageLink || "");
      setConfirmDeactivate(false);

      if (submitData.warning) {
        setWarning(submitData.warning);
      }

      const nextSnapshot = buildFormSnapshot({
        productType,
        status: resolvedStatus,
        name,
        ownerName,
        phone,
        email: useRecoveryEmailAsContact ? recoveryEmail : email,
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
        recoveryPhone,
        recoveryEmail,
        useRecoveryEmailAsContact
      });

      setInitialSnapshot(nextSnapshot);
      setSuccess(
        resolvedStatus === "inactive"
          ? "Ürün pasif duruma alındı. Public sayfada iletişim ve görünür profil kapatıldı."
          : "Ürün yeniden aktif edildi. Public sayfa ve iletişim seçenekleri tekrar açıldı."
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

      const res = await fetch(
        `/api/manage/${code}?token=${encodeURIComponent(token)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            productType,
            name,
            ownerName,
            phone,
            email: useRecoveryEmailAsContact ? recoveryEmail : email,
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
              phone: recoveryPhone,
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
      const resolvedStatus = submitData.status === "inactive" ? "inactive" : status;

      setStatus(resolvedStatus);
      setManageLink(submitData.manageLink || "");
      setConfirmDeactivate(false);

      setSuccess(
        submitData.message ||
          "Değişiklikler kaydedildi. Herkese açık profil otomatik olarak güncellendi."
      );

      if (submitData.warning) {
        setWarning(submitData.warning);
      }

      setInitialSnapshot(
        buildFormSnapshot({
          productType,
          status: resolvedStatus,
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
          showEmail: false,
          showCity,
          showAddressDetail,
          showPetName,
          showNote,
          allowDirectCall,
          allowDirectWhatsapp,
          recoveryPhone,
          recoveryEmail,
          useRecoveryEmailAsContact
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
      <main className="min-h-screen bg-neutral-100 px-4 py-8 text-neutral-900 sm:px-5 sm:py-10">
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
      <main className="min-h-screen bg-neutral-100 px-4 py-8 text-neutral-900 sm:px-5 sm:py-10">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.24em] text-neutral-500">
              Dokuntag Yönetim
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Profil yönetimi
            </h1>
          </div>

          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-5 shadow-sm">
            <p className="text-sm text-red-700">{error}</p>

            <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
              Yönetim bağlantınızı kaybettiyseniz{" "}
              <a href="/recover" className="font-medium underline underline-offset-4">
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
    <main className="min-h-screen bg-neutral-100 px-4 py-8 text-neutral-900 sm:px-5 sm:py-10">
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
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-neutral-500">
                    Dokuntag Yönetim
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                    Profil yönetimi
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
                    Bu ürünün herkese açık profilini, iletişim seçeneklerini ve gelen mesajlarını buradan yönetebilirsiniz.
                  </p>
                </div>

                <a
                  href={shareLink}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
                >
                  Herkese açık profili aç
                </a>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-700">
                  Kod: {code}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    status === "inactive"
                      ? "border border-amber-200 bg-amber-50 text-amber-800"
                      : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  Durum: {status === "inactive" ? "pasif" : "aktif"}
                </span>
                <span className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-700">
                  Tip: {getProductTypeLabel(productType)}
                </span>
                {displaySecondaryName ? (
                  <span className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-700">
                    Başlık: {displaySecondaryName}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
                  {status === "inactive" ? "Pasif ürün" : "Aktif ürün"}
                </p>
                <p className="mt-2 text-xl font-semibold text-neutral-900">
                  {displayPrimaryName}
                </p>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  {status === "inactive"
                    ? "Bu ürün şu anda public tarafta kapalıdır. Profil ve iletişim seçenekleri yalnızca yeniden aktifleştirildiğinde görünür."
                    : "Burada yaptığınız değişiklikler kaydedildiğinde herkese açık profil otomatik olarak güncellenir."}
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void handleStatusToggle()}
                    disabled={statusSaving}
                    className={`rounded-2xl px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
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

                  {status === "active" && confirmDeactivate ? (
                    <button
                      type="button"
                      onClick={() => setConfirmDeactivate(false)}
                      className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
                    >
                      Vazgeç
                    </button>
                  ) : null}
                </div>

                {status === "active" && confirmDeactivate ? (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
                    Pasife alındığında public profilde bilgiler ve iletişim seçenekleri kapanır. Manage erişiminiz devam eder.
                  </div>
                ) : null}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <SectionNavButton
                  label="Temel bilgiler"
                  isActive={openSection === "basic"}
                  onClick={() => openAndScrollToSection("basic")}
                />
                <SectionNavButton
                  label="İletişim"
                  isActive={openSection === "contact"}
                  onClick={() => openAndScrollToSection("contact")}
                />
                <SectionNavButton
                  label="Uyarılar"
                  isActive={openSection === "alerts"}
                  onClick={() => openAndScrollToSection("alerts")}
                />
                <SectionNavButton
                  label="Kurtarma"
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

        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={() => openAndScrollToSection("messages")}
            className="mb-5 flex w-full items-center justify-between rounded-[1.5rem] border border-amber-300 bg-amber-50 px-5 py-4 text-left shadow-sm transition hover:border-amber-400 hover:bg-amber-100"
          >
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Yeni mesajlarınız var
              </p>
              <p className="mt-1 text-sm text-amber-700">
                {unreadCount} okunmamış mesaj bulundu. Tıklayarak mesajlar bölümüne geçebilirsiniz.
              </p>
            </div>

            <span className="rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-semibold text-amber-800">
              {unreadCount} yeni
            </span>
          </button>
        ) : null}

        {error ? (
          <div className="mb-5 rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mb-5 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-4 shadow-sm">
            <p className="text-sm font-semibold text-emerald-900">
              Kaydedildi
            </p>
            <p className="mt-1 text-sm leading-6 text-emerald-700">
              {success}
            </p>
          </div>
        ) : null}

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <InfoCard
            title="Görünür alan"
            value={visibleFieldCount}
            subtext="Public sayfada"
          />
          <InfoCard
            title="Hızlı iletişim"
            value={enabledQuickActionsCount}
            subtext="Aktif seçenek"
          />
          <InfoCard
            title="Yeni mesaj"
            value={unreadCount}
            subtext="Okunmamış kayıt"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <SectionCard
            id="basic"
            title="Temel bilgiler"
            description="Ürün ve profil bilgilerini düzenleyin."
            isOpen={openSection === "basic"}
            onToggle={toggleSection}
            sectionRef={basicRef}
          >
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Ürün tipi">
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value as ProductType)}
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                  >
                    <option value="item">Eşya</option>
                    <option value="key">Anahtar</option>
                    <option value="pet">Evcil hayvan</option>
                    <option value="person">Kişi</option>
                  </select>
                </Field>

                <Field label={getPrimaryNameLabel(productType)}>
                  <input
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                    placeholder="Ana görünen isim"
                    required
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <InlineToggle
                      checked={showPetName}
                      label={`${getPrimaryNameLabel(productType)} görünsün`}
                      onChange={setShowPetName}
                    />
                  </div>
                </Field>
              </div>

              <Field label={getSecondaryNameLabel(productType)} optional>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                  placeholder="Sadece farklıysa girin"
                  required
                />
                <p className="mt-2 text-xs text-neutral-500">
                  Ana isimden farklıysa gösterilir.
                </p>
              </Field>

              <Field label={getOwnerNameLabel(productType)} optional>
                <input
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                  placeholder="İsteğe bağlı"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <InlineToggle
                    checked={showName}
                    label={`${getOwnerNameLabel(productType)} görünsün`}
                    onChange={setShowName}
                  />
                </div>
              </Field>

              <Field label="Ayırt edici özellik" optional>
                <input
                  value={distinctiveFeature}
                  onChange={(e) => setDistinctiveFeature(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                  placeholder={DISTINCTIVE_FEATURE_PLACEHOLDERS[productType]}
                />
              </Field>

              <Field label="Not" optional>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="min-h-[120px] w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                  placeholder="Bulana göstermek istediğiniz kısa not"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <InlineToggle
                    checked={showNote}
                    disabled={!note.trim()}
                    label="Not görünsün"
                    onChange={setShowNote}
                  />
                </div>
              </Field>
            </div>
          </SectionCard>

          <SectionCard
            id="contact"
            title="İletişim"
            description="İletişim bilgilerini girin ve hangileri görünsün seçin."
            isOpen={openSection === "contact"}
            onToggle={toggleSection}
            sectionRef={contactRef}
          >
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Telefon">
                  <input
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                    placeholder="05xxxxxxxxx"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <InlineToggle
                      checked={allowDirectCall}
                      disabled={!phone.trim()}
                      label="Telefonla ulaşılabilsin"
                      onChange={setAllowDirectCall}
                    />
                    <InlineToggle
                      checked={allowDirectWhatsapp}
                      disabled={!phone.trim() || !allowDirectCall}
                      label="WhatsApp açılsın"
                      onChange={setAllowDirectWhatsapp}
                    />
                    <InlineToggle
                      checked={showPhone}
                      disabled={!phone.trim() || !allowDirectCall}
                      label="Telefon görünsün"
                      onChange={setShowPhone}
                    />
                  </div>
                </Field>

                <Field label="E-posta">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={useRecoveryEmailAsContact}
                    className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 ${
                      useRecoveryEmailAsContact
                        ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-500"
                        : "border-neutral-300 bg-white"
                    }`}
                    placeholder="ornek@mail.com"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <InlineToggle
                      checked={useRecoveryEmailAsContact}
                      disabled={!recoveryEmail.trim()}
                      label="Kurtarma e-postasını iletişim maili olarak kullan"
                      onChange={(checked) => {
                        setUseRecoveryEmailAsContact(checked);
                        if (checked) {
                          setEmail(recoveryEmail.trim());
                        }
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-neutral-500">
                    Public profilde e-posta görünmez. Bu alan mesaj bildirimleri için kullanılır.
                  </p>
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Şehir" optional>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                  >
                    <option value="">Seçiniz</option>
                    {TURKIYE_CITIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <InlineToggle
                      checked={showCity}
                      disabled={!city.trim()}
                      label="Şehir görünsün"
                      onChange={setShowCity}
                    />
                  </div>
                  {productType === "key" ? (
                    <p className="mt-2 text-xs leading-5 text-amber-700">
                      Anahtar ürünlerinde konum paylaşımı güvenlik riski oluşturabilir. Gerekmedikçe şehir bilgisini kapalı tutun.
                    </p>
                  ) : null}
                </Field>

                <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 px-4 py-4">
                  <p className="text-sm font-medium text-neutral-900">Adres bilgisi gizli tutulur</p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    Adres detayı güvenlik nedeniyle Dokuntag içinde paylaşılmaz ve public profilde gösterilmez.
                    Adres belirtmek isterseniz bunu not alanına manuel olarak sizin yazmanız gerekir.
                  </p>
                  <p className="mt-2 text-xs leading-5 text-neutral-500">
                    Mevcut eski adres kayıtları sistemde saklı kalabilir ancak yeni ziyaretçilere gösterilmez.
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            id="alerts"
            title="Uyarılar"
            description="İsterseniz dikkat çekmesi gereken notları seçin."
            isOpen={openSection === "alerts"}
            onToggle={toggleSection}
            sectionRef={alertsRef}
          >
            <div className="grid gap-3">
              {allowedAlerts.map((item) => (
                <AlertOption
                  key={`${productType}-${item}`}
                  label={item}
                  checked={alerts.includes(item)}
                  onChange={() => toggleAlert(item)}
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            id="recovery"
            title="Kurtarma ve bağlantılar"
            description="Yedek iletişim ve bağlantıları burada tutun."
            isOpen={openSection === "recovery"}
            onToggle={toggleSection}
            sectionRef={recoveryRef}
          >
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Kurtarma telefonu">
                  <input
                    value={recoveryPhone}
                    onChange={(e) =>
                      setRecoveryPhone(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                    placeholder="05xxxxxxxxx"
                  />
                </Field>

                <Field label="Kurtarma e-postası">
                  <input
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                    placeholder="ornek@mail.com"
                  />
                  <p className="mt-2 text-xs text-neutral-500">
                    İsterseniz bunu tek dokunuşla iletişim bildirimi için de kullanabilirsiniz.
                  </p>
                </Field>
              </div>

              <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 px-4 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      Ürünü başkasına devret
                    </p>
                    <p className="mt-1 text-sm leading-6 text-neutral-600">
                      Devir linki oluşturduğunuzda ürün güvenlik için pasif duruma alınır. Yeni sahip linki kullanınca size özel yönetim erişimi kapanır.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleCreateTransfer()}
                    disabled={transferLoading || isDirty}
                    className="rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {transferLoading ? "Oluşturuluyor..." : "Devir linki oluştur"}
                  </button>
                </div>

                {isDirty ? (
                  <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Devir oluşturmadan önce mevcut değişiklikleri kaydedin.
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

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void copyTransferLink()}
                        className="rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
                      >
                        {copiedTransfer ? "Devir linki kopyalandı" : "Devir linkini kopyala"}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-4">
                <p className="text-sm font-medium text-amber-900">Önemli not</p>
                <p className="mt-1 text-sm leading-6 text-amber-800">
                  {warning}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => void copyManageLink()}
                  className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
                >
                  {copiedManage ? "Yönetim linki kopyalandı" : "Yönetim linkini kopyala"}
                </button>

                <button
                  type="button"
                  onClick={() => void copyShareLink()}
                  className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
                >
                  {copiedPublic ? "Public link kopyalandı" : "Public linki kopyala"}
                </button>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            id="messages"
            title="Mesajlar"
            description="Size gelen mesajları buradan yönetin."
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
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm leading-6 text-neutral-600">
                    Gelen mesajları buradan görebilir, sabitleyebilir, arşivleyebilir ve düzenleyebilirsiniz.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void loadLogs(code, token)}
                    className="rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
                  >
                    Yenile
                  </button>

                  <button
                    type="button"
                    onClick={() => void markAllAsRead()}
                    disabled={markingRead || unreadCount === 0}
                    className="rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {markingRead ? "İşleniyor..." : "Tümünü okundu yap"}
                  </button>
                </div>
              </div>

              <div className="mb-4 grid gap-3 sm:grid-cols-3">
                <select
                  value={messageFilter}
                  onChange={(e) => setMessageFilter(e.target.value as MessageFilter)}
                  className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none"
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
                  className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none"
                >
                  <option value="newest">En yeni</option>
                  <option value="oldest">En eski</option>
                  <option value="unread-first">Önce okunmamış</option>
                </select>

                <input
                  value={messageSearch}
                  onChange={(e) => setMessageSearch(e.target.value)}
                  className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none"
                  placeholder="Mesaj ara"
                />
              </div>

              {logsLoading ? (
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm text-neutral-600">
                  Mesajlar yükleniyor...
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm text-neutral-600">
                  Bu filtrede mesaj bulunmuyor.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredLogs.map((log) => {
                    const isArchived = Boolean(log.archivedAt);
                    const isPinned = Boolean(log.pinnedAt);
                    const isBusy = actingLogId === log.id || readingLogId === log.id;

                    return (
                      <div
                        key={log.id}
                        className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-4"
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

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl bg-white p-3">
                            <p className="text-xs text-neutral-400">Gönderen</p>
                            <p className="mt-1 text-sm font-medium text-neutral-900">
                              {log.senderName || "-"}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-white p-3">
                            <p className="text-xs text-neutral-400">Telefon</p>
                            <p className="mt-1 text-sm text-neutral-700">
                              {maskPhone(log.senderPhone || "")}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-white p-3 sm:col-span-2">
                            <p className="text-xs text-neutral-400">E-posta</p>
                            <p className="mt-1 break-all text-sm text-neutral-700">
                              {maskEmail(log.senderEmail || "")}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4">
                          <p className="text-xs text-neutral-400">Mesaj</p>
                          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-neutral-800">
                            {log.message || "-"}
                          </p>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {!log.readAt && !isArchived ? (
                            <button
                              type="button"
                              onClick={() => void markSingleAsRead(log.id)}
                              disabled={isBusy}
                              className="rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {readingLogId === log.id ? "İşleniyor..." : "Okundu yap"}
                            </button>
                          ) : null}

                          {!isArchived ? (
                            <button
                              type="button"
                              onClick={() => void runLogAction(log.id, "pin")}
                              disabled={isBusy}
                              className="rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {actingLogId === log.id
                                ? "İşleniyor..."
                                : isPinned
                                  ? "Sabitlemeyi kaldır"
                                  : "Sabitle"}
                            </button>
                          ) : null}

                          {!isArchived ? (
                            <button
                              type="button"
                              onClick={() => void runLogAction(log.id, "archive")}
                              disabled={isBusy}
                              className="rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
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
                                className="rounded-2xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {actingLogId === log.id ? "Siliniyor..." : "Silmeyi onayla"}
                              </button>

                              <button
                                type="button"
                                onClick={() => setPendingDeleteId("")}
                                className="rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
                              >
                                Vazgeç
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setPendingDeleteId(log.id)}
                              className="rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
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

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={saving || statusSaving}
              className="rounded-2xl bg-neutral-800 px-5 py-4 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Kaydediliyor..." : isDirty ? "Değişiklikleri kaydet" : "Kaydedilecek değişiklik yok"}
            </button>

            <a
              href={shareLink}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-neutral-300 bg-white px-5 py-4 text-center text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
            >
              Herkese açık profili aç
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}