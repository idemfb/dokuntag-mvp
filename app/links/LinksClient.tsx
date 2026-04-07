"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

type SavedLink = {
  code: string;
  manageLink: string;
  publicLink: string;
  addedAt: string;
};

const STORAGE_KEY = "dokuntag_saved_links_v1";

function normalizeCode(value: string) {
  return value.trim().toUpperCase();
}

function isValidCode(value: string) {
  const normalized = value.trim().toUpperCase();

  // eski/test kodlar: TEST01, DT001
  // yeni kodlar: D7K4P2
  return /^[A-Z0-9]{4,}$/.test(normalized);
}

function readSavedLinks(): SavedLink[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item) =>
        item &&
        typeof item.code === "string" &&
        typeof item.manageLink === "string" &&
        typeof item.publicLink === "string" &&
        typeof item.addedAt === "string"
    );
  } catch {
    return [];
  }
}

function writeSavedLinks(items: SavedLink[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items, null, 2));
}

function upsertSavedLink(newItem: SavedLink) {
  const current = readSavedLinks();

  const filtered = current.filter(
    (item) =>
      !(
        item.code === newItem.code &&
        item.manageLink.trim() === newItem.manageLink.trim()
      )
  );

  const next = [newItem, ...filtered];
  writeSavedLinks(next);

  return next;
}

function removeSavedLink(code: string, manageLink: string) {
  const current = readSavedLinks();
  const next = current.filter(
    (item) => !(item.code === code && item.manageLink === manageLink)
  );
  writeSavedLinks(next);
  return next;
}

export default function LinksClient() {
  const searchParams = useSearchParams();
  const autoHandledRef = useRef(false);

  const [items, setItems] = useState<SavedLink[]>([]);
  const [code, setCode] = useState("");
  const [manageLink, setManageLink] = useState("");
  const [publicLink, setPublicLink] = useState("");
  const [message, setMessage] = useState("");
  const [copiedText, setCopiedText] = useState("");

  const queryCode = useMemo(
    () => normalizeCode(searchParams.get("code") || ""),
    [searchParams]
  );
  const queryManage = useMemo(() => searchParams.get("manage") || "", [searchParams]);
  const queryPublic = useMemo(() => searchParams.get("public") || "", [searchParams]);

  useEffect(() => {
    setItems(readSavedLinks());
  }, []);

  useEffect(() => {
    if (!queryCode && !queryManage && !queryPublic) return;

    setCode(queryCode);
    setManageLink(queryManage);
    setPublicLink(queryPublic);
  }, [queryCode, queryManage, queryPublic]);

  useEffect(() => {
    if (autoHandledRef.current) return;
    if (!queryCode || !queryManage || !queryPublic) return;
    if (!isValidCode(queryCode)) {
      setMessage("Linkten gelen ürün kodu geçersiz görünüyor.");
      autoHandledRef.current = true;
      return;
    }

    autoHandledRef.current = true;

    const next = upsertSavedLink({
      code: queryCode,
      manageLink: queryManage.trim(),
      publicLink: queryPublic.trim(),
      addedAt: new Date().toISOString()
    });

    setItems(next);
    setMessage(`${queryCode} ürünlerime otomatik eklendi.`);
  }, [queryCode, queryManage, queryPublic]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const normalizedCode = normalizeCode(code);

    if (!isValidCode(normalizedCode)) {
      setMessage("Geçerli bir ürün kodu girin.");
      return;
    }

    if (!manageLink.trim()) {
      setMessage("Manage link zorunlu.");
      return;
    }

    if (!publicLink.trim()) {
      setMessage("Public profil link zorunlu.");
      return;
    }

    const next = upsertSavedLink({
      code: normalizedCode,
      manageLink: manageLink.trim(),
      publicLink: publicLink.trim(),
      addedAt: new Date().toISOString()
    });

    setItems(next);
    setCode("");
    setManageLink("");
    setPublicLink("");
    setMessage(`${normalizedCode} kaydedildi.`);
  }

  async function handleCopy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(""), 1500);
    } catch {
      setMessage("Kopyalama başarısız.");
    }
  }

  function handleRemove(item: SavedLink) {
    const next = removeSavedLink(item.code, item.manageLink);
    setItems(next);
    setMessage(`${item.code} kaldırıldı.`);
  }

  function clearAll() {
    writeSavedLinks([]);
    setItems([]);
    setMessage("Tüm kayıtlı linkler temizlendi.");
  }

  const hasIncomingQuery = Boolean(queryCode && queryManage && queryPublic);

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 text-neutral-900">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Ürünlerim / Linklerim</h1>
            <p className="text-sm text-neutral-600">
              Bu sayfa aynı tarayıcıda ürün linklerini saklar. Login yok, database yok.
              Sadece bu cihazda çalışır.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            {hasIncomingQuery ? "Yeni ürün hazır" : "Yeni ürün linki ekle"}
          </h2>

          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Ürün kodu</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="TEST01"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none ring-0 transition focus:border-neutral-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Manage link</label>
              <input
                value={manageLink}
                onChange={(e) => setManageLink(e.target.value)}
                placeholder="https://dokuntag.com/manage/TEST01?token=..."
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none ring-0 transition focus:border-neutral-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Public profil link</label>
              <input
                value={publicLink}
                onChange={(e) => setPublicLink(e.target.value)}
                placeholder="https://dokuntag.com/p/TEST01"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none ring-0 transition focus:border-neutral-500"
              />
            </div>

            <button
              type="submit"
              className="inline-flex rounded-xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              Kaydet
            </button>
          </form>

          {message ? (
            <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              {message}
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Kayıtlı ürünler</h2>

            {items.length > 0 ? (
              <button
                type="button"
                onClick={clearAll}
                className="rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Hepsini temizle
              </button>
            ) : null}
          </div>

          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-300 px-4 py-6 text-sm text-neutral-500">
              Henüz kayıtlı ürün yok.
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.code}-${item.manageLink}`}
                  className="rounded-2xl border border-neutral-200 p-4"
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-base font-semibold">{item.code}</div>
                      <div className="text-xs text-neutral-500">
                        Eklenme: {new Date(item.addedAt).toLocaleString("tr-TR")}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(item)}
                      className="rounded-xl border border-neutral-300 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      Kaldır
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-xl bg-neutral-50 p-3">
                      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500">
                        Manage Link
                      </div>
                      <div className="break-all text-sm text-neutral-800">
                        {item.manageLink}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <a
                          href={item.manageLink}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:opacity-90"
                        >
                          Yönet
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.manageLink, `${item.code}-manage`)}
                          className="rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                        >
                          {copiedText === `${item.code}-manage` ? "Kopyalandı" : "Manage link kopyala"}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl bg-neutral-50 p-3">
                      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-500">
                        Public Profil
                      </div>
                      <div className="break-all text-sm text-neutral-800">
                        {item.publicLink}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <a
                          href={item.publicLink}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                        >
                          Profili aç
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.publicLink, `${item.code}-public`)}
                          className="rounded-xl border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                        >
                          {copiedText === `${item.code}-public` ? "Kopyalandı" : "Public link kopyala"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Bu kayıtlar sadece bu tarayıcıda tutulur. Farklı cihazda otomatik gelmez.
        </div>
      </div>
    </main>
  );
}