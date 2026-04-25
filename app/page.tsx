import Image from "next/image";
import Link from "next/link";

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
  { name: "Facebook", href: "https://facebook.com/dokuntag" }
];

const useCases = [
  {
    title: "Anahtar",
    text: "Anahtarınız kaybolduğunda bulan kişi size kolayca ulaşabilir.",
    image: "/images/lost-key.jpg"
  },
  {
    title: "Çanta",
    text: "Unutulan çanta, sahibine daha hızlı geri dönebilir.",
    image: "/images/bag-tag.jpg"
  },
  {
    title: "Evcil hayvan",
    text: "Tasmadaki Dokuntag ile bulan kişi size güvenli şekilde ulaşabilir.",
    image: "/images/pet-tag.jpg"
  }
];

const steps = [
  {
    title: "Etiketi tak",
    text: "Dokuntag’ı anahtarınıza, çantanıza veya evcil hayvan tasmasına takın."
  },
  {
    title: "Bulan kişi okutur",
    text: "NFC ile dokunur veya QR kodu okutur. Uygulama indirmesine gerek yoktur."
  },
  {
    title: "Size ulaşır",
    text: "Açılan güvenli profil üzerinden sizin belirlediğiniz yöntemle iletişim kurar."
  }
];

const faqItems = [
  {
    question: "Adres paylaşmak zorunda mıyım?",
    answer:
      "Hayır. Hangi bilgilerin görüneceği sizin kontrolünüzdedir. Adres paylaşmak zorunda değilsiniz."
  },
  {
    question: "Bulan kişinin uygulama indirmesi gerekir mi?",
    answer:
      "Hayır. NFC ya da QR okutulduğunda Dokuntag profil sayfası tarayıcıda açılır."
  },
  {
    question: "Telefon numaram görünmek zorunda mı?",
    answer:
      "Hayır. Telefon, WhatsApp, e-posta ve not alanlarını isteğinize göre açıp kapatabilirsiniz."
  },
  {
    question: "NFC ve QR aynı yere mi gider?",
    answer:
      "Evet. Varsayılan olarak NFC ve QR aynı güvenli Dokuntag profil akışına yönlenir. İhtiyaç halinde NFC bağlantısı özel bir adrese de tanımlanabilir."
  },
  {
    question: "Birden fazla ürün ekleyebilir miyim?",
    answer:
      "Evet. Dokuntag yapısı birden fazla ürün yönetimine uygun şekilde hazırlanmıştır."
  }
];

