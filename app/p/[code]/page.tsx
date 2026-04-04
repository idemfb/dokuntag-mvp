import { findTagByCode } from "@/lib/tags";

export default async function PublicPage({
  params
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const tag = findTagByCode(code);

  if (!tag) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Tag bulunamadı.</p>
      </main>
    );
  }

  const { profile, visibility, alerts } = tag;

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-neutral-900">
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="text-2xl font-semibold">Dokuntag</h1>

        <div className="rounded-2xl border p-5 space-y-3">
          {visibility.showName && profile.name && (
            <p><strong>İsim:</strong> {profile.name}</p>
          )}

          {visibility.showPetName && profile.petName && (
            <p><strong>Ad:</strong> {profile.petName}</p>
          )}

          {visibility.showPhone && profile.phone && (
            <p><strong>Telefon:</strong> {profile.phone}</p>
          )}

          {visibility.showEmail && profile.email && (
            <p><strong>Email:</strong> {profile.email}</p>
          )}

          {visibility.showNote && profile.note && (
            <p><strong>Not:</strong> {profile.note}</p>
          )}
        </div>

        {alerts.length > 0 && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="font-medium text-red-700 mb-2">Uyarılar</p>
            <ul className="text-sm space-y-1">
              {alerts.map((a) => (
                <li key={a}>• {a}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-2xl border p-5">
          <p className="text-sm text-neutral-600">
            Sahibe ulaşmak için mesaj gönder:
          </p>

          <form className="mt-4 space-y-3" method="POST" action="/api/notify">
            <input
              type="hidden"
              name="code"
              value={code}
            />

            <textarea
              name="message"
              required
              placeholder="Mesajınızı yazın"
              className="w-full border rounded-xl p-3"
            />

            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-xl"
            >
              Mesaj gönder
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}