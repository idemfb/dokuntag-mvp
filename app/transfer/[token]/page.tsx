"use client";

import { use, useEffect, useMemo, useState } from "react";

type ProductType = "pet" | "item" | "key" | "person";
type TransferStatus = "pending" | "used" | "expired" | "cancelled";

type ProductSubtypeOption = {
  value: string;
  label: string;
};

type TransferApiResponse = {
  success?: boolean;
  code?: string;
  productType?: ProductType;
  productSubtype?: string;
  currentProfile?: {
    name?: string;
    ownerName?: string;
    phone?: string;
    email?: string;
    city?: string;
    addressDetail?: string;
    distinctiveFeature?: string;
    petName?: string;
    note?: string;
  };
  transfer?: {
    token?: string;
    status?: TransferStatus | null;
    createdAt?: string;
    expiresAt?: string;
    usedAt?: string;
  };
  error?: string;
};

type TransferClaimResponse = {
  success?: boolean;
  code?: string;
  managePath?: string;
  manageLink?: string;
  message?: string;
  error?: string;
};

const CITY_OPTIONS = [
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
  "Kilis",
  "Kırıkkale",
  "Kırklareli",
  "Kırşehir",
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

const SUBTYPE_OPTIONS: Record<ProductType, ProductSubtypeOption[]> = {
  pet: [
    { value: "cat", label: "Kedi" },
    { value: "dog", label: "Köpek" },
    { value: "bird", label: "Kuş" },
    { value: "other", label: "Diğer" }
  ],
  key: [
    { value: "home-key", label: "Ev anahtarı" },
    { value: "car-key", label: "Araba anahtarı" },
    { value: "office-key", label: "Ofis anahtarı" },
    { value: "other", label: "Diğer" }
  ],
  person: [
    { value: "girl-child", label: "Kız çocuk" },
    { value: "boy-child", label: "Erkek çocuk" },
    { value: "woman", label: "Kadın" },
    { value: "man", label: "Erkek" },
    { value: "elderly", label: "Yaşlı" },
    { value: "other", label: "Diğer" }
  ],
  item: [
    { value: "bag", label: "Çanta" },
    { value: "wallet", label: "Cüzdan" },
    { value: "suitcase", label: "Valiz" },
    { value: "phone", label: "Telefon" },
    { value: "tablet", label: "Tablet" },
    { value: "headphones", label: "Kulaklık" },
    { value: "other", label: "Diğer" }
  ]
};

function getProductTypeLabel(productType: ProductType) {
  if (productType === "pet") return "Evcil hayvan";
  if (productType === "key") return "Anahtar";
  if (productType === "person") return "Kişi";
  return "Eşya";
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
  return "Etiket / kısa başlık";
}

function getDistinctiveFeaturePlaceholder(productType: ProductType) {
  if (productType === "pet") return "Örn: sağ kulağında beyaz leke, mavi tasma";
  if (productType === "key") return "Örn: kırmızı anahtarlık, metal halka";
  if (productType === "person") return "Örn: mavi mont, siyah sırt çantası";
  return "Örn: siyah çanta, köşesi hafif çizik";
}

function getSubtypeLabel(productType: ProductType) {
  if (productType === "pet") return "Tür";
  if (productType === "key") return "Anahtar türü";
  if (productType === "person") return "Kategori";
  return "Eşya türü";
}

function normalizePhone(value: string) {
  return String(value || "").replace(/[^0-9]/g, "");
}

function normalizeEmail(value: string) {
  return String(value || "").trim().toLowerCase();
}

function formatDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight text-neutral-900">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm leading-6 text-neutral-600">{description}</p>
      ) : null}
    </div>
  );
}

