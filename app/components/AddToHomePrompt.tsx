"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

const INSTALLED_KEY = "dokuntag_pwa_installed";

function isStandaloneMode() {
  if (typeof window === "undefined") return false;

  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

function isIOSDevice() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export default function AddToHomePrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [pathname, setPathname] = useState("");

  const cardRef = useRef<HTMLDivElement | null>(null);

  const isManagePage = useMemo(() => pathname.startsWith("/manage/"), [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setPathname(window.location.pathname);
    setIsIOS(isIOSDevice());

    if (
      isStandaloneMode() ||
      window.localStorage.getItem(INSTALLED_KEY) === "1"
    ) {
      setIsVisible(false);
      setIsMinimized(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setIsVisible(true);
      setIsMinimized(false);
    }, 1200);

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setIsVisible(true);
      setIsMinimized(false);
      setShowGuide(false);
    }

    function handleAppInstalled() {
      window.localStorage.setItem(INSTALLED_KEY, "1");
      setIsVisible(false);
      setIsMinimized(false);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!isVisible || isMinimized) return;
      if (!cardRef.current) return;

      if (!cardRef.current.contains(event.target as Node)) {
        setIsVisible(false);
        setIsMinimized(true);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isVisible, isMinimized]);

  async function handleInstallClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === "accepted") {
        window.localStorage.setItem(INSTALLED_KEY, "1");
        setIsVisible(false);
        setIsMinimized(false);
      }

      setDeferredPrompt(null);
      return;
    }

    setShowGuide(true);
  }

  function minimizePrompt() {
    setIsVisible(false);
    setIsMinimized(true);
  }

  function openPrompt() {
    setIsVisible(true);
    setIsMinimized(false);
  }

  if (!isVisible && !isMinimized) return null;

  return (
    <>
      {isVisible ? (
        <div className="fixed inset-x-0 bottom-0 z-[100] px-4 pb-4 sm:px-6 sm:pb-6">
          <div
            ref={cardRef}
            className="relative mx-auto max-w-lg rounded-[1.5rem] border border-neutral-200 bg-white/95 p-4 pr-11 shadow-2xl backdrop-blur"
          >
            <button
              type="button"
              onClick={minimizePrompt}
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-base leading-none text-neutral-500 transition hover:bg-neutral-200 hover:text-neutral-900"
              aria-label="Ana ekrana ekle kartını küçült"
            >
              ×
            </button>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f7f3ea] text-sm font-semibold text-neutral-950 ring-1 ring-neutral-200">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-950 text-[11px] text-white">
                  D
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="pr-3 text-sm font-semibold text-neutral-950">
                  {isManagePage
                    ? "Bu ürünün yönetimini kaydedin"
                    : "Dokuntag®’ı ana ekrana ekleyin"}
                </p>

                <p className="mt-1 text-xs leading-5 text-neutral-600">
                  {isManagePage
                    ? "Yönetim bağlantınız kişiseldir. Kendi cihazınızın ana ekranına ekleyerek daha hızlı ulaşabilirsiniz."
                    : "Telefonunuzda uygulama gibi açmak için ana ekrana ekleyebilirsiniz."}
                </p>

                {showGuide ? (
                  <div className="mt-3 rounded-2xl bg-[#f7f3ea] px-3 py-2.5 text-xs leading-5 text-neutral-700">
                    {isIOS ? (
                      <>
                        iPhone’da Safari üzerinden paylaş simgesine dokunun ve{" "}
                        <span className="inline-flex rounded-full bg-white px-2 py-0.5 font-semibold text-neutral-950 ring-1 ring-neutral-200">
                          Ana Ekrana Ekle
                        </span>{" "}
                        seçeneğini kullanın.
                      </>
                    ) : (
                      <>
                        Tarayıcınızın paylaşım veya menü simgesinden{" "}
                        <span className="inline-flex rounded-full bg-white px-2 py-0.5 font-semibold text-neutral-950 ring-1 ring-neutral-200">
                          Uygulamayı yükle
                        </span>{" "}
                        ya da{" "}
                        <span className="inline-flex rounded-full bg-white px-2 py-0.5 font-semibold text-neutral-950 ring-1 ring-neutral-200">
                          Ana ekrana ekle
                        </span>{" "}
                        seçeneğini kullanabilirsiniz.
                      </>
                    )}
                  </div>
                ) : null}

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => void handleInstallClick()}
                    className="rounded-full bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-neutral-800"
                  >
                    Ana ekrana ekle
                  </button>

                  {isManagePage ? (
                    <Link
                      href="/my"
                      className="rounded-full border border-neutral-300 px-4 py-2.5 text-center text-xs font-semibold text-neutral-800 transition hover:bg-neutral-50"
                    >
                      Ürünlerim
                    </Link>
                  ) : (
                    <Link
                      href="/scan"
                      className="rounded-full border border-neutral-300 px-4 py-2.5 text-center text-xs font-semibold text-neutral-800 transition hover:bg-neutral-50"
                    >
                      QR okut
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isMinimized ? (
        <button
          type="button"
          onClick={openPrompt}
          className="fixed bottom-4 right-4 z-[100] flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-200 bg-white/95 text-sm font-semibold text-neutral-950 shadow-xl backdrop-blur transition hover:scale-[1.03] hover:bg-white"
          aria-label="Ana ekrana ekle kartını aç"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f7f3ea] ring-1 ring-neutral-200">
            D
          </span>
        </button>
      ) : null}
    </>
  );
}