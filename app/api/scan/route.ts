import { NextResponse } from "next/server";
import { findTagByCodeAsync } from "@/lib/tags";
import { addScanLog } from "@/lib/scan";
import { sendScanViewNotificationEmail } from "@/lib/mailer";
import {
  canSendScanNotification,
  markScanNotificationSent
} from "@/lib/scanSettings";

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeCode(value: unknown) {
  return getString(value).toUpperCase();
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const code = normalizeCode(body.code);

    if (!code) {
      return NextResponse.json({ success: true, skipped: true });
    }

    if (["DKNTG", "DEMO01", "DEMO02", "DEMO03"].includes(code)) {
      return NextResponse.json({ success: true, skipped: true });
    }

    const tag = await findTagByCodeAsync(code);

    if (!tag || tag.status !== "active") {
      return NextResponse.json({ success: true, skipped: true });
    }

    const result = await addScanLog({
      tagCode: code,
      ip: getClientIp(request),
      userAgent: request.headers.get("user-agent") || "unknown",
      source: "public_profile"
    });

    if (result.added) {
      const notificationCheck = await canSendScanNotification(code);

      if (notificationCheck.allowed) {
        const email = tag.recovery?.email || tag.profile?.email || "";

        if (email) {
          const productName =
            tag.profile?.petName ||
            tag.profile?.name ||
            tag.profile?.tagName ||
            tag.code;

          await sendScanViewNotificationEmail({
            to: email,
            tagCode: code,
            productName,
            viewedAt: new Date().toISOString()
          });

          await markScanNotificationSent(code);
        }
      }
    }

    return NextResponse.json({
      success: true,
      logged: result.added
    });
  } catch (error) {
    console.error("SCAN_POST_ERROR", error);

    return NextResponse.json({ success: true, skipped: true });
  }
}