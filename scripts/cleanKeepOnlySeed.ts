import { readDBAsync, writeDBAsync } from "../lib/db";

const keepCodes = new Set<string>([
  "DKNTG",
  "DEMO01",
  "DEMO02",
  "DEMO03",
  "IBRAHIM",
  ...Array.from({ length: 200 }, (_, i) => `TEST${String(i + 1).padStart(3, "0")}`)
]);

async function main() {
  const db = await readDBAsync();
  const products = Array.isArray(db?.products) ? db.products : [];

  const before = products.length;

  const cleanedProducts = products.filter((item: any) => {
    const code = String(item.publicCode || item.code || "").trim().toUpperCase();
    return keepCodes.has(code);
  });

  await writeDBAsync({
    ...db,
    products: cleanedProducts
  });

  console.log("Temizlik tamamlandı.");
  console.log("Önce:", before);
  console.log("Sonra:", cleanedProducts.length);
  console.log(
    "Kalan kodlar:",
    cleanedProducts.map((item: any) => item.publicCode || item.code).join(", ")
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});