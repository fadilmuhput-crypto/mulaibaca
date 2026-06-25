export type SubCategory = {
  key: string;
  label: string;
  matchTags: string[];
};

export type RootCategory = {
  key: string;
  label: string;
  matchTags: string[];
  children: SubCategory[];
};

export const CATEGORY_TREE: RootCategory[] = [
  {
    key: "fiksi",
    label: "Fiksi",
    matchTags: [
      "fiksi", "novel", "sastra", "cerpen", "antologi",
      "romance", "thriller", "misteri", "horror",
      "fantasi", "petualangan", "sci-fi",
      "distopia", "surreal",
      "humor", "komedi", "alegori", "satire",
      "drama", "klasik",
      "cerita rakyat", "legenda", "fabel", "rakyat",
      "puisi",
    ],
    children: [
      {
        key: "sastra-klasik",
        label: "Sastra & Klasik",
        matchTags: ["sastra", "klasik", "drama"],
      },
      {
        key: "romance",
        label: "Romance",
        matchTags: ["romance", "cinta"],
      },
      {
        key: "thriller-misteri",
        label: "Thriller & Misteri",
        matchTags: ["thriller", "misteri", "horror"],
      },
      {
        key: "fantasi-petualangan",
        label: "Fantasi & Petualangan",
        matchTags: ["fantasi", "petualangan", "sci-fi"],
      },
      {
        key: "distopia",
        label: "Distopia & Sci-Fi",
        matchTags: ["distopia", "surreal"],
      },
      {
        key: "humor-satire",
        label: "Humor & Satire",
        matchTags: ["humor", "komedi", "alegori", "satire"],
      },
      {
        key: "cerita-rakyat",
        label: "Cerita Rakyat",
        matchTags: ["cerita rakyat", "legenda", "fabel", "rakyat", "dongeng"],
      },
      {
        key: "puisi",
        label: "Puisi",
        matchTags: ["puisi", "sajak"],
      },
    ],
  },
  {
    key: "non-fiksi",
    label: "Non-Fiksi",
    matchTags: [
      "non-fiksi",
      "pengembangan diri", "produktivitas", "kebiasaan", "motivasi",
      "bisnis", "karier", "keuangan", "marketing", "startup", "strategi",
      "psikologi", "filsafat", "absurdisme",
      "sejarah", "sosial", "budaya", "politik",
      "sains", "teknologi",
      "agama", "spiritualitas", "islam",
      "biografi", "memoar",
      "parenting", "keluarga",
      "komunikasi", "inspirasi",
    ],
    children: [
      {
        key: "pengembangan-diri",
        label: "Pengembangan Diri",
        matchTags: ["pengembangan diri", "produktivitas", "kebiasaan", "motivasi", "mindset"],
      },
      {
        key: "bisnis-karier",
        label: "Bisnis & Karier",
        matchTags: ["bisnis", "karier", "keuangan", "marketing", "startup", "strategi"],
      },
      {
        key: "psikologi-filsafat",
        label: "Psikologi & Filsafat",
        matchTags: ["psikologi", "filsafat", "absurdisme"],
      },
      {
        key: "sejarah-budaya",
        label: "Sejarah & Budaya",
        matchTags: ["sejarah", "sosial", "budaya", "politik"],
      },
      {
        key: "sains-teknologi",
        label: "Sains & Teknologi",
        matchTags: ["sains", "teknologi"],
      },
      {
        key: "agama-spiritualitas",
        label: "Agama & Spiritualitas",
        matchTags: ["agama", "spiritualitas", "islam"],
      },
      {
        key: "biografi-memoar",
        label: "Biografi & Memoar",
        matchTags: ["biografi", "memoar"],
      },
      {
        key: "parenting-keluarga",
        label: "Parenting & Keluarga",
        matchTags: ["parenting", "keluarga"],
      },
    ],
  },
  {
    key: "bahasa-pendidikan",
    label: "Bahasa & Pendidikan",
    matchTags: [
      "pendidikan", "edukasi", "belajar",
      "bahasa", "bahasa inggris", "english",
      "moral", "nilai", "karakter",
    ],
    children: [
      {
        key: "pendidikan",
        label: "Pendidikan",
        matchTags: ["pendidikan", "edukasi", "belajar"],
      },
      {
        key: "bahasa-inggris",
        label: "Bahasa Inggris",
        matchTags: ["bahasa inggris", "english", "esl"],
      },
      {
        key: "nilai-karakter",
        label: "Nilai & Karakter",
        matchTags: ["moral", "nilai", "karakter"],
      },
    ],
  },
  {
    key: "anak-remaja",
    label: "Anak & Remaja",
    matchTags: [
      "anak", "remaja", "balita",
      "cerita anak", "picture book",
      "young adult",
    ],
    children: [
      {
        key: "balita",
        label: "Balita (0–6 th)",
        matchTags: ["balita", "toddler", "picture book"],
      },
      {
        key: "anak",
        label: "Anak (7–12 th)",
        matchTags: ["anak", "cerita anak", "chapter book"],
      },
      {
        key: "remaja",
        label: "Remaja (13+ th)",
        matchTags: ["remaja", "young adult", "ya"],
      },
    ],
  },
];

export function findSubCategory(subKey: string): SubCategory | undefined {
  for (const cat of CATEGORY_TREE) {
    const found = cat.children.find((s) => s.key === subKey);
    if (found) return found;
  }
}

export function findParentOfSub(subKey: string): RootCategory | undefined {
  return CATEGORY_TREE.find((cat) => cat.children.some((s) => s.key === subKey));
}

export function countBooksInCategory(
  books: { tags: string[] }[],
  matchTags: string[]
): number {
  return books.filter((b) => b.tags.some((t) => matchTags.includes(t))).length;
}
