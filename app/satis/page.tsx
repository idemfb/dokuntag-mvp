import LeadForm from "../components/LeadForm";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dokuntag® One Ön Sipariş",
  description:
    "Dokuntag® One, NFC ve QR ile çalışan güvenli kayıp buluşturma etiketidir. Birey, evcil hayvan, anahtar ve eşyalar için ilk üretim bilgisi alın.",
  alternates: {
    canonical: "/satis",
  },
  openGraph: {
    title: "Dokuntag® One Ön Sipariş",
    description:
      "QR ve NFC destekli Dokuntag® One ile kaybolanı sahibine ulaştırın.",
    url: "https://dokuntag.com/satis",
    images: [
      {
        url: "/images/product-key.jpg",
        width: 1200,
        height: 630,
        alt: "Dokuntag One NFC ve QR anahtarlık",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dokuntag® One Ön Sipariş",
    description:
      "QR ve NFC destekli Dokuntag® One ile kaybolanı sahibine ulaştırın.",
    images: ["/images/product-key.jpg"],
  },
};

const phoneDisplay = "0551 555 15 53";
const phoneHref = "tel:+905515551553";
const whatsappHref =
  "https://wa.me/905515551553?text=Merhaba,%20Dokuntag%20One%20ilk%20%C3%BCretim%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum.";
const emailHref =
  "mailto:info@dokuntag.com?subject=Dokuntag%20One%20%C4%B0lk%20%C3%9Cretim%20Bilgi";

const packageItems = [
  "Tek seferlik fiziksel ürün",
  "Yıllık üyelik yok",
  "Uygulama gerekmez",
  "Tüm telefonlarda QR ile çalışır",
  "Destekleyen cihazlarda NFC ile daha hızlı açılır",
  "Bilgilerin görünürlüğünü siz belirlersiniz",
];

const trustItems = [
  "Adres bilgisi istemez",
  "Adres paylaşmanızı önermez",
  "Telefon görünürlüğünü siz seçersiniz",
  "WhatsApp isteğe bağlıdır",
  "Bulan kişi uygulama indirmez",
  "Profil bilgileri ürün sahibi tarafından yönetilir",
];

const useCases = [
  {
    title: "Birey",
    text: "Yakınınıza ulaşılması gereken durumlarda güvenli iletişim köprüsü oluşturur.",
    image: "/images/relief-phone.jpg",
  },
  {
    title: "Evcil hayvan",
    text: "Tasmaya takıldığında bulan kişinin sahibine hızlıca ulaşmasını sağlar.",
    image: "/images/pet-tag.jpg",
  },
  {
    title: "Anahtar",
    text: "Kaybolduğunda açık adres paylaşmadan size ulaşılmasına yardımcı olur.",
    image: "/images/lost-key.jpg",
  },
  {
    title: "Eşya",
    text: "Çanta, laptop, valiz ve değer verdiğiniz eşyalar için kullanılabilir.",
    image: "/images/bag-tag.jpg",
  },
];

const faqItems = [
  {
    question: "Dokuntag® One nedir?",
    answer:
      "Dokuntag® One, QR ve NFC ile çalışan fiziksel bir güven etiketidir. Bulan kişi etiketi okutarak sizin belirlediğiniz iletişim bilgilerine ulaşabilir.",
  },
  {
    question: "Yıllık üyelik var mı?",
    answer:
      "Hayır. Dokuntag® One fiziksel ürün olarak üyeliksiz kullanılır.",
  },
  {
    question: "Bulan kişi uygulama indirmek zorunda mı?",
    answer:
      "Hayır. QR okutulduğunda veya NFC ile dokundurulduğunda profil sayfası doğrudan tarayıcıda açılır.",
  },
  {
    question: "Telefon numaram herkese açık olur mu?",
    answer:
      "Hayır. Telefon, WhatsApp, e-posta, şehir ve not gibi alanları ayrı ayrı açıp kapatabilirsiniz.",
  },
  {
    question: "Adres paylaşmam gerekir mi?",
    answer:
      "Hayır. Dokuntag adres bilgisi istemez ve adres paylaşmanızı önermez.",
  },
  {
    question: "QR ve NFC aynı yere mi gider?",
    answer:
      "Standart kullanımda QR ve NFC aynı güvenli Dokuntag profil akışına yönlenir.",
  },
  {
    question: "NFC farklı bir adrese tanımlanabilir mi?",
    answer:
      "Özel yönlendirme ihtiyaçları için bizimle iletişime geçebilirsiniz.",
  },
];

export default function SalesPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ea] text-neutral-950">
      <section className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-neutral-500">
              Dokuntag® One
            </p>

            <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Kaybolmadan önce hazır olsun.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600">
              Bulan kişi QR okutur veya etikete dokundurur. Saniyeler içinde
              size ulaşır; kontrol sizde kalır. Uygulama indirmeden, karmaşa
              yaşamadan.
            </p>

            <div className="mt-8 rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-500">
                    İlk üretim dönemi
                  </p>
                  <p className="mt-1 text-3xl font-semibold">
                    İlk üretim için bilgi alın
                  </p>
                  
                  <p className="mt-2 text-sm leading-6 text-neutral-500">
                    Sabit modeller, kullanım alanları ve üretim detayları için
                    WhatsApp üzerinden hızlıca bilgi alabilirsiniz.
                  </p>
                </div>

                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-neutral-950 px-7 py-4 text-center text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-neutral-800"
                >
                  WhatsApp ile bilgi al
                </a>
              </div>
            </div>
            <p className="text-sm font-medium text-neutral-600 mb-2">
  İlk üretim için haberdar olun
