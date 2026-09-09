// 3-dars test savollari banki.
//
// Har bir savolning `category` maydoni bor va test shu bo'yicha tuziladi:
//   nazariy — mavzu bo'yicha nazariy/ta'rif savollari
//   olchov  — axborot o'lchov birliklarini hisoblash
//   sanoq   — sanoq sistemalari (2-lik va 10-lik)
//
// Talabaga tushadigan 20 ta savol tarkibi js/config.js dagi TEST_COMPOSITION
// orqali belgilanadi (hozir: 12 nazariy + 4 o'lchov + 4 sanoq).
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
    "answer": "Bit",
    "category": "nazariy"
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
    "answer": "8 bit",
    "category": "olchov"
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
    "answer": "16 bit",
    "category": "olchov"
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
    "answer": "24 bit",
    "category": "olchov"
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
    "answer": "2 bayt",
    "category": "olchov"
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
    "answer": "3 bayt",
    "category": "olchov"
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
    "answer": "4 bayt",
    "category": "olchov"
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
    "answer": "1024 B",
    "category": "olchov"
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
    "answer": "2048 B",
    "category": "olchov"
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
    "answer": "3072 B",
    "category": "olchov"
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
    "answer": "2 KB",
    "category": "olchov"
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
    "answer": "3 KB",
    "category": "olchov"
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
    "answer": "4 KB",
    "category": "olchov"
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
    "answer": "1024 KB",
    "category": "olchov"
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
    "answer": "2048 KB",
    "category": "olchov"
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
    "answer": "3072 KB",
    "category": "olchov"
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
    "answer": "2 MB",
    "category": "olchov"
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
    "answer": "4 MB",
    "category": "olchov"
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
    "answer": "1024 MB",
    "category": "olchov"
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
    "answer": "2048 MB",
    "category": "olchov"
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
    "answer": "2 GB",
    "category": "olchov"
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
    "answer": "1024 GB",
    "category": "olchov"
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
    "answer": "2 ta (0 va 1)",
    "category": "nazariy"
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
    "answer": "10",
    "category": "nazariy"
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
    "answer": "2",
    "category": "sanoq"
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
    "answer": "3",
    "category": "sanoq"
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
    "answer": "4",
    "category": "sanoq"
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
    "answer": "5",
    "category": "sanoq"
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
    "answer": "6",
    "category": "sanoq"
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
    "answer": "7",
    "category": "sanoq"
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
    "answer": "8",
    "category": "sanoq"
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
    "answer": "9",
    "category": "sanoq"
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
    "answer": "10",
    "category": "sanoq"
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
    "answer": "11₂",
    "category": "sanoq"
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
    "answer": "100₂",
    "category": "sanoq"
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
    "answer": "101₂",
    "category": "sanoq"
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
    "answer": "Atrof-muhitdagi obyektlar va hodisalar haqidagi ma'lumotlar",
    "category": "nazariy"
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
    "answer": "Bemorning tana harorati 38°C",
    "category": "nazariy"
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
    "answer": "Axborot turlari",
    "category": "nazariy"
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
    "answer": "50 - 70 sm",
    "category": "nazariy"
  },
  {
    "id": 41,
    "category": "nazariy",
    "question": "\"Bit\" atamasi qaysi so'zlardan olingan?",
    "options": [
      "Binary digit (ikkilik raqam)",
      "Big data",
      "Byte information",
      "Basic unit"
    ],
    "answer": "Binary digit (ikkilik raqam)"
  },
  {
    "id": 42,
    "category": "nazariy",
    "question": "Baytni bitga aylantirish uchun songa nima qilinadi?",
    "options": [
      "8 ga ko'paytiriladi",
      "8 ga bo'linadi",
      "1024 ga ko'paytiriladi",
      "1024 ga bo'linadi"
    ],
    "answer": "8 ga ko'paytiriladi"
  },
  {
    "id": 43,
    "category": "nazariy",
    "question": "Bitni baytga aylantirish uchun songa nima qilinadi?",
    "options": [
      "8 ga bo'linadi",
      "8 ga ko'paytiriladi",
      "1024 ga bo'linadi",
      "2 ga bo'linadi"
    ],
    "answer": "8 ga bo'linadi"
  },
  {
    "id": 44,
    "category": "nazariy",
    "question": "Kichik birlikdan katta birlikka (masalan, B dan KB ga) o'tishda nima qilinadi?",
    "options": [
      "1024 ga bo'linadi",
      "1024 ga ko'paytiriladi",
      "8 ga bo'linadi",
      "10 ga bo'linadi"
    ],
    "answer": "1024 ga bo'linadi"
  },
  {
    "id": 45,
    "category": "nazariy",
    "question": "Katta birlikdan kichik birlikka (masalan, MB dan KB ga) o'tishda nima qilinadi?",
    "options": [
      "1024 ga ko'paytiriladi",
      "1024 ga bo'linadi",
      "8 ga ko'paytiriladi",
      "100 ga ko'paytiriladi"
    ],
    "answer": "1024 ga ko'paytiriladi"
  },
  {
    "id": 46,
    "category": "nazariy",
    "question": "1024 soni 2 ning nechanchi darajasiga teng?",
    "options": [
      "2¹⁰",
      "2⁸",
      "2⁵",
      "2¹²"
    ],
    "answer": "2¹⁰"
  },
  {
    "id": 47,
    "category": "nazariy",
    "question": "Quyidagi o'lchov birliklaridan qaysi biri eng katta?",
    "options": [
      "Terabayt",
      "Kilobayt",
      "Megabayt",
      "Gigabayt"
    ],
    "answer": "Terabayt"
  },
  {
    "id": 48,
    "category": "nazariy",
    "question": "Kompyuter texnikasi ma'lumotlarni asosan qaysi sanoq sistemasida qayta ishlaydi?",
    "options": [
      "Ikkilik (2-lik)",
      "O'nlik (10-lik)",
      "Sakkizlik (8-lik)",
      "O'n oltilik (16-lik)"
    ],
    "answer": "Ikkilik (2-lik)"
  },
  {
    "id": 49,
    "category": "nazariy",
    "question": "Ikkilik sanoq sistemasida quyidagi raqamlardan qaysi biri ISHLATILMAYDI?",
    "options": [
      "2",
      "0",
      "1",
      "0 va 1"
    ],
    "answer": "2"
  },
  {
    "id": 50,
    "category": "nazariy",
    "question": "Sanoq sistemasining asosi nimani bildiradi?",
    "options": [
      "Unda ishlatiladigan raqamlar sonini",
      "Sonning uzunligini",
      "Xotira hajmini",
      "Amallar sonini"
    ],
    "answer": "Unda ishlatiladigan raqamlar sonini"
  },
  {
    "id": 51,
    "category": "nazariy",
    "question": "Ikkilik sonda o'ngdan birinchi xonaning qiymati nechaga teng?",
    "options": [
      "1",
      "2",
      "0",
      "10"
    ],
    "answer": "1"
  }
];

// Global eksport.
// Classic script'dagi top-level `const` window obyektiga tushmaydi, shuning uchun
// buni aniq yozish shart — aks holda student.js/admin.js dagi window.ALL_QUESTIONS
// undefined bo'lib, test savollari umuman yuklanmaydi.
window.ALL_QUESTIONS = ALL_QUESTIONS;
