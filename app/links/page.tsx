import { Suspense } from "react";
import LinksClient from "./LinksClient";

function LinksPageFallback() {
  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 text-neutral-900">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Ürünlerim / Linklerim</h1>
            <p className="text-sm text-neutral-600">Yükleniyor...</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LinksPage() {
  return (
    <Suspense fallback={<LinksPageFallback />}>
      <LinksClient />
    </Suspense>
  );
}