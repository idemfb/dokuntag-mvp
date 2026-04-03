"use client";

import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { getTagByCode, normalizeCode } from "@/lib/tags";
import { useEffect, useState } from "react";

type Tag = {
  code: string;
  status: "unclaimed" | "active";
  name?: string;
  phone?: string;
};

export default function SetupPage({ params }: { params: { code: string } }) {
  const router = useRouter();

  const [tag, setTag] = useState<Tag | null>(null);
  const [code, setCode] = useState("");

  useEffect(() => {
    const normalizedCode = normalizeCode(params.code);
    const foundTag = getTagByCode(normalizedCode);

    if (!foundTag) {
      notFound();
      return;
    }

    setTag(foundTag);
    setCode(normalizedCode);
  }, [params.code]);

  if (!tag) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 🔥 MVP: direkt profile yönlendir
    router.push(`/p/${code}`);
  };

  return (
    <main className="min-h-screen bg-white px-6 py-12 text-black">
      <div className="mx-auto max-w-xl">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-neutral-500">
          Dokuntag Setup
        </p>

        <h1 className="text-3xl font-semibold">Etiketi kendin için ayarla</h1>

        <p className="mt-3 text-neutral-600">
          Ürün kodu: <span className="font-medium">{code}</span>
        </p>

        <p className="mt-2 text-neutral-600">
          Ürün adı: <span className="font-medium">{tag.name}</span>
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4 rounded-2xl border border-neutral-200 p-6"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">Ad Soyad</label>
            <input
              type="text"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none"
              placeholder="Adınızı girin"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Telefon</label>
            <input
              type="tel"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none"
              placeholder="Telefon numaranızı girin"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Evcil Hayvan Adı
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none"
              placeholder="Örn. Leo"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Not</label>
            <textarea
              className="min-h-[120px] w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none"
              placeholder="Ek bilgi yazın"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-black px-4 py-3 text-white"
          >
            Kaydet
          </button>
        </form>
      </div>
    </main>
  );
}