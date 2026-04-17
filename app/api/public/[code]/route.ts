import { NextRequest, NextResponse } from "next/server";
import { findTagByCodeAsync } from "@/lib/tags";

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

    const tag = await findTagByCodeAsync(normalizedCode);

    if (!tag) {
      return NextResponse.json(
        { success: false, message: "Profil bulunamadı" },
        { status: 404 }
      );
    }

    const resolvedStatus =
      tag.status === "inactive" ? "inactive" : tag.status || "unclaimed";

    if (resolvedStatus === "inactive") {
      return NextResponse.json({
        success: true,
        data: {
          publicCode: tag.code,
          oldCode: tag.oldCode || "",
          productType: tag.productType || "item",
          productSubtype: tag.productSubtype || "",

          name: "",
          ownerName: "",
          phone: "",
          city: "",
          addressDetail: "",
          distinctiveFeature: "",
          petName: "",
          note: "",

          alerts: [],

          allowDirectCall: false,
          allowDirectWhatsapp: false,

          contactOptions: {
            allowDirectCall: false,
            allowDirectWhatsapp: false
          },

          visibility: {
            showName: false,
            showPhone: false,
            showEmail: false,
            showCity: false,
            showAddressDetail: false,
            showPetName: false,
            showNote: false
          },

          showName: false,
          showPhone: false,
          showEmail: false,
          showCity: false,
          showAddressDetail: false,
          showPetName: false,
          showNote: false,

          status: "inactive"
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        publicCode: tag.code,
        oldCode: tag.oldCode || "",
        productType: tag.productType || "item",
        productSubtype: tag.productSubtype || "",

        name: tag.profile?.name || "",
        ownerName: tag.profile?.ownerName || "",
        phone: tag.profile?.phone || "",
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
          showEmail: false,
          showCity: Boolean(tag.visibility?.showCity),
          showAddressDetail: Boolean(tag.visibility?.showAddressDetail),
          showPetName: Boolean(tag.visibility?.showPetName),
          showNote: Boolean(tag.visibility?.showNote)
        },

        showName: Boolean(tag.visibility?.showName),
        showPhone: Boolean(tag.visibility?.showPhone),
        showEmail: false,
        showCity: Boolean(tag.visibility?.showCity),
        showAddressDetail: Boolean(tag.visibility?.showAddressDetail),
        showPetName: Boolean(tag.visibility?.showPetName),
        showNote: Boolean(tag.visibility?.showNote),

        status: resolvedStatus
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