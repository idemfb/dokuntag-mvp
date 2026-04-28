"use client";

import { useState } from "react";

export default function LeadForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  async function submitLead() {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setStatus("error");
      return;
    }

    try {
      setStatus("loading");

      const res = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: cleanEmail }),
      });

      if (!res.ok) {
        throw new Error("Talep gönderilemedi.");
      }

      setEmail("");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mt-5 rounded-[1.5rem] border border-neutral-200 bg-[#f7f3ea]/70 p-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <input
          type="email"
          placeholder="E-posta adresiniz"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          className="h-12 w-full rounded-full border border-neutral-300 bg-white px-4 text-sm outline-none transition focus:border-neutral-900"
        />

        <button
          type="button"
          onClick={submitLead}
          disabled={status === "loading"}
          className="h-12 w-full rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {status === "loading" ? "Gönderiliyor..." : "Haberdar et"}
        </button>
      </div>

      {status === "success" ? (
        <p className="mt-2 text-xs text-green-700">
          Talebiniz alındı. İlk üretim hazır olduğunda size haber vereceğiz.
        </p>
      ) : null}

      {status === "error" ? (
        <p className="mt-2 text-xs text-red-600">
          Lütfen geçerli bir e-posta adresi girin.
        </p>
      ) : null}

      <p className="mt-2 text-xs text-neutral-500">
        İlk üretim hazır olduğunda size e-posta ile haber verilir.
      </p>
    </div>
  );
}