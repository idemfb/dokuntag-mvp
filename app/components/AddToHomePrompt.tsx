"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function AddToHomePrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches;

    if (isStandalone) return;

    const timer = setTimeout(() => {
      setVisible(true);
    }, 1500);

    function handler(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setVisible(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
      <div className="mx-auto max-w-md rounded-3xl bg-white shadow-2xl border border-neutral-200 p-5">

        {/* HEADER */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center text-lg font-semibold">
            D
          </div>

          <div>
            <p className="text-sm font-semibold">Dokuntag</p>
            <p className="text-xs text-neutral-500">
              Dokun • Bul • Buluştur
            </p>
          </div>
        </div>

        {/* TEXT */}
        <div className="mt-4">
          <p className="text-base font-semibold">
            Ana ekrana ekle
          </p>

          <p className="mt-1 text-sm text-neutral-600">
            Uygulama gibi hızlı erişim sağlayın.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-5 flex flex-col gap-2">
  <button
    onClick={handleInstall}
    className="w-full rounded-full bg-black text-white py-3 text-sm font-semibold"
  >
    Ana ekrana ekle
  </button>

  <a
    href="/scan"
    className="w-full text-center rounded-full border border-neutral-300 py-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
  >
    QR okut
  </a>

  <button
    onClick={() => setVisible(false)}
    className="text-xs text-neutral-400 mt-1"
  >
    Kapat
  </button>
</div>

        {/* FALLBACK */}
        {!deferredPrompt && (
          <p className="mt-3 text-[11px] text-neutral-400 text-center">
            Menüden “Ana ekrana ekle” seçeneğini kullanabilirsiniz
          </p>
        )}
      </div>
    </div>
  );
}