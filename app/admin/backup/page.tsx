"use client";
import AdminBackButton from "../components/AdminBackButton";
import AdminPageHeader from "../components/AdminPageHeader";

const files = [
  
  {
    name: "tags.json",
    description: "Ürün ve profil kayıtları",
    href: "/api/admin/backup/download?file=tags"
  },
  {
    name: "notify-log.json",
    description: "Mesaj ve notify kayıtları",
    href: "/api/admin/backup/download?file=notify"
  },
  {
  name: "db.json",
  description: "Ana production veritabanı",
  href: "/api/admin/backup/download?file=db"
}

];

export default function AdminBackupPage() {
  return (
    <main className="min-h-screen bg-neutral-50 p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <AdminPageHeader
  title="Backup Merkezi"
  description="Production verilerini manuel yedekleyin."
  actions={<AdminBackButton />}
/>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
  <h2 className="text-base font-semibold text-amber-900">
    Production Backup Önerisi
  </h2>

  <div className="mt-3 space-y-2 text-sm leading-6 text-amber-800">
    <p>
      • Büyük değişikliklerden önce manuel backup alın.
    </p>

    <p>
      • Özellikle ürün üretimi, batch işlemleri ve transfer sonrası backup önerilir.
    </p>

    <p>
      • Backup dosyalarını harici disk veya cloud üzerinde saklayın.
    </p>
  </div>
  
</div>
<div className="rounded-2xl border border-neutral-200 bg-white p-5">
  <h2 className="text-base font-semibold text-neutral-900">
    Tek Tık Full Backup
  </h2>

  <p className="mt-2 text-sm leading-6 text-neutral-500">
    db.json, tags.json, notify-log.json ve recover-log.json dosyalarını tek JSON backup içinde indirir.
  </p>

  <a
    href="/api/admin/backup/full"
    className="mt-4 inline-flex rounded-2xl bg-neutral-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
  >
    Tüm backup dosyasını indir
  </a>
</div>
        <div className="grid gap-4 md:grid-cols-3">
          {files.map((item) => (
            <div
              key={item.name}
              className="rounded-2xl border border-neutral-200 bg-white p-5"
            >
              <div className="text-sm font-semibold text-neutral-900">
                {item.name}
              </div>

              <p className="mt-2 text-xs leading-5 text-neutral-500">
                {item.description}
              </p>

              <a
                href={item.href}
                className="mt-4 inline-flex rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
              >
                İndir
              </a>
              
            </div>
            
          ))}
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
  <h2 className="text-base font-semibold text-neutral-900">
    Güvenlik Notu
  </h2>

  <p className="mt-2 text-sm leading-6 text-neutral-500">
    Backup dosyaları ürün, mesaj ve kurtarma kayıtları içerebilir. Bu dosyaları herkese açık alanda paylaşmayın.
  </p>

  <p className="mt-2 text-sm leading-6 text-neutral-500">
    Restore işlemi şimdilik eklenmedi. Yanlış veri yükleme riski nedeniyle production öncesi ayrıca kontrollü tasarlanmalıdır.
  </p>
</div>
      </div>
    </main>
  );
}