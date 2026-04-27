import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kayıp eşya nasıl bulunur?",
  description:
    "Kayıp eşya nasıl bulunur? Anahtar, çanta, valiz veya değerli eşyalar kaybolduğunda yapılması gerekenler ve NFC / QR etiket çözümleri.",
  keywords: [
    "kayıp eşya nasıl bulunur",
    "kayıp eşya bulma",
    "kayıp çanta nasıl bulunur",
    "kayıp anahtar etiketi",
    "NFC kayıp eşya etiketi",
    "QR kayıp eşya etiketi",
  ],
  alternates: {
    canonical: "/kayip-esya-nasil-bulunur",
  },
  openGraph: {
    title: "Kayıp eşya nasıl bulunur?",
    description:
      "Kayıp eşya, anahtar, çanta ve valiz için güvenli geri ulaşma yöntemleri.",
    url: "https://dokuntag.com/kayip-esya-nasil-bulunur",
    images: [
      {
        url: "/images/bag-tag.jpg",
        width: 1200,
        height: 630,
        alt: "Kayıp eşya nasıl bulunur",
      },
    ],
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#f7f3ea] px-5 py-16 text-neutral-950 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Kayıp eşya nasıl bulunur?
        </h1>

        <p className="mt-6 text-lg leading-8 text-neutral-600">
          Kayıp eşya bulmanın en önemli noktası, eşyayı bulan kişinin sahibine
          güvenli ve hızlı şekilde ulaşabilmesidir. Anahtar, çanta, valiz,
          laptop veya kişisel eşyalar için doğru iletişim yöntemi bulunma
          ihtimalini artırır.
        </p>

        <h2 className="mt-10 text-2xl font-semibold">
          1. Son kullandığınız yeri hatırlayın
        </h2>
        <p className="mt-3 leading-7 text-neutral-600">
          Kaybolan eşyalar çoğu zaman en son bulunduğunuz yerde kalır. Kafe,
          iş yeri, okul, araç içi, toplu taşıma veya bekleme alanlarını sakin
          şekilde kontrol edin.
        </p>

        <h2 className="mt-10 text-2xl font-semibold">
          2. İşletme ve görevlilere haber verin
        </h2>
        <p className="mt-3 leading-7 text-neutral-600">
          Eşyanızı kaybettiğiniz yerde güvenlik, danışma, kafe çalışanı veya
          site görevlisi varsa kısa ve net bilgi bırakın.
        </p>

        <h2 className="mt-10 text-2xl font-semibold">
          3. Üzerinde açık adres bulundurmayın
        </h2>
        <p className="mt-3 leading-7 text-neutral-600">
          Özellikle anahtar gibi güvenlik riski taşıyan eşyalarda açık adres
          paylaşmak doğru değildir. Bulan kişinin size ulaşması gerekir; ev veya
          iş adresinizi bilmesi gerekmez.
        </p>

        <h2 className="mt-10 text-2xl font-semibold">
          4. NFC veya QR destekli kayıp eşya etiketi kullanın
        </h2>
        <p className="mt-3 leading-7 text-neutral-600">
          NFC kayıp eşya etiketi veya QR kayıp eşya etiketi, bulan kişinin
          uygulama indirmeden size ulaşmasını sağlar. Böylece telefon,
          WhatsApp veya e-posta gibi sizin seçtiğiniz iletişim yolları açılır.
        </p>

        <h2 className="mt-10 text-2xl font-semibold">
          5. Bilgileri kontrollü paylaşın
        </h2>
        <p className="mt-3 leading-7 text-neutral-600">
          Telefon, e-posta, şehir ve not gibi alanlar ihtiyaca göre görünür
          yapılmalıdır. Gereksiz kişisel bilgi paylaşımı güvenlik açısından
          doğru değildir.
        </p>

        <div className="mt-12 rounded-3xl bg-neutral-950 p-8 text-white">
          <h3 className="text-2xl font-semibold">
            Dokuntag® kayıp eşyalar için nasıl yardımcı olur?
          </h3>

          <p className="mt-4 leading-7 text-neutral-300">
            Dokuntag®, NFC ve QR ile çalışan güvenli bir kayıp eşya iletişim
            sistemidir. Bulan kişi etiketi okutur, sizin izin verdiğiniz
            iletişim bilgilerine ulaşır. Adres paylaşmanıza gerek kalmaz.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/satis"
              className="rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-neutral-950"
            >
              Ön sipariş ver
            </Link>

            <Link
              href="/p/DKNTG"
              className="rounded-full border border-white/30 px-6 py-3 text-center text-sm font-semibold text-white"
            >
              Demo profil gör
            </Link>
          </div>
        </div>

        <p className="mt-12 text-sm text-neutral-500">
          Dokuntag adres bilgisi istemez ve adres paylaşmanızı önermez.
        </p>
      </div>
    </main>
  );
}