export default function TransferPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loaded, setLoaded] = useState<TransferApiResponse | null>(null);

  const [productType, setProductType] = useState<ProductType>("item");
  const [productSubtype, setProductSubtype] = useState("");
  const [tagName, setTagName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [distinctiveFeature, setDistinctiveFeature] = useState("");
  const [petName, setPetName] = useState("");
  const [note, setNote] = useState("");
  const [recoveryPhone, setRecoveryPhone] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");

  const [useRecoveryPhoneAsContact, setUseRecoveryPhoneAsContact] = useState(false);
  const [useRecoveryEmailAsContact, setUseRecoveryEmailAsContact] = useState(false);

  const [showName, setShowName] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showCity, setShowCity] = useState(false);
  const [showPetName, setShowPetName] = useState(true);
  const [showNote, setShowNote] = useState(false);

  const [allowDirectCall, setAllowDirectCall] = useState(false);
  const [allowDirectWhatsapp, setAllowDirectWhatsapp] = useState(false);

  const allowedSubtypeOptions = useMemo(
    () => SUBTYPE_OPTIONS[productType] ?? [],
    [productType]
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/transfer/claim/${token}`, {
          cache: "no-store"
        });

        const data: TransferApiResponse = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Devir bağlantısı açılamadı.");
        }

        if (!cancelled) {
          setLoaded(data);
          setProductType(data.productType || "item");
          setProductSubtype(String(data.productSubtype || ""));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Bir hata oluştu.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    const hasSubtype = allowedSubtypeOptions.some((item) => item.value === productSubtype);
    if (!hasSubtype && productSubtype) {
      setProductSubtype("");
    }
  }, [allowedSubtypeOptions, productSubtype]);

  useEffect(() => {
    if (useRecoveryPhoneAsContact) {
      setPhone(normalizePhone(recoveryPhone));
    }
  }, [recoveryPhone, useRecoveryPhoneAsContact]);

  useEffect(() => {
    if (useRecoveryEmailAsContact) {
      setEmail(normalizeEmail(recoveryEmail));
    }
  }, [recoveryEmail, useRecoveryEmailAsContact]);

  useEffect(() => {
    if (!phone) {
      setAllowDirectCall(false);
      setAllowDirectWhatsapp(false);
      setShowPhone(false);
    }
  }, [phone]);

  useEffect(() => {
    if (!city) {
      setShowCity(false);
    }
  }, [city]);

  useEffect(() => {
    if (!note) {
      setShowNote(false);
    }
  }, [note]);

  const transferStatus = loaded?.transfer?.status;
  const expiresAtText = formatDate(loaded?.transfer?.expiresAt);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const resolvedPhone = useRecoveryPhoneAsContact
        ? normalizePhone(recoveryPhone)
        : normalizePhone(phone);
      const resolvedEmail = useRecoveryEmailAsContact
        ? normalizeEmail(recoveryEmail)
        : normalizeEmail(email);

      const res = await fetch(`/api/transfer/claim/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          productType,
          productSubtype,
          name: tagName,
          ownerName,
          phone: resolvedPhone,
          email: resolvedEmail,
          city,
          distinctiveFeature,
          petName,
          note,
          visibility: {
            showName,
            showPhone,
            showEmail,
            showCity,
            showAddressDetail: false,
            showPetName,
            showNote
          },
          contactOptions: {
            allowDirectCall: Boolean(allowDirectCall && resolvedPhone),
            allowDirectWhatsapp:
              Boolean(allowDirectWhatsapp && allowDirectCall && resolvedPhone)
          },
          recovery: {
            phone: normalizePhone(recoveryPhone),
            email: normalizeEmail(recoveryEmail)
          }
        })
      });

      const data: TransferClaimResponse = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Devir tamamlanamadı.");
      }

      setSuccess(
        data?.message || "Devir tamamlandı. Yeni yönetim bağlantınız oluşturuldu."
      );

      if (data?.manageLink) {
        window.location.href = data.manageLink;
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-100 px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-600">Yükleniyor...</p>
        </div>
      </main>
    );
  }

  if (error && !loaded) {
    return (
      <main className="min-h-screen bg-neutral-100 px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-red-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-red-500">Dokuntag Devir</p>
          <h1 className="mt-2 text-2xl font-semibold text-red-800">
            Devir bağlantısı kullanılamıyor
          </h1>
          <p className="mt-3 text-sm leading-6 text-red-700">{error}</p>
        </div>
      </main>
    );
  }

  if (transferStatus && transferStatus !== "pending") {
    return (
      <main className="min-h-screen bg-neutral-100 px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-amber-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-amber-600">Dokuntag Devir</p>
          <h1 className="mt-2 text-2xl font-semibold text-neutral-900">
            Bu bağlantı artık kullanılamaz
          </h1>
          <p className="mt-3 text-sm leading-6 text-neutral-700">Durum: {transferStatus}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-10 text-neutral-900">
      <div className="mx-auto max-w-2xl space-y-5">
        <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-neutral-500">Dokuntag Devir</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Ürünü üzerinize alın</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            Bu bağlantı ile ürünün yeni sahibi olarak kendi bilgilerinizi tanımlayabilirsiniz.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-700">
              Kod: {loaded?.code || "-"}
            </span>
            <span className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-700">
              Tip: {getProductTypeLabel(productType)}
            </span>
            <span className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-700">
              Son kullanım: {expiresAtText}
            </span>
          </div>
        </section>

        {success ? (
          <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
            {success}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-6">
            <SectionTitle
              title="Temel bilgiler"
              description="Ürün size geçtiğinde herkese açık profilde kullanılacak ana bilgileri belirleyin."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Ürün tipi</label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value as ProductType)}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none"
                >
                  <option value="item">Eşya</option>
                  <option value="key">Anahtar</option>
                  <option value="pet">Evcil hayvan</option>
                  <option value="person">Kişi</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">{getSubtypeLabel(productType)}</label>
                <select
                  value={productSubtype}
                  onChange={(e) => setProductSubtype(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none"
                >
                  <option value="">Seçmek istemiyorum</option>
                  {allowedSubtypeOptions.map((item) => (
                    <option key={`${productType}-${item.value}`} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                {getSecondaryNameLabel(productType)}
              </label>
              <input
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none"
                placeholder="Örn: Defne'nin anahtarı"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {getPrimaryNameLabel(productType)}
                </label>
                <input
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none"
                  placeholder="Ana görünen isim"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  {getOwnerNameLabel(productType)}
                </label>
                <input
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none"
                  placeholder="İsteğe bağlı"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Ayırt edici özellik</label>
              <input
                value={distinctiveFeature}
                onChange={(e) => setDistinctiveFeature(e.target.value)}
                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none"
                placeholder={getDistinctiveFeaturePlaceholder(productType)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Not</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-[120px] w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none"
                placeholder="İsterseniz ek bilgi yazabilirsiniz."
              />
            </div>

            <SectionTitle
              title="İletişim bilgileri"
              description="Ürün size geçtiğinde bulunacak kişi size bu bilgiler üzerinden ulaşabilir."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">İletişim telefonu</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(normalizePhone(e.target.value))}
                  disabled={useRecoveryPhoneAsContact}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none disabled:bg-neutral-100"
                  placeholder="05xxxxxxxxx"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">İletişim e-postası</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(normalizeEmail(e.target.value))}
                  disabled={useRecoveryEmailAsContact}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none disabled:bg-neutral-100"
                  placeholder="ornek@mail.com"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Kurtarma telefonu</label>
                <input
                  value={recoveryPhone}
                  onChange={(e) => setRecoveryPhone(normalizePhone(e.target.value))}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none"
                  placeholder="05xxxxxxxxx"
                />
                <label className="mt-3 flex items-center gap-2 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    checked={useRecoveryPhoneAsContact}
                    onChange={(e) => setUseRecoveryPhoneAsContact(e.target.checked)}
                  />
                  Kurtarma telefonunu iletişim telefonu olarak kullan
                </label>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Kurtarma e-postası</label>
                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(normalizeEmail(e.target.value))}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none"
                  placeholder="ornek@mail.com"
                />
                <label className="mt-3 flex items-center gap-2 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    checked={useRecoveryEmailAsContact}
                    onChange={(e) => setUseRecoveryEmailAsContact(e.target.checked)}
                  />
                  Kurtarma e-postasını iletişim maili olarak kullan
                </label>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Şehir</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none"
              >
                <option value="">Seçmek istemiyorum</option>
                {CITY_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
              <p className="text-sm font-medium text-amber-900">Adres bilgisi güvenlik için sistemde paylaşılmaz</p>
              <p className="mt-2 text-sm leading-6 text-amber-800">
                Bu bilgi size özeldir. Adres göstermek isterseniz bunu not alanına manuel olarak yazmanız gerekir.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-sm font-medium text-neutral-900">Herkese açık bilgiler</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={showName} onChange={(e) => setShowName(e.target.checked)} />
                  Sahip adı görünsün
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showPhone}
                    onChange={(e) => setShowPhone(e.target.checked)}
                    disabled={!phone && !useRecoveryPhoneAsContact}
                  />
                  Telefon görünsün
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showEmail}
                    onChange={(e) => setShowEmail(e.target.checked)}
                    disabled={!email && !useRecoveryEmailAsContact}
                  />
                  E-posta görünsün
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={showCity} onChange={(e) => setShowCity(e.target.checked)} disabled={!city} />
                  Şehir görünsün
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={showPetName} onChange={(e) => setShowPetName(e.target.checked)} />
                  Ana isim görünsün
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={showNote} onChange={(e) => setShowNote(e.target.checked)} disabled={!note} />
                  Not görünsün
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-sm font-medium text-neutral-900">Hızlı iletişim</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={allowDirectCall}
                    onChange={(e) => setAllowDirectCall(e.target.checked)}
                    disabled={!phone && !useRecoveryPhoneAsContact}
                  />
                  Telefonla ulaşılabilsin
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={allowDirectWhatsapp}
                    onChange={(e) => setAllowDirectWhatsapp(e.target.checked)}
                    disabled={!allowDirectCall || (!phone && !useRecoveryPhoneAsContact)}
                  />
                  WhatsApp açılsın
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-neutral-900 px-5 py-4 text-sm font-medium text-white disabled:opacity-60"
            >
              {submitting ? "Tamamlanıyor..." : "Devri tamamla"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
