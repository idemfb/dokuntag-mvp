import fs from "fs";
import path from "path";

export const DB_PATH = path.join(process.cwd(), "data", "db.json");

export function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    return { products: [] };
  }

  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

export function writeDB(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}