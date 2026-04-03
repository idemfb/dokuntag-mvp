import { notFound, redirect } from "next/navigation";
import { tags } from "@/data/tags";

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

  const normalizedCode = code.toUpperCase();
  const tag = tags.find((item) => item.code === normalizedCode);

  if (!tag) {
    notFound();
  }

  if (tag.status === "unclaimed") {
    redirect(`/setup/${normalizedCode}`);
  }

  redirect(`/p/${normalizedCode}`);
}