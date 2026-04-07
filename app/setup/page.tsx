"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SetupForm = {
  code: string;
  tagName: string;
  ownerName: string;
  phone: string;
  email: string;
  note: string;
  allowPhone: boolean;
  allowEmail: boolean;
  allowWhatsapp: boolean;
  allowDirectSms: boolean;
  allowDirectEmail: boolean;
};

const initialForm: SetupForm = {
  code: "",
  tagName: "",
  ownerName: "",
  phone: "",
  email: "",
  note: "",
  allowPhone: true,
  allowEmail: true,
  allowWhatsapp: true,
  allowDirectSms: false,
  allowDirectEmail: false,
};

export default function SetupPage() {
  const router = useRouter();
  const [form, setForm] = useState<SetupForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateField<K extends keyof SetupForm>(key: K, value: SetupForm[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

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
        throw new Error(data?.error || "Kayıt başarısız.");
      }

      setSuccess("Kayıt başarıyla oluşturuldu.");
      router.push(`/p/${form.code.trim().toUpperCase()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Dokuntag Kurulum</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Etiket bilgilerinizi girin ve hangi iletişim yollarının görüneceğini seçin.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-2xl border p-5">
        <div>
          <label className="mb-1 block text-sm font-medium">Kod</label>
          <input
            value={form.code}
            onChange={(e) => updateField("code", e.target.value)}
            className="w-full rounded-xl border px-3 py-2 outline-none"
            placeholder="Örn: DT001"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Adı / Etiket Adı</label>
          <input
            value={form.tagName}
            onChange={(e) => updateField("tagName", e.target.value)}
            className="w-full rounded-xl border px-3 py-2 outline-none"
            placeholder="Örn: Boncuk"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Sahibi</label>
          <input
            value={form.ownerName}
            onChange={(e) => updateField("ownerName", e.target.value)}
            className="w-full rounded-xl border px-3 py-2 outline-none"
            placeholder="Örn: İbrahim"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Telefon</label>
          <input
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            className="w-full rounded-xl border px-3 py-2 outline-none"
            placeholder="+905551112233"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">E-posta</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            className="w-full rounded-xl border px-3 py-2 outline-none"
            placeholder="ornek@mail.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Not</label>
          <textarea
            value={form.note}
            onChange={(e) => updateField("note", e.target.value)}
            className="min-h-[100px] w-full rounded-xl border px-3 py-2 outline-none"
            placeholder="Bulduysanız lütfen mesaj gönderin."
          />
        </div>

        <div className="rounded-2xl border p-4">
          <h2 className="text-sm font-semibold">İletişim izinleri</h2>
          <p className="mt-1 text-xs text-neutral-600">
            Public sayfada hangi seçeneklerin gösterileceğini belirler.
          </p>

          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={form.allowPhone}
                onChange={(e) => updateField("allowPhone", e.target.checked)}
              />
              Telefonu göster / ara butonu aktif olsun
            </label>

            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={form.allowWhatsapp}
                onChange={(e) => updateField("allowWhatsapp", e.target.checked)}
              />
              WhatsApp butonu aktif olsun
            </label>

            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={form.allowDirectSms}
                onChange={(e) => updateField("allowDirectSms", e.target.checked)}
              />
              Direkt SMS butonu aktif olsun
            </label>

            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={form.allowEmail}
                onChange={(e) => updateField("allowEmail", e.target.checked)}
              />
              E-posta adresi gösterilsin
            </label>

            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={form.allowDirectEmail}
                onChange={(e) => updateField("allowDirectEmail", e.target.checked)}
              />
              Direkt e-posta butonu aktif olsun
            </label>
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-green-600">{success}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </form>
    </main>
  );
}