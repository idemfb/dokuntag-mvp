"use client";

import { use, useEffect, useMemo, useState } from "react";

type ProductType = "pet" | "item" | "key" | "person";

type PublicProfile = {
  publicCode: string;
  oldCode?: string;
  productType?: ProductType;
  name: string;
  ownerName: string;
  phone: string;
  email: string;
  note: string;
  alerts: string[];
  allowDirectCall: boolean;
  allowDirectWhatsapp: boolean;
  status?: "unclaimed" | "active";
};

type PublicApiResponse = {
  success: boolean;
  data: PublicProfile;
  message?: string;
};

function getTitle(productType?: ProductType) {
  if (productType === "pet") return "🐶 Bu hayvanı buldunuz";
  if (productType === "key") return "🔑 Bu anahtarı buldunuz";
  if (productType === "person") return "🧍 Bu kişiye yardımcı olun";
  return "🎒 Bu eşyayı buldunuz";
}

function getSubtitle(productType?: ProductType) {
  if (productType === "pet") {
    return "Lütfen sahibine güvenli şekilde ulaşmasına yardımcı olun.";
  }

  if (productType === "person") {
    return "Bu kişi yardıma ihtiyaç duyuyor olabilir. Lütfen yakınlarıyla iletişim kurulmasına yardımcı olun.";
  }

  if (productType === "key") {
    return "Lütfen anahtarın sahibine ulaşmasına yardımcı olun.";
  }

  return "Lütfen eşyanın sahibine ulaşmasına yardımcı olun.";
}

function normalizePhoneForLink(phone: string) {
  return phone.replace(/\D/g, "");
}

