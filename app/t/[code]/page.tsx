import Link from "next/link";
import { redirect } from "next/navigation";
import { findTagByCodeAsync } from "@/lib/tags";

type PageProps = {
  params: Promise<{ code: string }>;
  searchParams?: Promise<{ from?: string }>;
};

function normalizeCode(value: string) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);
}

function InfoScreen({
  title,
  text,
  retryHref,
}: {
  title: string;
  text: string;
  retryHref: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f3ea] px-5 py-10 text-neutral-950">
      <section className="w-full max-w-md rounded-[2rem] border border-neutral-200 bg-white p-7 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-400">
          Dokuntag®
        </p>

        <h1 className="mt-4 text-2xl font-semibold">{title}</h1>

        <p className="mt-3 text-sm leading-6 text-neutral-600">{text}</p>

        <Link
          href={retryHref}
          className="mt-6 inline-flex rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white"
        >
          Kodu tekrar gir
        </Link>
      </section>
    </main>
  );
}

export default async function TagRedirectPage({
  params,
  searchParams,
}: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const retryHref = resolvedSearchParams.from === "scan" ? "/scan" : "/start";

  const code = normalizeCode(resolvedParams.code);

  if (code.length < 3 || code.length > 10) {
    return (
      <InfoScreen
        title="Geçersiz ürün kodu"
        text="Kod 3–10 karakter olmalı ve sadece harf/rakam içermelidir."
        retryHref={retryHref}
      />
    );
  }

  let tag: Awaited<ReturnType<typeof findTagByCodeAsync>> = null;

  try {
    tag = await findTagByCodeAsync(code);
  } catch (error) {
    console.error("TAG_REDIRECT_PAGE_ERROR", error);

    return (
      <InfoScreen
        title="Yönlendirme yapılamadı"
        text="Lütfen biraz sonra tekrar deneyin."
        retryHref={retryHref}
      />
    );
  }

  if (!tag) {
    return (
      <InfoScreen
        title="Ürün bulunamadı"
        text="Bu kod sistemde kayıtlı değil. Lütfen etiketteki kodu kontrol edin."
        retryHref={retryHref}
      />
    );
  }

  if (tag.status === "production_hold") {
    return (
      <InfoScreen
        title="Bu ürün henüz kullanıma açılmadı"
        text="Bu Dokuntag üretim kontrolündedir. Ürün kalite kontrolünden geçtikten sonra kurulum açılır."
        retryHref={retryHref}
      />
    );
  }

  if (tag.status === "void") {
    return (
      <InfoScreen
        title="Bu ürün kodu iptal edildi"
        text="Bu kod hatalı baskı veya üretim iptali nedeniyle kullanıma kapatılmıştır."
        retryHref={retryHref}
      />
    );
  }

  if (tag.status === "unclaimed") {
    redirect(`/setup/${code}`);
  }

  if (tag.status === "active") {
    redirect(`/p/${code}`);
  }

  return (
    <InfoScreen
      title="Bu ürün aktif değil"
      text="Ürün sahibi herkese açık profili geçici olarak kapatmış olabilir."
      retryHref={retryHref}
    />
  );
}
