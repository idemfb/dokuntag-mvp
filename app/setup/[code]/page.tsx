"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SetupForm = {
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

type Props = {
  params: Promise<{
    code: string;
  }>;
};

const initialForm: SetupForm = {
  tagName: "",
  ownerName: "",
  phone: "",
  email: "",
  note: "",
  allowPhone: true,
  allowEmail: true,
  allowWhatsapp: true,
  allowDirectSms: false,
  allowDirectEmail: false
};

export default function SetupCodePage({ params }: Props) {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [form, setForm] = useState<SetupForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;

    async function run() {
      try {
        const resolved = await params;
        const normalizedCode = String(resolved.code ?? "").trim().toUpperCase();

        if (!active) return;

        setCode(normalizedCode);

        const res = await fetch(`/api/setup/${normalizedCode}`);
        const data = await res.json();

        if (!res.ok || !data?.ok) {
          throw new Error(data?.error || "Veri alınamadı.");
        }

        if (!active) return;

        setForm({
          tagName: data.tag?.profile?.tagName ?? data.tag?.profile?.name ?? "",
          ownerName: data.tag?.profile?.ownerName ?? "",
          phone: data.tag?.profile?.phone ?? "",
          email: data.tag?.profile?.email ?? "",
          note: data.tag?.profile?.note ?? "",
          allowPhone: data.tag?.visibility?.allowPhone ?? false,
          allowEmail: data.tag?.visibility?.allowEmail ?? false,
          allowWhatsapp: data.tag?.visibility?.allowWhatsapp ?? false,
          allowDirectSms: data.tag?.visibility?.allowDirectSms ?? false,
          allowDirectEmail: data.tag?.visibility?.allowDirectEmail ?? false
        });
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Bir hata oluştu.");
      } finally {
        if (active) setLoading(false);
      }
    }

    run();

    return () => {
      active = false;
    };
  }, [params]);

  function updateField<K extends keyof SetupForm>(key: K, value: SetupForm[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value
    }));
  }

  async function copyText(value: string) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {}
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/setup/${code}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Güncelleme başarısız.");
      }

      setSuccess("Bilgiler güncellendi.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <p>Yükleniyor...</p>
      </main>
    );
  }

  if (done) {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const publicLink = `${origin}/p/${code}`;
    const myLink = `${origin}/my`;
    const setupLink = `${origin}/setup/${code}`;

    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">
              Dokuntag
            </p>
            <h1 className="mt-2 text-2xl font-semibold">Dokuntag hazır 🎉</h1>
            <p className="mt-2 text-sm text-neutral-600">
              Ürünün aktif oldu. Aşağıdaki linkleri kaydet.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Public link</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={publicLink}
                className="flex-1 rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => void copyText(publicLink)}
                className="rounded-xl border border-neutral-300 px-4 py-2 text-sm"
              >
                Kopyala
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Kurulum linki</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={setupLink}
                className="flex-1 rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => void copyText(setupLink)}
                className="rounded-xl border border-neutral-300 px-4 py-2 text-sm"
              >
                Kopyala
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push(`/p/${code}`)}
              className="rounded-xl bg-black px-4 py-2 text-sm text-white"
            >
              Profili Gör
            </button>

            <button
              type="button"
              onClick={() => router.push("/my")}
              className="rounded-xl border border-neutral-300 px-4 py-2 text-sm"
            >
              Ürünlerime Git
            </button>

            <button
              type="button"
              onClick={() =>
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(publicLink)}`,
                  "_blank"
                )
              }
              className="rounded-xl border border-neutral-300 px-4 py-2 text-sm"
            >
              WhatsApp ile paylaş
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Dokuntag Düzenle</h1>
      <p className="mt-2 text-sm text-neutral-600">Kod: {code}</p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-5 rounded-2xl border p-5"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">
            Adı / Etiket Adı
          </label>
          <input
            value={form.tagName}
            onChange={(e) => updateField("tagName", e.target.value)}
            className="w-full rounded-xl border px-3 py-2 outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Sahibi</label>
          <input
            value={form.ownerName}
            onChange={(e) => updateField("ownerName", e.target.value)}
            className="w-full rounded-xl border px-3 py-2 outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Telefon</label>
          <input
            value={form.phone}
            onChange={(e) => {
              const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
              updateField("phone", onlyNumbers);
            }}
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-full rounded-xl border px-3 py-2 outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">E-posta</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            className="w-full rounded-xl border px-3 py-2 outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Not</label>
          <textarea
            value={form.note}
            onChange={(e) => updateField("note", e.target.value)}
            className="min-h-[100px] w-full rounded-xl border px-3 py-2 outline-none"
          />
        </div>

        <div className="rounded-2xl border p-4">
          <h2 className="text-sm font-semibold">İletişim izinleri</h2>

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
                onChange={(e) =>
                  updateField("allowDirectSms", e.target.checked)
                }
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
                onChange={(e) =>
                  updateField("allowDirectEmail", e.target.checked)
                }
              />
              Direkt e-posta butonu aktif olsun
            </label>
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-green-600">{success}</p> : null}

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {saving ? "Kaydediliyor..." : "Güncelle"}
        </button>
      </form>
    </main>
  );
}