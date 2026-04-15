import { redirect } from "next/navigation";
import { findTagByCode } from "@/lib/tags";

type PageProps = {
  params: Promise<{ code: string }>;
};

export default async function TagRedirectPage({ params }: PageProps) {
  const resolvedParams = await params;
  const code = resolvedParams.code.trim().toUpperCase();

  if (!code) {
    return <main className="p-10">Geçersiz etiket kodu.</main>;
  }

  let tag: ReturnType<typeof findTagByCode> = null;

  try {
    tag = findTagByCode(code);
  } catch (error) {
    console.error("TAG_REDIRECT_PAGE_ERROR", error);
    return <main className="p-10">Yönlendirme sırasında bir hata oluştu.</main>;
  }

  if (!tag) {
    return <main className="p-10">Etiket bulunamadı.</main>;
  }

  if (tag.status === "unclaimed") {
    redirect(`/setup/${code}`);
  }

  if (tag.status === "active") {
    redirect(`/p/${code}`);
  }

  return <main className="p-10">Bu etiket şu an aktif değil.</main>;
}