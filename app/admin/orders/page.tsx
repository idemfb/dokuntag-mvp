"use client";

import { useState } from "react";

type FormState = {
  code: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  orderNo: string;
};

const initialForm: FormState = {
  code: "",
  customerName: "",
  customerPhone: "",
  customerAddress: "",
  orderNo: ""
};

function normalizeCode(value: string) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);
}

export default function AdminOrdersPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
    setSuccess("");
  }

  function validate() {
    if (!form.code.trim()) return "Ürün kodu zorunlu.";
    if (!form.customerName.trim()) return "Müşteri adı zorunlu.";
    if (!form.customerAddress.trim()) return "Kargo adresi zorunlu.";

    if (!form.customerPhone.trim() && !form.orderNo.trim()) {
      return "Telefon veya sipariş numarası zorunlu.";
    }

    return "";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    const confirmed = window.confirm(
      `${form.code} kodlu fiziksel ürün bu siparişe bağlansın ve kargoya hazır yapılsın mı?`
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const res = await fetch("/api/admin/mark-packed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          code: form.code.trim(),
          packed: true,
          shipmentStatus: "packed",
          customerName: form.customerName.trim(),
          customerPhone: form.customerPhone.trim(),
          customerAddress: form.customerAddress.trim(),
          orderNo: form.orderNo.trim()
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Sipariş koda bağlanamadı.");
      }

      setSuccess(`${form.code} kodlu ürün siparişe bağlandı ve kargoya hazırlandı.`);
      setForm(initialForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem başarısız.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 text-neutral-900">
      <div className="mx-auto max-w-3xl space-y-5">
        <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            Dokuntag
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Siparişe kod bağla
          </h1>

          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Fiziksel ürünü elinize alın, üzerindeki kodu yazın ve müşteri
            siparişiyle eşleştirin. Kod otomatik atanmaz.
          </p>
        </section>

        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={form.code}
              onChange={(e) => update("code", normalizeCode(e.target.value))}
              placeholder="Fiziksel ürün kodu"
              className="rounded-2xl border border-neutral-300 px-4 py-3 text-sm uppercase outline-none focus:border-neutral-500"
            />

            <input
              value={form.orderNo}
              onChange={(e) => update("orderNo", e.target.value)}
              placeholder="Sipariş numarası"
              className="rounded-2xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-500"
            />

            <input
              value={form.customerName}
              onChange={(e) => update("customerName", e.target.value)}
              placeholder="Müşteri adı"
              className="rounded-2xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-500"
            />

            <input
              value={form.customerPhone}
              onChange={(e) => update("customerPhone", e.target.value)}
              placeholder="Müşteri telefonu"
              className="rounded-2xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-500"
            />
          </div>

          <textarea
            value={form.customerAddress}
            onChange={(e) => update("customerAddress", e.target.value)}
            placeholder="Kargo adresi"
            className="mt-3 min-h-[110px] w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-500"
          />

          {error ? (
            <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Kaydediliyor..." : "Koda bağla ve kargoya hazırla"}
            </button>

            <a
              href="/admin/ready"
              className="rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold"
            >
              Kargoya hazır listeye git
            </a>

            <a
              href="/admin"
              className="rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold"
            >
              Admin panele dön
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}