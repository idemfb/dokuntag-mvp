import { notFound } from "next/navigation";
import { tags } from "@/data/tags";

type Props = {
  params: Promise<{
    code: string;
  }>;
};

export default async function SetupPage({ params }: Props) {
  const { code } = await params;

  if (!code) {
    notFound();
  }

  const normalizedCode = code.toUpperCase();
  const tag = tags.find((item) => item.code === normalizedCode);

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

        <form className="mt-8 space-y-4 rounded-2xl border border-neutral-200 p-6">
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