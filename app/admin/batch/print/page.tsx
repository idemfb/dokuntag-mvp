"use client";

import { useEffect, useMemo, useState } from "react";

type BatchItem = {
  code: string;
};

type Shape = "round" | "square";
type Size = "4cm" | "3cm" | "2.5cm";

function parseItems(raw: string | null): BatchItem[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is BatchItem => {
      return item && typeof item.code === "string";
    });
  } catch {
    return [];
  }
}

function normalizeSize(value: string | null): Size {
  if (value === "2.5cm") return "2.5cm";
  if (value === "4cm") return "4cm";
  return "3cm";
}

function normalizeShape(value: string | null): Shape {
  if (value === "square") return "square";
  return "round";
}

function getConfig(size: Size) {
  if (size === "2.5cm") {
    return {
      box: "2.5cm",
      gap: "0.18cm",
      pagePadding: "0.6cm"
    };
  }

  if (size === "4cm") {
    return {
      box: "4cm",
      gap: "0.22cm",
      pagePadding: "0.6cm"
    };
  }

  return {
    box: "3cm",
    gap: "0.2cm",
    pagePadding: "0.6cm"
  };
}

export default function BatchPrintPage() {
  const [items, setItems] = useState<BatchItem[]>([]);
const [size, setSize] = useState<Size>("3cm");
const [shape, setShape] = useState<Shape>("round");

useEffect(() => {
  const params = new URLSearchParams(window.location.search);

  setItems(parseItems(params.get("data")));
  setSize(normalizeSize(params.get("size")));
  setShape(normalizeShape(params.get("shape")));
}, []);

  const config = getConfig(size);

  return (
    <main className="bg-white text-black print:bg-white">
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 0.6cm;
        }

        html,
        body {
          background: #ffffff;
        }

        @media print {
          body {
            margin: 0;
            padding: 0;
          }

          .print-hidden {
            display: none !important;
          }

          .print-root {
            padding: 0 !important;
            margin: 0 !important;
          }

          .print-grid {
            gap: ${config.gap} !important;
          }

          .print-card {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="print-root p-4">
        <div className="print-hidden mx-auto mb-6 max-w-6xl">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShape("round")}
              className={`rounded border px-4 py-2 ${
                shape === "round" ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              Yuvarlak
            </button>

            <button
              type="button"
              onClick={() => setShape("square")}
              className={`rounded border px-4 py-2 ${
                shape === "square" ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              Kare
            </button>

            <button
              type="button"
              onClick={() => setSize("2.5cm")}
              className={`rounded border px-4 py-2 ${
                size === "2.5cm" ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              2.5 cm
            </button>

            <button
              type="button"
              onClick={() => setSize("3cm")}
              className={`rounded border px-4 py-2 ${
                size === "3cm" ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              3 cm
            </button>

            <button
              type="button"
              onClick={() => setSize("4cm")}
              className={`rounded border px-4 py-2 ${
                size === "4cm" ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              4 cm
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="rounded border px-4 py-2"
            >
              Yazdır
            </button>
          </div>

          <div className="mt-3 text-sm text-neutral-600">
            A4 baskı görünümü · {items.length} adet ·{" "}
            {shape === "round" ? "Yuvarlak" : "Kare"} · {size}
          </div>
        </div>

        {items.length ? (
          <div
            className="print-grid mx-auto grid"
            style={{
              width: "calc(21cm - 1.2cm)",
              minHeight: "calc(29.7cm - 1.2cm)",
              gridTemplateColumns: `repeat(auto-fill, ${config.box})`,
              gap: config.gap,
              justifyContent: "start",
              alignContent: "start",
              padding: config.pagePadding,
              boxSizing: "border-box"
            }}
          >
            {items.map((item) => (
              <div
                key={item.code}
                className="print-card"
                style={{
                  width: config.box,
                  height: config.box,
                  border: "0.4px dashed #d4d4d4",
                  borderRadius: shape === "round" ? "50%" : "0.18cm",
                  overflow: "hidden",
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#ffffff"
                }}
              >
                <img
                  src={`/api/qr/${item.code}?size=${encodeURIComponent(size)}`}
                  alt={item.code}
                  style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    objectFit: "contain"
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-4xl rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-6 text-sm text-neutral-600">
            Baskı için veri bulunamadı.
          </div>
        )}
      </div>
    </main>
  );
}