import fs from "fs";
import path from "path";
import { generateUniqueCode } from "../lib/code";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

function run() {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  const db = JSON.parse(raw);

  const usedCodes = new Set<string>();

  db.products = db.products.map((product: any) => {
    // sadece eski DT kodları değiştir
    if (product.publicCode.startsWith("DT")) {
      let newCode = generateUniqueCode();

      // extra güvenlik (script içinde de çakışma olmasın)
      while (usedCodes.has(newCode)) {
        newCode = generateUniqueCode();
      }

      usedCodes.add(newCode);

      return {
        ...product,
        oldCode: product.publicCode,
        publicCode: newCode,
      };
    }

    return product;
  });

  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

  console.log("✅ Migration tamamlandı");
}

run();