export default function PublicPage({
  params
}: {
  params: Promise<{ code: string }>;
}) {
  const resolvedParams = use(params);
  const code = resolvedParams.code;

  const [data, setData] = useState<PublicProfile | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");
  const [contactPhone, setContactPhone] = useState(true);
  const [contactWhatsapp, setContactWhatsapp] = useState(false);
  const [contactEmail, setContactEmail] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/public/${code}`, {
          cache: "no-store"
        });

        const json: PublicApiResponse = await res.json();

        if (!res.ok || !json.success || !json.data) {
          throw new Error(json?.message || "Profil yüklenemedi.");
        }

        if (!cancelled) {
          setData(json.data);
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
  }, [code]);

  const callHref = useMemo(() => {
    if (!data?.phone) return "";
    return `tel:${normalizePhoneForLink(data.phone)}`;
  }, [data]);

  const whatsappHref = useMemo(() => {
    if (!data?.phone) return "";
    const phone = normalizePhoneForLink(data.phone);
    const normalizedForWa = phone.startsWith("0") ? `90${phone.slice(1)}` : phone;
    const text = "Merhaba, Dokuntag profiliniz üzerinden size ulaşıyorum.";
    return `https://wa.me/${normalizedForWa}?text=${encodeURIComponent(text)}`;
  }, [data]);

  const smsHref = useMemo(() => {
    if (!data?.phone) return "";
    const phone = normalizePhoneForLink(data.phone);
    const text = "Dokuntag üzerinden size ulaşıyorum.";
    return `sms:${phone}?body=${encodeURIComponent(text)}`;
  }, [data]);

  const emailHref = useMemo(() => {
    if (!data?.email) return "";
    const subject = "Dokuntag mesajı";
    const body = "Dokuntag üzerinden size ulaşıyorum.";
    return `mailto:${data.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [data]);

  async function handleSendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSending(true);
      setSendError("");
      setSendSuccess("");

      const preferredContactMethods = [
        contactPhone ? "phone" : null,
        contactWhatsapp ? "whatsapp" : null,
        contactEmail ? "email" : null
      ].filter(Boolean);

      const res = await fetch("/api/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code,
          senderName,
          senderPhone,
          senderEmail,
          preferredContactMethods,
          message,
          website: ""
        })
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Mesaj gönderilemedi.");
      }

      setSendSuccess(
        json?.message || "Mesaj iletildi. Etiket sahibi sizinle iletişime geçebilir."
      );
      setSenderName("");
      setSenderPhone("");
      setSenderEmail("");
      setMessage("");
      setContactPhone(true);
      setContactWhatsapp(false);
      setContactEmail(false);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-900">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-sm">
          <p>Yükleniyor...</p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-900">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-lg font-semibold text-red-800">Profil açılamadı</h1>
          <p className="mt-2 text-sm text-red-700">
            {error || "Bu etiket için profil bulunamadı."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-900">
      <div className="mx-auto max-w-xl space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="space-y-2 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Dokuntag
            </p>

            <h1 className="text-2xl font-semibold">
              {getTitle(data.productType)}
            </h1>

            <p className="text-sm text-neutral-600">
              {getSubtitle(data.productType)}
            </p>
          </div>
        </div>

        {data.alerts.length > 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="text-sm font-semibold text-amber-900">Önemli uyarılar</h2>

            <div className="mt-3 flex flex-wrap gap-2">
              {data.alerts.map((alert) => (
                <span
                  key={alert}
                  className="rounded-full border border-amber-300 bg-white px-3 py-1 text-xs text-amber-900"
                >
                  {alert}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Profil bilgileri</h2>

          <div className="mt-4 space-y-3 text-sm">
            {data.name ? (
              <div>
                <span className="font-medium">Adı / Etiket adı:</span>{" "}
                <span>{data.name}</span>
              </div>
            ) : null}

            {data.ownerName ? (
              <div>
                <span className="font-medium">Sahibi:</span>{" "}
                <span>{data.ownerName}</span>
              </div>
            ) : null}

            {data.phone ? (
              <div>
                <span className="font-medium">Telefon:</span>{" "}
                <span>{data.phone}</span>
              </div>
            ) : null}

            {data.email ? (
              <div>
                <span className="font-medium">Email:</span>{" "}
                <span>{data.email}</span>
              </div>
            ) : null}

            {data.note ? (
              <div>
                <span className="font-medium">Not:</span>{" "}
                <span>{data.note}</span>
              </div>
            ) : null}
          </div>
        </div>

        {(data.phone || data.email) && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Hızlı iletişim</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Sahibine hızlıca ulaşabilirsiniz.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              {data.allowDirectCall && data.phone ? (
                <a
                  href={callHref}
                  className="rounded-xl bg-neutral-900 px-4 py-3 text-center text-sm font-medium text-white"
                >
                  Ara
                </a>
              ) : null}

              {data.allowDirectWhatsapp && data.phone ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-neutral-300 px-4 py-3 text-center text-sm font-medium text-neutral-900"
                >
                  WhatsApp
                </a>
              ) : null}

              {data.phone ? (
                <a
                  href={smsHref}
                  className="rounded-xl border border-neutral-300 px-4 py-3 text-center text-sm font-medium text-neutral-900"
                >
                  SMS
                </a>
              ) : null}

              {data.email ? (
                <a
                  href={emailHref}
                  className="rounded-xl border border-neutral-300 px-4 py-3 text-center text-sm font-medium text-neutral-900"
                >
                  Email
                </a>
              ) : null}
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">İletişim</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Sahibine ulaşmak için aşağıdaki formu kullanabilirsiniz.
          </p>

          {sendError ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {sendError}
            </div>
          ) : null}

          {sendSuccess ? (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {sendSuccess}
            </div>
          ) : null}

          <form onSubmit={handleSendMessage} className="mt-5 space-y-4">
            <input
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Adınız"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none"
            />

            <input
              value={senderPhone}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
                setSenderPhone(onlyNumbers);
              }}
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Telefonunuz"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none"
            />

            <input
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="Email adresiniz"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none"
            />

            <div className="rounded-xl border border-neutral-200 p-4">
              <p className="mb-3 text-sm font-medium">Size nasıl dönüş yapılsın?</p>

              <div className="space-y-2 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={contactPhone}
                    onChange={(e) => setContactPhone(e.target.checked)}
                  />
                  <span>Telefon / SMS</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={contactWhatsapp}
                    onChange={(e) => setContactWhatsapp(e.target.checked)}
                  />
                  <span>WhatsApp</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={contactEmail}
                    onChange={(e) => setContactEmail(e.target.checked)}
                  />
                  <span>Email</span>
                </label>
              </div>
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Bulduğunuz ürün / kişi / hayvan ile ilgili mesajınızı yazın"
              className="min-h-[120px] w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none"
            />

            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {sending ? "Gönderiliyor..." : "Mesaj gönder"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}