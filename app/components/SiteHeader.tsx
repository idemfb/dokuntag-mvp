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
  const panelRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function handleTouchStart(event: TouchEvent) {
      touchStartX.current = event.touches[0]?.clientX ?? null;
    }

    function handleTouchEnd(event: TouchEvent) {
      if (!open) return;

      const startX = touchStartX.current;
      const endX = event.changedTouches[0]?.clientX ?? null;

      if (startX === null || endX === null) return;

      if (startX - endX > 60) {
        setOpen(false);
      }

      touchStartX.current = null;
    }

    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[#f7f3ea]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="text-lg font-semibold tracking-tight text-neutral-950 transition hover:opacity-75"
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

        <div className="flex items-center gap-2">
          <Link
            href="/satis"
            onClick={() => setOpen(false)}
            className="hidden rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-neutral-800 sm:inline-flex"
          >
            İlk üretim için bilgi al
          </Link>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 bg-white shadow-sm transition hover:bg-neutral-50 active:scale-[0.96] lg:hidden"
            aria-label="Menüyü aç"
            aria-expanded={open}
          >
            <span className="flex flex-col gap-1.5">
              <span className="h-[2px] w-5 rounded-full bg-neutral-900" />
              <span className="h-[2px] w-5 rounded-full bg-neutral-900" />
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Menüyü kapat"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[70] cursor-default bg-[#f7f3ea]/85 backdrop-blur-2xl"
          />

          <div
            ref={panelRef}
            className="fixed right-0 top-0 z-[80] h-dvh w-[86%] max-w-sm border-l border-neutral-200 bg-[#f7f3ea] shadow-2xl"
          >
            <div className="flex h-full flex-col p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
                    Dokuntag®
                  </p>
                  <p className="mt-1 text-sm text-neutral-600">
                    Güvenle buluşturma sistemi
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-white text-xl leading-none text-neutral-800 shadow-sm transition hover:bg-neutral-50 active:scale-[0.96]"
                  aria-label="Menüyü kapat"
                >
                  ×
                </button>
              </div>

              <div className="mt-8 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl bg-white px-4 py-3 text-base font-semibold text-neutral-900 shadow-sm transition hover:bg-neutral-950 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <Link
                href="/satis"
                onClick={() => setOpen(false)}
                className="mt-6 block rounded-2xl bg-neutral-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                İlk üretim için bilgi al
              </Link>

              <p className="mt-auto pt-8 text-xs leading-5 text-neutral-500">
                Bir kere alırsın · Yıllık ücret yok · Uygulama gerekmez
              </p>
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}