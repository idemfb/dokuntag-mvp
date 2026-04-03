"use client";

import { useState } from "react";

type NotifyFormProps = {
  code: string;
};

export default function NotifyForm({ code }: NotifyFormProps) {
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    if (!message.trim()) return;

    await fetch("/api/notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, message }),
    });

    alert("Mesaj gönderildi");
    setMessage("");
  };

  return (
    <div className="mt-8 border-t pt-6">
      <h2 className="text-lg font-semibold">Sahibine mesaj gönder</h2>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="mt-3 w-full rounded border p-3"
        placeholder="Ürünü buldum, bana ulaşabilirsiniz..."
      />

      <button
        type="button"
        onClick={sendMessage}
        className="mt-3 w-full rounded bg-black p-3 text-white"
      >
        Gönder
      </button>
    </div>
  );
}