"use client";

import { use, useEffect, useState } from "react";

type ProductType = "pet" | "item" | "key" | "person";
type TransferStatus = "pending" | "used" | "expired" | "cancelled";

type TransferApiResponse = {
  success?: boolean;
  code?: string;
  productType?: ProductType;
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

function getProductTypeLabel(productType: ProductType) {
  if (productType === "pet") return "Evcil hayvan";
  if (productType === "key") return "Anahtar";
  if (productType === "person") return "Kişi";
  return "Ürün";
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
  const [tagName, setTagName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [distinctiveFeature, setDistinctiveFeature] = useState("");
  const [petName, setPetName] = useState("");
  const [note, setNote] = useState("");
  const [recoveryPhone, setRecoveryPhone] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");

  const [showName, setShowName] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showCity, setShowCity] = useState(false);
  const [showAddressDetail, setShowAddressDetail] = useState(false);
  const [showPetName, setShowPetName] = useState(true);
  const [showNote, setShowNote] = useState(false);

  const [allowDirectCall, setAllowDirectCall] = useState(false);
  const [allowDirectWhatsapp, setAllowDirectWhatsapp] = useState(false);

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const res = await fetch(`/api/transfer/claim/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          productType,
          name: tagName,
          ownerName,
          phone,
          email,
          city,
          addressDetail,
          distinctiveFeature,
          petName,
          note,
          visibility: {
            showName,
            showPhone,
            showEmail,
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
      });

      const data: TransferClaimResponse = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Devir tamamlanamadı.");
      }

      setSuccess(
        data?.message ||
          "Devir tamamlandı. Yeni yönetim bağlantınız oluşturuldu."
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

  if (error) {
    return (
      <main className="min-h-screen bg-neutral-100 px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-red-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-red-500">
            Dokuntag Devir
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-red-800">
            Devir bağlantısı kullanılamıyor
          </h1>
          <p className="mt-3 text-sm leading-6 text-red-700">{error}</p>
        </div>
      </main>
    );
  }

  const transferStatus = loaded?.transfer?.status;

  if (transferStatus && transferStatus !== "pending") {
    return (
      <main className="min-h-screen bg-neutral-100 px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-amber-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-amber-600">
            Dokuntag Devir
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-neutral-900">
            Bu bağlantı artık kullanılamaz
          </h1>
          <p className="mt-3 text-sm leading-6 text-neutral-700">
            Durum: {transferStatus}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-10 text-neutral-900">
      <div className="mx-auto max-w-2xl space-y-5">
        <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-neutral-500">
            Dokuntag Devir
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Ürünü üzerinize alın
          </h1>
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
          </div>
        </section>

        {success ? (
          <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
            {success}
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4">
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
              <label className="mb-2 block text-sm font-medium">Etiket / profil başlığı</label>
              <input
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none"
                placeholder="Örn: Defne'nin anahtarı"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Ana görünen isim</label>
              <input
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none"
                placeholder="Ürün / kişi / hayvan adı"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Sahip adı</label>
              <input
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none"
                placeholder="İsteğe bağlı"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Telefon</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none"
                  placeholder="05xxxxxxxxx"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">E-posta</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none"
                  placeholder="ornek@mail.com"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Şehir</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Adres detayı</label>
                <input
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Ayırt edici özellik</label>
              <input
                value={distinctiveFeature}
                onChange={(e) => setDistinctiveFeature(e.target.value)}
                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Not</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-[120px] w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none"
              />
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-sm font-medium text-neutral-900">Görünürlük</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={showName} onChange={(e) => setShowName(e.target.checked)} />
                  Sahip adı görünsün
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={showPhone} onChange={(e) => setShowPhone(e.target.checked)} />
                  Telefon görünsün
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={showEmail} onChange={(e) => setShowEmail(e.target.checked)} />
                  E-posta görünsün
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={showCity} onChange={(e) => setShowCity(e.target.checked)} />
                  Şehir görünsün
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={showAddressDetail} onChange={(e) => setShowAddressDetail(e.target.checked)} />
                  Adres detayı görünsün
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={showPetName} onChange={(e) => setShowPetName(e.target.checked)} />
                  Ana isim görünsün
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={showNote} onChange={(e) => setShowNote(e.target.checked)} />
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
                  />
                  Telefonla ulaşılabilsin
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={allowDirectWhatsapp}
                    onChange={(e) => setAllowDirectWhatsapp(e.target.checked)}
                  />
                  WhatsApp açılsın
                </label>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Kurtarma telefonu</label>
                <input
                  value={recoveryPhone}
                  onChange={(e) => setRecoveryPhone(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none"
                  placeholder="05xxxxxxxxx"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Kurtarma e-postası</label>
                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none"
                  placeholder="ornek@mail.com"
                />
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