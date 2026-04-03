import { notFound } from "next/navigation";
import tags from "@/data/tags.json";
import NotifyForm from "@/components/NotifyForm";

type Tag = {
  code: string;
  status: "unclaimed" | "active";
  name?: string;
  phone?: string;
};

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const normalizedCode = code.toUpperCase();

  const tag = (tags as Tag[]).find((t) => t.code === normalizedCode);

  if (!tag) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white px-6 py-12 text-black">
      <div className="mx-auto max-w-xl">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-neutral-500">
          Dokuntag Profile
        </p>

        <h1 className="text-3xl font-semibold">Kayıp ürün sahibine ulaşın</h1>

        <div className="mt-6 space-y-2 rounded-2xl border border-neutral-200 p-6">
          <p>
            <span className="font-medium">Kod:</span> {tag.code}
          </p>
          <p>
            <span className="font-medium">Durum:</span> {tag.status}
          </p>
          <p>
            <span className="font-medium">Ad:</span> {tag.name}
          </p>
          {tag.phone && (
            <p>
              <span className="font-medium">Telefon:</span> {tag.phone}
            </p>
          )}
        </div>

        <NotifyForm code={normalizedCode} />
      </div>
    </main>
  );
}