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
        <h1 className="text-3xl font-semibold">Dokuntag</h1>

        <p className="mt-4 text-lg">
          Bu ürün <strong>{tag.name}</strong> adlı kişiye aittir.
        </p>

        {tag.phone && (
          <p className="mt-2 text-neutral-700">
            📞 Telefon: <strong>{tag.phone}</strong>
          </p>
        )}

        <NotifyForm code={normalizedCode} />
      </div>
    </main>
  );
}