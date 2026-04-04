import { NextResponse } from "next/server";
import { findTagByCode, setupTag } from "@/lib/tags";

type Params = {
  params: Promise<{
    code: string;
  }>;
};

const ALERT_OPTIONS = [
  "Acil bana ulaşın",
  "Hayvanım hasta",
  "Alerjisi var",
  "Ürkek / yaklaşmayın",
  "Ödül verilecektir"
];

export async function GET(_: Request, { params }: Params) {
  const { code } = await params;
  const tag = findTagByCode(code);

  if (!tag) {
    return NextResponse.json({ error: "Tag not found" }, { status: 404 });
  }

  return NextResponse.json({
    code: tag.code,
    status: tag.status,
    profile: tag.profile,
    alerts: tag.alerts,
    visibility: tag.visibility,
    recovery: tag.recovery
  });
}

export async function POST(request: Request, { params }: Params) {
  const { code } = await params;
  const existing = findTagByCode(code);

  if (!existing) {
    return NextResponse.json({ error: "Tag not found" }, { status: 404 });
  }

  const body = await request.json();

  const name = typeof body.name === "string" ? body.name : "";
  const phone = typeof body.phone === "string" ? body.phone : "";
  const email = typeof body.email === "string" ? body.email : "";
  const petName = typeof body.petName === "string" ? body.petName : "";
  const note = typeof body.note === "string" ? body.note : "";

  const alerts = Array.isArray(body.alerts)
    ? body.alerts.filter(
        (item: unknown): item is string =>
          typeof item === "string" && ALERT_OPTIONS.includes(item)
      )
    : [];

  const visibility = {
    showName: Boolean(body.visibility?.showName),
    showPhone: Boolean(body.visibility?.showPhone),
    showEmail: Boolean(body.visibility?.showEmail),
    showPetName: Boolean(body.visibility?.showPetName),
    showNote: Boolean(body.visibility?.showNote)
  };

  const recovery = {
    phone: typeof body.recovery?.phone === "string" ? body.recovery.phone : "",
    email: typeof body.recovery?.email === "string" ? body.recovery.email : ""
  };

  if (!name.trim()) {
    return NextResponse.json(
      { error: "İsim / etiket adı zorunludur." },
      { status: 400 }
    );
  }

  if (!phone.trim()) {
    return NextResponse.json(
      { error: "Telefon zorunludur." },
      { status: 400 }
    );
  }

  if (!petName.trim()) {
    return NextResponse.json(
      { error: "Evcil hayvan adı / ürün adı zorunludur." },
      { status: 400 }
    );
  }

  if (!recovery.phone.trim() && !recovery.email.trim()) {
    return NextResponse.json(
      { error: "En az bir recovery alanı girilmelidir." },
      { status: 400 }
    );
  }

  const updated = setupTag(code, {
    name,
    phone,
    email,
    petName,
    note,
    alerts,
    visibility,
    recovery
  });

  if (!updated) {
    return NextResponse.json({ error: "Tag not found" }, { status: 404 });
  }

  const origin = request.headers.get("origin") || "";
  const managePath = `/manage/${updated.code}?token=${updated.manageToken}`;

  return NextResponse.json({
    success: true,
    code: updated.code,
    redirectTo: `/p/${updated.code}`,
    managePath,
    manageLink: origin ? `${origin}${managePath}` : managePath,
    warning:
      "Bu size özel yönetim linkidir. Profil bilgilerinizi güncellemek için kullanılır. Lütfen güvenli şekilde saklayın ve başkalarıyla paylaşmayın."
  });
}