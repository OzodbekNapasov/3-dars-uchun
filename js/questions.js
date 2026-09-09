// 3-dars: Bir amal bilan oson hisoblanadigan test savollari (40 ta)
const ALL_QUESTIONS = [
  {
    "id": 1,
    "question": "Axborotning eng kichik o'lchov birligi qaysi?",
    "options": [
      "Bit",
      "Bayt",
      "Kilobayt",
      "Megabayt"
    ],
    "answer": "Bit"
  },
  {
    "id": 2,
    "question": "1 bayt necha bitga teng?",
    "options": [
      "8 bit",
      "2 bit",
      "4 bit",
      "16 bit"
    ],
    "answer": "8 bit"
  },
  {
    "id": 3,
    "question": "2 bayt necha bit bo'ladi?",
    "options": [
      "16 bit",
      "10 bit",
      "12 bit",
      "20 bit"
    ],
    "answer": "16 bit"
  },
  {
    "id": 4,
    "question": "3 bayt necha bitga teng?",
    "options": [
      "24 bit",
      "16 bit",
      "18 bit",
      "32 bit"
    ],
    "answer": "24 bit"
  },
  {
    "id": 5,
    "question": "16 bit necha bayt bo'ladi?",
    "options": [
      "2 bayt",
      "1 bayt",
      "4 bayt",
      "8 bayt"
    ],
    "answer": "2 bayt"
  },
  {
    "id": 6,
    "question": "24 bit necha baytga teng?",
    "options": [
      "3 bayt",
      "2 bayt",
      "4 bayt",
      "6 bayt"
    ],
    "answer": "3 bayt"
  },
  {
    "id": 7,
    "question": "32 bit necha bayt bo'ladi?",
    "options": [
      "4 bayt",
      "2 bayt",
      "6 bayt",
      "8 bayt"
    ],
    "answer": "4 bayt"
  },
  {
    "id": 8,
    "question": "1 KB (Kilobayt) necha baytga teng?",
    "options": [
      "1024 B",
      "512 B",
      "1000 B",
      "2048 B"
    ],
    "answer": "1024 B"
  },
  {
    "id": 9,
    "question": "2 KB necha bayt bo'ladi?",
    "options": [
      "2048 B",
      "1024 B",
      "3072 B",
      "4096 B"
    ],
    "answer": "2048 B"
  },
  {
    "id": 10,
    "question": "3 KB necha baytga teng?",
    "options": [
      "3072 B",
      "2048 B",
      "4096 B",
      "1024 B"
    ],
    "answer": "3072 B"
  },
  {
    "id": 11,
    "question": "2048 bayt necha Kilobayt (KB) bo'ladi?",
    "options": [
      "2 KB",
      "1 KB",
      "4 KB",
      "8 KB"
    ],
    "answer": "2 KB"
  },
  {
    "id": 12,
    "question": "3072 bayt necha Kilobayt (KB) bo'ladi?",
    "options": [
      "3 KB",
      "2 KB",
      "4 KB",
      "6 KB"
    ],
    "answer": "3 KB"
  },
  {
    "id": 13,
    "question": "4096 bayt necha Kilobayt (KB) bo'ladi?",
    "options": [
      "4 KB",
      "2 KB",
      "8 KB",
      "16 KB"
    ],
    "answer": "4 KB"
  },
  {
    "id": 14,
    "question": "1 MB (Megabayt) necha KB ga teng?",
    "options": [
      "1024 KB",
      "512 KB",
      "1000 KB",
      "2048 KB"
    ],
    "answer": "1024 KB"
  },
  {
    "id": 15,
    "question": "2 MB necha KB bo'ladi?",
    "options": [
      "2048 KB",
      "1024 KB",
      "3072 KB",
      "4096 KB"
    ],
    "answer": "2048 KB"
  },
  {
    "id": 16,
    "question": "3 MB necha KB ga teng?",
    "options": [
      "3072 KB",
      "2048 KB",
      "4096 KB",
      "1024 KB"
    ],
    "answer": "3072 KB"
  },
  {
    "id": 17,
    "question": "2048 KB necha Megabayt (MB) bo'ladi?",
    "options": [
      "2 MB",
      "1 MB",
      "4 MB",
      "8 MB"
    ],
    "answer": "2 MB"
  },
  {
    "id": 18,
    "question": "4096 KB necha Megabayt (MB) bo'ladi?",
    "options": [
      "4 MB",
      "2 MB",
      "8 MB",
      "16 MB"
    ],
    "answer": "4 MB"
  },
  {
    "id": 19,
    "question": "1 GB (Gigabayt) necha MB ga teng?",
    "options": [
      "1024 MB",
      "512 MB",
      "1000 MB",
      "2048 MB"
    ],
    "answer": "1024 MB"
  },
  {
    "id": 20,
    "question": "2 GB necha MB bo'ladi?",
    "options": [
      "2048 MB",
      "1024 MB",
      "3072 MB",
      "4096 MB"
    ],
    "answer": "2048 MB"
  },
  {
    "id": 21,
    "question": "2048 MB necha Gigabayt (GB) bo'ladi?",
    "options": [
      "2 GB",
      "1 GB",
      "4 GB",
      "8 GB"
    ],
    "answer": "2 GB"
  },
  {
    "id": 22,
    "question": "1 TB (Terabayt) necha GB ga teng?",
    "options": [
      "1024 GB",
      "512 GB",
      "1000 GB",
      "2048 GB"
    ],
    "answer": "1024 GB"
  },
  {
    "id": 23,
    "question": "Ikkilik sanoq sistemasida nechta raqam ishlatiladi?",
    "options": [
      "2 ta (0 va 1)",
      "10 ta",
      "8 ta",
      "16 ta"
    ],
    "answer": "2 ta (0 va 1)"
  },
  {
    "id": 24,
    "question": "O'nlik sanoq sistemasining asosi nechaga teng?",
    "options": [
      "10",
      "2",
      "8",
      "16"
    ],
    "answer": "10"
  },
  {
    "id": 25,
    "question": "10₂ soni o'nlik sanoq sistemasida nechaga teng?",
    "options": [
      "2",
      "1",
      "3",
      "4"
    ],
    "answer": "2"
  },
  {
    "id": 26,
    "question": "11₂ soni o'nlik sanoq sistemasida nechaga teng?",
    "options": [
      "3",
      "2",
      "4",
      "5"
    ],
    "answer": "3"
  },
  {
    "id": 27,
    "question": "100₂ soni o'nlik sanoq sistemasida nechaga teng?",
    "options": [
      "4",
      "2",
      "3",
      "5"
    ],
    "answer": "4"
  },
  {
    "id": 28,
    "question": "101₂ soni o'nlik sanoq sistemasida nechaga teng?",
    "options": [
      "5",
      "3",
      "6",
      "7"
    ],
    "answer": "5"
  },
  {
    "id": 29,
    "question": "110₂ soni o'nlik sanoq sistemasida nechaga teng?",
    "options": [
      "6",
      "4",
      "5",
      "7"
    ],
    "answer": "6"
  },
  {
    "id": 30,
    "question": "111₂ soni o'nlik sanoq sistemasida nechaga teng?",
    "options": [
      "7",
      "5",
      "6",
      "8"
    ],
    "answer": "7"
  },
  {
    "id": 31,
    "question": "1000₂ soni o'nlik sanoq sistemasida nechaga teng?",
    "options": [
      "8",
      "6",
      "7",
      "10"
    ],
    "answer": "8"
  },
  {
    "id": 32,
    "question": "1001₂ soni o'nlik sanoq sistemasida nechaga teng?",
    "options": [
      "9",
      "7",
      "8",
      "10"
    ],
    "answer": "9"
  },
  {
    "id": 33,
    "question": "1010₂ soni o'nlik sanoq sistemasida nechaga teng?",
    "options": [
      "10",
      "8",
      "9",
      "12"
    ],
    "answer": "10"
  },
  {
    "id": 34,
    "question": "3₁₀ sonining ikkilik sanoq sistemasidagi ko'rinishi qaysi?",
    "options": [
      "11₂",
      "10₂",
      "100₂",
      "101₂"
    ],
    "answer": "11₂"
  },
  {
    "id": 35,
    "question": "4₁₀ sonining ikkilik sanoq sistemasidagi ko'rinishi qaysi?",
    "options": [
      "100₂",
      "101₂",
      "110₂",
      "111₂"
    ],
    "answer": "100₂"
  },
  {
    "id": 36,
    "question": "5₁₀ sonining ikkilik sanoq sistemasidagi ko'rinishi qaysi?",
    "options": [
      "101₂",
      "100₂",
      "110₂",
      "111₂"
    ],
    "answer": "101₂"
  },
  {
    "id": 37,
    "question": "Axborot nima?",
    "options": [
      "Atrof-muhitdagi obyektlar va hodisalar haqidagi ma'lumotlar",
      "Faqat kompyuter simlari",
      "Faqat printer qog'ozi",
      "Faqat elektr toki"
    ],
    "answer": "Atrof-muhitdagi obyektlar va hodisalar haqidagi ma'lumotlar"
  },
  {
    "id": 38,
    "question": "Quyidagilardan qaysi biri tibbiy axborotga misol bo'la oladi?",
    "options": [
      "Bemorning tana harorati 38°C",
      "Monitorning eni",
      "Sichqonchaning tugmasi",
      "Klaviatura kabeli"
    ],
    "answer": "Bemorning tana harorati 38°C"
  },
  {
    "id": 39,
    "question": "Matn, rasm, tovush va video nimalar hisoblanadi?",
    "options": [
      "Axborot turlari",
      "Sanoq sistemalari",
      "Operatsion tizimlar",
      "Xotira qurilmalari"
    ],
    "answer": "Axborot turlari"
  },
  {
    "id": 40,
    "question": "Kompyuterda ishlash vaqtida ko'z va monitor orasidagi me'yoriy masofa qanday bo'lishi kerak?",
    "options": [
      "50 - 70 sm",
      "5 - 10 sm",
      "2 metr",
      "15 sm"
    ],
    "answer": "50 - 70 sm"
  }
];

// Global eksport.
// Classic script'dagi top-level `const` window obyektiga tushmaydi, shuning uchun
// buni aniq yozish shart — aks holda student.js/admin.js dagi window.ALL_QUESTIONS
// undefined bo'lib, test savollari umuman yuklanmaydi.
window.ALL_QUESTIONS = ALL_QUESTIONS;
