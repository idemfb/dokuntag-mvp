import { NextResponse } from "next/server";
import { findTagByCode } from "@/lib/tags";

type Params = {
  params: Promise<{
    code: string;
  }>;
};

export async function GET(_: Request, { params }: Params) {
  const { code } = await params;
  const tag = findTagByCode(code);

  if (!tag) {
    return NextResponse.json({ error: "Tag not found" }, { status: 404 });
  }

  return NextResponse.json({
    code: tag.code,
    status: tag.status,
    profile: {
      name: tag.visibility.showName ? tag.profile.name : "",
      phone: tag.visibility.showPhone ? tag.profile.phone : "",
      email: tag.visibility.showEmail ? tag.profile.email : "",
      petName: tag.visibility.showPetName ? tag.profile.petName : "",
      note: tag.visibility.showNote ? tag.profile.note : ""
    },
    alerts: tag.alerts,
    messageEnabled: true
  });
}