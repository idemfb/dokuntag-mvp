"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type SiteHeaderProps = {
  variant?: "default" | "compact";
};

const navItems = [
  { label: "Nasıl çalışır", href: "/#nasil-calisir" },
  { label: "Hikayeler", href: "/hikayeler" },
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "Demo", href: "/p/DKNTG" },
  { label: "QR okut", href: "/scan" },
  { label: "Ürünlerim", href: "/my" },
];

export default function SiteHeader({ variant = "default" }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleTouchStart(event: TouchEvent) {
      touchStartX.current = event.touches[0]?.clientX ?? null;
    }

    function handleTouchEnd(event: TouchEvent) {
      const startX = touchStartX.current;
      const endX = event.changedTouches[0]?.clientX ?? null;

      if (startX === null || endX === null) return;

      const diff = endX - startX;

      if (diff > 80) setOpen(true);
      if (diff < -80) setOpen(false);

      touchStartX.current = null;
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[#f7f3ea]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Dokuntag®
        </Link>

        {variant === "default" ? (
          <nav className="hidden items-center gap-6 text-sm text-neutral-600 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-neutral-950"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        ) : null}

        <div ref={menuRef} className="relative flex items-center gap-3">
          <Link
            href="/satis"
            className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Ön sipariş ver
          </Link>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-full border border-neutral-300 bg-white/70 px-4 py-2 text-sm font-semibold lg:hidden"
            aria-expanded={open}
            aria-label="Menüyü aç"
          >
            Menü
          </button>

          {open ? (
            <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-3xl border border-neutral-200 bg-white p-2 shadow-xl lg:hidden">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-sm hover:bg-neutral-100"
                >
                  {item.label}
                </Link>
              ))}

              <Link
                href="/satis"
                onClick={() => setOpen(false)}
                className="mt-1 block rounded-2xl bg-neutral-950 px-4 py-3 text-sm font-semibold text-white"
              >
                Ön sipariş ver
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}