import { NextResponse } from "next/server";
import tags from "@/data/tags.json";

export async function GET(
  req: Request,
  { params }: { params: { code: string } }
) {
  const code = params.code.toUpperCase();

  const tag = (tags as any[]).find((t) => t.code === code);

  if (!tag) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(tag);
}