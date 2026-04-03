"use client";
export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { getTagByCode, normalizeCode } from "@/lib/tags";
import { useEffect, useState } from "react";

type Tag = {
  code: string;
  status: "unclaimed" | "active";
  name?: string;
  phone?: string;
};

export default function SetupPage({
  params,
}: {
  params: { code: string };
}) {
  const router = useRouter();
  const [tag, setTag] = useState<Tag | null>(null);
  const [code, setCode] = useState("");

  useEffect(() => {
    const normalizedCode = normalizeCode(params.code);
    const foundTag = getTagByCode(normalizedCode);

    if (!foundTag) return;

    setTag(foundTag);
    setCode(normalizedCode);
  }, [params.code]);

  if (!tag) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/p/${code}`);
  };

  return (
    <main className="min-h-screen bg-white px-6 py-12 text-black">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-semibold">Etiketi ayarla</h1>

        <p className="mt-3">Kod: {code}</p>
        <p>Ürün: {tag.name}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Ad Soyad"
            className="w-full border p-3 rounded"
          />

          <input
            type="tel"
            placeholder="Telefon"
            className="w-full border p-3 rounded"
          />

          <button className="w-full bg-black text-white p-3 rounded">
            Kaydet
          </button>
        </form>
      </div>
    </main>
  );
}