import { promises as fs } from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';

export type Tag = {
  code: string;
  status: "unclaimed" | "active";
  name?: string;
  phone?: string;
  petName?: string;
  note?: string;
};

const TAGS_JSON_PATH = path.join(process.cwd(), 'data', 'tags.json');
const TAGS_KEY = 'tags';

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

export async function getAllTags(): Promise<Tag[]> {
  if (redis) {
    const data = await redis.get(TAGS_KEY);
    if (data) {
      return JSON.parse(data as string);
    }
    // Load from file and set
    const fsData = await fs.readFile(TAGS_JSON_PATH, 'utf-8');
    const tags = JSON.parse(fsData);
    await redis.set(TAGS_KEY, JSON.stringify(tags));
    return tags;
  } else {
    // Local development, use file
    const data = await fs.readFile(TAGS_JSON_PATH, 'utf-8');
    return JSON.parse(data);
  }
}

export async function getTagByCode(code: string): Promise<Tag | undefined> {
  const tags = await getAllTags();
  return tags.find((t) => t.code === code);
}

export async function updateTag(code: string, data: Partial<Tag>): Promise<void> {
  const tags = await getAllTags();
  const index = tags.findIndex((t) => t.code === code);
  if (index === -1) {
    throw new Error('Tag not found');
  }
  tags[index] = { ...tags[index], ...data };
  const updatedJson = JSON.stringify(tags, null, 2);
  if (redis) {
    await redis.set(TAGS_KEY, updatedJson);
  } else {
    await fs.writeFile(TAGS_JSON_PATH, updatedJson);
  }
}

export function normalizeCode(code: string): string {
  return code.toUpperCase();
}