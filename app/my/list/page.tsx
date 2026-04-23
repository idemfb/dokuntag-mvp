import { verifyRecoverySessionTokenAsync } from "@/lib/tags";

type ProductType = "pet" | "item" | "key" | "person" | "other";
type TagStatus = "unclaimed" | "active" | "inactive";

function getMainSiteUrl() {
  const value =
    process.env.NEXT_PUBLIC_MAIN_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://dokuntag.com";

  return value.replace(/\/+$/, "");
}

function getProductTypeLabel(productType: ProductType) {
  if (productType === "pet") return "Evcil hayvan";
  if (productType === "key") return "Anahtar";
  if (productType === "person") return "Birey";
  if (productType === "other") return "Diğer";
  return "Eşya";
}

function getStatusLabel(status: TagStatus) {
  if (status === "inactive") return "Kapalı";
  if (status === "active") return "Aktif";
  return "Kurulum gerekli";
}

function getStatusBadgeClass(status: TagStatus) {
  if (status === "inactive") {
    return "border border-amber-200 bg-amber-50 text-amber-800";
  }

  if (status === "active") {
    return "border border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border border-neutral-300 bg-neutral-100 text-neutral-700";
}

function getRemainingTimeText(expiresAt: string) {
  const expires = new Date(expiresAt).getTime();
  const now = Date.now();
  const diff = Math.max(0, expires - now);

  const totalMinutes = Math.ceil(diff / (1000 * 60));

  if (totalMinutes <= 0) return "SÃ¼re doldu";
  if (totalMinutes < 60) return `${totalMinutes} dakika kaldÄ±`;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) return `${hours} saat kaldÄ±`;
  return `${hours} saat ${minutes} dakika kaldÄ±`;
}

function EmptyState({
  title,
  text
}: {
  title: string;
  text: string;
}) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
      <div className="px-6 py-8">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
          Dokuntag
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
          {text}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="/my"
            className="rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            ÃœrÃ¼nlerim giriÅŸine dÃ¶n
          </a>

          <a
            href="/"
            className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
          >
            Ana sayfaya git
          </a>
        </div>
      </div>
    </section>
  );
}

