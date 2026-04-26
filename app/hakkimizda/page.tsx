import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "Dokuntag®, NFC ve QR teknolojisiyle kaybolan birey, evcil hayvan, anahtar ve eşyaları sahibine ulaştıran güvenli iletişim köprüsüdür.",
  alternates: {
    canonical: "/hakkimizda",
  },
  openGraph: {
    title: "Dokuntag® Hakkımızda",
    description:
      "Dokuntag® kaybolan ile sahibi arasında güvenli bir köprü kurar.",
    url: "https://dokuntag.com/hakkimizda",
    images: [
      {
        url: "/images/hero-main.jpg",
        width: 1200,
        height: 630,
        alt: "Dokuntag hakkında",
      },
    ],
  },
};

const values = [
  {
    title: "Güven",
    text: "Dokuntag®, gereksiz bilgi istemeden kaybolanı sahibine ulaştırmayı hedefler.",
  },
  {
    title: "Kontrol",
    text: "Hangi bilgilerin görüneceğine ürün sahibi karar verir.",
  },
  {
    title: "Sadelik",
    text: "Bulan kişi uygulama indirmeden NFC veya QR ile profil sayfasına ulaşır.",
  },
  {
    title: "İnsan odaklılık",
    text: "Öncelik; birey, evcil hayvan ve değer verilen eşyaların güvenli şekilde sahibine ulaşmasıdır.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ea] text-neutral-950">
      <section className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">
            Hakkımızda
          </p>

          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Dokuntag®, kaybolan ile sahibi arasında güvenli bir köprü kurar.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-600">
            Dokuntag®, NFC ve QR teknolojisini kullanarak kaybolan birey,
            evcil hayvan, anahtar ve eşyaların sahibine daha hızlı ulaşmasını
            sağlayan bir güven sistemidir.
          </p>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-neutral-600">
            Amacımız karmaşık bir uygulama sunmak değil; ihtiyaç anında doğru
            kişiye, doğru iletişim kanalını güvenli ve sade şekilde açmaktır.
          </p>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2">
          {values.map((item) => (
            <div
              key={item.title}
              className="rounded-[2rem] border border-neutral-200 bg-white p-7 shadow-sm"
            >
              <h2 className="text-2xl font-semibold">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8">
        <div className="mx-auto max-w-5xl rounded-[2.5rem] bg-neutral-950 p-8 text-white sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-400">
            Gizlilik yaklaşımımız
          </p>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
            Adres bilgisi istemeyiz ve adres paylaşmanızı önermeyiz.
          </h2>

          <p className="mt-5 max-w-3xl text-sm leading-7 text-neutral-300">
            Dokuntag®’ın amacı, kaybolan şeyin sahibine ulaşmasını sağlamaktır;
            gereksiz kişisel bilgi göstermek değildir. Bu nedenle özellikle
            anahtar gibi güvenlik hassasiyeti taşıyan ürünlerde açık adres
            paylaşılmasını önermeyiz.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/satis"
              className="rounded-full bg-white px-7 py-4 text-center text-sm font-semibold text-neutral-950 transition hover:bg-neutral-100"
            >
              Ön sipariş ver
            </Link>

            <Link
              href="/p/DKNTG"
              className="rounded-full border border-white/20 px-7 py-4 text-center text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Demo profil gör
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}