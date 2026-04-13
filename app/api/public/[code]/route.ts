import { NextRequest, NextResponse } from "next/server";
import { findTagByCode } from "@/lib/tags";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Code missing" },
        { status: 400 }
      );
    }

    const normalizedCode = String(code).trim().toUpperCase();
    const tag = findTagByCode(normalizedCode);

    if (!tag) {
      return NextResponse.json(
        { success: false, message: "Profil bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        publicCode: tag.code,
        oldCode: tag.oldCode || "",
        productType: tag.productType || "item",

        name: tag.profile?.name || "",
        ownerName: tag.profile?.ownerName || "",
        phone: tag.profile?.phone || "",
        email: tag.profile?.email || "",
        city: tag.profile?.city || "",
        addressDetail: tag.profile?.addressDetail || "",
        distinctiveFeature: tag.profile?.distinctiveFeature || "",
        petName: tag.profile?.petName || "",
        note: tag.profile?.note || "",

        alerts: Array.isArray(tag.alerts) ? tag.alerts : [],

        allowDirectCall: Boolean(tag.contactOptions?.allowDirectCall),
        allowDirectWhatsapp: Boolean(tag.contactOptions?.allowDirectWhatsapp),

        contactOptions: {
          allowDirectCall: Boolean(tag.contactOptions?.allowDirectCall),
          allowDirectWhatsapp: Boolean(tag.contactOptions?.allowDirectWhatsapp)
        },

        visibility: {
          showName: Boolean(tag.visibility?.showName),
          showPhone: Boolean(tag.visibility?.showPhone),
          showEmail: Boolean(tag.visibility?.showEmail),
          showCity: Boolean(tag.visibility?.showCity),
          showAddressDetail: Boolean(tag.visibility?.showAddressDetail),
          showPetName: Boolean(tag.visibility?.showPetName),
          showNote: Boolean(tag.visibility?.showNote)
        },

        // legacy fallback
        showName: Boolean(tag.visibility?.showName),
        showPhone: Boolean(tag.visibility?.showPhone),
        showEmail: Boolean(tag.visibility?.showEmail),
        showCity: Boolean(tag.visibility?.showCity),
        showAddressDetail: Boolean(tag.visibility?.showAddressDetail),
        showPetName: Boolean(tag.visibility?.showPetName),
        showNote: Boolean(tag.visibility?.showNote),

        status: tag.status || "unclaimed"
      }
    });
  } catch (error) {
    console.error("PUBLIC_PROFILE_GET_ERROR", error);

    return NextResponse.json(
      { success: false, message: "Public fetch failed" },
      { status: 500 }
    );
  }
}