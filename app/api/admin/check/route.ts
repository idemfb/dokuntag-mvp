import { NextResponse } from "next/server";
import { findTagByCodeAsync, readTagsAsync } from "@/lib/tags";

function normalizeCode(value: unknown) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);
}

function toCheckItem(tag: Awaited<ReturnType<typeof findTagByCodeAsync>>) {
  if (!tag) return null;

  return {
    code: tag.code,
    status: tag.status,
    isTest: tag.isTest || false,
    name: tag.profile?.name || tag.profile?.petName || "",
    ownerName: tag.profile?.ownerName || ""
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = normalizeCode(searchParams.get("code"));
    const mode = searchParams.get("mode");

    if (mode === "pending") {
      const tags = await readTagsAsync();

      const items = tags
        .filter((tag) => tag.status === "production_hold")
        .map((tag) => ({
          code: tag.code,
          status: tag.status,
          isTest: tag.isTest || false,
          name: tag.profile?.name || tag.profile?.petName || "",
          ownerName: tag.profile?.ownerName || ""
        }))
        .sort((a, b) => a.code.localeCompare(b.code, "tr"));

      return NextResponse.json({
        success: true,
        items,
        count: items.length
      });
    }

    if (!code) {
      return NextResponse.json({ error: "Kod gerekli" }, { status: 400 });
    }

    const tag = await findTagByCodeAsync(code);

    if (!tag) {
      return NextResponse.json({ error: "Kod bulunamadı" }, { status: 404 });
    }

    const item = toCheckItem(tag);

    return NextResponse.json(item);
  } catch (error) {
    console.error("ADMIN_CHECK_GET_ERROR", error);

    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}