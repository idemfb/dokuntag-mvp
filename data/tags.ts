export type TagStatus = "unclaimed" | "active";

export type Tag = {
  code: string;
  status: TagStatus;
  name: string;
};

export const tags: Tag[] = [
  {
    code: "DT001",
    status: "unclaimed",
    name: "Dokuntag 001",
  },
  {
    code: "DT002",
    status: "active",
    name: "Dokuntag 002",
  },
];