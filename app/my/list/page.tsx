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

function getProductTheme(productType: ProductType) {
  if (productType === "pet") {
    return {
      card: "border-emerald-200 bg-[linear-gradient(180deg,#f4fbf7_0%,#ffffff_100%)]",
      badge: "border-emerald-200 bg-emerald-50 text-emerald-700"
    };
  }

  if (productType === "key") {
    return {
      card: "border-amber-200 bg-[linear-gradient(180deg,#fffaf1_0%,#ffffff_100%)]",
      badge: "border-amber-200 bg-amber-50 text-amber-700"
    };
  }

  if (productType === "person") {
    return {
      card: "border-blue-200 bg-[linear-gradient(180deg,#f5f9ff_0%,#ffffff_100%)]",
      badge: "border-blue-200 bg-blue-50 text-blue-700"
    };
  }

  if (productType === "other") {
    return {
      card: "border-violet-200 bg-[linear-gradient(180deg,#faf7ff_0%,#ffffff_100%)]",
      badge: "border-violet-200 bg-violet-50 text-violet-700"
    };
  }

  return {
    card: "border-neutral-200 bg-white",
    badge: "border-neutral-200 bg-neutral-50 text-neutral-700"
  };
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

  if (totalMinutes <= 0) return "Süre doldu";
  if (totalMinutes < 60) return `${totalMinutes} dakika kaldı`;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) return `${hours} saat kaldı`;
  return `${hours} saat ${minutes} dakika kaldı`;
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
            Ürünlerim girişine dön
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
            title="Bağlantı eksik"
            text="Güvenli giriş bağlantısında gerekli bilgi bulunamadı. E-postanızdaki bağlantıyı yeniden açın."
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
            title="Bağlantı geçersiz"
            text="Bu bağlantı bulunamadı veya artık kullanılamıyor. Yeni bir güvenli giriş bağlantısı istemeniz gerekir."
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
            title="Bağlantının süresi doldu"
            text="Bu bağlantının süresi dolmuş. Ürünlerim sayfasından yeni bir giriş bağlantısı isteyebilirsiniz."
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
            title="Bağlantı artık kullanılamıyor"
            text="Bu bağlantı artık geçerli değil. Ürünlerim sayfasından yeni bir güvenli giriş bağlantısı isteyebilirsiniz."
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
                ← Ürünlerim girişine dön
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
              Ürünlerim
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
              Erişim doğrulandı. Bu güvenli bağlantı ile aynı e-posta adresine bağlı ürünlerinizi sınırlı süre boyunca görüntüleyebilirsiniz.
            </p>
          </div>

          <div className="px-6 py-5">
            <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 px-4 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-700">
                  E-posta
                </span>

                <span className="min-w-0 truncate rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-900">
                  {session.email}
                </span>

                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-900">
                  Kalan süre: {getRemainingTimeText(session.expiresAt)}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-neutral-600">
                Bağlantı süresi dolana kadar aşağıdaki ürünler arasında güvenli şekilde geçiş yapabilirsiniz.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-4xl grid-cols-2 gap-3 xl:grid-cols-3">
          {session.items.map((item) => {
            const theme = getProductTheme(item.productType);

            return (
              <article
                key={item.code}
                className={`rounded-xl border p-3.5 shadow-sm ${theme.card}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="min-w-0 truncate text-[13px] font-semibold text-neutral-900">
                    {item.petName || item.code}
                  </h2>

                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] tracking-wide font-medium ${theme.badge}`}
                  >
                    {getProductTypeLabel(item.productType)}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="truncate text-[11px] text-neutral-600">
                    {item.code}
                  </span>

                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] tracking-wide font-medium ${getStatusBadgeClass(
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
                    className="inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-3 py-2.5 text-xs font-medium text-white transition hover:bg-neutral-800"
                  >
                    Yönet
                  </a>
                </div>
              </article>
            );
          })}
        </section>

        <div className="mx-auto max-w-4xl rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-800">
          Güvenli bağlantı süresi dolduğunda Ürünlerim sayfasından yeni bir giriş bağlantısı isteyebilirsiniz.
        </div>
      </div>
    </main>
  );
}
