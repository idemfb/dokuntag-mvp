import { NextRequest, NextResponse } from "next/server";
import { readNotifyLog } from "@/lib/notify";
import { readTags } from "@/lib/tags";

function normalizePhone(value: string) {
  return String(value || "").replace(/[^0-9]/g, "");
}

function normalizeEmail(value: string) {
  return String(value || "").trim().toLowerCase();
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const phone = normalizePhone(searchParams.get("phone") || "");
    const email = normalizeEmail(searchParams.get("email") || "");
    const excludeCode = String(searchParams.get("excludeCode") || "")
      .trim()
      .toUpperCase();

    if (!phone && !email) {
      return NextResponse.json({
        ok: true,
        hasMatch: false,
        unreadCount: 0,
        matchedProducts: []
      });
    }

    const tags = readTags();
    const logs = await readNotifyLog();

    const matchedProducts = tags.filter((tag) => {
      if (excludeCode && tag.code === excludeCode) {
        return false;
      }

      const profilePhone = normalizePhone(tag.profile.phone || "");
      const recoveryPhone = normalizePhone(tag.recovery.phone || "");
      const profileEmail = normalizeEmail(tag.profile.email || "");
      const recoveryEmail = normalizeEmail(tag.recovery.email || "");

      const phoneMatched =
        Boolean(phone) &&
        (phone === profilePhone || phone === recoveryPhone);

      const emailMatched =
        Boolean(email) &&
        (email === profileEmail || email === recoveryEmail);

      return phoneMatched || emailMatched;
    });

    const matchedCodes = new Set(matchedProducts.map((item) => item.code));

    const unreadCount = logs.filter((item) => {
      return (
        matchedCodes.has(String(item.tagCode || "").trim().toUpperCase()) &&
        !item.deletedAt &&
        !item.archivedAt &&
        !item.readAt
      );
    }).length;

    return NextResponse.json({
      ok: true,
      hasMatch: matchedProducts.length > 0,
      unreadCount,
      matchedProducts: matchedProducts.map((item) => ({
        code: item.code,
        productType: item.productType,
        displayName: item.profile.petName || item.profile.name || item.code
      }))
    });
  } catch (error) {
    console.error("SETUP_CONTACT_INSIGHTS_GET_ERROR", error);

    return NextResponse.json(
      {
        ok: false,
        error: "İletişim bilgileri kontrol edilemedi."
      },
      { status: 500 }
    );
  }
}