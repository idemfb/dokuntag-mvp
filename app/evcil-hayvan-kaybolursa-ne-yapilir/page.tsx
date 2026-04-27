import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Evcil hayvan kaybolursa ne yapılır?",
  description:
    "Evcil hayvan kaybolduğunda yapılması gerekenler. Kedi veya köpeğiniz kaybolursa hızlı ve güvenli şekilde ulaşılmasını kolaylaştıran adımlar.",
  alternates: {
    canonical: "/evcil-hayvan-kaybolursa-ne-yapilir",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#f7f3ea] px-5 py-16 text-neutral-950 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Evcil hayvan kaybolursa ne yapılır?
        </h1>

        <p className="mt-6 text-lg leading-8 text-neutral-600">
          Evcil hayvanın kaybolması çok stresli bir durumdur. İlk dakikalarda
          doğru adımları atmak, bulunma ihtimalini artırır.
        </p>

        <h2 className="mt-10 text-2xl font-semibold">
          1. Son görüldüğü alanı hızlıca kontrol edin
        </h2>
        <p className="mt-3 leading-7 text-neutral-600">
          Kedi veya köpekler genellikle son bulundukları çevrede saklanır ya da
          panikle yakın bir alana yönelir. Önce ev çevresi, apartman girişi,
          bahçe, otopark ve yakın sokaklar kontrol edilmelidir.
        </p>

        <h2 className="mt-10 text-2xl font-semibold">
          2. Yakın çevreye haber verin
        </h2>
        <p className="mt-3 leading-7 text-neutral-600">
          Komşulara, site görevlisine, çevredeki işletmelere ve veterinerlere
          bilgi verin. Net bir fotoğraf ve iletişim yöntemi paylaşmak süreci
          hızlandırır.
        </p>

        <h2 className="mt-10 text-2xl font-semibold">
          3. Sosyal medya ve yerel grupları kullanın
        </h2>
        <p className="mt-3 leading-7 text-neutral-600">
          Bölgenizdeki kayıp hayvan gruplarına, mahalle gruplarına ve sosyal
          medya hesaplarına kayıp ilanı bırakın. Konum, saat ve ayırt edici
          özellikleri kısa ve net yazın.
        </p>

        <h2 className="mt-10 text-2xl font-semibold">
          4. Tasmasında iletişim yolu olsun
        </h2>
        <p className="mt-3 leading-7 text-neutral-600">
          Evcil hayvanı bulan kişi iyi niyetli olsa bile size ulaşacak bir yol
          bulamazsa süreç uzayabilir. Tasmada güvenli bir iletişim etiketi
          bulunması bu nedenle önemlidir.
        </p>

        <h2 className="mt-10 text-2xl font-semibold">
          5. NFC ve QR etiketler hızlı iletişim sağlar
        </h2>
        <p className="mt-3 leading-7 text-neutral-600">
          NFC veya QR destekli bir etiket sayesinde bulan kişi uygulama
          indirmeden profil sayfasına ulaşabilir. Böylece telefon, WhatsApp veya
          e-posta gibi sizin seçtiğiniz iletişim yolları üzerinden size
          ulaşabilir.
        </p>

        <div className="mt-12 rounded-3xl bg-neutral-950 p-8 text-white">
          <h3 className="text-2xl font-semibold">
            Dokuntag® evcil hayvanlar için nasıl yardımcı olur?
          </h3>

          <p className="mt-4 leading-7 text-neutral-300">
            Dokuntag® etiketi tasmaya takıldığında bulan kişi NFC veya QR ile
            güvenli profile ulaşır. Hangi bilgilerin görüneceğini siz
            belirlersiniz; açık adres paylaşmak zorunda değilsiniz.
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