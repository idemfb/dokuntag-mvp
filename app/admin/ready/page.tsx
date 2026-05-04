"use client";

import { Suspense, useEffect, useMemo, useState } from "react";

type ShipmentStatus = "ready" | "packed" | "shipped";

type ReadyItem = {
  code: string;
  name?: string;
  ownerName?: string;
  status?: string;
  packed?: boolean;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  orderNo?: string;
  shipmentStatus?: ShipmentStatus;
};

type SortKey = "code" | "name" | "orderNo" | "customerName";

type Draft = {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  orderNo: string;
};

function getShipmentLabel(item: ReadyItem) {
  if (item.shipmentStatus === "shipped") return "Kargoya verildi";
  if (item.packed || item.shipmentStatus === "packed") return "Kargoya hazır";
  return "Satışa hazır";
}

function AdminReadyContent() {
  const [items, setItems] = useState<ReadyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingCode, setSavingCode] = useState("");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"ready" | "packed" | "all">("ready");
  const [sortKey, setSortKey] = useState<SortKey>("code");
  const [openCode, setOpenCode] = useState("");
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  async function fetchItems() {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/products?status=unclaimed", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) throw new Error();

      const nextItems: ReadyItem[] = data.items || [];
      setItems(nextItems);

      const nextDrafts: Record<string, Draft> = {};

      for (const item of nextItems) {
        nextDrafts[item.code] = {
          customerName: item.customerName || "",
          customerPhone: item.customerPhone || "",
          customerAddress: item.customerAddress || "",
          orderNo: item.orderNo || "",
        };
      }

      setDrafts(nextDrafts);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");

    return items
      .filter((item) => {
        if (view === "ready") {
          return !item.packed && item.shipmentStatus !== "shipped";
        }

        if (view === "packed") {
          return item.packed || item.shipmentStatus === "packed";
        }

        return true;
      })
      .filter((item) => {
        if (!normalizedQuery) return true;

        const searchable = [
          item.code,
          item.name,
          item.ownerName,
          item.customerName,
          item.customerPhone,
          item.customerAddress,
          item.orderNo,
          getShipmentLabel(item),
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("tr-TR");

        return searchable.includes(normalizedQuery);
      })
      .sort((a, b) => {
        const av = String(a[sortKey] || "").toLocaleLowerCase("tr-TR");
        const bv = String(b[sortKey] || "").toLocaleLowerCase("tr-TR");

        return av.localeCompare(bv, "tr");
      });
  }, [items, query, sortKey, view]);

  const stats = useMemo(() => {
    const ready = items.filter(
      (item) => !item.packed && item.shipmentStatus !== "shipped"
    ).length;

    const packed = items.filter(
      (item) => item.packed || item.shipmentStatus === "packed"
    ).length;

    const shipped = items.filter((item) => item.shipmentStatus === "shipped").length;

    return { ready, packed, shipped, total: items.length };
  }, [items]);

  function updateDraft(code: string, key: keyof Draft, value: string) {
    setDrafts((prev) => ({
      ...prev,
      [code]: {
        customerName: prev[code]?.customerName || "",
        customerPhone: prev[code]?.customerPhone || "",
        customerAddress: prev[code]?.customerAddress || "",
        orderNo: prev[code]?.orderNo || "",
        [key]: value,
      },
    }));
  }

  function validateDraft(draft: Draft) {
    if (!draft.customerName.trim()) {
      return "Müşteri adı zorunlu.";
    }

    if (!draft.customerPhone.trim() && !draft.orderNo.trim()) {
      return "Telefon veya sipariş numarası zorunlu.";
    }

    if (!draft.customerAddress.trim()) {
      return "Kargo adresi zorunlu.";
    }

    return "";
  }

  async function markPacked(item: ReadyItem) {
    const draft = drafts[item.code] || {
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      orderNo: "",
    };

    const validationError = validateDraft(draft);

    if (validationError) {
      window.alert(validationError);
      return;
    }

    const confirmed = window.confirm(
      `${item.code} kodlu ürün kargoya hazır olarak işaretlensin mi?`
    );

    if (!confirmed) return;

    try {
      setSavingCode(item.code);

      const res = await fetch("/api/admin/mark-packed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          code: item.code,
          packed: true,
          shipmentStatus: "packed",
          customerName: draft.customerName.trim(),
          customerPhone: draft.customerPhone.trim(),
          customerAddress: draft.customerAddress.trim(),
          orderNo: draft.orderNo.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "İşlem başarısız.");
      }

      setItems((prev) =>
        prev.map((current) =>
          current.code === item.code
            ? {
                ...current,
                packed: true,
                shipmentStatus: "packed",
                customerName: draft.customerName.trim(),
                customerPhone: draft.customerPhone.trim(),
                customerAddress: draft.customerAddress.trim(),
                orderNo: draft.orderNo.trim(),
              }
            : current
        )
      );

      setOpenCode("");
      setView("ready");
    } catch {
      window.alert("Paketleme durumu güncellenemedi.");
    } finally {
      setSavingCode("");
    }
  }

  async function markShipped(item: ReadyItem) {
    const confirmed = window.confirm(
      `${item.code} kodlu ürün kargoya verildi olarak işaretlensin mi?`
    );

    if (!confirmed) return;

    try {
      setSavingCode(item.code);

      const draft = drafts[item.code] || {
        customerName: item.customerName || "",
        customerPhone: item.customerPhone || "",
        customerAddress: item.customerAddress || "",
        orderNo: item.orderNo || "",
      };

      const res = await fetch("/api/admin/mark-packed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          code: item.code,
          packed: true,
          shipmentStatus: "shipped",
          customerName: draft.customerName.trim(),
          customerPhone: draft.customerPhone.trim(),
          customerAddress: draft.customerAddress.trim(),
          orderNo: draft.orderNo.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "İşlem başarısız.");
      }

      setItems((prev) =>
        prev.map((current) =>
          current.code === item.code
            ? {
                ...current,
                packed: true,
                shipmentStatus: "shipped",
              }
            : current
        )
      );
    } catch {
      window.alert("Kargo durumu güncellenemedi.");
    } finally {
      setSavingCode("");
    }
  }

  function printCargoSlip(item: ReadyItem) {
    const draft = drafts[item.code] || {
      customerName: item.customerName || "",
      customerPhone: item.customerPhone || "",
      customerAddress: item.customerAddress || "",
      orderNo: item.orderNo || "",
    };

    const html = `
      <html>
        <head>
          <title>Kargo Hazırlık Fişi</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            .card { border: 1px solid #ddd; border-radius: 18px; padding: 22px; max-width: 480px; }
            h1 { font-size: 20px; margin: 0 0 18px; }
            p { margin: 8px 0; font-size: 14px; line-height: 1.5; }
            .label { color: #666; font-size: 12px; }
            .value { font-weight: 700; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Dokuntag</h1>
            <p><span class="label">Sipariş No</span><br/><span class="value">${draft.orderNo || "-"}</span></p>
            <p><span class="label">Müşteri</span><br/><span class="value">${draft.customerName || "-"}</span></p>
            <p><span class="label">Telefon</span><br/><span class="value">${draft.customerPhone || "-"}</span></p>
            <p><span class="label">Adres</span><br/><span class="value">${draft.customerAddress || "-"}</span></p>
            <p><span class="label">Durum</span><br/><span class="value">Kargoya hazır</span></p>
          </div>
        </body>
      </html>
    `;

    const win = window.open("", "_blank", "width=520,height=720");

    if (!win) return;

    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  }

  function printThanksCard(item: ReadyItem) {
    const draft = drafts[item.code] || {
      customerName: item.customerName || "",
      customerPhone: item.customerPhone || "",
      customerAddress: item.customerAddress || "",
      orderNo: item.orderNo || "",
    };

    const name = draft.customerName.trim() || "Merhaba";

    const html = `
      <html>
        <head>
          <title>Dokuntag Teşekkür Kartı</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            .card { border: 1px solid #ddd; border-radius: 24px; padding: 30px; max-width: 480px; }
            h1 { font-size: 18px; margin: 0 0 22px; letter-spacing: 0.08em; }
            p { margin: 14px 0; font-size: 15px; line-height: 1.65; }
            .site { margin-top: 22px; font-size: 13px; color: #555; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Dokuntag</h1>
            <p>Merhaba ${name},</p>
            <p>Dokuntag'ı tercih ettiğin için teşekkür ederiz.</p>
            <p>Umarız hiç ihtiyaç duymazsın…<br/>Ama bir gün gerekirse, doğru kişiye ulaşacaktır.</p>
            <p>Beğendiysen, bizimle paylaşmayı unutma 🤍</p>
            <p class="site">dokuntag.com</p>
          </div>
        </body>
      </html>
    `;

    const win = window.open("", "_blank", "width=520,height=720");

    if (!win) return;

    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  }
  function printThanksCardsBulk() {
  const packedItems = items.filter(
    (item) => item.packed || item.shipmentStatus === "packed"
  );

  if (!packedItems.length) {
    window.alert("Kargoya hazır ürün bulunamadı.");
    return;
  }

  const cards = packedItems
    .map((item) => {
      const draft = drafts[item.code] || {
        customerName: item.customerName || "",
        customerPhone: item.customerPhone || "",
        customerAddress: item.customerAddress || "",
        orderNo: item.orderNo || "",
      };

      const name = draft.customerName.trim() || "Merhaba";

      return `
        <section class="card">
          <h1>Dokuntag</h1>
          <p>Merhaba ${name},</p>
          <p>Dokuntag'ı tercih ettiğin için teşekkür ederiz.</p>
          <p>Umarız hiç ihtiyaç duymazsın…<br/>Ama bir gün gerekirse, doğru kişiye ulaşacaktır.</p>
          <p>Beğendiysen, bizimle paylaşmayı unutma 🤍</p>
          <p class="site">dokuntag.com</p>
        </section>
      `;
    })
    .join("");

  const html = `
    <html>
      <head>
        <title>Dokuntag Teşekkür Kartları</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
          .card {
            border: 1px solid #ddd;
            border-radius: 24px;
            padding: 30px;
            max-width: 480px;
            min-height: 360px;
            margin: 0 auto 24px;
            page-break-after: always;
          }
          h1 { font-size: 18px; margin: 0 0 22px; letter-spacing: 0.08em; }
          p { margin: 14px 0; font-size: 15px; line-height: 1.65; }
          .site { margin-top: 22px; font-size: 13px; color: #555; }
          @media print {
            body { padding: 0; }
            .card { margin: 0 auto; page-break-after: always; }
          }
        </style>
      </head>
      <body>${cards}</body>
    </html>
  `;

  const win = window.open("", "_blank", "width=720,height=900");

  if (!win) return;

  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}
