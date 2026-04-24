"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ProductType = "pet" | "item" | "key" | "person" | "other";
type OpenSection = "basic" | "contact" | "alerts" | null;

type SetupForm = {
  code: string;
  productType: ProductType;
  petName: string;
  tagName: string;
  ownerName: string;
  phone: string;
  email: string;
  city: string;
  addressDetail: string;
  distinctiveFeature: string;
  note: string;
  alerts: string[];
  allowPhone: boolean;
  allowWhatsapp: boolean;
  showName: boolean;
  showPhone: boolean;
  showEmail: boolean;
  showCity: boolean;
  showAddressDetail: boolean;
  showPetName: boolean;
  showNote: boolean;
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

const ALERT_OPTIONS_BY_TYPE: Record<ProductType, string[]> = {
  pet: [
    "Acil bana ulaşın",
    "Hayvanım hasta",
    "Alerjisi var",
    "Ürkek / yaklaşmayın",
    "Ödül verilecektir",
  ],
  item: [
    "Acil bana ulaşın",
    "Lütfen benimle iletişime geçin",
    "İçinde önemli eşya var",
    "Ödül verilecektir",
  ],
  key: [
    "Acil bana ulaşın",
    "Lütfen benimle iletişime geçin",
    "Önemli anahtar",
    "Ödül verilecektir",
  ],
  person: [
    "Acil yakınıma ulaşın",
    "Sağlık durumu için bilgi verin",
    "Kaybolursa lütfen haber verin",
    "Ödül verilecektir",
  ],
  other: [
    "Acil bana ulaşın",
    "Lütfen benimle iletişime geçin",
    "Önemli bilgi var",
  ],
};

const initialForm: SetupForm = {
  code: "",
  productType: "item",
  petName: "",
  tagName: "",
  ownerName: "",
  phone: "",
  email: "",
  city: "",
  addressDetail: "",
  distinctiveFeature: "",
  note: "",
  alerts: [],
  allowPhone: true,
  allowWhatsapp: false,
  showName: true,
  showPhone: true,
  showEmail: true,
  showCity: false,
  showAddressDetail: false,
  showPetName: true,
  showNote: true,
};

function getPrimaryNameLabel(productType: ProductType) {
  if (productType === "pet") return "Evcil hayvan adı";
  if (productType === "person") return "Kişi adı";
  if (productType === "key") return "Anahtar adı";
  return "Ürün adı";
}

function getOwnerNameLabel(productType: ProductType) {
  if (productType === "person") return "Yakını";
  return "Sahibi";
}

function getSecondaryNameLabel(productType: ProductType) {
  if (productType === "pet") return "Etiket başlığı";
  if (productType === "person") return "Profil başlığı";
  return "Etiket / kısa başlık";
}

function getDistinctiveFeaturePlaceholder(productType: ProductType) {
  if (productType === "pet") {
    return "Örn: sağ kulağında beyaz leke, mavi tasma";
  }

  if (productType === "key") {
    return "Örn: kırmızı anahtarlık, metal halka";
  }

  if (productType === "person") {
    return "Örn: mavi mont, siyah sırt çantası";
  }

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
  children,
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
  optional,
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
  onChange,
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
  onChange,
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

function GuideStep({
  step,
  title,
  text,
}: {
  step: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-neutral-200 bg-white px-4 py-4">
      <div className="inline-flex rounded-full border border-neutral-300 bg-neutral-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
        {step}
      </div>

      <h3 className="mt-3 text-sm font-semibold text-neutral-900">{title}</h3>

      <p className="mt-1.5 text-sm leading-6 text-neutral-600">{text}</p>
    </div>
  );
}

export default function SetupPage() {
  const router = useRouter();
  const mainSiteUrl = getMainSiteUrl();

  const [form, setForm] = useState<SetupForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contactInsights, setContactInsights] =
    useState<ContactInsightsResponse | null>(null);
  const [openSection, setOpenSection] = useState<OpenSection>("basic");

  function updateField<K extends keyof SetupForm>(key: K, value: SetupForm[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function toggleSection(id: Exclude<OpenSection, null>) {
    setOpenSection((prev) => (prev === id ? null : id));
  }

  function toggleAlert(alert: string, checked: boolean) {
    setForm((prev) => ({
      ...prev,
      alerts: checked
        ? [...prev.alerts, alert]
        : prev.alerts.filter((item) => item !== alert),
    }));
  }

  const hasPhone = useMemo(() => Boolean(form.phone.trim()), [form.phone]);
  const hasEmail = useMemo(() => Boolean(form.email.trim()), [form.email]);
  const hasCity = useMemo(() => Boolean(form.city.trim()), [form.city]);
  const hasAddressDetail = useMemo(
    () => Boolean(form.addressDetail.trim()),
    [form.addressDetail],
  );
  const hasNote = useMemo(() => Boolean(form.note.trim()), [form.note]);

  const alertOptions = useMemo(
    () => ALERT_OPTIONS_BY_TYPE[form.productType],
    [form.productType],
  );

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      alerts: prev.alerts.filter((item) =>
        ALERT_OPTIONS_BY_TYPE[prev.productType].includes(item),
      ),
    }));
  }, [form.productType]);

  useEffect(() => {
    if (!hasPhone && form.allowPhone) {
      setForm((prev) => ({
        ...prev,
        allowPhone: false,
      }));
    }
  }, [hasPhone, form.allowPhone]);

  useEffect(() => {
    if ((!hasPhone || !form.allowPhone) && form.allowWhatsapp) {
      setForm((prev) => ({
        ...prev,
        allowWhatsapp: false,
      }));
    }
  }, [hasPhone, form.allowPhone, form.allowWhatsapp]);

  useEffect(() => {
    if ((!hasPhone || !form.allowPhone) && form.showPhone) {
      setForm((prev) => ({
        ...prev,
        showPhone: false,
      }));
    }
  }, [hasPhone, form.allowPhone, form.showPhone]);

  useEffect(() => {
    if (!hasEmail && form.showEmail) {
      setForm((prev) => ({
        ...prev,
        showEmail: false,
      }));
    }
  }, [hasEmail, form.showEmail]);

  useEffect(() => {
    if (!hasCity && form.showCity) {
      setForm((prev) => ({
        ...prev,
        showCity: false,
      }));
    }
  }, [hasCity, form.showCity]);

  useEffect(() => {
    if (!hasAddressDetail && form.showAddressDetail) {
      setForm((prev) => ({
        ...prev,
        showAddressDetail: false,
      }));
    }
  }, [hasAddressDetail, form.showAddressDetail]);

  useEffect(() => {
    if (!hasNote && form.showNote) {
      setForm((prev) => ({
        ...prev,
        showNote: false,
      }));
    }
  }, [hasNote, form.showNote]);

  useEffect(() => {
    const phone = normalizePhone(form.phone);
    const email = normalizeEmail(form.email);

    if (!phone && !email) {
      setContactInsights(null);
      return;
    }

    let active = true;

    const timeoutId = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams();

        if (phone) params.set("phone", phone);
        if (email) params.set("email", email);

        if (form.code.trim()) {
          params.set("excludeCode", form.code.trim().toUpperCase());
        }

        const res = await fetch(
          `/api/setup/contact-insights?${params.toString()}`,
          {
            cache: "no-store",
          },
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
  }, [form.phone, form.email, form.code]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          code: form.code.trim().toUpperCase(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Kurulum sırasında bir hata oluştu.");
      }

      router.push(
        `/manage/${form.code.trim().toUpperCase()}?token=${data.tag.manageToken}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
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
            Dokuntag Setup
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
            İlk kurulum
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600">
            Bilgileri doldurun ve kurulumu tamamlayın. Sonrasında size özel
            yönetim bağlantınız oluşur.
          </p>
        </div>

        <section className="mb-5 overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-neutral-100/80 px-5 py-5 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Nasıl kurulur
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-tight text-neutral-900">
              3 adımda kurulum
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
              Kısa bilgileri girin, erişim tercihlerini seçin ve kurulumu
              tamamlayın.
            </p>
          </div>

          <div className="px-5 py-5 sm:px-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <GuideStep
                step="1. Adım"
                title="Temel bilgileri girin"
                text="Kod, ürün tipi ve ana isim gibi temel bilgileri doldurun."
              />

              <GuideStep
                step="2. Adım"
                title="İletişim tercihlerini seçin"
                text="Hangi bilgilerin görüneceğini ve size nasıl ulaşılacağını belirleyin."
              />

              <GuideStep
                step="3. Adım"
                title="Kurulumu tamamlayın"
                text="Kaydettikten sonra size özel yönetim bağlantınız oluşur."
              />
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-blue-200 bg-blue-50 px-4 py-4 text-sm leading-6 text-blue-900">
              İpucu: Kısa başlık yalnızca ana isimden farklıysa kullanılır.
              Telefon, e-posta ve not gibi alanları ister açabilir ister gizli
              tutabilirsiniz.
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
              <Field label="Kod">
                <input
                  value={form.code}
                  onChange={(e) => updateField("code", e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                  placeholder="Örn: DT001"
                  required
                />
              </Field>

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
                    <option value="person">Kişi</option>
                  </select>
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
                  placeholder={getDistinctiveFeaturePlaceholder(
                    form.productType,
                  )}
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
            description="İletişim bilgilerini girin ve hangileri görünsün seçin."
            isOpen={openSection === "contact"}
            onToggle={toggleSection}
          >
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Telefon" optional>
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      updateField(
                        "phone",
                        e.target.value.replace(/[^0-9]/g, ""),
                      )
                    }
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                    placeholder="05xxxxxxxxx"
                  />

                  <div className="mt-3 flex flex-wrap gap-2">
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

                <Field label="E-posta" optional>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                    placeholder="ornek@mail.com"
                  />

                  <div className="mt-3 flex flex-wrap gap-2">
                    <InlineToggle
                      checked={form.showEmail}
                      disabled={!hasEmail}
                      label="E-posta görünsün"
                      onChange={(value) => updateField("showEmail", value)}
                    />
                  </div>
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Şehir" optional>
                  <input
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                    placeholder="İsteğe bağlı"
                  />

                  <div className="mt-3 flex flex-wrap gap-2">
                    <InlineToggle
                      checked={form.showCity}
                      disabled={!hasCity}
                      label="Şehir görünsün"
                      onChange={(value) => updateField("showCity", value)}
                    />
                  </div>
                </Field>

                <Field label="Adres detayı" optional>
                  <input
                    value={form.addressDetail}
                    onChange={(e) =>
                      updateField("addressDetail", e.target.value)
                    }
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                    placeholder="İsteğe bağlı"
                  />

                  <div className="mt-3 flex flex-wrap gap-2">
                    <InlineToggle
                      checked={form.showAddressDetail}
                      disabled={!hasAddressDetail}
                      label="Adres detayı görünsün"
                      onChange={(value) =>
                        updateField("showAddressDetail", value)
                      }
                    />
                  </div>
                </Field>
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

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-neutral-800 px-5 py-4 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Kaydediliyor..." : "Kurulumu tamamla"}
          </button>
        </form>
      </div>
    </main>
  );
}