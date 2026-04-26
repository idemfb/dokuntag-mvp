import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mesafeli Satış Bilgilendirmesi",
  description:
    "Dokuntag® One mesafeli satış bilgilendirmesi: satış modeli, teslimat, iade, iptal ve kullanım koşulları hakkında genel bilgiler.",
  alternates: {
    canonical: "/mesafeli-satis",
  },
  openGraph: {
    title: "Dokuntag® Mesafeli Satış Bilgilendirmesi",
    description:
      "Dokuntag® One fiziksel ürün satış süreci, teslimat ve iade bilgilendirmesi.",
    url: "https://dokuntag.com/mesafeli-satis",
    images: [
      {
        url: "/images/product-key.jpg",
        width: 1200,
        height: 630,
        alt: "Dokuntag mesafeli satış bilgilendirmesi",
      },
    ],
  },
};

export default function DistanceSalesPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ea] text-neutral-950">
      <section className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">
            Mesafeli Satış
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Mesafeli satış bilgilendirmesi
          </h1>

          <p className="mt-6 leading-7 text-neutral-600">
            Bu sayfa, Dokuntag® ürünlerinin uzaktan satış süreçleri için genel
            bilgilendirme amacıyla hazırlanmıştır.
          </p>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8">
        <div className="mx-auto max-w-4xl space-y-8 text-sm leading-7 text-neutral-700">
          <div>
            <h2 className="text-xl font-semibold text-neutral-950">
              Satış modeli
            </h2>
            <p className="mt-2">
              Dokuntag® One fiziksel ürün olarak sunulmaktadır. Satış süreci ve
              teslimat detayları sipariş aşamasında ayrıca belirtilir.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-neutral-950">
              Teslimat
            </h2>
            <p className="mt-2">
              Ürün teslimatına ilişkin süre ve yöntemler sipariş sırasında
              kullanıcıya bildirilir.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-neutral-950">
              İade ve iptal
            </h2>
            <p className="mt-2">
              İade ve iptal koşulları yürürlükteki mevzuata uygun şekilde
              belirlenir ve sipariş sırasında kullanıcıya sunulur.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-neutral-950">
              Kullanım
            </h2>
            <p className="mt-2">
              Dokuntag® ürünleri, kaybolan ürünlerin sahibine ulaştırılması
              amacıyla kullanılmalıdır.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-neutral-950">
              Güncellemeler
            </h2>
            <p className="mt-2">
              Dokuntag®, satış ve teslimat süreçlerinde değişiklik yapma
              hakkını saklı tutar.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}