</p>

<LeadForm />
            
            <p className="mt-4 text-sm text-neutral-500">
              Tek seferlik fiziksel ürün · Yıllık ücret yok · Uygulama gerekmez
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a
                href={phoneHref}
                className="rounded-full border border-neutral-300 bg-white/70 px-6 py-3 text-center text-sm font-semibold transition hover:bg-white"
              >
                Ara: {phoneDisplay}
              </a>

              <a
                href={emailHref}
                className="rounded-full border border-neutral-300 bg-white/70 px-6 py-3 text-center text-sm font-semibold transition hover:bg-white"
              >
                Mail gönder
              </a>

              <Link
                href="/p/DKNTG"
                className="rounded-full border border-neutral-300 bg-white/70 px-6 py-3 text-center text-sm font-semibold transition hover:bg-white"
              >
                Demo profil
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2.5rem] border border-white/50 bg-white shadow-sm">
            <Image
              src="/images/product-key.jpg"
              alt="Dokuntag One NFC ve QR anahtarlık"
              width={1200}
              height={1200}
              priority
              className="h-[520px] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-3">
          <div className="rounded-[2rem] bg-neutral-950 p-7 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-400">
              Problem
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              Kaybolduğunda sana ulaşacak yol yoksa geri dönmesi zordur.
            </h2>
          </div>

          <div className="rounded-[2rem] border border-neutral-200 bg-white p-7 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Çözüm
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              Dokuntag®, bulan kişiyle ürün sahibi arasında güvenli köprü kurar.
            </h2>
          </div>

          <div className="rounded-[2rem] border border-neutral-200 bg-white p-7 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Kontrol
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              Hangi bilginin görüneceğine ürün sahibi karar verir.
            </h2>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[2.5rem] border border-neutral-200 bg-white shadow-sm">
            <Image
              src="/images/nfc-touch.jpg"
              alt="QR okutma ve NFC dokundurma"
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
              Okutulur, profil açılır, size ulaşılır.
            </h2>

            <p className="mt-5 text-lg leading-8 text-neutral-600">
              Dokuntag® One üzerindeki QR okutulduğunda veya NFC ile
              dokundurulduğunda güvenli profil sayfası açılır. Size ulaşma
              şekillerini siz belirlersiniz.
            </p>

            <p className="mt-3 text-sm text-neutral-500">
              Tüm telefonlarda QR ile çalışır. Destekleyen cihazlarda NFC ile
              daha hızlı açılır.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {packageItems.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm font-medium shadow-sm"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">
              Kullanım alanları
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Öncelik can, sonra değer verdiğiniz her şey.
            </h2>
            <p className="mt-5 text-lg leading-8 text-neutral-600">
              Birey, evcil hayvan, anahtar, çanta, laptop, valiz ve güvenli
              iletişim gerektiren farklı alanlar için kullanılabilir.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

          <div className="mt-5 rounded-[2rem] border border-neutral-200 bg-white/70 p-5 text-sm leading-6 text-neutral-600">
            Diğer kullanımlar: telefon, ekipman, valiz, bisiklet, araç içi eşya
            ve güvenli iletişim gerektiren farklı alanlar.
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-10 rounded-[2.5rem] bg-neutral-950 p-6 text-white sm:p-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[2rem]">
            <Image
              src="/images/relief-phone.jpg"
              alt="Dokuntag güven sistemi"
              width={1100}
              height={900}
              className="h-[420px] w-full object-cover"
            />
          </div>

          <div className="p-2 sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-400">
              Dokuntag® güven sistemi
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Güven, görünürlük kontrolüyle başlar.
            </h2>

            <p className="mt-5 text-lg leading-8 text-neutral-300">
              Dokuntag®’ın amacı fazla bilgi göstermek değil, doğru kişiye doğru
              iletişim yolunu açmaktır. Telefon, WhatsApp, e-posta ve not
              alanlarını siz yönetirsiniz.
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
        <div className="mx-auto max-w-4xl rounded-[2.5rem] bg-white p-8 text-center shadow-sm sm:p-14">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">
            İlk üretim
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Satın almadan önce bilgi alın.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-neutral-600">
            İlk üretim dönemi için ürün modeli, kullanım alanı ve hazırlık
            detaylarını birlikte netleştirelim.
          </p>

          <p className="mt-3 text-sm text-neutral-500">
            Fiyat netleşmeden talep bırakabilir, ilk üretim hakkında bilgi
            alabilirsiniz.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-neutral-950 px-8 py-4 text-center text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-neutral-800"
            >
              WhatsApp ile bilgi al
            </a>

            <a
              href={phoneHref}
              className="rounded-full border border-neutral-300 bg-white px-8 py-4 text-center text-sm font-semibold transition hover:bg-neutral-50"
            >
              Telefonla ara
            </a>
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
    </main>
  );
}