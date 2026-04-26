import Link from "next/link";

const footerLinks = [
  { label: "Ana sayfa", href: "/" },
  { label: "Hikayeler", href: "/hikayeler" },
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "Ön sipariş", href: "/satis" },
  { label: "Gizlilik", href: "/gizlilik" },
  { label: "Kullanım Koşulları", href: "/kullanim-kosullari" },
  { label: "Mesafeli Satış", href: "/mesafeli-satis" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-[#f7f3ea] px-5 py-8 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© Dokuntag®</p>

        <div className="flex flex-wrap gap-4">
          {footerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-neutral-950"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}