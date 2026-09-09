/**
 * 3-Dars: Amaliy Mashg'ulotlar Ma'lumotlari (Exercises)
 * 1-bo'lim: Axborot o'lchov birliklari (10 ta misol)
 * 2-bo'lim: 2-lik sanoq sistemasidan 10-likka o'tish (10 ta misol)
 * 3-bo'lim: 10-lik sanoq sistemasidan 2-likka o'tish (10 ta misol)
 */

const PRACTICAL_SECTIONS = [
  {
    id: "section-1",
    sectionNumber: 1,
    title: "1-Bo'lim: Axborot O'lchov Birliklari",
    subtitle: "Birliklarni o'zaro aylantiring va to'g'ri sonni yozing",
    icon: `<svg class="icon" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>`,
    ruleText: "<strong>Asosiy qoida:</strong> 1 B = 8 bit; 1 KB = 1024 B; 1 MB = 1024 KB; 1 GB = 1024 MB. Faqat son qiymatini yozing.",
    questions: [
      {
        id: "s1_q1",
        num: "01",
        prompt: "5 KB = ? B",
        unitHint: "Bayt (B)",
        placeholder: "Masalan: 5120",
        expectedAnswer: "5120",
        solution: "5 × 1024 = 5120 B"
      },
      {
        id: "s1_q2",
        num: "02",
        prompt: "3 MB = ? KB",
        unitHint: "Kilobayt (KB)",
        placeholder: "Masalan: 3072",
        expectedAnswer: "3072",
        solution: "3 × 1024 = 3072 KB"
      },
      {
        id: "s1_q3",
        num: "03",
        prompt: "2 GB = ? MB",
        unitHint: "Megabayt (MB)",
        placeholder: "Masalan: 2048",
        expectedAnswer: "2048",
        solution: "2 × 1024 = 2048 MB"
      },
      {
        id: "s1_q4",
        num: "04",
        prompt: "4096 B = ? KB",
        unitHint: "Kilobayt (KB)",
        placeholder: "Masalan: 4",
        expectedAnswer: "4",
        solution: "4096 / 1024 = 4 KB"
      },
      {
        id: "s1_q5",
        num: "05",
        prompt: "2048 KB = ? MB",
        unitHint: "Megabayt (MB)",
        placeholder: "Masalan: 2",
        expectedAnswer: "2",
        solution: "2048 / 1024 = 2 MB"
      },
      {
        id: "s1_q6",
        num: "06",
        prompt: "8192 B = ? KB",
        unitHint: "Kilobayt (KB)",
        placeholder: "Masalan: 8",
        expectedAnswer: "8",
        solution: "8192 / 1024 = 8 KB"
      },
      {
        id: "s1_q7",
        num: "07",
        prompt: "5 MB = ? B",
        unitHint: "Bayt (B)",
        placeholder: "Masalan: 5242880",
        expectedAnswer: "5242880",
        solution: "5 × 1024 × 1024 = 5 242 880 B"
      },
      {
        id: "s1_q8",
        num: "08",
        prompt: "3 GB = ? KB",
        unitHint: "Kilobayt (KB)",
        placeholder: "Masalan: 3145728",
        expectedAnswer: "3145728",
        solution: "3 × 1024 × 1024 = 3 145 728 KB"
      },
      {
        id: "s1_q9",
        num: "09",
        prompt: "16 384 KB = ? MB",
        unitHint: "Megabayt (MB)",
        placeholder: "Masalan: 16",
        expectedAnswer: "16",
        solution: "16 384 / 1024 = 16 MB"
      },
      {
        id: "s1_q10",
        num: "10",
        prompt: "10 240 MB = ? GB",
        unitHint: "Gigabayt (GB)",
        placeholder: "Masalan: 10",
        expectedAnswer: "10",
        solution: "10 240 / 1024 = 10 GB"
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
        id: "s2_q1",
        num: "01",
        prompt: "101₂ = ?₁₀",
        unitHint: "10-lik son",
        placeholder: "Masalan: 5",
        expectedAnswer: "5",
        solution: "4 + 1 = 5"
      },
      {
        id: "s2_q2",
        num: "02",
        prompt: "110₂ = ?₁₀",
        unitHint: "10-lik son",
        placeholder: "Masalan: 6",
        expectedAnswer: "6",
        solution: "4 + 2 = 6"
      },
      {
        id: "s2_q3",
        num: "03",
        prompt: "1001₂ = ?₁₀",
        unitHint: "10-lik son",
        placeholder: "Masalan: 9",
        expectedAnswer: "9",
        solution: "8 + 1 = 9"
      },
      {
        id: "s2_q4",
        num: "04",
        prompt: "1010₂ = ?₁₀",
        unitHint: "10-lik son",
        placeholder: "Masalan: 10",
        expectedAnswer: "10",
        solution: "8 + 2 = 10"
      },
      {
        id: "s2_q5",
        num: "05",
        prompt: "1101₂ = ?₁₀",
        unitHint: "10-lik son",
        placeholder: "Masalan: 13",
        expectedAnswer: "13",
        solution: "8 + 4 + 1 = 13"
      },
      {
        id: "s2_q6",
        num: "06",
        prompt: "1111₂ = ?₁₀",
        unitHint: "10-lik son",
        placeholder: "Masalan: 15",
        expectedAnswer: "15",
        solution: "8 + 4 + 2 + 1 = 15"
      },
      {
        id: "s2_q7",
        num: "07",
        prompt: "10000₂ = ?₁₀",
        unitHint: "10-lik son",
        placeholder: "Masalan: 16",
        expectedAnswer: "16",
        solution: "2⁴ = 16"
      },
      {
        id: "s2_q8",
        num: "08",
        prompt: "10101₂ = ?₁₀",
        unitHint: "10-lik son",
        placeholder: "Masalan: 21",
        expectedAnswer: "21",
        solution: "16 + 4 + 1 = 21"
      },
      {
        id: "s2_q9",
        num: "09",
        prompt: "11011₂ = ?₁₀",
        unitHint: "10-lik son",
        placeholder: "Masalan: 27",
        expectedAnswer: "27",
        solution: "16 + 8 + 2 + 1 = 27"
      },
      {
        id: "s2_q10",
        num: "10",
        prompt: "101010₂ = ?₁₀",
        unitHint: "10-lik son",
        placeholder: "Masalan: 42",
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
        placeholder: "Masalan: 110010",
        expectedAnswer: "110010",
        solution: "32 + 16 + 2 = 110010₂"
      },
      {
        id: "s3_q2",
        num: "02",
        prompt: "70₁₀ = ?₂",
        unitHint: "2-lik kod (0 va 1)",
        placeholder: "Masalan: 1000110",
        expectedAnswer: "1000110",
        solution: "64 + 4 + 2 = 1000110₂"
      },
      {
        id: "s3_q3",
        num: "03",
        prompt: "100₁₀ = ?₂",
        unitHint: "2-lik kod (0 va 1)",
        placeholder: "Masalan: 1100100",
        expectedAnswer: "1100100",
        solution: "64 + 32 + 4 = 1100100₂"
      },
      {
        id: "s3_q4",
        num: "04",
        prompt: "102₁₀ = ?₂",
        unitHint: "2-lik kod (0 va 1)",
        placeholder: "Masalan: 1100110",
        expectedAnswer: "1100110",
        solution: "64 + 32 + 4 + 2 = 1100110₂"
      },
      {
        id: "s3_q5",
        num: "05",
        prompt: "105₁₀ = ?₂",
        unitHint: "2-lik kod (0 va 1)",
        placeholder: "Masalan: 1101001",
        expectedAnswer: "1101001",
        solution: "64 + 32 + 8 + 1 = 1101001₂"
      },
      {
        id: "s3_q6",
        num: "06",
        prompt: "108₁₀ = ?₂",
        unitHint: "2-lik kod (0 va 1)",
        placeholder: "Masalan: 1101100",
        expectedAnswer: "1101100",
        solution: "64 + 32 + 8 + 4 = 1101100₂"
      },
      {
        id: "s3_q7",
        num: "07",
        prompt: "150₁₀ = ?₂",
        unitHint: "2-lik kod (0 va 1)",
        placeholder: "Masalan: 10010110",
        expectedAnswer: "10010110",
        solution: "128 + 16 + 4 + 2 = 10010110₂"
      },
      {
        id: "s3_q8",
        num: "08",
        prompt: "200₁₀ = ?₂",
        unitHint: "2-lik kod (0 va 1)",
        placeholder: "Masalan: 11001000",
        expectedAnswer: "11001000",
        solution: "128 + 64 + 8 = 11001000₂"
      },
      {
        id: "s3_q9",
        num: "09",
        prompt: "205₁₀ = ?₂",
        unitHint: "2-lik kod (0 va 1)",
        placeholder: "Masalan: 11001101",
        expectedAnswer: "11001101",
        solution: "128 + 64 + 8 + 4 + 1 = 11001101₂"
      },
      {
        id: "s3_q10",
        num: "10",
        prompt: "255₁₀ = ?₂",
        unitHint: "2-lik kod (0 va 1)",
        placeholder: "Masalan: 11111111",
        expectedAnswer: "11111111",
        solution: "128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = 11111111₂"
      }
    ]
  }
];

/**
 * Javobni tekshirish uchun qulay yordamchi funksiya.
 * Bo'shliqlar, birlik harflari (B, KB, MB, GB, 2, 10 va b.) ni aqlli tozalaydi.
 */
function normalizeAnswer(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "") // barcha bo'shliqlarni olib tashlash (masalan "5 120" -> "5120")
    .replace(/[bkmg]b?$/i, "") // oxiridagi birliklarni olib tashlash (5120b -> 5120)
    .replace(/₂|₁₀/g, ""); // indeks belgilarini olib tashlash
}

function checkPracticalAnswer(userAnswer, expectedAnswer) {
  const normUser = normalizeAnswer(userAnswer);
  const normExp = normalizeAnswer(expectedAnswer);
  return normUser !== "" && normUser === normExp;
}

// Global eksport
window.PRACTICAL_SECTIONS = PRACTICAL_SECTIONS;
window.checkPracticalAnswer = checkPracticalAnswer;
window.normalizeAnswer = normalizeAnswer;
