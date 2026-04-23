"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ProductType = "pet" | "item" | "key" | "person" | "other" | "other";
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
    "Acil bana ulaÅŸÄ±n",
    "HayvanÄ±m hasta",
    "Alerjisi var",
    "Ãœrkek / yaklaÅŸmayÄ±n",
    "Ã–dÃ¼l verilecektir"
  ],
  item: [
    "Acil bana ulaÅŸÄ±n",
    "LÃ¼tfen benimle iletiÅŸime geÃ§in",
    "Ä°Ã§inde Ã¶nemli eÅŸya var",
    "Ã–dÃ¼l verilecektir"
  ],
  key: [
    "Acil bana ulaÅŸÄ±n",
    "LÃ¼tfen benimle iletiÅŸime geÃ§in",
    "Ã–nemli anahtar",
    "Ã–dÃ¼l verilecektir"
  ],
  person: [
    "Acil yakÄ±nÄ±ma ulaÅŸÄ±n",
    "SaÄŸlÄ±k durumu iÃ§in bilgi verin",
    "Kaybolursa lÃ¼tfen haber verin",
    "Ã–dÃ¼l verilecektir"
  ],
  other: [
  "Acil bana ulaşın",
  "Lütfen benimle iletişime geçin",
  "Önemli bilgi var"
]
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
  showNote: true
};

function getPrimaryNameLabel(productType: ProductType) {
  if (productType === "pet") return "Evcil hayvan adÄ±";
  if (productType === "person") return "KiÅŸi adÄ±";
  if (productType === "key") return "Anahtar adÄ±";
  return "ÃœrÃ¼n adÄ±";
}

function getOwnerNameLabel(productType: ProductType) {
  if (productType === "person") return "YakÄ±nÄ±";
  return "Sahibi";
}

function getSecondaryNameLabel(productType: ProductType) {
  if (productType === "pet") return "Etiket baÅŸlÄ±ÄŸÄ±";
  if (productType === "person") return "Profil baÅŸlÄ±ÄŸÄ±";
  if (productType === "key") return "Etiket / kÄ±sa baÅŸlÄ±k";
  return "Etiket / kÄ±sa baÅŸlÄ±k";
}