const trustItems = [
  "Adres paylaşmak zorunda değilsiniz",
  "Telefon görünürlüğünü siz seçersiniz",
  "WhatsApp isteğe bağlıdır",
  "Bulan kişi uygulama indirmez",
  "NFC ve QR güvenli profil akışına yönlenir",
  "Bilgiler ürün sahibi tarafından yönetilir"
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f3ea] text-neutral-950">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-[#f7f3ea]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Dokuntag
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-neutral-600 md:flex">
            <a href="#nasil-calisir" className="hover:text-neutral-950">
              Nasıl çalışır
            </a>
            <a href="#neden" className="hover:text-neutral-950">
              Neden Dokuntag?
            </a>
            <a href="#yardim" className="hover:text-neutral-950">
              Kaybettim / Buldum
            </a>
            <Link href="/p/DKNTG" className="hover:text-neutral-950">
              Demo profil
            </Link>
            <Link href="/satis" className="hover:text-neutral-950">
              Satın al
            </Link>
            <a href="#iletisim" className="hover:text-neutral-950">
              İletişim
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/scan"
              className="hidden rounded-full border border-neutral-300 bg-white/60 px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:bg-white sm:inline-flex"
            >
              QR okut
            </Link>

            <Link
              href="/my"
              className="hidden rounded-full border border-neutral-300 bg-white/60 px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:bg-white sm:inline-flex"
            >
              Ürünlerim
            </Link>

            <Link
              href="/satis"
              className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Hemen edin
            </Link>

            <details className="relative md:hidden">
              <summary className="list-none rounded-full border border-neutral-300 bg-white/70 px-3 py-2 text-sm font-semibold">
                Menü
              </summary>

              <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-3xl border border-neutral-200 bg-white p-2 shadow-xl">
                <a
                  href="#nasil-calisir"
                  className="block rounded-2xl px-4 py-3 text-sm hover:bg-neutral-100"
                >
                  Nasıl çalışır
                </a>
                <a
                  href="#neden"
                  className="block rounded-2xl px-4 py-3 text-sm hover:bg-neutral-100"
                >
                  Neden Dokuntag?
                </a>
                <a
                  href="#yardim"
                  className="block rounded-2xl px-4 py-3 text-sm hover:bg-neutral-100"
                >
                  Kaybettim / Buldum
                </a>
                <Link
                  href="/p/DKNTG"
                  className="block rounded-2xl px-4 py-3 text-sm hover:bg-neutral-100"
                >
                  Demo profil
                </Link>
                <Link
                  href="/scan"
                  className="block rounded-2xl px-4 py-3 text-sm hover:bg-neutral-100"
                >
                  QR okut
                </Link>
                <Link
                  href="/satis"
                  className="block rounded-2xl px-4 py-3 text-sm hover:bg-neutral-100"
                >
                  Satın al
                </Link>
                <Link
                  href="/my"
                  className="block rounded-2xl px-4 py-3 text-sm hover:bg-neutral-100"
                >
                  Ürünlerim
                </Link>
                <a
                  href="#iletisim"
                  className="block rounded-2xl px-4 py-3 text-sm hover:bg-neutral-100"
                >
                  İletişim
                </a>
              </div>
            </details>
          </div>
        </div>
      </header>

      <section className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-neutral-500">
              NFC / QR güvenli buluşturma sistemi
            </p>

            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-neutral-950 sm:text-6xl lg:text-7xl">
              Kaybolanı sahibine ulaştırmanın en kolay yolu
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600 sm:text-xl">
              Dokuntag ile bulan kişi size anında ulaşır. Uygulama indirmeden,
              karmaşa yaşamadan, güvenli ve kontrollü şekilde.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/satis"
                className="rounded-full bg-neutral-950 px-8 py-4 text-center text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Hemen edin
              </Link>

              <a
                href="#nasil-calisir"
                className="rounded-full border border-neutral-300 bg-white/70 px-8 py-4 text-center text-sm font-semibold text-neutral-950 transition hover:bg-white"
              >
                Nasıl çalışır?
              </a>

              <Link
                href="/scan"
                className="rounded-full border border-neutral-300 bg-white/70 px-8 py-4 text-center text-sm font-semibold text-neutral-950 transition hover:bg-white"
              >
                QR okut
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/50 bg-white shadow-sm">
            <Image
              src="/images/hero-main.jpg"
              alt="Dokuntag kullanım senaryosu"
              width={1400}
              height={1000}
              priority
              className="h-[420px] w-full object-cover sm:h-[560px]"
            />
          </div>
        </div>
      </section>

      <section id="neden" className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">
              Neden Dokuntag?
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Çünkü kaybolduğunda sana ulaşacak bir yol gerekir.
            </h2>
            <p className="mt-5 text-lg leading-8 text-neutral-600">
              Anahtarınızı, çantanızı veya evcil hayvanınızı bulan kişi iyi
              niyetli olabilir. Ama size ulaşacak bir yol yoksa geri dönmesi
              zordur.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <div className="overflow-hidden rounded-[2rem] bg-neutral-950 text-white">
              <Image
                src="/images/lost-key.jpg"
                alt="Kaybolan anahtar"
                width={900}
                height={900}
                className="h-72 w-full object-cover opacity-90"
              />
              <div className="p-7">
                <h3 className="text-2xl font-semibold">
                  Anahtarın kaybolursa?
                </h3>
                <p className="mt-3 text-sm leading-6 text-neutral-300">
                  Bulan kişi sana ulaşamazsa, anahtarın büyük ihtimalle geri
                  dönmez.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
              <Image
                src="/images/bag-tag.jpg"
                alt="Çanta üzerinde Dokuntag"
                width={900}
                height={900}
                className="h-72 w-full object-cover"
              />
              <div className="p-7">
                <h3 className="text-2xl font-semibold">
                  Çantanı bir yerde unutsan?
                </h3>
                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  Dokuntag sayesinde bulan kişi size hızlıca ulaşabilir.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
              <Image
                src="/images/pet-tag.jpg"
                alt="Evcil hayvan tasmasında Dokuntag"
                width={900}
                height={900}
                className="h-72 w-full object-cover"
              />
              <div className="p-7">
                <h3 className="text-2xl font-semibold">
                  Evcil hayvanın uzaklaşırsa?
                </h3>
                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  Tasmadaki Dokuntag, bulan kişiyle aranızda güvenli bir köprü
                  kurar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="nasil-calisir" className="px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[2.5rem] border border-neutral-200 bg-white shadow-sm">
            <Image
              src="/images/nfc-touch.jpg"
              alt="NFC okutma anı"
              width={1200}
              height={1200}
              className="h-[460px] w-full object-cover"
            />
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">
              Nasıl çalışır?
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Tek dokunuşla güvenli bağlantı açılır.
            </h2>
            <p className="mt-5 text-lg leading-8 text-neutral-600">
              Dokuntag, NFC ve QR teknolojisini kullanır. Bulan kişi etiketi
              okutur, güvenli profil açılır ve sizin izin verdiğiniz iletişim
              yollarıyla size ulaşır.
            </p>

            <div className="mt-8 space-y-4">
              {steps.map((item, index) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-3xl border border-neutral-200 bg-white/70 p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-neutral-600">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/p/DKNTG"
                className="inline-flex justify-center rounded-full border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold transition hover:bg-neutral-100"
              >
                Demo profili gör
              </Link>

              <Link
                href="/scan"
                className="inline-flex justify-center rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                QR okut
              </Link>
            </div>
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
              Dokuntag iki taraf için de süreci sadeleştirir. Bulan kişi hızlıca
              okutur, ürün sahibi iletişim bilgilerini kontrol eder.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[2rem] bg-[#f7f3ea] p-6">
              <h3 className="text-2xl font-semibold">Bir ürün buldum</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                Üzerindeki Dokuntag NFC alanına dokunun veya QR kodu okutun.
                Sayfa açılırsa sahibine ulaşmak için yönergeleri takip edin.
              </p>
              <Link
                href="/scan"
                className="mt-6 inline-flex rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                QR okut
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
              Değer verdiğiniz şeyler için.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {useCases.map((item) => (
              <div
                key={item.title}
                className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  width={900}
                  height={900}
                  className="h-72 w-full object-cover"
                />
                <div className="p-7">
                  <h3 className="text-2xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-neutral-600">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-10 rounded-[2.5rem] bg-neutral-950 p-6 text-white sm:p-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[2rem]">
            <Image
              src="/images/relief-phone.jpg"
              alt="Telefon bildirimi alan kullanıcı"
              width={1100}
              height={900}
              className="h-[420px] w-full object-cover"
            />
          </div>

          <div className="p-2 sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-400">
              Dokuntag güven sistemi
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Bilgilerinizin kontrolü sizde.
            </h2>
            <p className="mt-5 text-lg leading-8 text-neutral-300">
              Dokuntag bir güven köprüsüdür. Bulan kişi yalnızca sizin görünür
              yapmayı seçtiğiniz bilgilere ulaşır. Amaç, kaybolanı sahibine
              hızlı ve güvenli şekilde ulaştırmaktır.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {trustItems.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-neutral-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Sık sorulan sorular
            </h2>
          </div>

          <div className="space-y-3">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm"
              >
                <summary className="cursor-pointer list-none font-semibold">
                  {item.question}
                </summary>
                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  {item.answer}
                </p>
              </details>
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
                Dokuntag ile iletişime geçin.
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
                  Bulan kişinin gördüğü örnek Dokuntag profilini inceleyin.
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

      <section className="px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Kaybolmadan önce hazır olsun.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-neutral-600">
            Dokuntag, kaybolanla sahibi arasında güvenli ve hızlı bir bağlantı
            kurar.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/satis"
              className="rounded-full bg-neutral-950 px-8 py-4 text-center text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Hemen edin
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

      <footer className="border-t border-neutral-200 px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© Dokuntag</p>

          <div className="flex flex-wrap gap-4">
            <a href="#nasil-calisir" className="hover:text-neutral-950">
              Nasıl çalışır
            </a>
            <a href="#neden" className="hover:text-neutral-950">
              Neden Dokuntag?
            </a>
            <a href="#yardim" className="hover:text-neutral-950">
              Kaybettim / Buldum
            </a>
            <Link href="/scan" className="hover:text-neutral-950">
              QR okut
            </Link>
            <Link href="/satis" className="hover:text-neutral-950">
              Satın al
            </Link>
            <a href="#iletisim" className="hover:text-neutral-950">
              İletişim
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}