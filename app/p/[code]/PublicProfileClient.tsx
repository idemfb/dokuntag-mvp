"use client";

import { useEffect, useState } from "react";

type TagStatus = "production_hold" | "unclaimed" | "active" | "inactive" | "void";

type PublicProfileClientProps = {
  code: string;
};

type PublicProfileResponse = {
  success?: boolean;
  data?: {
    status?: TagStatus;
  };
  message?: string;
};

export default function PublicProfileClient({
  code
}: PublicProfileClientProps) {
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [preferredContactMethods, setPreferredContactMethods] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [tagStatus, setTagStatus] = useState<TagStatus>("active");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      try {
        setStatusLoading(true);

        const res = await fetch(`/api/public/${code}`, {
          cache: "no-store"
        });

        const data: PublicProfileResponse = await res.json();

        if (!res.ok || !data?.data) {
          throw new Error(data?.message || "Ürün durumu alınamadı.");
        }

        if (!cancelled) {
          const incoming = data.data.status;

if (
  incoming === "production_hold" ||
  incoming === "void" ||
  incoming === "inactive"
) {
  setTagStatus("inactive");
} else {
  setTagStatus("active");
}
        }
      } catch {
        if (!cancelled) {
          setTagStatus("active");
        }
      } finally {
        if (!cancelled) {
          setStatusLoading(false);
        }
      }
    }

    void loadStatus();

    return () => {
      cancelled = true;
    };
  }, [code]);

  function toggleMethod(value: string) {
    setPreferredContactMethods((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (tagStatus !== "active") {
      setError("Bu ürün şu an aktif değil. İletişim geçici olarak kapatılmıştır.");
      setSuccess("");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

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
          website
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Mesaj gönderilemedi.");
      }

      setSuccess(data?.message || "Mesaj gönderildi.");
      setSenderName("");
      setSenderPhone("");
      setSenderEmail("");
      setPreferredContactMethods([]);
      setMessage("");
      setWebsite("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  const needsPhone =
    preferredContactMethods.includes("phone") ||
    preferredContactMethods.includes("whatsapp");

  const needsEmail = preferredContactMethods.includes("email");

  if (statusLoading) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
        Yükleniyor...
      </div>
    );
  }

  if (tagStatus !== "active") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Bu ürün şu an aktif değil. İletişim formu geçici olarak kapatılmıştır.
      </div>
    );
  }

  return (
    <div>
      {error ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">Adınız</label>
          <input
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 outline-none"
            placeholder="Adınızı yazın"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Size nasıl ulaşılmasını istersiniz?
          </label>

          <div className="grid gap-3 sm:grid-cols-3">
            <MethodCard
              label="Telefon"
              checked={preferredContactMethods.includes("phone")}
              onChange={() => toggleMethod("phone")}
            />
            <MethodCard
              label="WhatsApp"
              checked={preferredContactMethods.includes("whatsapp")}
              onChange={() => toggleMethod("whatsapp")}
            />
            <MethodCard
              label="Email"
              checked={preferredContactMethods.includes("email")}
              onChange={() => toggleMethod("email")}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Telefon numaranız</label>
          <input
            value={senderPhone}
            onChange={(e) => setSenderPhone(e.target.value)}
            className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 outline-none"
            placeholder="+90 5xx xxx xx xx"
          />
          {needsPhone ? (
            <p className="mt-2 text-xs text-neutral-500">
              Telefon veya WhatsApp seçtiğiniz için bu alan gereklidir.
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Email adresiniz</label>
          <input
            type="email"
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 outline-none"
            placeholder="ornek@mail.com"
          />
          {needsEmail ? (
            <p className="mt-2 text-xs text-neutral-500">
              Email seçtiğiniz için bu alan gereklidir.
            </p>
          ) : null}
        </div>

        <div className="hidden">
          <label>Website</label>
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Mesaj</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className="min-h-[140px] w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 outline-none"
            placeholder="Örn: Etiketi güvenli şekilde buldum. Uygunsanız bana ulaşabilirsiniz."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-neutral-900 px-5 py-4 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Gönderiliyor..." : "Mesaj gönder"}
        </button>
      </form>
    </div>
  );
}

function MethodCard({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-4 text-sm transition ${
        checked
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-200 bg-neutral-50 text-neutral-800"
      }`}
    >
      <input type="checkbox" checked={checked} onChange={onChange} className="hidden" />
      <span>{label}</span>
    </label>
  );
}