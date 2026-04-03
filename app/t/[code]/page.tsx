import { notFound, redirect } from "next/navigation";
import { getTagByCode, normalizeCode } from "@/lib/tags";

type Props = {
  params: Promise<{
    code: string;
  }>;
};

export default async function TagRoute({ params }: Props) {
  const { code } = await params;

  if (!code) {
    notFound();
  }

  const normalizedCode = normalizeCode(code);
  const tag = await getTagByCode(normalizedCode);

  if (!tag) {
    notFound();
  }

  if (tag.status === "unclaimed") {
    redirect(`/setup/${normalizedCode}`);
  }

  if (tag.status === "active") {
    redirect(`/p/${normalizedCode}`);
  }

  notFound();
}