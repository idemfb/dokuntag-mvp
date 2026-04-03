import { redirect } from "next/navigation";

export default async function TPage({
  params,
}: {
  params: { code: string };
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/tag/${params.code}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return <div>Tag not found</div>;
  }

  const tag = await res.json();

  if (tag.status === "unclaimed") {
    redirect(`/setup/${params.code}`);
  }

  redirect(`/p/${params.code}`);
}