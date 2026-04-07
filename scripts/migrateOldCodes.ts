import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(length = 6) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return result;
}

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    return { products: [] };
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function writeDB(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function run() {
  const db = readDB();

  const usedCodes = new Set<string>(
    db.products.map((p: any) => p.publicCode)
  );

  let migratedCount = 0;

  db.products = db.products.map((product: any) => {
    // sadece eski DT kodlarını yakala
    if (
      product.publicCode &&
      product.publicCode.startsWith("DT")
    ) {
      let newCode = generateCode();

      while (usedCodes.has(newCode)) {
        newCode = generateCode();
      }

      usedCodes.add(newCode);
      migratedCount++;

      return {
        ...product,
        oldCode: product.publicCode,
        publicCode: newCode
      };
    }

    return product;
  });

  writeDB(db);

  console.log(`✅ Migration tamamlandı: ${migratedCount} adet`);
}

run();