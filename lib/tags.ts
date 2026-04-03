import tagsData from "@/data/tags.json";

export type Tag = {
  code: string;
  status: "unclaimed" | "active";
  name?: string;
  phone?: string;
};

export function getAllTags(): Tag[] {
  return tagsData as Tag[];
}

export function getTag(code: string): Tag | undefined {
  return getAllTags().find((t) => t.code === code);
}

// ❌ updateTag kaldırıyoruz (Vercel'de çalışmaz)