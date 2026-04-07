import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
console.log("DB PATH:", DB_PATH);
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

function run(count = 10) {
  const db = readDB();

  const existing = new Set(db.products.map((p: any) => p.publicCode));

  const newProducts = [];

  for (let i = 0; i < count; i++) {
    let code = generateCode();

    while (existing.has(code)) {
      code = generateCode();
    }

    existing.add(code);

    newProducts.push({
      publicCode: code,
      manageToken: crypto.randomUUID(),
      productType: "item",
      name: "",
      phone: "",
      email: "",
      note: "",
      alerts: [],
      allowDirectCall: false,
      allowDirectWhatsapp: false,
      status: "unclaimed",
      createdAt: new Date().toISOString()
    });
  }

  db.products.push(...newProducts);

  writeDB(db);

  console.log(`✅ ${count} adet code üretildi`);
}

run(20); // istediğin kadar değiştir