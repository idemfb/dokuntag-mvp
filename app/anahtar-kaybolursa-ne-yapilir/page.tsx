import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Anahtar kaybolursa ne yapılır?",
  description:
    "Anahtar kaybolduğunda yapılması gereken adımlar. Güvenli şekilde anahtarınızı geri bulmanın yolları.",
  alternates: {
    canonical: "/anahtar-kaybolursa-ne-yapilir",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#f7f3ea] text-neutral-950 px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Anahtar kaybolursa ne yapılır?
        </h1>

        <p className="mt-6 text-lg text-neutral-600">
          Anahtar kaybetmek günlük hayatta en sık yaşanan sorunlardan biridir.
          Özellikle ev veya araç anahtarı kaybolduğunda hem güvenlik hem de
          maliyet açısından önemli sonuçlar doğurabilir.
        </p>

        <h2 className="mt-10 text-2xl font-semibold">
          1. Panik yapmayın ve son konumu düşünün
        </h2>
        <p className="mt-3 text-neutral-600">
          Anahtarlar genellikle son kullanıldığı yerde unutulur. Son bulunduğunuz
          yerleri sakin şekilde gözden geçirmek çoğu zaman çözüm sağlar.
        </p>

        <h2 className="mt-10 text-2xl font-semibold">
          2. Olası yerleri kontrol edin
        </h2>
        <p className="mt-3 text-neutral-600">
          Çanta, araç içi, masa, kafe veya iş yeri gibi son bulunduğunuz
          alanları kontrol edin.
        </p>

        <h2 className="mt-10 text-2xl font-semibold">
          3. Güvenlik riskini değerlendirin
        </h2>
        <p className="mt-3 text-neutral-600">
          Anahtarınız üzerinde adres veya kimlik bilgisi varsa kilit değişimi
          gerekebilir. Bu nedenle anahtar üzerinde açık adres bulundurmak
          önerilmez.
        </p>

        <h2 className="mt-10 text-2xl font-semibold">
          4. İletişim bilgisi olan bir etiket kullanın
        </h2>
        <p className="mt-3 text-neutral-600">
          Günümüzde anahtarların üzerine iletişim sağlayan etiketler eklemek,
          kaybolduğunda bulunma ihtimalini ciddi şekilde artırır.
        </p>

        <h2 className="mt-10 text-2xl font-semibold">
          5. NFC ve QR etiketler çözüm olabilir
        </h2>
        <p className="mt-3 text-neutral-600">
          NFC ve QR teknolojisi sayesinde anahtarı bulan kişi, herhangi bir
          uygulama indirmeden sahibine ulaşabilir. Bu yöntem, klasik isim etiketi
          yöntemlerinden çok daha güvenlidir.
        </p>

        <div className="mt-12 rounded-3xl bg-neutral-950 p-8 text-white">
          <h3 className="text-2xl font-semibold">
            Dokuntag® ile anahtarınızı kaybettiğinizde ne olur?
          </h3>

          <p className="mt-4 text-neutral-300">
            Dokuntag® kullanıldığında anahtarı bulan kişi etiketi okutur ve
            sizin belirlediğiniz iletişim bilgilerine ulaşır. Adres paylaşmanıza
            gerek kalmadan güvenli şekilde iletişim kurulabilir.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/satis"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-950"
            >
              Ön sipariş ver
            </Link>

            <Link
              href="/p/DKNTG"
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white"
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