export default async function MyListPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const token =
    typeof resolvedSearchParams?.token === "string"
      ? resolvedSearchParams.token.trim()
      : "";

  const mainSiteUrl = getMainSiteUrl();

  if (!token) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#fbfbfa_0%,#fdfdfc_55%,#ffffff_100%)] px-4 py-10 text-neutral-900">
        <div className="mx-auto max-w-3xl space-y-6">
          <EmptyState
            title="BaÄŸlantÄ± eksik"
            text="GÃ¼venli giriÅŸ baÄŸlantÄ±sÄ±nda gerekli bilgi bulunamadÄ±. E-postanÄ±zdaki baÄŸlantÄ±yÄ± yeniden aÃ§Ä±n."
          />
        </div>
      </main>
    );
  }

  const session = await verifyRecoverySessionTokenAsync(token);

  if (!session) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#fbfbfa_0%,#fdfdfc_55%,#ffffff_100%)] px-4 py-10 text-neutral-900">
        <div className="mx-auto max-w-3xl space-y-6">
          <EmptyState
            title="BaÄŸlantÄ± geÃ§ersiz"
            text="Bu baÄŸlantÄ± bulunamadÄ± veya artÄ±k kullanÄ±lamÄ±yor. Yeni bir gÃ¼venli giriÅŸ baÄŸlantÄ±sÄ± istemeniz gerekir."
          />
        </div>
      </main>
    );
  }

  if (session.status === "expired") {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#fbfbfa_0%,#fdfdfc_55%,#ffffff_100%)] px-4 py-10 text-neutral-900">
        <div className="mx-auto max-w-3xl space-y-6">
          <EmptyState
            title="BaÄŸlantÄ±nÄ±n sÃ¼resi doldu"
            text="Bu baÄŸlantÄ±nÄ±n sÃ¼resi dolmuÅŸ. ÃœrÃ¼nlerim sayfasÄ±ndan yeni bir giriÅŸ baÄŸlantÄ±sÄ± isteyebilirsiniz."
          />
        </div>
      </main>
    );
  }

  if (session.status === "used") {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#fbfbfa_0%,#fdfdfc_55%,#ffffff_100%)] px-4 py-10 text-neutral-900">
        <div className="mx-auto max-w-3xl space-y-6">
          <EmptyState
            title="BaÄŸlantÄ± artÄ±k kullanÄ±lamÄ±yor"
            text="Bu baÄŸlantÄ± artÄ±k geÃ§erli deÄŸil. ÃœrÃ¼nlerim sayfasÄ±ndan yeni bir gÃ¼venli giriÅŸ baÄŸlantÄ±sÄ± isteyebilirsiniz."
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fbfbfa_0%,#fdfdfc_55%,#ffffff_100%)] px-4 py-10 text-neutral-900">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-neutral-100/80 px-6 py-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <a
                href="/my"
                className="text-sm text-neutral-500 transition hover:text-neutral-900 hover:underline"
              >
                â† ÃœrÃ¼nlerim giriÅŸine dÃ¶n
              </a>

              <a
                href={mainSiteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-neutral-500 transition hover:text-neutral-900 hover:underline"
              >
                Dokuntag ana sayfa
              </a>
            </div>

            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-neutral-400">
              Dokuntag
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              ÃœrÃ¼nlerim
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
              Bu gÃ¼venli baÄŸlantÄ± ile eriÅŸebileceÄŸiniz Ã¼rÃ¼nler aÅŸaÄŸÄ±da listelenmiÅŸtir.
            </p>
          </div>

          <div className="px-6 py-6">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-800">
              EriÅŸim doÄŸrulandÄ±. AÅŸaÄŸÄ±daki Ã¼rÃ¼nler aynÄ± e-posta adresine baÄŸlÄ±dÄ±r.
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm leading-6 text-neutral-700">
                E-posta:{" "}
                <span className="font-medium text-neutral-900">{session.email}</span>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4 text-sm leading-6 text-blue-900">
                <div>Bu giriÅŸ baÄŸlantÄ±sÄ± sÄ±nÄ±rlÄ± sÃ¼reyle kullanÄ±labilir.</div>
                <div className="mt-1 font-medium">
                  Kalan sÃ¼re: {getRemainingTimeText(session.expiresAt)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl grid grid-cols-2 gap-3 xl:grid-cols-3">
          {session.items.map((item) => (
            <article
              key={item.code}
              className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="min-w-0 truncate text-sm font-semibold text-neutral-900">
                  {item.petName || item.code}
                </h2>

                <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.12em] text-neutral-400">
                  {getProductTypeLabel(item.productType)}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="truncate text-[11px] text-neutral-500">
                  {item.code}
                </span>

                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusBadgeClass(
                    item.status
                  )}`}
                >
                  {getStatusLabel(item.status)}
                </span>
              </div>

              <div className="mt-3">
                <a
                  href={`/recover/select?token=${encodeURIComponent(
                    token
                  )}&code=${encodeURIComponent(item.code)}`}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-neutral-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-neutral-800"
                >
                  YÃ¶net
                </a>
              </div>
            </article>
          ))}
        </section>

        <div className="mx-auto max-w-4xl rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-800">
          Bu baÄŸlantÄ± sÃ¼re dolana kadar baÄŸlÄ± Ã¼rÃ¼nleriniz arasÄ±nda geÃ§iÅŸ yapabilir.
          SÃ¼re dolduÄŸunda ÃœrÃ¼nlerim sayfasÄ±ndan yeni giriÅŸ baÄŸlantÄ±sÄ± isteyebilirsiniz.
        </div>
      </div>
    </main>
  );
}

