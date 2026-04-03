"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Tag = {
  code: string;
  status: "unclaimed" | "active";
  name?: string;
  phone?: string;
};

export default function TagRedirectPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("Yönlendiriliyor...");

  useEffect(() => {
    let mounted = true;

    async function run() {
      const resolved = await params;
      const code = resolved.code.toUpperCase();

      const res = await fetch(`/api/tag/${code}`, {
        cache: "no-store",
      });

      if (!mounted) return;

      if (!res.ok) {
        setMessage("Etiket bulunamadı.");
        return;
      }

      const tag = (await res.json()) as Tag;

      if (tag.status === "unclaimed") {
        router.replace(`/setup/${code}`);
        return;
      }

      router.replace(`/p/${code}`);
    }

    run();

    return () => {
      mounted = false;
    };
  }, [params, router]);

  return <main className="p-10">{message}</main>;
}