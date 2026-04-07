"use client";

import { useState } from "react";

type RecoverResponse = {
  success: boolean;
  code: string;
  manageLink: string;
};

export default function RecoverPage() {
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [finding, setFinding] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState<RecoverResponse | null>(null);
  const [foundItems, setFoundItems] = useState<{ code: string }[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccessData(null);

      const res = await fetch("/api/recover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code, phone, email })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function findMyProducts() {
    try {
      setFinding(true);
      setError("");
      setFoundItems([]);

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
      if (!res.ok) throw new Error(data.error);

      setFoundItems(data.items || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFinding(false);
    }
  }

  async function generateManage(code: string) {
    try {
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
      if (!res.ok) throw new Error(data.error);

      setSuccessData(data);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="mx-auto max-w-xl space-y-6">

        {/* HEADER */}
        <div className="space-y-2">
          <a href="/my" className="text-sm text-neutral-500 hover:underline">
            ← Ürünlerime git
          </a>

          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            Dokuntag
          </p>

          <h1 className="text-2xl font-semibold">
            Manage link kurtarma
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 p-3 text-sm text-red-700 rounded">
            {error}
          </div>
        )}

        {/* TEK ÜRÜN SONUÇ */}
        {successData && (
          <div className="border p-4 rounded space-y-2 bg-white">
            <p className="text-sm font-medium">Manage link</p>
            <p className="break-all text-sm">{successData.manageLink}</p>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Kod (DT001)"
            className="w-full border p-3 rounded"
          />

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Telefon"
            className="w-full border p-3 rounded"
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full border p-3 rounded"
          />

          <button className="w-full bg-black text-white p-3 rounded">
            {loading ? "Kontrol ediliyor..." : "Tek ürün kurtar"}
          </button>
        </form>

        {/* MULTI */}
        <div className="space-y-3">
          <button
            onClick={findMyProducts}
            className="w-full border p-3 rounded"
          >
            {finding ? "Aranıyor..." : "Tüm ürünlerimi bul"}
          </button>

          {foundItems.length > 0 && (
            <div className="space-y-3">
              {foundItems.map((item) => (
                <div
                  key={item.code}
                  className="flex justify-between items-center border p-3 rounded bg-white"
                >
                  <span>{item.code}</span>

                  <button
                    onClick={() => generateManage(item.code)}
                    className="bg-black text-white px-3 py-1 rounded text-sm"
                  >
                    Yönet
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}