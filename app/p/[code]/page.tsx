"use client";

import { useEffect, useState } from "react";

type Tag = {
  code: string;
  status: "unclaimed" | "active";
  name?: string;
  phone?: string;
};

export default function ProfilePage({
  params,
}: {
  params: { code: string };
}) {
  const [tag, setTag] = useState<Tag | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const code = params.code.toUpperCase();

      const res = await fetch(`/api/tag/${code}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        setTag(null);
        return;
      }

      const data = (await res.json()) as Tag;
      setTag(data);
    }

    load();
  }, [params.code]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    await fetch("/api/notify", {
      method: "POST",
      body: JSON.stringify({
        code: params.code,
        message,
      }),
    });

    alert("Mesaj gönderildi");
    setMessage("");
  };

  if (!tag) {
    return <main className="p-10">Yükleniyor...</main>;
  }

  return (
    <main className="min-h-screen bg-white px-6 py-12 text-black">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-semibold">Dokuntag</h1>

        <p className="mt-4 text-lg">
          Bu ürün <strong>{tag.name}</strong> adlı kişiye aittir.
        </p>

        {tag.phone && (
          <p className="mt-2 text-neutral-700">
            📞 Telefon: <strong>{tag.phone}</strong>
          </p>
        )}

        {/* 🔥 MESAJ FORMU */}
        <div className="mt-8 border-t pt-6">
          <h2 className="text-lg font-semibold">
            Sahibine mesaj gönder
          </h2>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full mt-3 border rounded p-3"
            placeholder="Ürünü buldum, bana ulaşabilirsiniz..."
          />

          <button
            onClick={sendMessage}
            className="mt-3 w-full bg-black text-white p-3 rounded"
          >
            Gönder
          </button>
        </div>
      </div>
    </main>
  );
}