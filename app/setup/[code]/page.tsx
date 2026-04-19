"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ProductType = "pet" | "item" | "key" | "person";
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

const PRODUCT_SUBTYPE_OPTIONS: Record<ProductType, Array<{ value: ProductSubtype; label: string }>> = {
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
  ]
};

function getProductSubtypeLabel(value?: string) {
  if (!value) return "";
  for (const options of Object.values(PRODUCT_SUBTYPE_OPTIONS)) {
    const matched = options.find((item) => item.value === value);
    if (matched) return matched.label;
  }
  return "";
}

function getSubtypeLabel(productType: ProductType, value: ProductSubtype | "") {
  if (!value) return "";
  const matched = PRODUCT_SUBTYPE_OPTIONS[productType].find((item) => item.value === value);
  return matched?.label || "";
}

type OpenSection = "basic" | "contact" | "recovery" | "alerts" | null;

type SetupForm = {
  productType: ProductType;
  productSubtype: ProductSubtype | "";
  petName: string;
  tagName: string;
  ownerName: string;
  phone: string;
  city: string;
  addressDetail: string;
  distinctiveFeature: string;
  note: string;
  alerts: string[];
  allowPhone: boolean;
  allowWhatsapp: boolean;
  showName: boolean;
  showPhone: boolean;
  showCity: boolean;
  showAddressDetail: boolean;
  showPetName: boolean;
  showNote: boolean;
  recoveryPhone: string;
  recoveryEmail: string;
  useRecoveryPhoneAsContact: boolean;
  useRecoveryEmailAsContact: boolean;
};

type Props = {
  params: Promise<{
    code: string;
  }>;
};

type ContactInsightsResponse = {
  ok: boolean;
  hasMatch: boolean;
  unreadCount: number;
  matchedProducts: Array<{
    code: string;
    productType: ProductType;
    displayName: string;
  }>;
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

const initialForm: SetupForm = {
  productType: "item",
  productSubtype: "",
  petName: "",
  tagName: "",
  ownerName: "",
  phone: "",
  city: "",
  addressDetail: "",
  distinctiveFeature: "",
  note: "",
  alerts: [],
  allowPhone: false,
  allowWhatsapp: false,
  showName: true,
  showPhone: false,
  showCity: false,
  showAddressDetail: false,
  showPetName: true,
  showNote: false,
  recoveryPhone: "",
  recoveryEmail: "",
  useRecoveryPhoneAsContact: false,
  useRecoveryEmailAsContact: false
};

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
  return "Etiket / kısa başlık";
}

function getDistinctiveFeaturePlaceholder(productType: ProductType) {
  if (productType === "pet") return "Örn: sağ kulağında beyaz leke, mavi tasma";
  if (productType === "key") return "Örn: kırmızı anahtarlık, metal halka";
  if (productType === "person") return "Örn: mavi mont, siyah sırt çantası";
  return "Örn: siyah çanta, köşesi hafif çizik";
}

function normalizePhone(value: string) {
  return String(value || "").replace(/[^0-9]/g, "");
}

function normalizeEmail(value: string) {
  return String(value || "").trim().toLowerCase();
}

function getMainSiteUrl() {
  const value =
    process.env.NEXT_PUBLIC_MAIN_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://dokuntag.com";

  return value.replace(/\/+$/, "");
}

function SectionCard({
  id,
  title,
  description,
  isOpen,
  onToggle,
  children
}: {
  id: Exclude<OpenSection, null>;
  title: string;
  description?: string;
  isOpen: boolean;
  onToggle: (id: Exclude<OpenSection, null>) => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-neutral-200 bg-white shadow-sm">
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

        <span className="ml-4 text-xl text-neutral-500">
          {isOpen ? "−" : "+"}
        </span>
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
            ? "cursor-pointer border-neutral-800 bg-neutral-800 text-white shadow-sm"
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
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-neutral-200 px-4 py-3 transition hover:border-neutral-300 hover:bg-neutral-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5"
      />
      <span className="text-sm text-neutral-900">{label}</span>
    </label>
  );
}