function getDistinctiveFeaturePlaceholder(productType: ProductType) {
  if (productType === "pet") {
    return "Ã–rn: saÄŸ kulaÄŸÄ±nda beyaz leke, mavi tasma";
  }
  if (productType === "key") {
    return "Ã–rn: kÄ±rmÄ±zÄ± anahtarlÄ±k, metal halka";
  }
  if (productType === "person") {
    return "Ã–rn: mavi mont, siyah sÄ±rt Ã§antasÄ±";
  }
  return "Ã–rn: siyah Ã§anta, kÃ¶ÅŸesi hafif Ã§izik";
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
          {isOpen ? "âˆ’" : "+"}
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
  text
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
      [key]: value
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
        : prev.alerts.filter((item) => item !== alert)
    }));
  }

  const hasPhone = useMemo(() => Boolean(form.phone.trim()), [form.phone]);
  const hasEmail = useMemo(() => Boolean(form.email.trim()), [form.email]);
  const hasCity = useMemo(() => Boolean(form.city.trim()), [form.city]);
  const hasAddressDetail = useMemo(
    () => Boolean(form.addressDetail.trim()),
    [form.addressDetail]
  );
  const hasNote = useMemo(() => Boolean(form.note.trim()), [form.note]);

  const alertOptions = useMemo(
    () => ALERT_OPTIONS_BY_TYPE[form.productType],
    [form.productType]
  );

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      alerts: prev.alerts.filter((item) =>
        ALERT_OPTIONS_BY_TYPE[prev.productType].includes(item)
      )
    }));
  }, [form.productType]);

  useEffect(() => {
    if (!hasPhone && form.allowPhone) {
      setForm((prev) => ({
        ...prev,
        allowPhone: false
      }));
    }
  }, [hasPhone, form.allowPhone]);

  useEffect(() => {
    if ((!hasPhone || !form.allowPhone) && form.allowWhatsapp) {
      setForm((prev) => ({
        ...prev,
        allowWhatsapp: false
      }));
    }
  }, [hasPhone, form.allowPhone, form.allowWhatsapp]);

  useEffect(() => {
    if ((!hasPhone || !form.allowPhone) && form.showPhone) {
      setForm((prev) => ({
        ...prev,
        showPhone: false
      }));
    }
  }, [hasPhone, form.allowPhone, form.showPhone]);

  useEffect(() => {
    if (!hasEmail && form.showEmail) {
      setForm((prev) => ({
        ...prev,
        showEmail: false
      }));
    }
  }, [hasEmail, form.showEmail]);

  useEffect(() => {
    if (!hasCity && form.showCity) {
      setForm((prev) => ({
        ...prev,
        showCity: false
      }));
    }
  }, [hasCity, form.showCity]);

  useEffect(() => {
    if (!hasAddressDetail && form.showAddressDetail) {
      setForm((prev) => ({
        ...prev,
        showAddressDetail: false
      }));
    }
  }, [hasAddressDetail, form.showAddressDetail]);

  useEffect(() => {
    if (!hasNote && form.showNote) {
      setForm((prev) => ({
        ...prev,
        showNote: false
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
  }, [form.phone, form.email, form.code]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
          code: form.code.trim().toUpperCase()
        })
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Kurulum sÄ±rasÄ±nda bir hata oluÅŸtu.");
      }

      router.push(
        `/manage/${form.code.trim().toUpperCase()}?token=${data.tag.manageToken}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluÅŸtu.");
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
            â† Dokuntag ana sayfa
          </a>

          <p className="mt-4 text-sm uppercase tracking-[0.24em] text-neutral-500">
            Dokuntag Setup
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
            Ä°lk kurulum
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600">
            Bilgileri doldurun ve kurulumu tamamlayÄ±n. SonrasÄ±nda size Ã¶zel
            yÃ¶netim baÄŸlantÄ±nÄ±z oluÅŸur.
          </p>
        </div>

        <section className="mb-5 overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-neutral-100/80 px-5 py-5 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              NasÄ±l kurulur
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-neutral-900">
              3 adÄ±mda kurulum
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
              KÄ±sa bilgileri girin, eriÅŸim tercihlerini seÃ§in ve kurulumu tamamlayÄ±n.
            </p>
          </div>

          <div className="px-5 py-5 sm:px-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <GuideStep
                step="1. AdÄ±m"
                title="Temel bilgileri girin"
                text="Kod, Ã¼rÃ¼n tipi ve ana isim gibi temel bilgileri doldurun."
              />
              <GuideStep
                step="2. AdÄ±m"
                title="Ä°letiÅŸim tercihlerini seÃ§in"
                text="Hangi bilgilerin gÃ¶rÃ¼neceÄŸini ve size nasÄ±l ulaÅŸÄ±lacaÄŸÄ±nÄ± belirleyin."
              />
              <GuideStep
                step="3. AdÄ±m"
                title="Kurulumu tamamlayÄ±n"
                text="Kaydettikten sonra size Ã¶zel yÃ¶netim baÄŸlantÄ±nÄ±z oluÅŸur."
              />
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-blue-200 bg-blue-50 px-4 py-4 text-sm leading-6 text-blue-900">
              Ä°pucu: KÄ±sa baÅŸlÄ±k yalnÄ±zca ana isimden farklÄ±ysa kullanÄ±lÄ±r. Telefon,
              e-posta ve not gibi alanlarÄ± ister aÃ§abilir ister gizli tutabilirsiniz.
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
              Bu iletiÅŸim bilgileriyle iliÅŸkili Ã¶nceki Ã¼rÃ¼nleriniz olabilir
            </p>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              {contactInsights.unreadCount > 0
                ? `Ã–nceki Ã¼rÃ¼nlerinizde toplam ${contactInsights.unreadCount} okunmamÄ±ÅŸ mesaj gÃ¶rÃ¼nÃ¼yor.`
                : "Daha Ã¶nce eklenmiÅŸ Ã¼rÃ¼nleriniz olabilir. Ä°sterseniz Ã¼rÃ¼nlerim alanÄ±nÄ± da kontrol edin."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href="/my"
                className="rounded-2xl border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-900 transition hover:bg-amber-100"
              >
                ÃœrÃ¼nlerime git
              </a>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <SectionCard
            id="basic"
            title="Temel bilgiler"
            description="ÃœrÃ¼n ve profil bilgilerini girin."
            isOpen={openSection === "basic"}
            onToggle={toggleSection}
          >
            <div className="grid gap-4">
              <Field label="Kod">
                <input
                  value={form.code}
                  onChange={(e) => updateField("code", e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                  placeholder="Ã–rn: DT001"
                  required
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="ÃœrÃ¼n tipi">
                  <select
                    value={form.productType}
                    onChange={(e) =>
                      updateField("productType", e.target.value as ProductType)
                    }
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                  >
                    <option value="item">EÅŸya</option>
                    <option value="key">Anahtar</option>
                    <option value="pet">Evcil hayvan</option>
                    <option value="person">KiÅŸi</option>
                  </select>
                </Field>

                <Field label={getPrimaryNameLabel(form.productType)}>
                  <input
                    value={form.petName}
                    onChange={(e) => updateField("petName", e.target.value)}
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                    placeholder="Ana gÃ¶rÃ¼nen isim"
                    required
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <InlineToggle
                      checked={form.showPetName}
                      label={`${getPrimaryNameLabel(form.productType)} gÃ¶rÃ¼nsÃ¼n`}
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
                  placeholder="Sadece farklÄ±ysa girin"
                />
                <p className="mt-2 text-xs text-neutral-500">
                  Ana isimden farklÄ±ysa gÃ¶sterilir.
                </p>
              </Field>

              <Field label={getOwnerNameLabel(form.productType)} optional>
                <input
                  value={form.ownerName}
                  onChange={(e) => updateField("ownerName", e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                  placeholder="Ä°steÄŸe baÄŸlÄ±"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <InlineToggle
                    checked={form.showName}
                    label={`${getOwnerNameLabel(form.productType)} gÃ¶rÃ¼nsÃ¼n`}
                    onChange={(value) => updateField("showName", value)}
                  />
                </div>
              </Field>

              <Field label="AyÄ±rt edici Ã¶zellik" optional>
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
                  placeholder="Bulana gÃ¶stermek istediÄŸiniz kÄ±sa not"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <InlineToggle
                    checked={form.showNote}
                    disabled={!hasNote}
                    label="Not gÃ¶rÃ¼nsÃ¼n"
                    onChange={(value) => updateField("showNote", value)}
                  />
                </div>
              </Field>
            </div>
          </SectionCard>

          <SectionCard
            id="contact"
            title="Ä°letiÅŸim"
            description="Ä°letiÅŸim bilgilerini girin ve hangileri gÃ¶rÃ¼nsÃ¼n seÃ§in."
            isOpen={openSection === "contact"}
            onToggle={toggleSection}
          >
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Telefon" optional>
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      updateField("phone", e.target.value.replace(/[^0-9]/g, ""))
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
                      label="Telefonla ulaÅŸÄ±labilsin"
                      onChange={(value) => updateField("allowPhone", value)}
                    />
                    <InlineToggle
                      checked={form.allowWhatsapp}
                      disabled={!hasPhone || !form.allowPhone}
                      label="WhatsApp aÃ§Ä±lsÄ±n"
                      onChange={(value) => updateField("allowWhatsapp", value)}
                    />
                    <InlineToggle
                      checked={form.showPhone}
                      disabled={!hasPhone || !form.allowPhone}
                      label="Telefon gÃ¶rÃ¼nsÃ¼n"
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
                      label="E-posta gÃ¶rÃ¼nsÃ¼n"
                      onChange={(value) => updateField("showEmail", value)}
                    />
                  </div>
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Åehir" optional>
                  <input
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                    placeholder="Ä°steÄŸe baÄŸlÄ±"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <InlineToggle
                      checked={form.showCity}
                      disabled={!hasCity}
                      label="Åehir gÃ¶rÃ¼nsÃ¼n"
                      onChange={(value) => updateField("showCity", value)}
                    />
                  </div>
                </Field>

                <Field label="Adres detayÄ±" optional>
                  <input
                    value={form.addressDetail}
                    onChange={(e) =>
                      updateField("addressDetail", e.target.value)
                    }
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
                    placeholder="Ä°steÄŸe baÄŸlÄ±"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <InlineToggle
                      checked={form.showAddressDetail}
                      disabled={!hasAddressDetail}
                      label="Adres detayÄ± gÃ¶rÃ¼nsÃ¼n"
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
            title="UyarÄ±lar"
            description="Ä°sterseniz dikkat Ã§ekmesi gereken notlarÄ± seÃ§in."
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

