export default function Loading() {
  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-8 text-neutral-900 sm:px-5 sm:py-10">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[2rem] border border-neutral-200 bg-white px-6 py-7 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">
            Dokuntag
          </p>
          <div className="mt-4 space-y-3">
            <div className="h-8 w-40 animate-pulse rounded-full bg-neutral-200" />
            <div className="h-4 w-full animate-pulse rounded-full bg-neutral-200" />
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-neutral-200" />
          </div>
        </div>
      </div>
    </main>
  );
}