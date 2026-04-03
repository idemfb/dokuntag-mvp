"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Tag = {
  code: string;
  status: "unclaimed" | "active";
  name?: string;
  phone?: string;
};

export default function ProfilePage() {
  const params = useParams();
  const codeParam = params?.code;
  const code = Array.isArray(codeParam)
    ? codeParam[0]?.toUpperCase()
    : String(codeParam || "").toUpperCase();

  const [tag, setTag] = useState<Tag | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!code) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setNotFound(false);

        const res = await fetch(`/api/tag/${code}`, {
          cache: "no-store",
        });

        if (cancelled) return;

        if (!res.ok) {
          setTag(null);
          setNotFound(true);
          setLoading(false);
          return;
        }

        const data = (await res.json()) as Tag;

        if (cancelled) return;

        setTag(data);
        setLoading(false);
      } catch {
        if (cancelled) return;
        setTag(null);
        setNotFound(true);
        setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [code]);

  const sendMessage = async () => {
    if (!message.trim() || !tag) return;

    await fetch("/api/notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: tag.code,
        message,
      }),
    });

    alert("Mesaj gönderildi");
    setMessage("");
  };

  if (!code) {
    return <main className="p-10">Kod bulunamadı.</main>;
  }

  if (loading) {
    return <main className="p-10">Yükleniyor...</main>;
  }

  if (notFound || !tag) {
    return <main className="p-10">Etiket bulunamadı.</main>;
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

        <div className="mt-8 border-t pt-6">
          <h2 className="text-lg font-semibold">Sahibine mesaj gönder</h2>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-3 w-full rounded border p-3"
            placeholder="Ürünü buldum, bana ulaşabilirsiniz..."
          />

          <button
            onClick={sendMessage}
            className="mt-3 w-full rounded bg-black p-3 text-white"
          >
            Gönder
          </button>
        </div>
      </div>
    </main>
  );
}