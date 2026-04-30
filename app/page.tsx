import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ScrollToTopButton from "./components/ScrollToTopButton";

export const metadata: Metadata = {
  title: "Dokuntag® | NFC ve QR ile kaybolanı sahibine ulaştırın",
  description:
    "Dokuntag®, NFC ve QR ile çalışan güvenli kayıp buluşturma sistemidir. Birey, evcil hayvan, anahtar ve eşyalar için güvenli iletişim köprüsü kurar.",
  keywords: [
    "Dokuntag",
    "NFC anahtarlık",
    "QR kayıp eşya",
    "kayıp anahtar bulma",
    "kayıp eşya etiketi",
    "evcil hayvan etiketi",
    "evcil hayvan QR etiketi",
    "akıllı anahtarlık",
    "NFC etiket",
    "QR etiket",
    "kayıp eşya nasıl bulunur",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Dokuntag® | Dokun, Bul, Buluştur",
    description:
      "NFC ve QR ile kaybolanı sahibine ulaştıran güvenli iletişim sistemi.",
    url: "https://dokuntag.com",
    images: [
      {
        url: "/images/hero-new.jpg",
        width: 1200,
        height: 630,
        alt: "Dokuntag NFC ve QR kayıp buluşturma sistemi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dokuntag® | Dokun, Bul, Buluştur",
    description:
      "NFC ve QR ile kaybolanı sahibine ulaştıran güvenli iletişim sistemi.",
    images: ["/images/hero-new.jpg"],
  },
};

const phoneDisplay = "0551 555 15 53";
const phoneHref = "tel:+905515551553";
const whatsappHref =
  "https://wa.me/905515551553?text=Merhaba,%20Dokuntag%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum.";
const emailHref = "mailto:info@dokuntag.com";

const address =
  "Osmaniye Mahallesi Fabrikalar Geçidi Sokak No:9 Bakırköy/İstanbul";

const socialLinks = [
  { name: "Instagram", href: "https://instagram.com/dokuntag" },
  { name: "TikTok", href: "https://tiktok.com/@dokuntag" },
  { name: "YouTube", href: "https://youtube.com/@dokuntag" },
  { name: "X", href: "https://x.com/dokuntag" },
  { name: "Facebook", href: "https://facebook.com/dokuntag" },
];

const useCases = [
  {
    title: "Birey",
    text: "Yakınınıza ulaşılması gereken durumlarda güvenli iletişim köprüsü oluşturur.",
    image: "/images/relief-phone.jpg",
  },
  {
    title: "Evcil hayvan",
    text: "Tasmadaki Dokuntag® ile bulan kişi size güvenli şekilde ulaşabilir.",
    image: "/images/pet-tag.jpg",
  },
  {
    title: "Anahtar",
    text: "Anahtarınız kaybolduğunda bulan kişi size kolayca ulaşabilir.",
    image: "/images/lost-key.jpg",
  },
  {
    title: "Eşya",
    text: "Çanta, laptop, valiz ve değer verdiğiniz eşyalar için kullanılabilir.",
    image: "/images/bag-tag.jpg",
  },
];


const guideItems = [
  {
    title: "Anahtar kaybolursa ne yapılır?",
    text: "Anahtarınızı kaybettiğinizde güvenlik ve geri bulma için atılacak adımlar.",
    href: "/anahtar-kaybolursa-ne-yapilir",
  },
  {
    title: "Evcil hayvan kaybolursa ne yapılır?",
    text: "Kedi veya köpeğiniz kaybolduğunda hızlı hareket etmek için pratik rehber.",
    href: "/evcil-hayvan-kaybolursa-ne-yapilir",
  },
  {
    title: "Kayıp eşya nasıl bulunur?",
    text: "Çanta, valiz, laptop veya kişisel eşyalar kaybolduğunda yapılması gerekenler.",
    href: "/kayip-esya-nasil-bulunur",
  },
  {
    title: "NFC anahtarlık nedir?",
    text: "NFC teknolojisinin nasıl çalıştığını ve kayıp eşya için nasıl kullanıldığını öğrenin.",
    href: "/nfc-anahtarlik-nedir",
  },
];

const shareLinks = [
  {
    name: "WhatsApp",
    href: "https://wa.me/?text=Dokuntag%C2%AE%20-%20Kaybolan%C4%B1%20sahibine%20ula%C5%9Ft%C4%B1rman%C4%B1n%20en%20kolay%20yolu:%20https%3A%2F%2Fdokuntag.com",
    style: "bg-green-500 text-white hover:bg-green-600",
  },
  {
    name: "X",
    href: "https://twitter.com/intent/tweet?text=Dokuntag%C2%AE%20-%20Kaybolan%C4%B1%20sahibine%20ula%C5%9Ft%C4%B1rman%C4%B1n%20en%20kolay%20yolu&url=https%3A%2F%2Fdokuntag.com",
    style: "bg-black text-white hover:bg-neutral-800",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fdokuntag.com",
    style: "bg-blue-600 text-white hover:bg-blue-700",
  },
  {
    name: "Instagram",
    href: "https://instagram.com/dokuntag",
    style: "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white",
  },
  {
    name: "TikTok",
    href: "https://tiktok.com/@dokuntag",
    style: "bg-black text-white",
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@dokuntag",
    style: "bg-red-600 text-white hover:bg-red-700",
  },
];
export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f3ea] text-neutral-950">
      <section className="px-5 py-16 sm:px-8 sm:py-24">
  <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
    
    <div>
      <p className="mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-neutral-500">
        Dokuntag®
      </p>

      <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-neutral-950 sm:text-6xl lg:text-7xl">
        Kaybolduğunda, sana ulaşırlar.
      </h1>

      <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600 sm:text-xl">
        Bulan kişi etiketi okutur veya dokundurur. Saniyeler içinde size ulaşır; uygulama indirmez, karmaşa yaşamaz.
      </p>

      <p className="mt-4 text-sm text-neutral-500">
        Bir kere alırsın · Yıllık ücret yok · Uygulama gerekmez
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/satis"
          className="rounded-full bg-neutral-950 px-8 py-4 text-center text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-neutral-800"
        >
          İlk üretim için bilgi al
        </Link>

        <Link
          href="/p/DKNTG"
          className="rounded-full border border-neutral-300 bg-white/70 px-8 py-4 text-center text-sm font-semibold text-neutral-950 transition hover:bg-white"
        >
          Demo gör
        </Link>
      </div>
    </div>

    <div className="relative">
      <div className="absolute -inset-5 -z-10 rounded-[3rem] bg-neutral-200/60 blur-3xl" />

      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white shadow-2xl shadow-neutral-200/70">
        <Image
          src="/images/hero-new.jpg"
          alt="Dokuntag kullanım"
          width={1400}
          height={1000}
          priority
          className="h-[420px] w-full object-cover sm:h-[560px]"
        />

        <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-black/10 bg-white/85 p-4 shadow-xl backdrop-blur-md">
          <p className="text-sm font-semibold text-neutral-950">
            Telefonunu yaklaştırman yeterli.
          </p>

          <p className="mt-1 text-xs text-neutral-600">
            Bulan kişi doğrudan sana ulaşır.
          </p>
        </div>
      </div>
    </div>

  </div>
</section>
      <section id="neden" className="px-5 py-20 sm:px-8">
  <div className="mx-auto max-w-7xl">
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">
        Neden Dokuntag®?
      </p>
      <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
        Çünkü kaybolduğunda sana ulaşacak bir yol gerekir.
      </h2>
      <p className="mt-5 text-lg leading-8 text-neutral-600">
        Yakınınızı, evcil hayvanınızı veya eşyalarınızı bulan kişi iyi niyetli olabilir. Ama size ulaşacak bir yol yoksa geri dönmesi zordur.
      </p>
    </div>

    <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[
        {
          src: "/images/child.jpg",
          alt: "Birey güvenli iletişim",
          dark: false,
          title: "Yakınınıza ulaşılması gerekirse?",
          text: "Dokuntag®, acil durumlarda doğru kişinin hızlıca bilgilendirilmesini sağlar.",
        },
        {
          src: "/images/lost-key.jpg",
          alt: "Kaybolan anahtar",
          dark: true,
          title: "Anahtarın kaybolursa?",
          text: "Bulan kişi sana ulaşamazsa, anahtarın büyük ihtimalle geri dönmez.",
        },
        {
          src: "/images/pet-tag.jpg",
          alt: "Evcil hayvan tasmasında Dokuntag",
          dark: false,
          title: "Evcil hayvanın uzaklaşırsa?",
          text: "Tasmadaki Dokuntag®, bulan kişiyle aranızda güvenli bir köprü kurar.",
        },
        {
          src: "/images/bag-tag.jpg",
          alt: "Çanta üzerinde Dokuntag",
          dark: true,
          title: "Çantanı bir yerde unutsan?",
          text: "Dokuntag® sayesinde bulan kişi size hızlıca ulaşabilir.",
        },
      ].map((item) => (
        <div
          key={item.title}
          className={[
            "group overflow-hidden rounded-[2rem] border shadow-sm transition-all duration-500",
            "hover:-translate-y-1 hover:shadow-xl",
            item.dark
              ? "border-neutral-900 bg-neutral-950 text-white"
              : "border-neutral-200 bg-white text-neutral-950",
          ].join(" ")}
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
              className="object-cover transition duration-700 group-hover:scale-[1.04]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent opacity-70 transition duration-500 group-hover:opacity-90" />

       
          </div>

          <div className="p-7">
            <h3 className="text-2xl font-semibold tracking-tight">
              {item.title}
            </h3>
            <p
              className={[
                "mt-3 text-sm leading-6",
                item.dark ? "text-neutral-300" : "text-neutral-600",
              ].join(" ")}
            >
              {item.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
<section id="nasil-calisir" className="px-5 pt-10 pb-20 sm:px-8 sm:py-20">
  <div className="mx-auto max-w-5xl">

    {/* 🔥 BAŞLIK (MOBİL + DESKTOP ORTAK) */}
    <div className="mb-8 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
        Nasıl çalışır?
      </p>

      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
        Bulunduğunda, saniyeler içinde size ulaşılır.
      </h2>

      <p className="mt-3 text-sm text-neutral-500">
        Bulundu · Okutuldu · Profil açıldı · Ulaşıldı
      </p>
    </div>

    {/* 🔥 GÖRSEL */}
    <div className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
      <Image
        src="/images/how-all.jpg"
        alt="Dokuntag nasıl çalışır"
        width={1200}
        height={1200}
        className="w-full object-cover"
      />
    </div>

    {/* 🔥 AÇIKLAMA */}
    <div className="mt-10 text-center">
      <p className="text-lg leading-8 text-neutral-600">
        Dokuntag®, NFC ve QR teknolojisini kullanır. Bulan kişi etiketi okutur,
        profil açılır ve sizin izin verdiğiniz iletişim yollarıyla size ulaşır.
      </p>

      <p className="mt-4 text-sm text-neutral-500">
        Dilerseniz tüm iletişim bilgilerinizi gizleyebilirsiniz. Bu durumda
        bulan kişi yalnızca mesaj bırakır.
      </p>
    </div>

  </div>
</section>
      <section id="yardim" className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] border border-neutral-200 bg-white p-8 shadow-sm sm:p-12">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">
              Yardım
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Bir ürün mü buldunuz, yoksa ürününüz mü kayboldu?
            </h2>
            <p className="mt-5 text-neutral-600">
              Dokuntag® iki taraf için de süreci sadeleştirir. Bulan kişi
              hızlıca okutur, ürün sahibi iletişim bilgilerini kontrol eder.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[2rem] bg-[#f7f3ea] p-6">
              <h3 className="text-2xl font-semibold">Bir ürün buldum</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                Üzerindeki Dokuntag® NFC alanına dokunun veya QR kodu okutun.
                Sayfa açılırsa sahibine ulaşmak için yönergeleri takip edin.
              </p>
              <Link
                href="/scan"
                className="mt-6 inline-flex rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                QR okut / NFC dokundur
              </Link>
            </div>

            <div className="rounded-[2rem] bg-neutral-950 p-6 text-white">
              <h3 className="text-2xl font-semibold">Ürünüm kayboldu</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-300">
                Ürünlerim sayfasından kayıtlı ürünlerinizi kontrol edin.
                İletişim bilgilerinizin güncel olduğundan emin olun.
              </p>
              <Link
                href="/my"
                className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-100"
              >
                Ürünlerim
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">
              Kullanım alanları
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Öncelik can, sonra değer verdiğiniz her şey.
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-neutral-600">
              Birey, evcil hayvan, anahtar ve eşyalar için güvenli iletişim
              katmanı oluşturur.
            </p>
          </div>

          <div className="mt-8 space-y-3 max-w-3xl mx-auto">
  {useCases.map((item, index) => (
    <details
      key={item.title}
      className="group rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm"
      open={index === 0}
    >
      <summary className="flex cursor-pointer items-center justify-between font-semibold text-lg">
        {item.title}
        <span className="text-neutral-400 group-open:rotate-45 transition">
          +
        </span>
      </summary>

      <div className="mt-4 space-y-4">
        <p className="text-sm text-neutral-600 leading-6">
          {item.text}
        </p>

        <Image
          src={item.image}
          alt={item.title}
          width={800}
          height={600}
          className="rounded-2xl w-full object-cover"
        />
      </div>
    </details>
  ))}
</div>
        </div>
      </section>

      <section id="rehberler" className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">
            Daha fazlasını keşfet
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Kayıp durumlarında ne yapmanız gerektiğini öğrenin.
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {guideItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[1.75rem] border border-neutral-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  {item.text}
                </p>
                <span className="mt-5 inline-flex text-sm font-semibold text-neutral-950">
                  Rehberi oku →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="iletisim" className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] border border-neutral-200 bg-white p-8 shadow-sm sm:p-12">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">
                İletişim
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                Dokuntag® ile iletişime geçin.
              </h2>
              <p className="mt-5 text-neutral-600">
                Ürün, kurulum, iş birliği veya destek için bize ulaşabilirsiniz.
              </p>

              <div className="mt-8 space-y-3 text-sm text-neutral-700">
                <p>
                  Telefon:{" "}
                  <a href={phoneHref} className="font-semibold text-neutral-950">
                    {phoneDisplay}
                  </a>
                </p>
                <p>
                  WhatsApp:{" "}
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-neutral-950"
                  >
                    WhatsApp ile yaz
                  </a>
                </p>
                <p>
                  E-posta:{" "}
                  <a href={emailHref} className="font-semibold text-neutral-950">
                    info@dokuntag.com
                  </a>
                </p>
                <p>Adres: {address}</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold">Sosyal medya</h3>
              <p className="mt-2 text-sm text-neutral-600">
                Tüm sosyal medya hesaplarında kullanıcı adımız:{" "}
                <span className="font-semibold text-neutral-950">dokuntag</span>
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {socialLinks.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-center text-sm font-semibold transition hover:bg-neutral-100"
                  >
                    {item.name}
                  </a>
                ))}
              </div>

              <div className="mt-8 rounded-3xl bg-[#f7f3ea] p-6">
                <h4 className="font-semibold">Demo profil</h4>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  Bulan kişinin gördüğü örnek Dokuntag® profilini inceleyin.
                </p>
                <Link
                  href="/p/DKNTG"
                  className="mt-5 inline-flex rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  Demo profili aç
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

<section className="px-5 py-16 sm:px-8">
  <div className="mx-auto max-w-4xl rounded-[2.5rem] border border-neutral-200 bg-white p-8 text-center shadow-sm sm:p-10">
    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">
      Paylaş
    </p>

    <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
      Dokuntag® fikrini sevdin mi?
    </h2>

    <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-neutral-600">
      Kaybolan eşyaların, evcil hayvanların ve yakınların sahibine daha kolay
      ulaşması için Dokuntag®’ı paylaşabilirsiniz.
    </p>

    <div className="mt-6 flex flex-wrap justify-center gap-3">
  {shareLinks.map((item) => (
    <a
      key={item.name}
      href={item.href}
      target="_blank"
      rel="noreferrer"
      className={`rounded-full px-5 py-3 text-sm font-semibold transition ${item.style}`}
    >
      {item.name}
    </a>
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
            Dokuntag®, kaybolanla sahibi arasında güvenli ve hızlı bir bağlantı
            kurar.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/satis"
              className="rounded-full bg-neutral-950 px-8 py-4 text-center text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-neutral-800"
            >
              İlk üretim için bilgi al
            </Link>

            <Link
              href="/p/DKNTG"
              className="rounded-full border border-neutral-300 bg-white/70 px-8 py-4 text-center text-sm font-semibold text-neutral-950 transition hover:bg-white"
            >
              Demo profil gör
            </Link>
          </div>
        </div>
      </section>
      <ScrollToTopButton />
    </main>
  );
}