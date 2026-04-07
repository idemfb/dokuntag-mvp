const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 0,O,1,I yok

export function generateCode(length = 6): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return result;
}import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

function readDB() {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

export function generateUniqueCode(): string {
  const db = readDB();

  let code = "";
  let exists = true;

  while (exists) {
    code = generateCode(6);
    exists = db.products.some((p: any) => p.publicCode === code);
  }

  return code;
}