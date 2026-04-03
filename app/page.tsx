export default function HomePage() {
  return (
    <main className="min-h-screen bg-white px-6 py-12 text-black">
      <div className="mx-auto max-w-3xl">
        <p className="mb-3 text-sm tracking-[0.2em] text-neutral-500 uppercase">
          Dokuntag
        </p>

        <h1 className="text-4xl font-semibold tracking-tight">
          Kaybolanları geri getiren akıllı etiket
        </h1>

        <p className="mt-4 max-w-2xl text-lg text-neutral-600">
          Telefonunu dokundur, profil açılsın, sahibine ulaş.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <a
            href="/t/DT001"
            className="rounded-2xl border border-neutral-200 p-5"
          >
            <p className="text-sm text-neutral-500">Test ürün</p>
            <p className="mt-2 text-xl font-medium">DT001</p>
            <p className="mt-2 text-neutral-600">Kurulmamış ürün örneği</p>
          </a>

          <a
            href="/t/DT002"
            className="rounded-2xl border border-neutral-200 p-5"
          >
            <p className="text-sm text-neutral-500">Test ürün</p>
            <p className="mt-2 text-xl font-medium">DT002</p>
            <p className="mt-2 text-neutral-600">Aktif profil örneği</p>
          </a>
        </div>
      </div>
    </main>
  );
}