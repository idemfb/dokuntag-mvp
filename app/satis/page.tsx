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
      source: "satis-ilk-uretim",
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
      alert("Talep gönderilemedi. Lütfen tekrar deneyin.");
      return;
    }

    setSent(true);
    form.reset();
  }

  return (
    <main className="min-h-screen bg-[#f7f3ea] px-5 py-14 text-neutral-950 sm:px-8 sm:py-20">
      {/* HERO */}
      <section className="mx-auto max-w-5xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-neutral-500">
          Dokuntag® İlk Üretim
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
          Kaybolmadan önce hazır olsun.
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
          Dokuntag®, NFC ve QR ile çalışan güvenli kayıp buluşturma sistemidir.
          Demo üretim hazırlanıyor. İlk üretimden haberdar olmak için talep
          bırakabilirsiniz.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <span className="rounded-full bg-neutral-950 px-5 py-2 text-sm font-semibold text-white">
            Sınırlı ilk üretim
          </span>
          <span className="rounded-full border border-neutral-300 bg-white/70 px-5 py-2 text-sm font-semibold text-neutral-700">
            Uygulama gerekmez
          </span>
          <span className="rounded-full border border-neutral-300 bg-white/70 px-5 py-2 text-sm font-semibold text-neutral-700">
            Yıllık ücret yok
          </span>
        </div>
      </section>

      {/* GÖRSEL */}
      <section className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
        <Image
          src="/images/hero-new.jpg"
          alt="Dokuntag ürün"
          width={1200}
          height={800}
          priority
          className="w-full object-cover"
        />
      </section>

      {/* ÜRÜN ALGISI */}
      <section className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-3">
        <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-2xl">🐾</p>
          <h3 className="mt-3 font-semibold">Evcil hayvan</h3>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Tasmadaki Dokuntag® ile bulan kişi size güvenli şekilde ulaşabilir.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-2xl">🔑</p>
          <h3 className="mt-3 font-semibold">Anahtar</h3>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Anahtarınız kaybolduğunda bulan kişi adresinizi görmeden size
            ulaşabilir.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-2xl">👤</p>
          <h3 className="mt-3 font-semibold">Kişisel kullanım</h3>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Yakınınıza ulaşılması gereken durumlarda hızlı iletişim köprüsü
            kurar.
          </p>
        </div>
      </section>

      {/* NASIL ÇALIŞIR */}
      <section className="mx-auto mt-12 max-w-4xl rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">
          Nasıl çalışır?
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#f7f3ea] p-5">
            <p className="text-sm font-semibold">1. Dokun / okut</p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Bulan kişi NFC’ye dokunur veya QR kodu okutur.
            </p>
          </div>

          <div className="rounded-2xl bg-[#f7f3ea] p-5">
            <p className="text-sm font-semibold">2. Profil açılır</p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Sizin izin verdiğiniz bilgiler veya mesaj formu görünür.
            </p>
          </div>

          <div className="rounded-2xl bg-[#f7f3ea] p-5">
            <p className="text-sm font-semibold">3. Size ulaşılır</p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Bulan kişi telefon, WhatsApp, e-posta veya mesajla ulaşabilir.
            </p>
          </div>
        </div>
      </section>

      {/* GÜVEN */}
      <section className="mx-auto mt-10 max-w-4xl rounded-[2rem] border border-neutral-200 bg-neutral-950 p-6 text-white shadow-sm sm:p-8">
        <h2 className="text-2xl font-semibold tracking-tight">
          Adres bilgisi istemez.
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-300">
          Dokuntag® adres paylaşmanızı önermez. Özellikle anahtar gibi ürünlerde
          güvenlik için şehir ve adres bilgisi paylaşmadan iletişim kurulması
          hedeflenir.
        </p>

        <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            Uygulama gerekmez
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            Yıllık ücret yok
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            Bilgi paylaşımı kullanıcı kontrolünde
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="mx-auto mt-12 max-w-xl rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="text-center text-xl font-semibold">
          İlk üretim için bilgi alın
        </h3>

        <p className="mt-2 text-center text-sm leading-6 text-neutral-600">
          Üretim başladığında size haber verelim. Bu form sipariş değil, öncelikli
          bilgi talebidir.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          {sent ? (
            <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
              Talebiniz alındı. İlk üretim başladığında size dönüş yapacağız.
            </div>
          ) : null}

          <input
            name="name"
            placeholder="Adınız"
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
          />

          <input
            name="email"
            type="email"
            required
            placeholder="E-posta *"
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
          />

          <input
            name="phone"
            placeholder="Telefon"
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
          />

          <textarea
            name="note"
            placeholder="Not (isteğe bağlı)"
            rows={4}
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
          >
            {loading ? "Gönderiliyor..." : "Talep bırak"}
          </button>

          <a
            href="https://wa.me/905515551553?text=Merhaba,%20Dokuntag%20ilk%20%C3%BCretim%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
            target="_blank"
            rel="noreferrer"
            className="block w-full rounded-xl border border-neutral-300 px-4 py-3 text-center text-sm font-semibold transition hover:bg-neutral-50"
          >
            WhatsApp ile yaz
          </a>
        </form>

      </section>

      {/* ALT CTA */}
      <section className="mt-16 text-center">
        <Link
          href="/"
          className="rounded-full border border-neutral-300 bg-white/70 px-6 py-3 text-sm font-semibold transition hover:bg-white"
        >
          Ana sayfaya dön
        </Link>
      </section>
    </main>
  );
}