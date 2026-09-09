/**
 * 3-Dars: Amaliy Mashg'ulotlar Ma'lumotlari (Exercises)
 * 1-bo'lim: Axborot o'lchov birliklari — 10 ta misol (har biri BITTA amal bilan yechiladi)
 * 2-bo'lim: 2-lik sanoq sistemasidan 10-likka o'tish — 5 ta misol
 * 3-bo'lim: 10-lik sanoq sistemasidan 2-likka o'tish — 5 ta misol
 *
 * Eslatma: savollar sonini o'zgartirsangiz, boshqa hech qayerda tuzatish
 * kerak emas — ballar va "n / m" yozuvlari shu ro'yxatdan avtomatik hisoblanadi.
 */

const PRACTICAL_SECTIONS = [
  {
    id: "section-1",
    sectionNumber: 1,
    title: "1-Bo'lim: Axborot O'lchov Birliklari",
    subtitle: "Birliklarni o'zaro aylantiring va to'g'ri sonni yozing",
    icon: `<svg class="icon" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>`,
    ruleText: "<strong>Asosiy qoida:</strong> 1 B = 8 bit; 1 KB = 1024 B; 1 MB = 1024 KB; 1 GB = 1024 MB; 1 TB = 1024 GB. Har bir misol bitta amal (bitta ko'paytirish yoki bitta bo'lish) bilan yechiladi. Faqat son qiymatini yozing.",
    questions: [
      {
        id: "s1_q1",
        num: "01",
        prompt: "7 KB = ? B",
        unitHint: "Bayt (B)",
        placeholder: "Faqat sonni yozing",
        expectedAnswer: "7168",
        solution: "7 × 1024 = 7168 B"
      },
      {
        id: "s1_q2",
        num: "02",
        prompt: "4 MB = ? KB",
        unitHint: "Kilobayt (KB)",
        placeholder: "Faqat sonni yozing",
        expectedAnswer: "4096",
        solution: "4 × 1024 = 4096 KB"
      },
      {
        id: "s1_q3",
        num: "03",
        prompt: "6 GB = ? MB",
        unitHint: "Megabayt (MB)",
        placeholder: "Faqat sonni yozing",
        expectedAnswer: "6144",
        solution: "6 × 1024 = 6144 MB"
      },
      {
        id: "s1_q4",
        num: "04",
        prompt: "2 TB = ? GB",
        unitHint: "Gigabayt (GB)",
        placeholder: "Faqat sonni yozing",
        expectedAnswer: "2048",
        solution: "2 × 1024 = 2048 GB"
      },
      {
        id: "s1_q5",
        num: "05",
        prompt: "9 B = ? bit",
        unitHint: "bit",
        placeholder: "Faqat sonni yozing",
        expectedAnswer: "72",
        solution: "9 × 8 = 72 bit"
      },
      {
        id: "s1_q6",
        num: "06",
        prompt: "56 bit = ? B",
        unitHint: "Bayt (B)",
        placeholder: "Faqat sonni yozing",
        expectedAnswer: "7",
        solution: "56 / 8 = 7 B"
      },
      {
        id: "s1_q7",
        num: "07",
        prompt: "6144 B = ? KB",
        unitHint: "Kilobayt (KB)",
        placeholder: "Faqat sonni yozing",
        expectedAnswer: "6",
        solution: "6144 / 1024 = 6 KB"
      },
      {
        id: "s1_q8",
        num: "08",
        prompt: "5120 KB = ? MB",
        unitHint: "Megabayt (MB)",
        placeholder: "Faqat sonni yozing",
        expectedAnswer: "5",
        solution: "5120 / 1024 = 5 MB"
      },
      {
        id: "s1_q9",
        num: "09",
        prompt: "3072 MB = ? GB",
        unitHint: "Gigabayt (GB)",
        placeholder: "Faqat sonni yozing",
        expectedAnswer: "3",
        solution: "3072 / 1024 = 3 GB"
      },
      {
        id: "s1_q10",
        num: "10",
        prompt: "9216 B = ? KB",
        unitHint: "Kilobayt (KB)",
        placeholder: "Faqat sonni yozing",
        expectedAnswer: "9",
        solution: "9216 / 1024 = 9 KB"
      }
    ]
  },
  {
    id: "section-2",
    sectionNumber: 2,
    title: "2-Bo'lim: 2-likdan 10-lik Sanoq Sistemasiga O'tish",
    subtitle: "Ikkilik kodni o'nlik songa aylantiring va javobni yozing",
    icon: `<svg class="icon" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>`,
    ruleText: "<strong>O'tish qoidasi:</strong> O'ngdan chapga 2 ning darajalari: ... 64, 32, 16, 8, 4, 2, 1. Faqat 1 bo'lgan xonalar qo'shiladi.",
    questions: [
      {
        id: "s2_q6",
        num: "01",
        prompt: "1111₂ = ?₁₀",
        unitHint: "10-lik son",
        placeholder: "Faqat sonni yozing",
        expectedAnswer: "15",
        solution: "8 + 4 + 2 + 1 = 15"
      },
      {
        id: "s2_q7",
        num: "02",
        prompt: "10000₂ = ?₁₀",
        unitHint: "10-lik son",
        placeholder: "Faqat sonni yozing",
        expectedAnswer: "16",
        solution: "2⁴ = 16"
      },
      {
        id: "s2_q8",
        num: "03",
        prompt: "10101₂ = ?₁₀",
        unitHint: "10-lik son",
        placeholder: "Faqat sonni yozing",
        expectedAnswer: "21",
        solution: "16 + 4 + 1 = 21"
      },
      {
        id: "s2_q9",
        num: "04",
        prompt: "11011₂ = ?₁₀",
        unitHint: "10-lik son",
        placeholder: "Faqat sonni yozing",
        expectedAnswer: "27",
        solution: "16 + 8 + 2 + 1 = 27"
      },
      {
        id: "s2_q10",
        num: "05",
        prompt: "101010₂ = ?₁₀",
        unitHint: "10-lik son",
        placeholder: "Faqat sonni yozing",
        expectedAnswer: "42",
        solution: "32 + 8 + 2 = 42"
      }
    ]
  },
  {
    id: "section-3",
    sectionNumber: 3,
    title: "3-Bo'lim: 10-likdan 2-lik Sanoq Sistemasiga O'tish",
    subtitle: "O'nlik sonni ikkilik (0 va 1) ko'rinishida yozing",
    icon: `<svg class="icon" viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>`,
    ruleText: "<strong>O'tish qoidasi:</strong> Sonni ketma-ket 2 ga bo'lib qoldiqlarni teskari tartibda oling yoki 2 ning darajalari yig'indisi ko'rinishida yozing.",
    questions: [
      {
        id: "s3_q1",
        num: "01",
        prompt: "50₁₀ = ?₂",
        unitHint: "2-lik kod (0 va 1)",
        placeholder: "Masalan: 1010110",
        expectedAnswer: "110010",
        solution: "32 + 16 + 2 = 110010₂"
      },
      {
        id: "s3_q2",
        num: "02",
        prompt: "70₁₀ = ?₂",
        unitHint: "2-lik kod (0 va 1)",
        placeholder: "Masalan: 1010110",
        expectedAnswer: "1000110",
        solution: "64 + 4 + 2 = 1000110₂"
      },
      {
        id: "s3_q3",
        num: "03",
        prompt: "100₁₀ = ?₂",
        unitHint: "2-lik kod (0 va 1)",
        placeholder: "Masalan: 1010110",
        expectedAnswer: "1100100",
        solution: "64 + 32 + 4 = 1100100₂"
      },
      {
        id: "s3_q7",
        num: "04",
        prompt: "150₁₀ = ?₂",
        unitHint: "2-lik kod (0 va 1)",
        placeholder: "Masalan: 1010110",
        expectedAnswer: "10010110",
        solution: "128 + 16 + 4 + 2 = 10010110₂"
      },
      {
        id: "s3_q10",
        num: "05",
        prompt: "255₁₀ = ?₂",
        unitHint: "2-lik kod (0 va 1)",
        placeholder: "Masalan: 1010110",
        expectedAnswer: "11111111",
        solution: "128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = 11111111₂"
      }
    ]
  }
];

