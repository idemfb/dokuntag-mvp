"use client";

import { useEffect, useMemo, useState } from "react";

const ALERT_OPTIONS = [
  "Acil bana ulaşın",
  "Hayvanım hasta",
  "Alerjisi var",
  "Ürkek / yaklaşmayın",
  "Ödül verilecektir"
];

type SetupResponse = {
  code: string;
  status: "active" | "unclaimed";
  profile: {
    name: string;
    phone: string;
    petName: string;
    note: string;
  };
  alerts: string[];
  visibility: {
    showName: boolean;
    showPhone: boolean;
    showPetName: boolean;
    showNote: boolean;
  };
  recovery: {
    phone: string;
    email: string;
  };
};

type SubmitResponse = {
  success: boolean;
  code: string;
  redirectTo: string;
  managePath: string;
  manageLink: string;
};

export default function SetupPage({
  params
}: {
  params: Promise<{ code: string }>;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState<SubmitResponse | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [petName, setPetName] = useState("");
  const [note, setNote] = useState("");
  const [alerts, setAlerts] = useState<string[]>([]);
  const [showName, setShowName] = useState(true);
  const [showPhone, setShowPhone] = useState(true);
  const [showPetName, setShowPetName] = useState(true);
  const [showNote, setShowNote] = useState(true);
  const [recoveryPhone, setRecoveryPhone] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");

  useEffect(() => {
    params.then((resolved) => setCode(resolved.code));
  }, [params]);

  useEffect(() => {
    if (!code) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/setup/${code}`, {
          cache: "no-store"
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data?.error || "Veri alınamadı.");
        }

        const data: SetupResponse = await res.json();

        setName(data.profile.name || "");
        setPhone(data.profile.phone || "");
        setPetName(data.profile.petName || "");
        setNote(data.profile.note || "");
        setAlerts(Array.isArray(data.alerts) ? data.alerts : []);
        setShowName(Boolean(data.visibility?.showName));
        setShowPhone(Boolean(data.visibility?.showPhone));
        setShowPetName(Boolean(data.visibility?.showPetName));
        setShowNote(Boolean(data.visibility?.showNote));
        setRecoveryPhone(data.recovery?.phone || "");
        setRecoveryEmail(data.recovery?.email || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [code]);

  const whatsappLink = useMemo(() => {
    if (!successData?.manageLink) return "";
    const text = `Dokuntag yönetim linkim: ${successData.manageLink}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }, [successData]);

  function toggleAlert(value: string) {
    setAlerts((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  }

  async function copyManageLink() {
    if (!successData?.manageLink) return;
    await navigator.clipboard.writeText(successData.manageLink);
    alert("Manage link kopyalandı.");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccessData(null);

      const res = await fetch(`/api/setup/${code}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          phone,
          petName,
          note,
          alerts,
          visibility: {
            showName,
            showPhone,
            showPetName,
            showNote
          },
          recovery: {
            phone: recoveryPhone,
            email: recoveryEmail
          }
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Kaydetme başarısız.");
      }

      setSuccessData(data as SubmitResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white px-4 py-10 text-neutral-900">
        <div className="mx-auto max-w-2xl">
          <p>Yükleniyor...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-neutral-900">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
            Dokuntag Setup
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Etiket kurulumu</h1>
          <p className="mt-2 text-sm text-neutral-600">Kod: {code}</p>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {successData ? (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5">
            <h2 className="text-lg font-semibold text-green-800">
              Kurulum tamamlandı
            </h2>

            <p className="mt-2 text-sm text-green-700">
              Public profil linki:{" "}
              <a
                href={successData.redirectTo}
                className="underline"
                target="_blank"
                rel="noreferrer"
              >
                {successData.redirectTo}
              </a>
            </p>

            <div className="mt-4 rounded-xl border border-green-200 bg-white p-4">
              <p className="text-sm font-medium text-neutral-900">
                Manage link
              </p>
              <p className="mt-2 break-all text-sm text-neutral-700">
                {successData.manageLink}
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => void copyManageLink()}
                  className="rounded-xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white"
                >
                  Kopyala
                </button>

                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-neutral-300 px-4 py-3 text-center text-sm font-medium text-neutral-900"
                >
                  WhatsApp’a gönder
                </a>

                <a
                  href={successData.redirectTo}
                  className="rounded-xl border border-neutral-300 px-4 py-3 text-center text-sm font-medium text-neutral-900"
                >
                  Public profile aç
                </a>
              </div>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="rounded-2xl border border-neutral-200 p-5">
            <h2 className="text-lg font-semibold">Temel bilgiler</h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  İsim / Etiket adı
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none"
                  placeholder="Örn: İbrahim"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Telefon</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none"
                  placeholder="Örn: +90 5xx xxx xx xx"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Evcil hayvan adı / ürün adı
                </label>
                <input
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none"
                  placeholder="Örn: Luna / Anahtarlık"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Not</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="min-h-[120px] w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none"
                  placeholder="Ek bilgi yazabilirsiniz"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 p-5">
            <h2 className="text-lg font-semibold">Uyarılar</h2>

            <div className="mt-5 space-y-3">
              {ALERT_OPTIONS.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3"
                >
                  <input
                    type="checkbox"
                    checked={alerts.includes(item)}
                    onChange={() => toggleAlert(item)}
                  />
                  <span className="text-sm">{item}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 p-5">
            <h2 className="text-lg font-semibold">Public profilde göster</h2>

            <div className="mt-5 space-y-3">
              <label className="flex items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3">
                <input
                  type="checkbox"
                  checked={showName}
                  onChange={(e) => setShowName(e.target.checked)}
                />
                <span className="text-sm">İsim göster</span>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3">
                <input
                  type="checkbox"
                  checked={showPhone}
                  onChange={(e) => setShowPhone(e.target.checked)}
                />
                <span className="text-sm">Telefon göster</span>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3">
                <input
                  type="checkbox"
                  checked={showPetName}
                  onChange={(e) => setShowPetName(e.target.checked)}
                />
                <span className="text-sm">Evcil hayvan / ürün adı göster</span>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3">
                <input
                  type="checkbox"
                  checked={showNote}
                  onChange={(e) => setShowNote(e.target.checked)}
                />
                <span className="text-sm">Not göster</span>
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 p-5">
            <h2 className="text-lg font-semibold">Recovery bilgileri</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Bu alanlar public profilde görünmez. Manage link kaybolursa
              doğrulama için kullanılacak.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Recovery telefon
                </label>
                <input
                  value={recoveryPhone}
                  onChange={(e) => setRecoveryPhone(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none"
                  placeholder="Örn: +90 5xx xxx xx xx"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Recovery e-posta
                </label>
                <input
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none"
                  placeholder="ornek@mail.com"
                />
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-neutral-900 px-5 py-4 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Kaydediliyor..." : "Kurulumu kaydet"}
          </button>
        </form>
      </div>
    </main>
  );
}