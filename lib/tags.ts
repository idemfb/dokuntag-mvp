import fs from "fs";
import path from "path";

export type TagStatus = "active" | "unclaimed";

export type TagItem = {
  code: string;
  status: TagStatus;
  manageToken: string;
  profile: {
    name: string;
    phone: string;
    petName: string;
    note: string;
  };
  alerts: string[];
  visibility: {
    showName: boolean;
    showPhone: boolean;
    showPetName: boolean;
    showNote: boolean;
  };
  recovery: {
    phone: string;
    email: string;
  };
};

const filePath = path.join(process.cwd(), "data", "tags.json");

export function readTags(): TagItem[] {
  const file = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(file) as TagItem[];
}

export function findTagByCode(code: string): TagItem | undefined {
  const tags = readTags();
  return tags.find((tag) => tag.code === code);
}