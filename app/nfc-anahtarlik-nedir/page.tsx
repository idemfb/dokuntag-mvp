import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "NFC anahtarlık nedir?",
  description:
    "NFC anahtarlık nedir, nasıl çalışır ve ne işe yarar? NFC teknolojisi ile kayıp eşyalarınıza nasıl ulaşılabileceğini öğrenin.",
  alternates: {
    canonical: "/nfc-anahtarlik-nedir",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#f7f3ea] px-5 py-16 text-neutral-950 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          NFC anahtarlık nedir?
        </h1>

        <p className="mt-6 text-lg leading-8 text-neutral-600">
          NFC anahtarlık, telefon ile temassız iletişim kurabilen küçük bir
          teknolojik etikettir. Günümüzde özellikle kayıp eşya ve evcil hayvan
          takibi için yaygın olarak kullanılmaktadır.
        </p>

        <h2 className="mt-10 text-2xl font-semibold">
          NFC ne demek?
        </h2>
        <p className="mt-3 leading-7 text-neutral-600">
          NFC (Near Field Communication), kısa mesafede kablosuz veri
          iletişimi sağlayan bir teknolojidir. Telefonunuzu etikete
          yaklaştırdığınızda otomatik olarak bağlantı kurulur.
        </p>

        <h2 className="mt-10 text-2xl font-semibold">
          NFC anahtarlık nasıl çalışır?
        </h2>
        <p className="mt-3 leading-7 text-neutral-600">
          NFC anahtarlık içine yerleştirilen çip sayesinde çalışır. Telefon
          etikete dokundurulduğunda önceden tanımlanmış bağlantı açılır.
          Bu bağlantı bir profil sayfası, iletişim bilgisi veya özel bir sayfa
          olabilir.
        </p>

        <h2 className="mt-10 text-2xl font-semibold">
          NFC anahtarlık ne işe yarar?
        </h2>
        <p className="mt-3 leading-7 text-neutral-600">
          En yaygın kullanım alanı kayıp eşyaların bulunmasını sağlamaktır.
          Anahtar, çanta, valiz veya evcil hayvan tasması üzerine takılarak
          bulan kişinin sahibine ulaşmasını kolaylaştırır.
        </p>

        <h2 className="mt-10 text-2xl font-semibold">
          QR ile farkı nedir?
        </h2>
        <p className="mt-3 leading-7 text-neutral-600">
          QR kod kamerayla okutulur, NFC ise dokunarak çalışır. İki teknoloji
          birlikte kullanıldığında her cihazdan erişim sağlanabilir.
        </p>

        <h2 className="mt-10 text-2xl font-semibold">
          Güvenli mi?
        </h2>
        <p className="mt-3 leading-7 text-neutral-600">
          NFC anahtarlık güvenlidir çünkü hangi bilgilerin gösterileceği
          kullanıcı tarafından belirlenir. Özellikle açık adres paylaşımı
          önerilmez.
        </p>

        <div className="mt-12 rounded-3xl bg-neutral-950 p-8 text-white">
          <h3 className="text-2xl font-semibold">
            Dokuntag® ile farkı ne?
          </h3>

          <p className="mt-4 leading-7 text-neutral-300">
            Dokuntag®, NFC ve QR teknolojisini birlikte kullanarak güvenli bir
            profil sistemi oluşturur. Bulan kişi uygulama indirmeden size
            ulaşabilir. Hangi bilgilerin görüneceğine siz karar verirsiniz.
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