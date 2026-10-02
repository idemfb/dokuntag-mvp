const BLOCKED_WORDS = [
"siktir",
"sktir",
"siktr",
"sikerim",
"sikeyim",
"siktirgit",
  "amk",
  "aq",
  "orospu",
  "oruspu",
  "rspu",
  "oç",
  "piç",
  "sikik",
  "ananı",
  "anan",
  "salak",
  "gerizekalı",
  "aptal",
  "ibne",
  "yarrak",
  "fuck",
  "bitch",
  "asshole",
  "shit",
  "fucking",
  "motherfucker",
  "bastard",
  "idiot",
  "moron",
  "mk",
  "sg",
  "salak herif",
  "geri zekalı"
];

function normalizeText(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/[^a-z0-9ğüşöçıİ\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function containsBlockedContent(
  value: string
) {
  const normalized =
    normalizeText(value);

  return BLOCKED_WORDS.some((word) =>
    normalized.includes(word)
  );
}