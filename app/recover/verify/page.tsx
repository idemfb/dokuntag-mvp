import { verifyRecoverySessionTokenAsync } from "@/lib/tags";

type ProductType = "pet" | "item" | "key" | "person";
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
  return "Eşya";
}

function getStatusLabel(status: TagStatus) {
  if (status === "inactive") return "Pasif";
  if (status === "active") return "Aktif";
  return "Kurulmamış";
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
            href="/recover"
            className="rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Recover sayfasına dön
          </a>

          <a
            href="/my"
            className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
          >
            Ürünlerim sayfasına git
          </a>
        </div>
      </div>
    </section>
  );
}

export default async function RecoverVerifyPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const token = typeof resolvedSearchParams?.token === "string"
    ? resolvedSearchParams.token.trim()
    : "";

  const mainSiteUrl = getMainSiteUrl();

  if (!token) {
    return (
      <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-900">
        <div className="mx-auto max-w-5xl space-y-6">
          <EmptyState
            title="Bağlantı eksik"
            text="Doğrulama bağlantısında gerekli token bilgisi bulunamadı. Lütfen e-postanızdaki bağlantıyı yeniden açın."
          />
        </div>
      </main>
    );
  }

  const session = await verifyRecoverySessionTokenAsync(token);

  if (!session) {
    return (
      <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-900">
        <div className="mx-auto max-w-5xl space-y-6">
          <EmptyState
            title="Bağlantı geçersiz"
            text="Bu doğrulama bağlantısı bulunamadı veya artık kullanılamıyor. Yeni bir güvenli bağlantı istemeniz gerekir."
          />
        </div>
      </main>
    );
  }

  if (session.status === "expired") {
    return (
      <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-900">
        <div className="mx-auto max-w-5xl space-y-6">
          <EmptyState
            title="Bağlantının süresi doldu"
            text="Bu doğrulama bağlantısının geçerlilik süresi sona erdi. Recover veya Ürünlerim sayfasından yeni bir bağlantı isteyebilirsiniz."
          />
        </div>
      </main>
    );
  }

  if (session.status === "used") {
    return (
      <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-900">
        <div className="mx-auto max-w-5xl space-y-6">
          <EmptyState
            title="Bağlantı daha önce kullanılmış"
            text="Bu güvenli bağlantı tek kullanımlıktır. Yeniden erişmek için yeni bir doğrulama bağlantısı istemeniz gerekir."
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10 text-neutral-900">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-neutral-100/80 px-6 py-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <a
                href="/recover"
                className="text-sm text-neutral-500 transition hover:text-neutral-900 hover:underline"
              >
                ← Recover sayfasına dön
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
              Doğrulama başarılı
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
              Bu güvenli bağlantı ile erişebileceğiniz ürünler aşağıda listelenmiştir.
            </p>
          </div>

          <div className="px-6 py-6">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-800">
              Erişim doğrulandı. Aşağıdaki ürünler aynı recovery e-posta adresine bağlıdır.
            </div>

            <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm leading-6 text-neutral-700">
              E-posta: <span className="font-medium text-neutral-900">{session.email}</span>
            </div>
          </div>
        </section>

        <section className="grid gap-4">
          {session.items.map((item) => (
            <article
              key={item.code}
              className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-neutral-400">
                    Dokuntag Ürünü
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-neutral-900">
                    {item.petName || item.code}
                  </h2>

                  {item.ownerName ? (
                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                      Sahip / profil: {item.ownerName}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-700">
                    Kod: {item.code}
                  </span>

                  <span className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-700">
                    Tip: {getProductTypeLabel(item.productType)}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(
                      item.status
                    )}`}
                  >
                    {getStatusLabel(item.status)}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={`/recover/select?token=${encodeURIComponent(
                    token
                  )}&code=${encodeURIComponent(item.code)}`}
                  className="rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  Bu ürün için devam et
                </a>

                <a
                  href={`/p/${encodeURIComponent(item.code)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium transition hover:border-neutral-400 hover:bg-neutral-50"
                >
                  Public sayfayı aç
                </a>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}