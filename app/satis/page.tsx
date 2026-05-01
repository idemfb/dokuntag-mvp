"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function SalesPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      note: formData.get("note"),
    };

    const res = await fetch("/api/lead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      alert("Bir hata oluştu");
      return;
    }

    setSent(true);
    form.reset();
  }

  return (
    <main className="min-h-screen bg-[#f7f3ea] px-5 py-16 sm:px-8">

      {/* HERO */}
      <section className="mx-auto max-w-5xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-neutral-500">
          Dokuntag®
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
          Yeni üretim hazırlanıyor.
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-neutral-600">
          İlk üretim için sınırlı kontenjan açılıyor.
          Öncelikli bilgi almak için talep bırakabilirsiniz.
        </p>

        <div className="mt-6 inline-flex rounded-full bg-neutral-950 px-5 py-2 text-sm font-semibold text-white">
          Sınırlı üretim
        </div>
      </section>

      {/* GÖRSEL */}
      <section className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
        <Image
          src="/images/hero-new.jpg"
          alt="Dokuntag ürün"
          width={1200}
          height={800}
          className="w-full object-cover"
        />
      </section>

      {/* FORM */}
      <section className="mx-auto mt-14 max-w-xl rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-center">
          Öncelikli bilgi almak için
        </h3>

        <p className="mt-2 text-center text-sm text-neutral-600">
          Üretim başladığında size haber verelim.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">

          {sent && (
            <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
              Talebiniz alındı. Size dönüş yapacağız.
            </div>
          )}

          <input
            name="name"
            placeholder="Adınız"
            className="w-full rounded-xl border px-4 py-3 text-sm"
          />

          <input
            name="email"
            placeholder="E-posta"
            className="w-full rounded-xl border px-4 py-3 text-sm"
          />

          <input
            name="phone"
            placeholder="Telefon"
            className="w-full rounded-xl border px-4 py-3 text-sm"
          />

          <textarea
            name="note"
            placeholder="Not (isteğe bağlı)"
            className="w-full rounded-xl border px-4 py-3 text-sm"
          />

          {/* 🔥 ANA BUTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-neutral-950 px-4 py-3 text-sm font-semibold text-white"
          >
            {loading ? "Gönderiliyor..." : "Talep bırak"}
          </button>

          {/* 🔥 WHATSAPP */}
          <a
            href="https://wa.me/905515551553"
            target="_blank"
            className="block w-full rounded-xl border px-4 py-3 text-center text-sm font-semibold"
          >
            WhatsApp ile yaz
          </a>
        </form>
      </section>

      {/* ALT CTA */}
      <section className="mt-20 text-center">
        <Link
          href="/"
          className="rounded-full border px-6 py-3 text-sm font-semibold"
        >
          Ana sayfaya dön
        </Link>
      </section>

    </main>
  );
}