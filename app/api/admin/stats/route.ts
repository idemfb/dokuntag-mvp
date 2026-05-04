import { NextResponse } from "next/server";
import { readTagsAsync } from "@/lib/tags";

const STATUSES = [
  "production_hold",
  "unclaimed",
  "active",
  "inactive",
  "void"
] as const;

type Status = (typeof STATUSES)[number];

export async function GET() {
  try {
    const tags = await readTagsAsync();

    const counts = {
      total: tags.length,
      production_hold: 0,
      unclaimed: 0,
      active: 0,
      inactive: 0,
      void: 0,
      registered: 0,
      test: 0
    };

    for (const tag of tags) {
      const status: Status =
        STATUSES.includes(tag.status as Status)
          ? (tag.status as Status)
          : "unclaimed";

      counts[status] += 1;

      if (status === "active") {
        counts.registered += 1;
      }

      if (tag.isTest) {
        counts.test += 1;
      }
    }

    return NextResponse.json({
      success: true,
      counts
    });
  } catch (error) {
    console.error("ADMIN_STATS_ERROR", error);

    return NextResponse.json(
      { success: false, error: "İstatistikler alınamadı." },
      { status: 500 }
    );
  }
}