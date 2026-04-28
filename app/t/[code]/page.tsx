import { redirect } from "next/navigation";
import { findTagByCodeAsync } from "@/lib/tags";

type PageProps = {
  params: Promise<{ code: string }>;
};

export default async function TagRedirectPage({ params }: PageProps) {
  const resolvedParams = await params;
  const code = resolvedParams.code.trim().toUpperCase();

  if (!code) {
    redirect("/start");
  }

  let tag: Awaited<ReturnType<typeof findTagByCodeAsync>> = null;

  try {
    tag = await findTagByCodeAsync(code);
  } catch (error) {
    console.error("TAG_REDIRECT_PAGE_ERROR", error);
    redirect(`/setup/${code}`);
  }

  if (!tag) {
    redirect(`/setup/${code}`);
  }

  if (tag.status === "unclaimed") {
    redirect(`/setup/${code}`);
  }

  if (tag.status === "active") {
    redirect(`/p/${code}`);
  }

  return <main className="p-10">Bu etiket şu an aktif değil.</main>;
}