function LinkCard({
  title,
  description,
  value,
  copied,
  onCopy
}: {
  title: string;
  description: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50/70 p-4">
      <p className="text-sm font-medium text-neutral-900">{title}</p>
      <p className="mt-1 text-xs leading-5 text-neutral-500">{description}</p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          readOnly
          value={value}
          className="flex-1 rounded-2xl border border-neutral-300 bg-white px-3 py-3 text-sm outline-none"
        />
        <button
          type="button"
          onClick={onCopy}
          className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
        >
          {copied ? "Kopyalandı" : "Kopyala"}
        </button>
      </div>
    </div>
  );
}

function ShortcutCard() {
  return (
    <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 px-4 py-4">
      <p className="text-sm font-medium text-neutral-900">
        Ana ekrana ekleyebilirsiniz
      </p>
      <p className="mt-2 text-sm leading-6 text-neutral-600">
        Tarayıcı menüsünden <strong>Ana ekrana ekle</strong> veya{" "}
        <strong>Kısayol oluştur</strong> seçeneğini kullanabilirsiniz.
      </p>
    </div>
  );
}

function GuideStep({
  step,
  title,
  text
}: {
  step: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="inline-flex rounded-full border border-neutral-300 bg-neutral-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
        {step}
      </div>
      <h3 className="mt-3 text-sm font-semibold text-neutral-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-neutral-600">{text}</p>
    </div>
  );
}

