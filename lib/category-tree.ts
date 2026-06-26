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
      "romance", "cinta",
      "thriller", "misteri", "suspens", "kriminal", "crime",
      "horor", "horror",
      "fantasi", "paranormal", "petualangan",
      "sci-fi", "fiksi ilmiah", "distopia", "surreal",
      "fiksi sejarah", "historical fiction",
      "humor", "komedi", "alegori", "satire",
      "cerita rakyat", "legenda", "fabel", "rakyat", "dongeng",
      "puisi", "sajak",
      "drama", "klasik",
    ],
    children: [
      {
        key: "sastra-klasik",
        label: "Sastra & Klasik",
        matchTags: ["sastra", "klasik", "drama"],
      },
      {
        key: "kontemporer",
        label: "Kontemporer",
        matchTags: ["kontemporer", "contemporary"],
      },
      {
        key: "romance",
        label: "Romance",
        matchTags: ["romance", "cinta"],
      },
      {
        key: "thriller-misteri",
        label: "Thriller & Misteri",
        matchTags: ["thriller", "misteri", "suspens", "kriminal", "crime"],
      },
      {
        key: "horor",
        label: "Horor",
        matchTags: ["horor", "horror"],
      },
      {
        key: "fantasi",
        label: "Fantasi & Paranormal",
        matchTags: ["fantasi", "paranormal", "petualangan"],
      },
      {
        key: "fiksi-ilmiah",
        label: "Fiksi Ilmiah",
        matchTags: ["sci-fi", "fiksi ilmiah", "distopia", "surreal"],
      },
      {
        key: "fiksi-sejarah",
        label: "Fiksi Sejarah",
        matchTags: ["fiksi sejarah", "historical fiction", "sejarah"],
      },
      {
        key: "humor",
        label: "Humor & Komedi",
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
      "biografi", "memoar",
      "pengembangan diri", "produktivitas", "kebiasaan", "motivasi", "inspirasi",
      "bisnis", "karier", "keuangan", "marketing", "startup", "strategi", "komunikasi",
      "psikologi", "filsafat", "absurdisme",
      "sejarah", "sosial", "budaya", "politik",
      "sains", "teknologi",
      "agama", "spiritualitas", "islam",
      "masakan", "kuliner",
      "perjalanan", "travel",
      "olahraga", "sports",
      "seni", "musik",
      "parenting", "keluarga",
    ],
    children: [
      {
        key: "biografi-memoar",
        label: "Biografi & Memoar",
        matchTags: ["biografi", "memoar"],
      },
      {
        key: "pengembangan-diri",
        label: "Pengembangan Diri",
        matchTags: ["pengembangan diri", "produktivitas", "kebiasaan", "motivasi", "mindset", "inspirasi"],
      },
      {
        key: "bisnis-karier",
        label: "Bisnis & Karier",
        matchTags: ["bisnis", "karier", "keuangan", "marketing", "startup", "strategi", "komunikasi"],
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
        key: "masakan",
        label: "Masak-memasak",
        matchTags: ["masakan", "kuliner", "resep"],
      },
      {
        key: "perjalanan",
        label: "Perjalanan",
        matchTags: ["perjalanan", "travel"],
      },
      {
        key: "olahraga",
        label: "Olahraga",
        matchTags: ["olahraga", "sports"],
      },
      {
        key: "seni-musik",
        label: "Seni & Musik",
        matchTags: ["seni", "musik", "art", "music"],
      },
      {
        key: "parenting-keluarga",
        label: "Parenting & Keluarga",
        matchTags: ["parenting", "keluarga"],
      },
    ],
  },
  {
    key: "anak-anak",
    label: "Anak-Anak",
    matchTags: [
      "anak", "balita", "cerita anak", "picture book", "board book",
      "children", "children's",
    ],
    children: [
      {
        key: "balita",
        label: "Balita & Bayi (0–3)",
        matchTags: ["balita", "toddler", "board book", "picture book"],
      },
      {
        key: "anak-awal",
        label: "Anak Awal (4–8)",
        matchTags: ["anak", "cerita anak", "children"],
      },
      {
        key: "anak-akhir",
        label: "Anak Akhir (9–12)",
        matchTags: ["anak", "chapter book"],
      },
    ],
  },
  {
    key: "remaja",
    label: "Remaja",
    matchTags: ["remaja", "young adult", "ya", "teen"],
    children: [
      {
        key: "fiksi-remaja",
        label: "Fiksi Remaja",
        matchTags: ["remaja", "young adult", "ya"],
      },
      {
        key: "fantasi-remaja",
        label: "Fantasi Remaja",
        matchTags: ["fantasi", "remaja"],
      },
      {
        key: "romance-remaja",
        label: "Romance Remaja",
        matchTags: ["romance", "remaja"],
      },
    ],
  },
  {
    key: "komik-grafis",
    label: "Komik & Grafis",
    matchTags: ["komik", "manga", "novel grafis", "graphic novel", "webtoon", "comics"],
    children: [
      {
        key: "manga",
        label: "Manga",
        matchTags: ["manga"],
      },
      {
        key: "komik-barat",
        label: "Komik Barat",
        matchTags: ["komik", "comics"],
      },
      {
        key: "novel-grafis",
        label: "Novel Grafis",
        matchTags: ["novel grafis", "graphic novel"],
      },
      {
        key: "webtoon",
        label: "Webtoon",
        matchTags: ["webtoon"],
      },
    ],
  },
  {
    key: "referensi",
    label: "Referensi",
    matchTags: [
      "pendidikan", "edukasi", "belajar",
      "bahasa", "bahasa inggris", "english",
      "kamus", "referensi", "ensiklopedi",
      "moral", "nilai", "karakter",
    ],
    children: [
      {
        key: "pendidikan",
        label: "Pendidikan",
        matchTags: ["pendidikan", "edukasi", "belajar"],
      },
      {
        key: "bahasa",
        label: "Bahasa",
        matchTags: ["bahasa", "bahasa inggris", "english"],
      },
      {
        key: "kamus-referensi",
        label: "Kamus & Referensi",
        matchTags: ["kamus", "referensi", "ensiklopedi"],
      },
      {
        key: "nilai-karakter",
        label: "Nilai & Karakter",
        matchTags: ["moral", "nilai", "karakter"],
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
