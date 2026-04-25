"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

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

function getPromptStorageKey(pathname: string) {
  if (pathname.startsWith("/manage/")) {
    return "dokuntag_manage_install_prompt_closed";
  }

  return "dokuntag_install_prompt_closed";
}

export default function AddToHomePrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [pathname, setPathname] = useState("");

  const isManagePage = useMemo(() => {
    return pathname.startsWith("/manage/");
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const currentPathname = window.location.pathname;
    const storageKey = getPromptStorageKey(currentPathname);

    setPathname(currentPathname);
    setIsIOS(isIOSDevice());

    if (isStandaloneMode()) {
      return;
    }

    if (window.localStorage.getItem(storageKey) === "1") {
      return;
    }

    if (isIOSDevice()) {
      const timer = window.setTimeout(() => {
        setIsVisible(true);
      }, 2200);

      return () => window.clearTimeout(timer);
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);

      const timer = window.setTimeout(() => {
        setIsVisible(true);
      }, 1600);

      return () => window.clearTimeout(timer);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      closePrompt();
    }

    setDeferredPrompt(null);
  }

  function closePrompt() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(getPromptStorageKey(pathname), "1");
    }

    setIsVisible(false);
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="mx-auto max-w-xl rounded-[1.75rem] border border-neutral-200 bg-white/95 p-4 shadow-2xl backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-950 text-sm font-semibold text-white">
            D
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-neutral-950">
              {isManagePage
                ? "Bu ürünün yönetimini kaydedin"
                : "Dokuntag’ı ana ekrana ekleyin"}
            </p>

            <p className="mt-1 text-sm leading-6 text-neutral-600">
              {isManagePage
                ? "Yönetim bağlantınız kişiseldir. Bu sayfayı kendi cihazınızın ana ekranına ekleyerek ürüne daha hızlı ulaşabilirsiniz."
                : "Dokuntag’ı telefonunuzda uygulama gibi açmak için ana ekrana ekleyebilirsiniz."}
            </p>

            {isIOS ? (
              <div className="mt-3 rounded-2xl bg-[#f7f3ea] px-4 py-3 text-xs leading-5 text-neutral-700">
                iPhone’da: Paylaş simgesine dokunun, ardından{" "}
                <strong>Ana Ekrana Ekle</strong> seçeneğini kullanın.
              </div>
            ) : null}

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              {deferredPrompt ? (
                <button
                  type="button"
                  onClick={() => void handleInstall()}
                  className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  Ana ekrana ekle
                </button>
              ) : null}

              {isManagePage ? (
                <Link
                  href="/my"
                  className="rounded-full border border-neutral-300 px-5 py-3 text-center text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
                >
                  Ürünlerim
                </Link>
              ) : (
                <Link
                  href="/scan"
                  className="rounded-full border border-neutral-300 px-5 py-3 text-center text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
                >
                  QR okut
                </Link>
              )}

              <button
                type="button"
                onClick={closePrompt}
                className="rounded-full px-5 py-3 text-sm font-semibold text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
              >
                Daha sonra
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}