export default function SetupCodePage({ params }: Props) {
  const router = useRouter();
  const mainSiteUrl = getMainSiteUrl();

  const [code, setCode] = useState("");
  const [form, setForm] = useState<SetupForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [locked, setLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState("");
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [copiedManage, setCopiedManage] = useState(false);
  const [publicLink, setPublicLink] = useState("");
  const [manageLink, setManageLink] = useState("");
  const [contactInsights, setContactInsights] =
    useState<ContactInsightsResponse | null>(null);
  const [openSection, setOpenSection] = useState<OpenSection>("basic");

  function toggleSection(id: Exclude<OpenSection, null>) {
    setOpenSection((prev) => (prev === id ? null : id));
  }

  function updateField<K extends keyof SetupForm>(key: K, value: SetupForm[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value
    }));
  }

  function toggleAlert(alert: string, checked: boolean) {
    setForm((prev) => ({
      ...prev,
      alerts: checked
        ? [...prev.alerts, alert]
        : prev.alerts.filter((item) => item !== alert)
    }));
  }

  useEffect(() => {
    let active = true;

    async function run() {
      try {
        const resolved = await params;
        const normalizedCode = String(resolved.code ?? "").trim().toUpperCase();

        if (!active) return;
        setCode(normalizedCode);

        const res = await fetch(`/api/setup/${normalizedCode}`, {
          cache: "no-store"
        });
        const data = await res.json();

        if (!res.ok || !data?.ok) {
          throw new Error(data?.error || "Veri alınamadı.");
        }

        if (!active) return;

        setLocked(Boolean(data.isLocked));
        setLockMessage(String(data.message ?? ""));

        const allowPhone = Boolean(
          data.tag?.contactOptions?.allowDirectCall ??
            data.tag?.visibility?.allowPhone
        );

        const allowWhatsapp = Boolean(
          data.tag?.contactOptions?.allowDirectWhatsapp ??
            data.tag?.visibility?.allowWhatsapp
        );

        const recoveryPhone = data.tag?.recovery?.phone ?? "";
        const recoveryEmail = data.tag?.recovery?.email ?? "";
        const contactPhone = data.tag?.profile?.phone ?? "";
        const contactEmail = data.tag?.profile?.email ?? "";

        setForm({
          productType: (data.tag?.productType ?? "item") as ProductType,
          productSubtype: (data.tag?.productSubtype ?? "") as ProductSubtype | "",
          petName: data.tag?.profile?.petName ?? "",
          tagName: data.tag?.profile?.tagName ?? data.tag?.profile?.name ?? "",
          ownerName: data.tag?.profile?.ownerName ?? "",
          phone: data.tag?.profile?.phone ?? "",
          city: data.tag?.profile?.city ?? "",
          addressDetail: "",
          distinctiveFeature: data.tag?.profile?.distinctiveFeature ?? "",
          note: data.tag?.profile?.note ?? "",
          alerts: Array.isArray(data.tag?.alerts) ? data.tag.alerts : [],
          allowPhone,
          allowWhatsapp,
          showName: Boolean(data.tag?.visibility?.showName),
          showPhone: Boolean(data.tag?.visibility?.showPhone),
          showCity: Boolean(data.tag?.visibility?.showCity),
          showAddressDetail: false,
          showPetName: Boolean(data.tag?.visibility?.showPetName),
          showNote: Boolean(data.tag?.visibility?.showNote),
          recoveryPhone,
          recoveryEmail,
          useRecoveryPhoneAsContact: Boolean(
            recoveryPhone &&
              contactPhone &&
              recoveryPhone.trim() === contactPhone.trim()
          ),
          useRecoveryEmailAsContact: Boolean(
            recoveryEmail &&
              contactEmail &&
              recoveryEmail.trim().toLowerCase() === contactEmail.trim().toLowerCase()
          )
        });
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Bir hata oluştu.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void run();

    return () => {
      active = false;
    };
  }, [params]);

  const hasPhone = useMemo(() => Boolean(form.phone.trim()), [form.phone]);
  const hasRecoveryPhone = useMemo(() => Boolean(form.recoveryPhone.trim()), [form.recoveryPhone]);
  const hasCity = useMemo(() => Boolean(form.city.trim()), [form.city]);
  const hasNote = useMemo(() => Boolean(form.note.trim()), [form.note]);
  const hasRecoveryEmail = useMemo(
    () => Boolean(form.recoveryEmail.trim()),
    [form.recoveryEmail]
  );

  const alertOptions = useMemo(
    () => ALERT_OPTIONS_BY_TYPE[form.productType],
    [form.productType]
  );

  const allowedSubtypeOptions = useMemo(
    () => PRODUCT_SUBTYPE_OPTIONS[form.productType],
    [form.productType]
  );

  const publicPreviewItems = useMemo(() => {
    const items: Array<{ label: string; value: string }> = [];

    if (form.showPetName && form.petName.trim()) {
      items.push({
        label: getPrimaryNameLabel(form.productType),
        value: form.petName.trim()
      });
    }

    if (form.showName && form.ownerName.trim()) {
      items.push({
        label: getOwnerNameLabel(form.productType),
        value: form.ownerName.trim()
      });
    }

    const subtypeLabel = getSubtypeLabel(form.productType, form.productSubtype);
    if (subtypeLabel) {
      items.push({ label: "Kategori", value: subtypeLabel });
    }

    if (form.showPhone && form.allowPhone && form.phone.trim()) {
      items.push({ label: "Telefon", value: form.phone.trim() });
    }

    if (form.showCity && form.city.trim()) {
      items.push({ label: "Şehir", value: form.city.trim() });
    }

    return items;
  }, [
    form.productType,
    form.productSubtype,
    form.petName,
    form.ownerName,
    form.phone,
    form.city,
    form.showPetName,
    form.showName,
    form.showPhone,
    form.showCity,
    form.allowPhone
  ]);

  const publicPreviewNote = useMemo(() => {
    if (!form.showNote || !form.note.trim()) return "";
    return form.note.trim();
  }, [form.note, form.showNote]);

  useEffect(() => {
    setForm((prev) => {
      const nextSubtypeOptions = PRODUCT_SUBTYPE_OPTIONS[prev.productType];
      const hasValidSubtype = prev.productSubtype
        ? nextSubtypeOptions.some((item) => item.value === prev.productSubtype)
        : true;

      return {
        ...prev,
        productSubtype: hasValidSubtype ? prev.productSubtype : "",
        alerts: prev.alerts.filter((item) =>
          ALERT_OPTIONS_BY_TYPE[prev.productType].includes(item)
        )
      };
    });
  }, [form.productType]);

  useEffect(() => {
    if (!hasPhone && form.allowPhone) {
      updateField("allowPhone", false);
    }
  }, [hasPhone, form.allowPhone]);

  useEffect(() => {
    if ((!hasPhone || !form.allowPhone) && form.allowWhatsapp) {
      updateField("allowWhatsapp", false);
    }
  }, [hasPhone, form.allowPhone, form.allowWhatsapp]);

  useEffect(() => {
    if ((!hasPhone || !form.allowPhone) && form.showPhone) {
      updateField("showPhone", false);
    }
  }, [hasPhone, form.allowPhone, form.showPhone]);

  useEffect(() => {
    if (!hasCity && form.showCity) {
      updateField("showCity", false);
    }
  }, [hasCity, form.showCity]);

  useEffect(() => {
    if (form.showAddressDetail) {
      updateField("showAddressDetail", false);
    }
  }, [form.showAddressDetail]);

  useEffect(() => {
    if (!hasNote && form.showNote) {
      updateField("showNote", false);
    }
  }, [hasNote, form.showNote]);

  useEffect(() => {
    if (!hasRecoveryPhone && form.useRecoveryPhoneAsContact) {
      updateField("useRecoveryPhoneAsContact", false);
    }
  }, [hasRecoveryPhone, form.useRecoveryPhoneAsContact]);

  useEffect(() => {
    if (!hasRecoveryEmail && form.useRecoveryEmailAsContact) {
      updateField("useRecoveryEmailAsContact", false);
    }
  }, [hasRecoveryEmail, form.useRecoveryEmailAsContact]);

  useEffect(() => {
    if (form.useRecoveryPhoneAsContact) {
      const normalizedRecoveryPhone = normalizePhone(form.recoveryPhone);
      if (form.phone !== normalizedRecoveryPhone) {
        updateField("phone", normalizedRecoveryPhone);
      }
    }
  }, [form.recoveryPhone, form.phone, form.useRecoveryPhoneAsContact]);

  useEffect(() => {
    const phone = normalizePhone(form.phone);
    const recoveryPhone = normalizePhone(form.recoveryPhone);
    const recoveryEmail = normalizeEmail(form.recoveryEmail);

    if (!phone && !recoveryPhone && !recoveryEmail) {
      setContactInsights(null);
      return;
    }

    let active = true;

    const timeoutId = window.setTimeout(async () => {
      try {
        const paramsValue = new URLSearchParams();

        if (phone) paramsValue.set("phone", phone);
        if (recoveryPhone) paramsValue.set("phone", recoveryPhone);
        if (recoveryEmail) paramsValue.set("email", recoveryEmail);
        if (code) paramsValue.set("excludeCode", code);

        const res = await fetch(
          `/api/setup/contact-insights?${paramsValue.toString()}`,
          {
            cache: "no-store"
          }
        );

        const data = (await res.json()) as ContactInsightsResponse;

        if (!active) return;

        if (res.ok && data.ok) {
          setContactInsights(data);
        } else {
          setContactInsights(null);
        }
      } catch {
        if (!active) return;
        setContactInsights(null);
      }
    }, 400);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [form.phone, form.recoveryPhone, form.recoveryEmail, code]);

  async function copyText(value: string, type: "public" | "manage") {
    try {
      await navigator.clipboard.writeText(value);

      if (type === "public") {
        setCopiedPublic(true);
        setTimeout(() => setCopiedPublic(false), 1500);
      } else {
        setCopiedManage(true);
        setTimeout(() => setCopiedManage(false), 1500);
      }
    } catch {}
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (form.useRecoveryPhoneAsContact && !form.recoveryPhone.trim()) {
        throw new Error(
          "İletişim telefonu olarak kullanmak için kurtarma telefonu girilmelidir."
        );
      }

      if (!form.phone.trim()) {
        throw new Error("İletişim telefonu zorunludur.");
      }

      if (!form.recoveryPhone.trim() && !form.recoveryEmail.trim()) {
        throw new Error(
          "Kurtarma için telefon veya e-posta alanlarından en az biri zorunludur."
        );
      }

      if (form.useRecoveryEmailAsContact && !form.recoveryEmail.trim()) {
        throw new Error(
          "İletişim maili olarak kullanmak için kurtarma e-postası girilmelidir."
        );
      }

      const res = await fetch(`/api/setup/${code}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Kurulum tamamlanamadı.");
      }

      const origin = typeof window !== "undefined" ? window.location.origin : "";
      setPublicLink(`${origin}/p/${code}`);
      setManageLink(`${origin}${data.managePath}`);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#fbfbfa_0%,#fdfdfc_55%,#ffffff_100%)] px-4 py-8 text-neutral-900 sm:px-5 sm:py-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <a
              href={mainSiteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center text-sm text-neutral-500 transition hover:text-neutral-900 hover:underline"
            >
              ← Dokuntag ana sayfa
            </a>
          </div>

          <div className="rounded-[2rem] border border-neutral-200 bg-white px-6 py-7 shadow-sm">
            <p className="text-sm text-neutral-600">Yükleniyor...</p>
          </div>
        </div>
      </main>
    );
  }

  if (locked) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#fbfbfa_0%,#fdfdfc_55%,#ffffff_100%)] px-4 py-8 text-neutral-900 sm:px-5 sm:py-10">
        <div className="mx-auto max-w-3xl space-y-5">
          <div>
            <a
              href={mainSiteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center text-sm text-neutral-500 transition hover:text-neutral-900 hover:underline"
            >
              ← Dokuntag ana sayfa
            </a>
          </div>

          <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-neutral-100/80 px-6 py-7 sm:px-8 sm:py-8">
              <p className="text-sm uppercase tracking-[0.24em] text-neutral-500">
                Dokuntag
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Bu ürün zaten aktif
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                {lockMessage ||
                  "Kurulum bağlantısı yalnızca ilk aktivasyon içindir. Eğer ürün size aitse aşağıdan yönetim erişimi alabilirsiniz."}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-700">
                  Kod: {code}
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  Durum: aktif
                </span>
              </div>
            </div>

            <div className="px-6 py-6 sm:px-8">
              <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-4">
                <p className="text-sm font-medium text-amber-900">
                  Kurulum tamamlanmış görünüyor
                </p>
                <p className="mt-1 text-sm leading-6 text-amber-800">
                  Eğer bu ürün size aitse kurtarma alanından yönetim bağlantınızı
                  tekrar alabilirsiniz. Daha önce giriş yaptıysanız ürünlerinize de
                  geçebilirsiniz.
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => router.push("/recover")}
                  className="rounded-2xl bg-neutral-800 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-700"
                >
                  Yönetim erişimi al
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/my")}
                  className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
                >
                  Ürünlerime git
                </button>

                <button
                  type="button"
                  onClick={() => router.push(`/p/${code}`)}
                  className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
                >
                  Paylaşım sayfasını gör
                </button>
              </div>

              <div className="mt-5">
                <ShortcutCard />
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (done) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#fbfbfa_0%,#fdfdfc_55%,#ffffff_100%)] px-4 py-8 text-neutral-900 sm:px-5 sm:py-10">
        <div className="mx-auto max-w-3xl space-y-5">
          <div>
            <a
              href={mainSiteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center text-sm text-neutral-500 transition hover:text-neutral-900 hover:underline"
            >
              ← Dokuntag ana sayfa
            </a>
          </div>

          <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-neutral-100/80 px-6 py-7 sm:px-8 sm:py-8">
              <p className="text-sm uppercase tracking-[0.24em] text-neutral-500">
                Dokuntag
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Kurulum tamamlandı
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                Ürününüz artık aktif. Herkese açık profil yayında. Bundan sonraki
                düzenlemeleri yönetim bağlantınızdan yapabilirsiniz.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-700">
                  Kod: {code}
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  Durum: aktif
                </span>
              </div>
            </div>

            <div className="px-6 py-6 sm:px-8">
              <div className="grid gap-4">
                <LinkCard
                  title="Paylaşım bağlantısı"
                  description="Karşı tarafın göreceği bağlantı."
                  value={publicLink}
                  copied={copiedPublic}
                  onCopy={() => void copyText(publicLink, "public")}
                />

                <LinkCard
                  title="Düzenleme bağlantısı"
                  description="Bu size özel bağlantı ile ürün bilgilerini değiştirebilirsiniz. Güvenli şekilde saklayın."
                  value={manageLink}
                  copied={copiedManage}
                  onCopy={() => void copyText(manageLink, "manage")}
                />
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-4">
                <p className="text-sm font-medium text-amber-900">Önemli bilgi</p>
                <p className="mt-1 text-sm leading-6 text-amber-800">
                  Bu sayfa ilk kurulum içindir. Sonraki değişiklikleri düzenleme bağlantınızdan yapın.
                </p>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-blue-200 bg-blue-50 px-4 py-4 text-sm leading-6 text-blue-900">
                Erişim bilgilerinizi daha sonra düzenleme sayfasından güncelleyebilirsiniz.
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => router.push(`/p/${code}`)}
                  className="rounded-2xl bg-neutral-800 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-700"
                >
                  Paylaşım sayfasını gör
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const tokenValue =
                      new URL(manageLink).searchParams.get("token") || "";
                    router.push(`/manage/${code}?token=${tokenValue}`);
                  }}
                  className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
                >
                  Düzenleme sayfasına git
                </button>

                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      `https://wa.me/?text=${encodeURIComponent(publicLink)}`,
                      "_blank"
                    )
                  }
                  className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
                >
                  WhatsApp ile paylaş
                </button>
              </div>

              <div className="mt-5">
                <ShortcutCard />
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fbfbfa_0%,#fdfdfc_55%,#ffffff_100%)] px-4 py-8 text-neutral-900 sm:px-5 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <a
            href={mainSiteUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center text-sm text-neutral-500 transition hover:text-neutral-900 hover:underline"
          >
            ← Dokuntag ana sayfa
          </a>

          <p className="mt-4 text-sm uppercase tracking-[0.24em] text-neutral-500">
            Dokuntag
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Ürününüzü hazırlayın
          </h1>
          <p className="mt-3 text-sm text-neutral-600">Kod: {code}</p>
        </div>

        <section className="mb-5 overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-neutral-100/80 px-5 py-5 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Ürünü hazırla
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-neutral-900">
            Bilgileri gir, iletişim hazır olsun.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
            Sonunda sana özel düzenleme bağlantın oluşur.
          </p>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <GuideStep
              step="1. Adım"
              title="Bilgileri gir"
              text="Ürün tipi ve gerekli bilgileri kısa şekilde doldurun."
            />
            <GuideStep
              step="2. Adım"
              title="Nasıl ulaşılacağını seç"
              text="Size nasıl ulaşılacağını ve erişimi geri alma bilgilerini belirleyin."
            />
            <GuideStep
              step="3. Adım"
              title="Kaydet ve devam et"
              text="Kurulum bitince paylaşım ve düzenleme bağlantılarınızı güvenli şekilde kaydedin."
            />
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-blue-200 bg-blue-50 px-4 py-4 text-sm leading-6 text-blue-900">
            E-posta sadece sana özeldir. Başkaları görmez. Buradaki erişim bilgileri yalnızca ürüne yeniden ulaşmanız için kullanılır.
          </div>
        </div>
        </section>

        {error ? (
          <div className="mb-5 rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {contactInsights?.hasMatch ? (
          <div className="mb-5 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-4">
            <p className="text-sm font-medium text-amber-900">
              Bu iletişim bilgileriyle ilişkili önceki ürünleriniz olabilir
            </p>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              {contactInsights.unreadCount > 0
                ? `Önceki ürünlerinizde toplam ${contactInsights.unreadCount} okunmamış mesaj görünüyor.`
                : "Daha önce eklenmiş ürünleriniz olabilir. İsterseniz ürünlerim alanını da kontrol edin."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href="/my"
                className="rounded-2xl border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-900 transition hover:bg-amber-100"
              >
                Ürünlerime git
              </a>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <SectionCard
            id="basic"
            title="Temel bilgiler"
            description="Ürün ve profil bilgilerini girin."
            isOpen={openSection === "basic"}
            onToggle={toggleSection}
          >
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Ürün tipi">
                  <select
                    value={form.productType}
                    onChange={(e) =>
                      updateField("productType", e.target.value as ProductType)
                    }
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                  >
                    <option value="item">Eşya</option>
                    <option value="key">Anahtar</option>
                    <option value="pet">Evcil hayvan</option>
                    <option value="person">Birey</option>
                  </select>
                </Field>

                <Field label="Kategori" optional>
                  <select
                    value={form.productSubtype}
                    onChange={(e) =>
                      updateField("productSubtype", e.target.value as ProductSubtype | "")
                    }
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                  >
                    <option value="">Seçmek istemiyorum</option>
                    {allowedSubtypeOptions.map((item) => (
                      <option key={`${form.productType}-${item.value}`} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-neutral-500">
                    İsterseniz ürün tipini biraz daha net anlatabilirsiniz.
                  </p>
                </Field>

                <Field label={getPrimaryNameLabel(form.productType)}>
                  <input
                    value={form.petName}
                    onChange={(e) => updateField("petName", e.target.value)}
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                    placeholder="Ana görünen isim"
                    required
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <InlineToggle
                      checked={form.showPetName}
                      label={`${getPrimaryNameLabel(form.productType)} görünsün`}
                      onChange={(value) => updateField("showPetName", value)}
                    />
                  </div>
                </Field>
              </div>

              <Field label={getSecondaryNameLabel(form.productType)} optional>
                <input
                  value={form.tagName}
                  onChange={(e) => updateField("tagName", e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                  placeholder="Sadece farklıysa girin"
                />
                <p className="mt-2 text-xs text-neutral-500">
                  Ana isimden farklıysa gösterilir.
                </p>
              </Field>

              <Field label={getOwnerNameLabel(form.productType)} optional>
                <input
                  value={form.ownerName}
                  onChange={(e) => updateField("ownerName", e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                  placeholder="İsteğe bağlı"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <InlineToggle
                    checked={form.showName}
                    label={`${getOwnerNameLabel(form.productType)} görünsün`}
                    onChange={(value) => updateField("showName", value)}
                  />
                </div>
              </Field>

              <Field label="Ayırt edici özellik" optional>
                <input
                  value={form.distinctiveFeature}
                  onChange={(e) =>
                    updateField("distinctiveFeature", e.target.value)
                  }
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                  placeholder={getDistinctiveFeaturePlaceholder(form.productType)}
                />
              </Field>

              <Field label="Not" optional>
                <textarea
                  value={form.note}
                  onChange={(e) => updateField("note", e.target.value)}
                  className="min-h-[120px] w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                  placeholder="Bulana göstermek istediğiniz kısa not"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <InlineToggle
                    checked={form.showNote}
                    disabled={!hasNote}
                    label="Not görünsün"
                    onChange={(value) => updateField("showNote", value)}
                  />
                </div>
              </Field>
            </div>
          </SectionCard>

          <SectionCard
            id="contact"
            title="İletişim"
            description="Bulana açık olacak telefon bilgilerini belirleyin."
            isOpen={openSection === "contact"}
            onToggle={toggleSection}
          >
            <div className="grid gap-4">
              <Field label="Telefon">
                <input
                  value={form.phone}
                  onChange={(e) =>
                    updateField("phone", e.target.value.replace(/[^0-9]/g, ""))
                  }
                  inputMode="numeric"
                  pattern="[0-9]*"
                  disabled={form.useRecoveryPhoneAsContact}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 disabled:cursor-not-allowed disabled:bg-neutral-100"
                  placeholder="05xxxxxxxxx"
                  required
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <InlineToggle
                    checked={form.useRecoveryPhoneAsContact}
                    disabled={!hasRecoveryPhone}
                    label="Kurtarma telefonu iletişim telefonu olarak da kullanılsın"
                    onChange={(value) => updateField("useRecoveryPhoneAsContact", value)}
                  />
                  <InlineToggle
                    checked={form.allowPhone}
                    disabled={!hasPhone}
                    label="Telefonla ulaşılabilsin"
                    onChange={(value) => updateField("allowPhone", value)}
                  />
                  <InlineToggle
                    checked={form.allowWhatsapp}
                    disabled={!hasPhone || !form.allowPhone}
                    label="WhatsApp açılsın"
                    onChange={(value) => updateField("allowWhatsapp", value)}
                  />
                  <InlineToggle
                    checked={form.showPhone}
                    disabled={!hasPhone || !form.allowPhone}
                    label="Telefon görünsün"
                    onChange={(value) => updateField("showPhone", value)}
                  />
                </div>
              </Field>

              <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-neutral-900">Herkese açık bilgiler önizlemesi</p>
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-neutral-500">
                    Şu an görünecek alanlar
                  </span>
                </div>
                {publicPreviewItems.length > 0 ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {publicPreviewItems.map((item) => (
                      <div key={`${item.label}-${item.value}`} className="rounded-2xl border border-neutral-200 bg-white px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">{item.label}</p>
                        <p className="mt-1 text-sm text-neutral-900">{item.value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-neutral-600">
                    Şu an herkese açık profilde bilgi görünmüyor. İsterseniz görünürlük seçeneklerinden bazı alanları açabilirsiniz.
                  </p>
                )}
                {publicPreviewNote ? (
                  <div className="mt-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Not</p>
                    <p className="mt-1 text-sm leading-6 text-neutral-900">{publicPreviewNote}</p>
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Şehir" optional>
                  <select
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
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
                      checked={form.showCity}
                      disabled={!form.city.trim()}
                      label="Şehir görünsün"
                      onChange={(value) => updateField("showCity", value)}
                    />
                  </div>
                  {form.productType === "key" ? (
                    <p className="mt-2 text-xs leading-5 text-amber-700">
                      Anahtar ürünlerinde şehir bilgisi bile güvenlik riski oluşturabilir. Gerekmedikçe kapalı bırakın.
                    </p>
                  ) : null}
                </Field>

                <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 px-4 py-4">
                  <p className="text-sm font-medium text-neutral-900">Adres bilgisi size özeldir</p>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">
                    Güvenlik nedeniyle adres detayı Dokuntag içinde kimseyle paylaşılmaz ve public profilde gösterilmez.
                    Adres belirtmek isterseniz bunu not alanına manuel olarak yazmanız gerekir.
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            id="recovery"
            title="Kurtarma bilgileri"
            description="Yönetim erişimini tekrar alabilmeniz için en az 1 alan zorunludur."
            isOpen={openSection === "recovery"}
            onToggle={toggleSection}
          >
            <div className="grid gap-4">
              <div className="rounded-[1.5rem] border border-blue-200 bg-blue-50 px-4 py-4 text-sm leading-6 text-blue-900">
                Bu bilgiler herkese açık profilde görünmez. Kurtarma ve isterseniz sistem içi iletişim için kullanılır.
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Kurtarma telefonu" optional>
                  <input
                    value={form.recoveryPhone}
                    onChange={(e) =>
                      updateField(
                        "recoveryPhone",
                        e.target.value.replace(/[^0-9]/g, "")
                      )
                    }
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                    placeholder="05xxxxxxxxx"
                  />
                </Field>

                <Field label="Kurtarma e-postası" optional>
                  <input
                    type="email"
                    value={form.recoveryEmail}
                    onChange={(e) => updateField("recoveryEmail", e.target.value)}
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                    placeholder="ornek@mail.com"
                  />
                </Field>
              </div>

              <div className="flex flex-wrap gap-2">
                <InlineToggle
                  checked={form.useRecoveryEmailAsContact}
                  disabled={!hasRecoveryEmail}
                  label="Kurtarma e-postası iletişim maili olarak da kullanılsın"
                  onChange={(value) =>
                    updateField("useRecoveryEmailAsContact", value)
                  }
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            id="alerts"
            title="Uyarılar"
            description="İsterseniz dikkat çekmesi gereken notları seçin."
            isOpen={openSection === "alerts"}
            onToggle={toggleSection}
          >
            <div className="grid gap-3">
              {alertOptions.map((item) => (
                <AlertOption
                  key={`${form.productType}-${item}`}
                  label={item}
                  checked={form.alerts.includes(item)}
                  onChange={(checked) => toggleAlert(item, checked)}
                />
              ))}
            </div>
          </SectionCard>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-neutral-800 px-5 py-4 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Kaydediliyor..." : "Kurulumu tamamla"}
            </button>

            <button
              type="button"
              onClick={() => router.push(`/p/${code}`)}
              className="rounded-2xl border border-neutral-300 bg-white px-5 py-4 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
            >
              Herkese açık sayfayı gör
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}