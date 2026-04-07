"use client";

import { useState } from "react";

type Item = {
  code: string;
  petName?: string;
  status?: string;
  productType?: "pet" | "item" | "key" | "person";
};

function getIcon(productType?: Item["productType"]) {
  if (productType === "pet") return "🐶";
  if (productType === "key") return "🔑";
  if (productType === "person") return "🧍";
  if (productType === "item") return "🎒";
  return "🏷️";
}

function getStatusLabel(status?: string) {
  if (status === "active") {
    return "Aktif";
  }

  if (status === "unclaimed") {
    return "Kurulum bekliyor";
  }

  return "Bilinmiyor";
}

function getStatusClass(status?: string) {
  if (status === "active") {
    return "text-green-600";
  }

  if (status === "unclaimed") {
    return "text-amber-600";
  }

  return "text-neutral-500";
}

export default function MyPage() {
  const [value, setValue] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function detectInput(input: string) {
    const trimmed = input.trim();

    if (trimmed.includes("@")) {
      return { email: trimmed.toLowerCase(), phone: "" };
    }

    return { email: "", phone: trimmed };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setItems([]);

      const { email, phone } = detectInput(value);

      if (!email && !phone) {
        throw new Error("Email veya telefon girin.");
      }

      const res = await fetch("/api/recover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          phone,
          mode: "list"
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ürünler bulunamadı.");
      }

      setItems(data.items || []);
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  async function openManage(code: string) {
    try {
      const { email, phone } = detectInput(value);

      const res = await fetch("/api/recover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code,
          email,
          phone
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Manage link oluşturulamadı.");
      }

      if (data.manageLink) {
        window.location.href = data.manageLink;
      }
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-900">
      <div className="mx-auto max-w-xl space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            Dokuntag
          </p>
          <h1 className="text-2xl font-semibold">Ürünlerim</h1>
          <p className="text-sm text-neutral-600">
            Email veya telefon ile ürünlerinize hızlıca ulaşabilirsiniz.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Email veya telefon"
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none"
          />

          <button className="w-full rounded-xl bg-black py-3 text-white">
            {loading ? "Aranıyor..." : "Ürünlerimi getir"}
          </button>
        </form>

        {error ? <div className="text-sm text-red-600">{error}</div> : null}

        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.code}
                className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getIcon(item.productType)}</div>

                  <div>
                    <p className="text-xs text-neutral-400">{item.code}</p>

                    <p className="font-medium">
                      {item.petName || "İsimsiz ürün"}
                    </p>

                    <p className={`text-xs ${getStatusClass(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openManage(item.code)}
                  className="rounded-xl bg-black px-4 py-2 text-sm text-white"
                >
                  Yönet
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}