/**
 * Javobni tekshirish uchun yordamchi funksiya.
 * Bo'shliqlarni, birlik nomlarini (bit, B, KB, MB, GB, TB) va ₂/₁₀ indekslarini tozalaydi,
 * shunda "7168", "7168 B" va "7168b" bir xil deb qabul qilinadi.
 */
function normalizeAnswer(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")          // "5 120" -> "5120"
    .replace(/₂|₁₀/g, "")         // indeks belgilarini olib tashlash
    .replace(/(bayt|bit|kb|mb|gb|tb|b)$/i, ""); // oxiridagi birlik nomini olib tashlash
}

function checkPracticalAnswer(userAnswer, expectedAnswer) {
  const normUser = normalizeAnswer(userAnswer);
  const normExp = normalizeAnswer(expectedAnswer);
  return normUser !== "" && normUser === normExp;
}

/** Bo'limdagi savollar soni (ball hisoblash uchun yagona manba) */
function getSectionTotal(sectionNumber) {
  const sec = PRACTICAL_SECTIONS[sectionNumber - 1];
  return sec ? sec.questions.length : 0;
}

// Global eksport
window.PRACTICAL_SECTIONS = PRACTICAL_SECTIONS;
window.checkPracticalAnswer = checkPracticalAnswer;
window.normalizeAnswer = normalizeAnswer;
window.getSectionTotal = getSectionTotal;
