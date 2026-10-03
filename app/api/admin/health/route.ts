import { NextResponse } from "next/server";
import { getNotifyChannels } from "@/lib/notifyChannels";
import { getServiceHealth } from "@/lib/serviceHealth";
import { getAbuseSummaryAsync } from "@/lib/security/abuseLog";
import { readNotifyLog } from "@/lib/notify";
import { readTagsAsync } from "@/lib/tags";
import { isMailConfigured } from "@/lib/mailer";
import {
  addAdminActionLog,
  getAdminActionSummaryAsync
} from "@/lib/adminActionLog";
import { buildNotifyAnalytics } from "@/lib/notifyAnalytics";
import { getSmsAnalyticsSummaryAsync } from "@/lib/smsAnalytics";
import { getSmsHealth } from "@/lib/smsHealth";
import { getPushHealth } from "@/lib/pushHealth";
import { getBackupStorageMode } from "@/lib/backupData";
import {
  isMaintenanceMode,
  isNotifyDisabled,
  isPushDisabled,
  isSmsDisabled
} from "@/lib/productionFlags";
function getLastHoursDate(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

export async function GET() {
  try {
const [logs, tags, abuseSummary, smsAnalytics, adminActions] =
  await Promise.all([
    readNotifyLog(),
    readTagsAsync(),
    getAbuseSummaryAsync(),
    getSmsAnalyticsSummaryAsync(),
    getAdminActionSummaryAsync()
  ]);

    const generatedAt = new Date();
    if (isMaintenanceMode()) {
  addAdminActionLog({
    type: "maintenance_mode",
    message: "Bakım modu aktifken sistem durumu görüntülendi.",
    metadata: {
      source: "admin_system"
    }
  });
}
    const analyticsSummary = buildNotifyAnalytics(logs);

    const recentLogs = logs.filter((item) => {
      const createdAt = new Date(item.createdAt);
      return createdAt >= getLastHoursDate(24);
    });

    const recentErrors: typeof logs = [];
    const unreadCount = logs.filter((item) => !item.readAt).length;

    const activeTags = tags.filter((item) => item.status === "active").length;
    const unclaimedTags = tags.filter((item) => item.status === "unclaimed").length;

    const mailConfigured = isMailConfigured();
    const alerts: string[] = [];
    const storage = getBackupStorageMode();

    if (!mailConfigured) {
      alerts.push("Mail sistemi yapılandırılmamış.");
    }

    if (process.env.VERCEL && !storage.redisConfigured) {
      alerts.push("Production veri deposu yapılandırılmamış.");
    }
    if (recentErrors.length >= 5) {
      alerts.push("Son mesaj bildirimlerinde hata artışı var.");
    }

    if (recentLogs.length === 0) {
      alerts.push("Son 24 saatte mesaj bildirimi hareketi yok.");
    }

    return NextResponse.json({
      success: true,
      generatedAt: generatedAt.toISOString(),
      storage,
      push: getPushHealth(),
      analytics: {
        notifyToday: analyticsSummary.today,
        notifyLast7Days: analyticsSummary.last7Days,
        notifyLast30Days: analyticsSummary.last30Days,
        unreadToday: analyticsSummary.unreadToday,
        topProducts: analyticsSummary.topProducts.slice(0, 5)
      },

      abuse: abuseSummary,

      adminActions,

      services: getServiceHealth({
        mailConfigured,
        notifyCount: logs.length
      }),

      channels: getNotifyChannels(),

      mail: {
        configured: mailConfigured
      },
      sms: getSmsHealth(),
      smsAnalytics,
    flags: {
      maintenanceMode: isMaintenanceMode(),
      notifyDisabled: isNotifyDisabled(),
      smsDisabled: isSmsDisabled(),
      pushDisabled: isPushDisabled()
    },
      notify: {
        totalLogs: logs.length,
        recent24h: recentLogs.length,
        unreadCount,
        errorCount: recentErrors.length
      },

      tags: {
        total: tags.length,
        active: activeTags,
        unclaimed: unclaimedTags
      },

      alerts
    });
  } catch (error) {
    console.error("ADMIN_HEALTH_GET_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        error: "Sistem durumu alınamadı."
      },
      { status: 500 }
    );
  }
}