import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

export const DB_PATH = path.join(process.cwd(), "data", "db.json");
const REDIS_DB_KEY = "dokuntag:db";

let redisClient: Redis | null = null;

function isRedisEnabled() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  );
}

function getRedis() {
  if (!isRedisEnabled()) return null;

  if (!redisClient) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!.trim(),
      token: process.env.UPSTASH_REDIS_REST_TOKEN!.trim()
    });
  }

  return redisClient;
}

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

export async function readDBAsync() {
  const redis = getRedis();

  if (redis) {
    const data = await redis.get<any>(REDIS_DB_KEY);

    // 🔥 KRİTİK: Redis boşsa → local db.json'dan yükle
    if (!data || !data.products || data.products.length === 0) {
      const local = readDB();

      if (local.products?.length) {
        await redis.set(REDIS_DB_KEY, local);
        return local;
      }
    }

    return data || { products: [] };
  }

  return readDB();
}

export async function writeDBAsync(data: any) {
  const redis = getRedis();

  if (redis) {
    await redis.set(REDIS_DB_KEY, data);
    return;
  }

  writeDB(data);
}