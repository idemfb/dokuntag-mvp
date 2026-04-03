export const dynamic = "force-dynamic";
export const revalidate = 0;

import { notFound, redirect } from "next/navigation";
import { getTagByCode, normalizeCode, updateTag } from "@/lib/tags";

type Props = {
  params: Promise<{
    code: string;
  }>;
};

async function submitForm(formData: FormData) {
  'use server';

  const code = formData.get('code') as string;
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const petName = formData.get('petName') as string;
  const note = formData.get('note') as string;

  const normalizedCode = normalizeCode(code);
  const existingTag = await getTagByCode(normalizedCode);

  if (!existingTag) {
    throw new Error('Tag not found');
  }

  await updateTag(normalizedCode, {
    status: 'active',
    name: name || existingTag.name,
    phone,
    petName,
    note,
  });

  redirect(`/p/${normalizedCode}`);
}

export default async function SetupPage({ params }: Props) {
  const { code } = await params;

  if (!code) {
    notFound();
  }

  const normalizedCode = normalizeCode(code);
  const tag = await getTagByCode(normalizedCode);

  if (!tag) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white px-6 py-12 text-black">
      <div className="mx-auto max-w-xl">
        <p className="mb-3 text-sm tracking-[0.2em] text-neutral-500 uppercase">
          Dokuntag Setup
        </p>

        <h1 className="text-3xl font-semibold">Etiketi kendin için ayarla</h1>

        <p className="mt-3 text-neutral-600">
          Ürün kodu: <span className="font-medium">{normalizedCode}</span>
        </p>

        <p className="mt-2 text-neutral-600">
          Ürün adı: <span className="font-medium">{tag.name}</span>
        </p>

        <form action={submitForm} className="mt-8 space-y-4 rounded-2xl border border-neutral-200 p-6">
          <input type="hidden" name="code" value={normalizedCode} />
          <div>
            <label className="mb-2 block text-sm font-medium">Ad Soyad</label>
            <input
              name="name"
              type="text"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none"
              placeholder="Adınızı girin"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Telefon</label>
            <input
              name="phone"
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
              name="petName"
              type="text"
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none"
              placeholder="Örn. Leo"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Not</label>
            <textarea
              name="note"
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