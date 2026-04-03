"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Tag = {
  code: string;
  status: "unclaimed" | "active";
  name?: string;
  phone?: string;
};

export default function SetupPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [tag, setTag] = useState<Tag | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const resolved = await params;
      const currentCode = resolved.code.toUpperCase();
      setCode(currentCode);

      const res = await fetch(`/api/tag/${currentCode}`, {
        cache: "no-store",
      });

      if (!mounted) return;

      if (!res.ok) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const data = (await res.json()) as Tag;
      setTag(data);
      setLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, [params]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/p/${code}`);
  };

  if (loading) {
    return <main className="p-10">Yükleniyor...</main>;
  }

  if (notFound || !tag) {
    return <main className="p-10">Etiket bulunamadı.</main>;
  }

  return (
    <main className="min-h-screen bg-white px-6 py-12 text-black">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-semibold">Etiketi ayarla</h1>

        <p className="mt-3">Kod: {tag.code}</p>
        <p className="mt-2">Ürün: {tag.name}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Ad Soyad"
            className="w-full rounded border p-3"
          />

          <input
            type="tel"
            placeholder="Telefon"
            className="w-full rounded border p-3"
          />

          <button className="w-full rounded bg-black p-3 text-white">
            Kaydet
          </button>
        </form>
      </div>
    </main>
  );
}