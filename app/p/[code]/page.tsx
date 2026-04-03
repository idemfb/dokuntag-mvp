import { notFound } from "next/navigation";
import { tags } from "@/data/tags";

type Props = {
  params: Promise<{
    code: string;
  }>;
};

export default async function ProfilePage({ params }: Props) {
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
          Dokuntag Profile
        </p>

        <h1 className="text-3xl font-semibold">Kayıp ürün sahibine ulaşın</h1>

        <div className="mt-8 rounded-2xl border border-neutral-200 p-6">
          <div className="space-y-3 text-neutral-700">
            <p>
              <span className="font-medium text-black">Kod:</span>{" "}
              {normalizedCode}
            </p>
            <p>
              <span className="font-medium text-black">Durum:</span>{" "}
              {tag.status}
            </p>
            <p>
              <span className="font-medium text-black">Ad:</span> {tag.name}
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a
              href="tel:+905555555555"
              className="rounded-xl border border-black px-4 py-3 text-center font-medium"
            >
              Telefon Et
            </a>

            <a
              href="https://wa.me/905555555555"
              className="rounded-xl bg-black px-4 py-3 text-center font-medium text-white"
            >
              WhatsApp ile Yaz
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}