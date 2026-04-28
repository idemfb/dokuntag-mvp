"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type SiteHeaderProps = {
  variant?: "default" | "compact";
};

const navItems = [
  { label: "Nasıl çalışır", href: "/#nasil-calisir" },
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

      if (Math.abs(diff) > 80) {
        setOpen((current) => !current);
      }

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
        <Link
          href="/"
          className="rounded-full px-1 text-lg font-semibold tracking-tight text-neutral-950 transition hover:opacity-75"
          onClick={() => setOpen(false)}
        >
          Dokuntag®
        </Link>

        {variant === "default" ? (
          <nav className="hidden items-center gap-6 text-sm text-neutral-600 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:text-neutral-950"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        ) : null}

        <div ref={menuRef} className="relative flex items-center gap-2">
          <Link
            href="/satis"
            onClick={() => setOpen(false)}
            className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.02] hover:bg-neutral-800"
          >
            İlk üretim için bilgi al
          </Link>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 bg-white/80 shadow-sm transition hover:bg-white active:scale-[0.96] lg:hidden"
            aria-expanded={open}
            aria-label="Menüyü aç"
          >
            <span className="flex h-4 w-4 flex-col justify-center gap-1.5">
              <span className="block h-[2px] w-4 rounded-full bg-neutral-900" />
              <span className="block h-[2px] w-4 rounded-full bg-neutral-900" />
            </span>
          </button>

          {open ? (
            <div className="absolute right-0 top-12 w-72 overflow-hidden rounded-[1.75rem] border border-neutral-200 bg-white/95 p-2 shadow-2xl backdrop-blur lg:hidden">
              <div className="px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                  Dokuntag®
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  Güvenli kayıp buluşturma sistemi
                </p>
              </div>

              <div className="h-px bg-neutral-100" />

              <div className="py-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <Link
                href="/satis"
                onClick={() => setOpen(false)}
                className="mt-1 block rounded-2xl bg-neutral-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                İlk üretim için bilgi al
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}