import type { NotifyLogItem } from "@/lib/notify";

const DAY_MS = 1000 * 60 * 60 * 24;

function getDaysAgo(days: number) {
  return Date.now() - DAY_MS * days;
}

function isUnread(item: NotifyLogItem) {
  return !item.readAt;
}

export type NotifyAnalyticsSummary = {
  total: number;
  unread: number;

  today: number;
  last7Days: number;
  last30Days: number;

  unreadToday: number;

  topProducts: Array<{
    code: string;
    count: number;
  }>;
};

export function buildNotifyAnalytics(
  logs: NotifyLogItem[]
): NotifyAnalyticsSummary {
  const now = Date.now();

  const todayLimit = getDaysAgo(1);
  const last7DaysLimit = getDaysAgo(7);
  const last30DaysLimit = getDaysAgo(30);

  const todayLogs = logs.filter((item) => {
    return new Date(item.createdAt).getTime() >= todayLimit;
  });

  const last7DaysLogs = logs.filter((item) => {
    return new Date(item.createdAt).getTime() >= last7DaysLimit;
  });

  const last30DaysLogs = logs.filter((item) => {
    return new Date(item.createdAt).getTime() >= last30DaysLimit;
  });

  const productMap = new Map<string, number>();

  for (const item of logs) {
    const current = productMap.get(item.tagCode) || 0;
    productMap.set(item.tagCode, current + 1);
  }

  const topProducts = Array.from(productMap.entries())
    .map(([code, count]) => ({
      code,
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    total: logs.length,

    unread: logs.filter(isUnread).length,

    today: todayLogs.length,

    last7Days: last7DaysLogs.length,

    last30Days: last30DaysLogs.length,

    unreadToday: todayLogs.filter(isUnread).length,

    topProducts
  };
}