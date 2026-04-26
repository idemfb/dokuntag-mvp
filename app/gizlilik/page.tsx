import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description:
    "Dokuntag® gizlilik yaklaşımı: kullanıcı kontrolü, minimum veri, adres bilgisi istememe ve güvenli iletişim prensipleri.",
  alternates: {
    canonical: "/gizlilik",
  },
  openGraph: {
    title: "Dokuntag® Gizlilik Politikası",
    description:
      "Dokuntag®, kullanıcı bilgilerini minimum seviyede tutmayı ve kontrolü kullanıcıya bırakmayı hedefler.",
    url: "https://dokuntag.com/gizlilik",
    images: [
      {
        url: "/images/hero-main.jpg",
        width: 1200,
        height: 630,
        alt: "Dokuntag gizlilik politikası",
      },
    ],
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ea] text-neutral-950">
      <section className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">
            Gizlilik
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Gizliliğiniz bizim için önemlidir.
          </h1>

          <p className="mt-6 leading-7 text-neutral-600">
            Dokuntag®, kullanıcıların paylaştığı bilgileri minimum seviyede
            tutmayı ve kontrolü kullanıcıya bırakmayı hedefler.
          </p>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8">
        <div className="mx-auto max-w-4xl space-y-8 text-sm leading-7 text-neutral-700">
          <div>
            <h2 className="text-xl font-semibold text-neutral-950">
              Toplanan bilgiler
            </h2>
            <p className="mt-2">
              Dokuntag®, yalnızca kullanıcı tarafından girilen iletişim
              bilgilerini saklar. Bu bilgiler; telefon, e-posta, şehir ve not
              gibi alanları içerebilir.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-neutral-950">
              Kontrol sizdedir
            </h2>
            <p className="mt-2">
              Hangi bilginin herkese açık profilde görüneceğini tamamen siz
              belirlersiniz. İstediğiniz zaman değiştirilebilir.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-neutral-950">
              Adres bilgisi
            </h2>
            <p className="mt-2">
              Dokuntag adres bilgisi istemez ve adres paylaşmanızı önermez.
              Güvenlik açısından açık adres paylaşımı önerilmez.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-neutral-950">
              Veri kullanımı
            </h2>
            <p className="mt-2">
              Paylaşılan bilgiler yalnızca kaybolan ürünün sahibine ulaşılması
              amacıyla kullanılır. Üçüncü taraflarla paylaşılmaz.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-neutral-950">
              İletişim
            </h2>
            <p className="mt-2">
              Gizlilik ile ilgili sorularınız için bizimle iletişime
              geçebilirsiniz.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}