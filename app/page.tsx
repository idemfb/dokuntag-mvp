import Link from "next/link";

const steps = [
  "Etiketi tak",
  "Biri bulursa okutur",
  "Sana ulaşır",
];

const uses = ["Evcil hayvan", "Anahtar", "Çanta", "Çocuk"];

const trustItems = [
  "Adres paylaşılmaz",
  "Kontrol sende",
  "Anonim iletişim",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#171717]">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-6 sm:px-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Dokuntag
          </Link>

          <nav className="flex items-center gap-4 text-sm text-neutral-600">
            <Link href="/my" className="hover:text-neutral-950">
              Ürünlerim
            </Link>
            <Link href="/setup" className="hover:text-neutral-950">
              Kurulum
            </Link>
          </nav>
        </header>

        <div className="flex flex-1 flex-col justify-center py-20">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-5 text-sm font-medium tracking-[0.24em] text-neutral-500 uppercase">
              NFC / QR kayıp buluşturma sistemi
            </p>

            <h1 className="text-5xl font-semibold tracking-tight text-neutral-950 sm:text-6xl md:text-7xl">
              Kaybolanı sahibine ulaştırmanın en kolay yolu
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-600 sm:text-xl">
              Dokuntag ile bulan kişi size anında ulaşır.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#nasil-calisir"
                className="w-full rounded-full bg-neutral-950 px-7 py-4 text-center text-sm font-semibold text-white transition hover:bg-neutral-800 sm:w-auto"
              >
                Nasıl çalışır
              </a>

              <Link
                href="/p/TEST01"
                className="w-full rounded-full border border-neutral-300 bg-white/70 px-7 py-4 text-center text-sm font-semibold text-neutral-950 transition hover:bg-white sm:w-auto"
              >
                Demo gör
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="nasil-calisir" className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Nasıl çalışır?
            </h2>
            <p className="mt-3 text-neutral-600">
              Karmaşık uygulama yok. Sadece okutulur ve iletişim başlar.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step}
                className="rounded-[2rem] border border-neutral-200 bg-white/75 p-7 shadow-sm"
              >
                <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-full bg-neutral-950 text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold">{step}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Nerede kullanılır?
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {uses.map((item) => (
              <div
                key={item}
                className="rounded-[1.75rem] border border-neutral-200 bg-white/75 p-6 text-center text-lg font-semibold shadow-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-4xl rounded-[2.5rem] bg-neutral-950 p-8 text-center text-white sm:p-14">
          <p className="mb-4 text-sm font-medium tracking-[0.2em] text-neutral-400 uppercase">
            Demo
          </p>

          <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            Bir Dokuntag profili nasıl görünür?
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-neutral-300">
            Örnek public profil sayfasını inceleyin.
          </p>

          <Link
            href="/p/TEST01"
            className="mt-8 inline-flex rounded-full bg-white px-7 py-4 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-100"
          >
            Demo profili aç
          </Link>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Güven sende kalır
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {trustItems.map((item) => (
              <div
                key={item}
                className="rounded-[2rem] border border-neutral-200 bg-white/75 p-7 text-center shadow-sm"
              >
                <h3 className="text-xl font-semibold">{item}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Kaybolmadan önce hazır olsun.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-neutral-600">
            Dokuntag, ürününüzü bulan kişiyle sizi hızlı ve güvenli şekilde
            buluşturur.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/setup"
              className="w-full rounded-full bg-neutral-950 px-8 py-4 text-center text-sm font-semibold text-white transition hover:bg-neutral-800 sm:w-auto"
            >
              Hemen edin
            </Link>

            <Link
              href="/my"
              className="w-full rounded-full border border-neutral-300 bg-white/70 px-8 py-4 text-center text-sm font-semibold text-neutral-950 transition hover:bg-white sm:w-auto"
            >
              Ürünlerim
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}