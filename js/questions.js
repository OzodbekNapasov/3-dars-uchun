/**
 * 3-Dars: Axborot Texnologiyalari — Test Savollari Banki (Soddalashtirilgan)
 * Tibbiyot texnikumi 1-kurs talabalari uchun tushunarli, aniq va ortiqcha chalg'itishlarsiz savollar.
 *
 * Kategoriyalar:
 *  - nazariy: umumiy tushunchalar va ta'riflar
 *  - olchov:  o'lchov birliklari (bit, bayt, KB, MB, GB, TB)
 *  - sanoq:   sanoq sistemalari (2-lik va 10-lik)
 */

const ALL_QUESTIONS = [
  // --- NAZARIY SAVOLLAR (18 ta sodda savol) ---
  {
    id: 1,
    category: "nazariy",
    question: "Axborotning eng kichik o'lchov birligi qaysi?",
    options: ["Bit", "Bayt", "Kilobayt", "Megabayt"],
    answer: "Bit"
  },
  {
    id: 3,
    category: "nazariy",
    question: "1 bayt necha bitga teng?",
    options: ["8 bit", "2 bit", "4 bit", "16 bit"],
    answer: "8 bit"
  },
  {
    id: 5,
    category: "nazariy",
    question: "8 ta bitdan iborat axborot bo'lagi qanday ataladi?",
    options: ["Bayt", "Fayl", "Piksel", "Megabayt"],
    answer: "Bayt"
  },
  {
    id: 6,
    category: "nazariy",
    question: "Quyidagilardan qaysi biri axborot o'lchov birligi EMAS?",
    options: ["Gers (Hz)", "Kilobayt (KB)", "Megabayt (MB)", "Gigabayt (GB)"],
    answer: "Gers (Hz)"
  },
  {
    id: 7,
    category: "nazariy",
    question: "Quyidagi o'lchov birliklaridan qaysi biri eng kattasi?",
    options: ["Terabayt (TB)", "Gigabayt (GB)", "Megabayt (MB)", "Kilobayt (KB)"],
    answer: "Terabayt (TB)"
  },
  {
    id: 8,
    category: "nazariy",
    question: "Quyidagi o'lchov birliklaridan qaysi biri eng kichigi?",
    options: ["Bit", "Bayt", "Kilobayt", "Megabayt"],
    answer: "Bit"
  },
  {
    id: 9,
    category: "nazariy",
    question: "Ikkilik sanoq sistemasida qaysi raqamlar ishlatiladi?",
    options: ["Faqat 0 va 1", "0 dan 9 gacha", "1 va 2", "0, 1 va 2"],
    answer: "Faqat 0 va 1"
  },
  {
    id: 10,
    category: "nazariy",
    question: "Ikkilik sanoq sistemasining asosi nechaga teng?",
    options: ["2", "10", "8", "16"],
    answer: "2"
  },
  {
    id: 11,
    category: "nazariy",
    question: "Biz kundalik hayotda qaysi sanoq sistemasidan foydalanamiz?",
    options: ["O'nlik (10-lik)", "Ikkilik (2-lik)", "Sakkizlik (8-lik)", "O'n oltilik (16-lik)"],
    answer: "O'nlik (10-lik)"
  },
  {
    id: 12,
    category: "nazariy",
    question: "O'nlik sanoq sistemasining asosi nechaga teng?",
    options: ["10", "2", "8", "100"],
    answer: "10"
  },
  {
    id: 13,
    category: "nazariy",
    question: "Kompyuter barcha ma'lumotlarni qaysi sanoq sistemasida qayta ishlaydi?",
    options: ["Ikkilik (2-lik)", "O'nlik (10-lik)", "Sakkizlik (8-lik)", "O'n oltilik (16-lik)"],
    answer: "Ikkilik (2-lik)"
  },
  {
    id: 52,
    category: "nazariy",
    question: "O'nlik sanoq sistemasida qaysi raqamlar ishlatiladi?",
    options: ["0 dan 9 gacha bo'lgan raqamlar", "Faqat 0 va 1", "1 dan 10 gacha bo'lgan raqamlar", "0 dan 8 gacha bo'lgan raqamlar"],
    answer: "0 dan 9 gacha bo'lgan raqamlar"
  },
  {
    id: 16,
    category: "nazariy",
    question: "Ikkilik sanoq sistemasida quyidagi raqamlardan qaysi biri ISHLATILMAYDI?",
    options: ["2", "0", "1", "0 va 1"],
    answer: "2"
  },
  {
    id: 17,
    category: "nazariy",
    question: "Kompyuterda matn, rasm va videolar qanday ko'rinishda saqlanadi?",
    options: ["0 va 1 lardan iborat ikkilik kodda", "Faqat so'zlar ko'rinishida", "Rangli piksellarda", "Tovush to'lqinlarida"],
    answer: "0 va 1 lardan iborat ikkilik kodda"
  },

  // --- O'LCHOV BIRLIKLARI (18 ta sodda hisoblash savollari) ---
  {
    id: 19,
    category: "olchov",
    question: "1 Kilobayt (KB) necha baytga teng?",
    options: ["1024 B", "1000 B", "512 B", "2048 B"],
    answer: "1024 B"
  },
  {
    id: 20,
    category: "olchov",
    question: "1 Megabayt (MB) necha Kilobaytga teng?",
    options: ["1024 KB", "1000 KB", "512 KB", "2048 KB"],
    answer: "1024 KB"
  },
  {
    id: 21,
    category: "olchov",
    question: "1 Gigabayt (GB) necha Megabaytga teng?",
    options: ["1024 MB", "1000 MB", "2048 MB", "512 MB"],
    answer: "1024 MB"
  },
  {
    id: 22,
    category: "olchov",
    question: "1 Terabayt (TB) necha Gigabaytga teng?",
    options: ["1024 GB", "1000 GB", "2048 GB", "500 GB"],
    answer: "1024 GB"
  },
  {
    id: 23,
    category: "olchov",
    question: "2 bayt necha bit bo'ladi?",
    options: ["16 bit", "10 bit", "12 bit", "20 bit"],
    answer: "16 bit"
  },
  {
    id: 24,
    category: "olchov",
    question: "3 bayt necha bit bo'ladi?",
    options: ["24 bit", "16 bit", "18 bit", "30 bit"],
    answer: "24 bit"
  },
  {
    id: 25,
    category: "olchov",
    question: "4 bayt necha bit bo'ladi?",
    options: ["32 bit", "24 bit", "16 bit", "40 bit"],
    answer: "32 bit"
  },
  {
    id: 26,
    category: "olchov",
    question: "5 bayt necha bit bo'ladi?",
    options: ["40 bit", "35 bit", "50 bit", "25 bit"],
    answer: "40 bit"
  },
  {
    id: 27,
    category: "olchov",
    question: "16 bit necha bayt bo'ladi?",
    options: ["2 bayt", "1 bayt", "4 bayt", "8 bayt"],
    answer: "2 bayt"
  },
  {
    id: 28,
    category: "olchov",
    question: "24 bit necha bayt bo'ladi?",
    options: ["3 bayt", "2 bayt", "4 bayt", "6 bayt"],
    answer: "3 bayt"
  },
  {
    id: 29,
    category: "olchov",
    question: "32 bit necha bayt bo'ladi?",
    options: ["4 bayt", "2 bayt", "6 bayt", "8 bayt"],
    answer: "4 bayt"
  },
  {
    id: 30,
    category: "olchov",
    question: "40 bit necha bayt bo'ladi?",
    options: ["5 bayt", "4 bayt", "6 bayt", "8 bayt"],
    answer: "5 bayt"
  },
  {
    id: 31,
    category: "olchov",
    question: "2 KB necha bayt bo'ladi?",
    options: ["2048 B", "1024 B", "3072 B", "2000 B"],
    answer: "2048 B"
  },
  {
    id: 32,
    category: "olchov",
    question: "3 KB necha bayt bo'ladi?",
    options: ["3072 B", "2048 B", "4096 B", "3000 B"],
    answer: "3072 B"
  },
  {
    id: 33,
    category: "olchov",
    question: "2048 bayt necha Kilobayt (KB) bo'ladi?",
    options: ["2 KB", "1 KB", "4 KB", "3 KB"],
    answer: "2 KB"
  },
  {
    id: 34,
    category: "olchov",
    question: "3072 bayt necha Kilobayt (KB) bo'ladi?",
    options: ["3 KB", "2 KB", "4 KB", "6 KB"],
    answer: "3 KB"
  },
  {
    id: 35,
    category: "olchov",
    question: "4096 bayt necha Kilobayt (KB) bo'ladi?",
    options: ["4 KB", "2 KB", "8 KB", "3 KB"],
    answer: "4 KB"
  },
  {
    id: 36,
    category: "olchov",
    question: "2048 KB necha Megabayt (MB) bo'ladi?",
    options: ["2 MB", "1 MB", "4 MB", "8 MB"],
    answer: "2 MB"
  },

  // --- SANOQ SISTEMALARI (15 ta sodda savol) ---
  {
    id: 37,
    category: "sanoq",
    question: "Ikkilik sanoq sistemasidagi 10₂ soni o'nlikda nechaga teng?",
    options: ["2", "1", "3", "10"],
    answer: "2"
  },
  {
    id: 38,
    category: "sanoq",
    question: "Ikkilik sanoq sistemasidagi 11₂ soni o'nlikda nechaga teng?",
    options: ["3", "2", "4", "5"],
    answer: "3"
  },
  {
    id: 39,
    category: "sanoq",
    question: "Ikkilik sanoq sistemasidagi 100₂ soni o'nlikda nechaga teng?",
    options: ["4", "3", "5", "8"],
    answer: "4"
  },
  {
    id: 40,
    category: "sanoq",
    question: "Ikkilik sanoq sistemasidagi 101₂ soni o'nlikda nechaga teng?",
    options: ["5", "4", "6", "7"],
    answer: "5"
  },
  {
    id: 41,
    category: "sanoq",
    question: "Ikkilik sanoq sistemasidagi 110₂ soni o'nlikda nechaga teng?",
    options: ["6", "5", "7", "8"],
    answer: "6"
  },
  {
    id: 42,
    category: "sanoq",
    question: "Ikkilik sanoq sistemasidagi 111₂ soni o'nlikda nechaga teng?",
    options: ["7", "6", "8", "9"],
    answer: "7"
  },
  {
    id: 43,
    category: "sanoq",
    question: "Ikkilik sanoq sistemasidagi 1000₂ soni o'nlikda nechaga teng?",
    options: ["8", "4", "6", "10"],
    answer: "8"
  },
  {
    id: 44,
    category: "sanoq",
    question: "Ikkilik sanoq sistemasidagi 1001₂ soni o'nlikda nechaga teng?",
    options: ["9", "8", "10", "11"],
    answer: "9"
  },
  {
    id: 45,
    category: "sanoq",
    question: "Ikkilik sanoq sistemasidagi 1010₂ soni o'nlikda nechaga teng?",
    options: ["10", "8", "12", "14"],
    answer: "10"
  },
  {
    id: 46,
    category: "sanoq",
    question: "O'nlik sanoq sistemasidagi 4₁₀ soni ikkilikda qanday yoziladi?",
    options: ["100₂", "101₂", "110₂", "11₂"],
    answer: "100₂"
  },
  {
    id: 47,
    category: "sanoq",
    question: "O'nlik sanoq sistemasidagi 5₁₀ soni ikkilikda qanday yoziladi?",
    options: ["101₂", "100₂", "110₂", "111₂"],
    answer: "101₂"
  },
  {
    id: 48,
    category: "sanoq",
    question: "O'nlik sanoq sistemasidagi 6₁₀ soni ikkilikda qanday yoziladi?",
    options: ["110₂", "101₂", "100₂", "111₂"],
    answer: "110₂"
  },
  {
    id: 49,
    category: "sanoq",
    question: "O'nlik sanoq sistemasidagi 7₁₀ soni ikkilikda qanday yoziladi?",
    options: ["111₂", "110₂", "101₂", "1000₂"],
    answer: "111₂"
  },
  {
    id: 50,
    category: "sanoq",
    question: "O'nlik sanoq sistemasidagi 8₁₀ soni ikkilikda qanday yoziladi?",
    options: ["1000₂", "111₂", "1001₂", "1010₂"],
    answer: "1000₂"
  },
  {
    id: 51,
    category: "sanoq",
    question: "Ikkilik sondagi xona qiymatlari o'ngdan chapga qarab necha martaga oshib boradi?",
    options: ["2 martaga (1, 2, 4, 8...)", "10 martaga (1, 10, 100...)", "8 martaga", "O'zgarmaydi"],
    answer: "2 martaga (1, 2, 4, 8...)"
  }
];

// Global eksport
window.ALL_QUESTIONS = ALL_QUESTIONS;
