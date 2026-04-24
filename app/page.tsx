import Link from "next/link";

const steps = [
  {
    title: "Etiketi tak",
    text: "Dokuntag etiketini anahtara, çantaya, evcil hayvan tasmasına veya ürüne tak.",
  },
  {
    title: "Biri bulursa okutur",
    text: "Bulan kişi NFC ya da QR kodu okutarak güvenli profil sayfasına ulaşır.",
  },
  {
    title: "Sana ulaşır",
    text: "Senin izin verdiğin bilgilerle sana hızlıca ulaşabilir.",
  },
];

const uses = ["Evcil hayvan", "Anahtar", "Çanta", "Çocuk", "Valiz", "Cüzdan"];

const trustItems = [
  "Adres paylaşmak zorunda değilsin",
  "Hangi bilgi görünsün sen seçersin",
  "Bulan kişi uygulama indirmez",
  "NFC ve QR birlikte çalışır",
];

const socials = [
  {
    name: "Instagram",
    href: "https://instagram.com/dokuntag",
  },
  {
    name: "TikTok",
    href: "https://tiktok.com/@dokuntag",
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@dokuntag",
  },
  {
    name: "X",
    href: "https://x.com/dokuntag",
  },
  {
    name: "Facebook",
    href: "https://facebook.com/dokuntag",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/dokuntag",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#171717]">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-[#f7f5ef]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Dokuntag
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-neutral-600 sm:flex">
            <a href="#nasil-calisir" className="hover:text-neutral-950">
              Nasıl çalışır
            </a>
            <a href="#demo" className="hover:text-neutral-950">
              Demo
            </a>
            <a href="#iletisim" className="hover:text-neutral-950">
              İletişim
            </a>
            <Link href="/my" className="hover:text-neutral-950">
              Ürünlerim
            </Link>
          </nav>

          <Link
            href="/setup"
            className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Kurulum
          </Link>
        </div>
      </header>

      <section className="mx-auto flex min-h-[86vh] max-w-6xl flex-col justify-center px-5 py-20 text-center sm:px-8">
        <p className="mb-5 text-sm font-medium tracking-[0.24em] text-neutral-500 uppercase">
          NFC / QR kayıp buluşturma sistemi
        </p>

        <h1 className="mx-auto max-w-5xl text-5xl font-semibold tracking-tight text-neutral-950 sm:text-6xl md:text-7xl">
          Kaybolanı sahibine ulaştırmanın en kolay yolu
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-600 sm:text-xl">
          Dokuntag ile bulan kişi size anında ulaşır. Uygulama indirmeden,
          karmaşa yaşamadan, güvenli şekilde.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#nasil-calisir"
            className="w-full rounded-full bg-neutral-950 px-7 py-4 text-center text-sm font-semibold text-white transition hover:bg-neutral-800 sm:w-auto"
          >
            Nasıl çalışır
          </a>

          <Link
            href="/p/DEMO01"
            className="w-full rounded-full border border-neutral-300 bg-white/70 px-7 py-4 text-center text-sm font-semibold text-neutral-950 transition hover:bg-white sm:w-auto"
          >
            Demo profil gör
          </Link>
        </div>
      </section>

      <section id="nasil-calisir" className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Nasıl çalışır?
            </h2>
            <p className="mt-3 text-neutral-600">
              3 basit adımda kaybolanı sahibine yaklaştırır.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-[2rem] border border-neutral-200 bg-white/75 p-7 shadow-sm"
              >
                <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-full bg-neutral-950 text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  {step.text}
                </p>
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

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
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

      <section id="demo" className="px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_0.85fr]">
          <div className="rounded-[2.5rem] bg-neutral-950 p-8 text-white sm:p-14">
            <p className="mb-4 text-sm font-medium tracking-[0.2em] text-neutral-400 uppercase">
              Demo profil
            </p>

            <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              Bulan kişinin gördüğü sayfayı incele.
            </h2>

            <p className="mt-5 max-w-xl text-neutral-300">
              Demo profil sayfasında Dokuntag’ın nasıl çalıştığını görebilirsin.
              Hangi bilgiler görünür, hangi iletişim yolları açılır, hepsi senin
              kontrolündedir.
            </p>

            <Link
              href="/p/DEMO01"
              className="mt-8 inline-flex rounded-full bg-white px-7 py-4 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-100"
            >
              Demo profili aç
            </Link>
          </div>

          <div className="rounded-[2.5rem] border border-neutral-200 bg-white/75 p-8 shadow-sm sm:p-10">
            <p className="text-sm font-semibold tracking-[0.18em] text-neutral-500 uppercase">
              Örnek akış
            </p>

            <div className="mt-8 space-y-4">
              <div className="rounded-3xl bg-neutral-50 p-5">
                <p className="text-sm text-neutral-500">1</p>
                <h3 className="mt-1 font-semibold">Kodu okutur</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  NFC’ye dokunur veya QR kodu kamerayla okutur.
                </p>
              </div>

              <div className="rounded-3xl bg-neutral-50 p-5">
                <p className="text-sm text-neutral-500">2</p>
                <h3 className="mt-1 font-semibold">Profil açılır</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  Ürün, evcil hayvan veya kişi için hazırlanan güvenli sayfa
                  görünür.
                </p>
              </div>

              <div className="rounded-3xl bg-neutral-50 p-5">
                <p className="text-sm text-neutral-500">3</p>
                <h3 className="mt-1 font-semibold">İletişim başlar</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  Telefon, WhatsApp, e-posta veya mesaj tercihlerine göre sana
                  ulaşabilir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Güven sende kalır
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trustItems.map((item) => (
              <div
                key={item}
                className="rounded-[2rem] border border-neutral-200 bg-white/75 p-7 text-center shadow-sm"
              >
                <h3 className="text-lg font-semibold">{item}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="iletisim" className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl rounded-[2.5rem] border border-neutral-200 bg-white/75 p-8 shadow-sm sm:p-14">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="mb-4 text-sm font-medium tracking-[0.2em] text-neutral-500 uppercase">
                İletişim
              </p>

              <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                Dokuntag ile iletişime geç
              </h2>

              <p className="mt-5 text-neutral-600">
                Ürün, kurulum, iş birliği veya destek için bize ulaşabilirsin.
              </p>

              <div className="mt-8 space-y-3 text-sm text-neutral-700">
                <p>
                  E-posta:{" "}
                  <a
                    href="mailto:info@dokuntag.com"
                    className="font-semibold text-neutral-950 hover:underline"
                  >
                    info@dokuntag.com
                  </a>
                </p>

                <p>
                  Web:{" "}
                  <a
                    href="https://dokuntag.com"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-neutral-950 hover:underline"
                  >
                    dokuntag.com
                  </a>
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold">Sosyal medya</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                Tüm sosyal medya hesaplarında kullanıcı adımız:
                <span className="font-semibold text-neutral-950">
                  {" "}
                  dokuntag
                </span>
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {socials.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-neutral-200 bg-white px-4 py-4 text-center text-sm font-semibold text-neutral-900 transition hover:border-neutral-400 hover:bg-neutral-50"
                  >
                    {social.name}
                  </a>
                ))}
              </div>
            </div>
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

      <footer className="border-t border-neutral-200 px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© Dokuntag</p>

          <div className="flex flex-wrap gap-4">
            <a href="#nasil-calisir" className="hover:text-neutral-950">
              Nasıl çalışır
            </a>
            <a href="#demo" className="hover:text-neutral-950">
              Demo
            </a>
            <a href="#iletisim" className="hover:text-neutral-950">
              İletişim
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}