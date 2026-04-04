import fs from "fs";
import path from "path";
import crypto from "crypto";

export type TagStatus = "active" | "unclaimed";

export type TagItem = {
  code: string;
  status: TagStatus;
  manageToken: string;
  profile: {
    name: string;
    phone: string;
    email: string;
    petName: string;
    note: string;
  };
  alerts: string[];
  visibility: {
    showName: boolean;
    showPhone: boolean;
    showEmail: boolean;
    showPetName: boolean;
    showNote: boolean;
  };
  recovery: {
    phone: string;
    email: string;
  };
};

type SetupPayload = {
  name: string;
  phone: string;
  email: string;
  petName: string;
  note: string;
  alerts: string[];
  visibility: {
    showName: boolean;
    showPhone: boolean;
    showEmail: boolean;
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

export function writeTags(tags: TagItem[]) {
  fs.writeFileSync(filePath, JSON.stringify(tags, null, 2), "utf-8");
}

export function findTagByCode(code: string): TagItem | undefined {
  const tags = readTags();
  return tags.find((tag) => tag.code === code);
}

export function createManageToken() {
  return `mg_${crypto.randomBytes(16).toString("hex")}`;
}

export function setupTag(code: string, payload: SetupPayload): TagItem | null {
  const tags = readTags();
  const index = tags.findIndex((tag) => tag.code === code);

  if (index === -1) {
    return null;
  }

  const current = tags[index];

  const updated: TagItem = {
    ...current,
    status: "active",
    manageToken: current.manageToken || createManageToken(),
    profile: {
      name: payload.name.trim(),
      phone: payload.phone.trim(),
      email: payload.email.trim(),
      petName: payload.petName.trim(),
      note: payload.note.trim()
    },
    alerts: payload.alerts,
    visibility: {
      showName: payload.visibility.showName,
      showPhone: payload.visibility.showPhone,
      showEmail: payload.visibility.showEmail,
      showPetName: payload.visibility.showPetName,
      showNote: payload.visibility.showNote
    },
    recovery: {
      phone: payload.recovery.phone.trim(),
      email: payload.recovery.email.trim()
    }
  };

  tags[index] = updated;
  writeTags(tags);

  return updated;
}