function printCargoSlipsBulk() {
  const packedItems = items.filter(
    (item) => item.packed || item.shipmentStatus === "packed"
  );

  if (!packedItems.length) {
    window.alert("Kargoya hazır ürün bulunamadı.");
    return;
  }

  const slips = packedItems
    .map((item) => {
      const draft = drafts[item.code] || {
        customerName: item.customerName || "",
        customerPhone: item.customerPhone || "",
        customerAddress: item.customerAddress || "",
        orderNo: item.orderNo || "",
      };

      return `
        <section class="card">
          <h1>Dokuntag</h1>
          <p><span>Sipariş No</span><br/><strong>${draft.orderNo || "-"}</strong></p>
          <p><span>Müşteri</span><br/><strong>${draft.customerName || "-"}</strong></p>
          <p><span>Telefon</span><br/><strong>${draft.customerPhone || "-"}</strong></p>
          <p><span>Adres</span><br/><strong>${draft.customerAddress || "-"}</strong></p>
          <p><span>Durum</span><br/><strong>Kargoya hazır</strong></p>
        </section>
      `;
    })
    .join("");

  const html = `
    <html>
      <head>
        <title>Dokuntag Kargo Fişleri</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
          .card {
            border: 1px solid #ddd;
            border-radius: 18px;
            padding: 22px;
            max-width: 480px;
            margin: 0 auto 24px;
            page-break-after: always;
          }
          h1 { font-size: 20px; margin: 0 0 18px; }
          p { margin: 8px 0; font-size: 14px; line-height: 1.5; }
          span { color: #666; font-size: 12px; }
          strong { font-weight: 700; }
          @media print {
            body { padding: 0; }
            .card { margin: 0 auto; page-break-after: always; }
          }
        </style>
      </head>
      <body>${slips}</body>
    </html>
  `;

  const win = window.open("", "_blank", "width=720,height=900");

  if (!win) return;

  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}
  function downloadCsv() {
    const rows = [
      [
        "code",
        "customerName",
        "customerPhone",
        "customerAddress",
        "orderNo",
        "shipmentStatus",
      ],
      ...filteredItems.map((item) => [
        item.code,
        item.customerName || drafts[item.code]?.customerName || "",
        item.customerPhone || drafts[item.code]?.customerPhone || "",
        item.customerAddress || drafts[item.code]?.customerAddress || "",
        item.orderNo || drafts[item.code]?.orderNo || "",
        getShipmentLabel(item),
      ]),
    ];

    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "dokuntag-satisa-hazir-urunler.csv";
    a.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Satışa hazır ürünler</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Kurulum bekleyen ürünlerin paketleme ve sipariş takibi.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={fetchItems}
            disabled={loading}
            className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "Yükleniyor..." : "Yenile"}
          </button>

          <button
            type="button"
            onClick={downloadCsv}
            disabled={!filteredItems.length}
            className="rounded-xl bg-neutral-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            CSV indir
          </button>
          <button
            type="button"
            onClick={printCargoSlipsBulk}
            disabled={!stats.packed}
            className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold disabled:opacity-50"
          >
            Toplu kargo fişi
          </button>

          <button
            type="button"
            onClick={printThanksCardsBulk}
            disabled={!stats.packed}
            className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold disabled:opacity-50"
          >
            Toplu teşekkür kartı
          </button>
          <a
            href="/admin"
            className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold"
          >
            Admin panele dön
          </a>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-4">
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-xs text-neutral-500">Satışa hazır</p>
          <p className="mt-1 text-2xl font-semibold">{stats.ready}</p>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-xs text-neutral-500">Kargoya hazır</p>
          <p className="mt-1 text-2xl font-semibold">{stats.packed}</p>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-xs text-neutral-500">Kargoya verildi</p>
          <p className="mt-1 text-2xl font-semibold">{stats.shipped}</p>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-xs text-neutral-500">Toplam</p>
          <p className="mt-1 text-2xl font-semibold">{stats.total}</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-3">
        <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Kod, müşteri, sipariş no veya adres ara"
            className="rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-500"
          />

          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-500"
          >
            <option value="code">Koda göre sırala</option>
            <option value="name">Ürün adına göre sırala</option>
            <option value="customerName">Müşteriye göre sırala</option>
            <option value="orderNo">Sipariş noya göre sırala</option>
          </select>

          <select
            value={view}
            onChange={(e) => setView(e.target.value as "ready" | "packed" | "all")}
            className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-500"
          >
            <option value="ready">Sadece satışa hazır</option>
            <option value="packed">Kargoya hazır</option>
            <option value="all">Tümü</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Yükleniyor...</p>
      ) : filteredItems.length ? (
        <div className="space-y-2">
          {filteredItems.map((item) => {
            const draft = drafts[item.code] || {
              customerName: "",
              customerPhone: "",
              customerAddress: "",
              orderNo: "",
            };

            const isOpen = openCode === item.code;
            const isPacked = item.packed || item.shipmentStatus === "packed";
            const isShipped = item.shipmentStatus === "shipped";

            return (
              <div
                key={item.code}
                className="rounded-2xl border border-neutral-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenCode(isOpen ? "" : item.code)}
                  className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold">{item.code}</p>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {getShipmentLabel(item)}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-neutral-500">
                      {draft.customerName || item.name || "Bilgi girilmedi"}
                      {draft.orderNo ? ` • ${draft.orderNo}` : ""}
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-neutral-500">
                    {isOpen ? "Kapat" : "Aç"}
                  </span>
                </button>

                {isOpen ? (
                  <div className="border-t border-neutral-100 px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`/setup/${item.code}`}
                        target="_blank"
                        className="rounded-xl border border-neutral-300 px-3 py-2 text-xs font-semibold"
                      >
                        Kurulum
                      </a>

                      <a
                        href={`/qr/${item.code}`}
                        target="_blank"
                        className="rounded-xl border border-neutral-300 px-3 py-2 text-xs font-semibold"
                      >
                        QR
                      </a>

                      <a
                        href={`/t/${item.code}`}
                        target="_blank"
                        className="rounded-xl border border-neutral-300 px-3 py-2 text-xs font-semibold"
                      >
                        Kontrol
                      </a>
                    </div>

                    <div className="mt-4 grid gap-2 md:grid-cols-3">
                      <input
                        value={draft.customerName}
                        onChange={(e) =>
                          updateDraft(item.code, "customerName", e.target.value)
                        }
                        disabled={isShipped}
                        placeholder="Müşteri adı"
                        className="rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-500 disabled:bg-neutral-100"
                      />

                      <input
                        value={draft.customerPhone}
                        onChange={(e) =>
                          updateDraft(item.code, "customerPhone", e.target.value)
                        }
                        disabled={isShipped}
                        placeholder="Müşteri telefonu"
                        className="rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-500 disabled:bg-neutral-100"
                      />

                      <input
                        value={draft.orderNo}
                        onChange={(e) =>
                          updateDraft(item.code, "orderNo", e.target.value)
                        }
                        disabled={isShipped}
                        placeholder="Sipariş numarası"
                        className="rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-500 disabled:bg-neutral-100"
                      />
                    </div>

                    <textarea
                      value={draft.customerAddress}
                      onChange={(e) =>
                        updateDraft(item.code, "customerAddress", e.target.value)
                      }
                      disabled={isShipped}
                      placeholder="Kargo adresi"
                      className="mt-2 min-h-[80px] w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-500 disabled:bg-neutral-100"
                    />

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-neutral-500">
                        Müşteri ileride ulaşırsa kod içeride saklanır:{" "}
                        <span className="font-semibold text-neutral-900">
                          {item.code}
                        </span>
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {isPacked ? (
                          <>
                            <button
                              type="button"
                              onClick={() => printCargoSlip(item)}
                              className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold"
                            >
                              Kargo fişi yazdır
                            </button>

                            <button
                              type="button"
                              onClick={() => printThanksCard(item)}
                              className="rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold"
                            >
                              Teşekkür kartı yazdır
                            </button>
                          </>
                        ) : null}

                        {!isPacked && !isShipped ? (
                          <button
                            type="button"
                            onClick={() => markPacked(item)}
                            disabled={savingCode === item.code}
                            className="rounded-xl bg-neutral-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                          >
                            {savingCode === item.code
                              ? "Kaydediliyor..."
                              : "Kargoya hazır yap"}
                          </button>
                        ) : null}

                        {isPacked && !isShipped ? (
                          <button
                            type="button"
                            onClick={() => markShipped(item)}
                            disabled={savingCode === item.code}
                            className="rounded-xl bg-blue-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                          >
                            {savingCode === item.code
                              ? "Kaydediliyor..."
                              : "Kargoya verildi yap"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-500">
          Bu filtrede ürün bulunamadı.
        </div>
      )}
    </div>
  );
}

export default function AdminReadyPage() {
  return (
    <main className="min-h-screen bg-neutral-50 p-6">
      <Suspense fallback={<p>Yükleniyor...</p>}>
        <AdminReadyContent />
      </Suspense>
    </main>
  );
}