import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kullanım Koşulları",
  description:
    "Dokuntag® kullanım koşulları: NFC ve QR tabanlı güvenli kayıp buluşturma sisteminin kullanım amacı, sorumluluk ve güvenlik ilkeleri.",
  alternates: {
    canonical: "/kullanim-kosullari",
  },
  openGraph: {
    title: "Dokuntag® Kullanım Koşulları",
    description:
      "Dokuntag® kaybolan birey, evcil hayvan, anahtar ve eşyaların sahibine ulaşmasını kolaylaştırır.",
    url: "https://dokuntag.com/kullanim-kosullari",
    images: [
      {
        url: "/images/nfc-touch.jpg",
        width: 1200,
        height: 630,
        alt: "Dokuntag kullanım koşulları",
      },
    ],
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ea] text-neutral-950">
      <section className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">
            Kullanım Koşulları
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Dokuntag® kullanım koşulları
          </h1>

          <p className="mt-6 leading-7 text-neutral-600">
            Dokuntag®, kaybolan ürünlerin sahibine ulaşmasını kolaylaştırmak
            amacıyla geliştirilmiştir.
          </p>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8">
        <div className="mx-auto max-w-4xl space-y-8 text-sm leading-7 text-neutral-700">
          <div>
            <h2 className="text-xl font-semibold text-neutral-950">
              Kullanım amacı
            </h2>
            <p className="mt-2">
              Dokuntag sistemi, kaybolan birey, evcil hayvan, anahtar ve
              eşyaların sahibine ulaştırılması amacıyla kullanılmalıdır.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-neutral-950">
              Sorumluluk
            </h2>
            <p className="mt-2">
              Kullanıcı, paylaştığı bilgilerin doğruluğundan sorumludur.
              Dokuntag®, paylaşılan bilgilerin yanlış kullanımından sorumlu
              tutulamaz.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-neutral-950">
              Güvenlik
            </h2>
            <p className="mt-2">
              Kullanıcıların hassas bilgilerini, özellikle açık adres
              bilgisini, herkese açık şekilde paylaşmamaları önerilir.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-neutral-950">
              Hizmet değişiklikleri
            </h2>
            <p className="mt-2">
              Dokuntag®, hizmet içeriğinde değişiklik yapma hakkını saklı
              tutar.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-neutral-950">
              İletişim
            </h2>
            <p className="mt-2">
              Herhangi bir soru için bizimle iletişime geçebilirsiniz.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}