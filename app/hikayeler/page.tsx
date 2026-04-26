import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dokuntag® Hikayeleri",
  description:
    "Kaybolan anahtar, evcil hayvan, çanta ve değer verilen eşyaların Dokuntag® ile sahibine nasıl ulaşabileceğini anlatan örnek hikayeler.",
  alternates: {
    canonical: "/hikayeler",
  },
  openGraph: {
    title: "Dokuntag® Hikayeleri",
    description:
      "Küçük bir etiket, kaybolan ile sahibi arasında büyük bir fark yaratır.",
    url: "https://dokuntag.com/hikayeler",
    images: [
      {
        url: "/images/pet-tag.jpg",
        width: 1200,
        height: 630,
        alt: "Dokuntag hikayeleri",
      },
    ],
  },
};

const stories = [
  {
    title: "Kaybolan anahtar geri geldi",
    text: "Ali anahtarını bir kafede unuttu. Masayı temizleyen kişi anahtardaki Dokuntag® etiketini fark etti. QR kodu okuttu ve Ali’ye ulaştı. Aynı gün içinde anahtar geri teslim edildi.",
    image: "/images/lost-key.jpg",
  },
  {
    title: "Evcil hayvanına saatler içinde ulaştı",
    text: "Mia parkta tasmasından kurtulup uzaklaştı. Onu bulan kişi tasmadaki Dokuntag® etiketini okuttu. Sahibine ulaşıldı ve kısa sürede buluştular.",
    image: "/images/pet-tag.jpg",
  },
  {
    title: "Çanta unutuldu ama kaybolmadı",
    text: "Ayşe çantasını bir takside unuttu. Şoför çantadaki etiketi fark etti ve QR ile iletişim kurdu. Çanta ertesi gün sahibine ulaştı.",
    image: "/images/bag-tag.jpg",
  },
  {
    title: "Birine ulaşmak hayat kurtarabilir",
    text: "Kalabalıkta yalnız kalan bir bireyin çantasındaki Dokuntag® etiketi sayesinde yakınına ulaşıldı. Doğru bilgi, doğru kişiye ulaştı.",
    image: "/images/relief-phone.jpg",
  },
];

export default function StoriesPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ea] text-neutral-950">
      <section className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">
            Hikayeler
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            Küçük bir etiket, büyük bir fark yaratır.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
            Dokuntag®, kaybolan ile sahibi arasında bir bağlantı kurar.
            Aşağıdaki senaryolar, bu sistemin gerçek hayatta nasıl çalıştığını
            gösterir.
          </p>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          {stories.map((item) => (
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
                <h2 className="text-2xl font-semibold">{item.title}</h2>

                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8">
        <div className="mx-auto max-w-4xl rounded-[2.5rem] bg-neutral-950 p-10 text-center text-white">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Sizin hikayeniz nasıl bitecek?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-neutral-300">
            Kaybolduğunda ne olacağını şansa bırakmayın. Dokuntag® ile
            bağlantıyı önceden kurun.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/satis"
              className="rounded-full bg-white px-8 py-4 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
            >
              Ön sipariş ver
            </Link>

            <Link
              href="/p/DKNTG"
              className="rounded-full border border-white/30 px-8 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Demo profil gör
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}