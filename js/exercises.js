/**
 * 3-Dars: Amaliy Mashg'ulotlar Ma'lumotlari (Exercises)
 * 5 XIL VARIANT (Variant 1, 2, 3, 4, 5)
 *
 * Har bir variant tarkibi:
 *  - 1-Bo'lim: Axborot o'lchov birliklari — 10 ta sodda, bir amalli misol (chalg'itishlarsiz)
 *  - 2-Bo'lim: 2-likdan 10-likka o'tish — 5 ta misol
 *  - 3-Bo'lim: 10-likdan 2-likka o'tish — 5 ta misol
 *
 * Har bir talabaga alohida variant tushadi va bo'lim ichidagi savollar ham
 * aralashtirib beriladi (yonma-yon o'tirgan talabalar bir-biridan ko'chira olmaydi).
 */

const EXERCISE_VARIANTS = {
  1: {
    section1: [
      { id: "v1_s1_q1", num: "01", prompt: "3 KB = ? B", unitHint: "Bayt (B)", placeholder: "Faqat sonni yozing", expectedAnswer: "3072", solution: "3 × 1024 = 3072 B" },
      { id: "v1_s1_q2", num: "02", prompt: "2 MB = ? KB", unitHint: "Kilobayt (KB)", placeholder: "Faqat sonni yozing", expectedAnswer: "2048", solution: "2 × 1024 = 2048 KB" },
      { id: "v1_s1_q3", num: "03", prompt: "5 GB = ? MB", unitHint: "Megabayt (MB)", placeholder: "Faqat sonni yozing", expectedAnswer: "5120", solution: "5 × 1024 = 5120 MB" },
      { id: "v1_s1_q4", num: "04", prompt: "4 TB = ? GB", unitHint: "Gigabayt (GB)", placeholder: "Faqat sonni yozing", expectedAnswer: "4096", solution: "4 × 1024 = 4096 GB" },
      { id: "v1_s1_q5", num: "05", prompt: "6 B = ? bit", unitHint: "bit", placeholder: "Faqat sonni yozing", expectedAnswer: "48", solution: "6 × 8 = 48 bit" },
      { id: "v1_s1_q6", num: "06", prompt: "40 bit = ? B", unitHint: "Bayt (B)", placeholder: "Faqat sonni yozing", expectedAnswer: "5", solution: "40 / 8 = 5 B" },
      { id: "v1_s1_q7", num: "07", prompt: "2048 B = ? KB", unitHint: "Kilobayt (KB)", placeholder: "Faqat sonni yozing", expectedAnswer: "2", solution: "2048 / 1024 = 2 KB" },
      { id: "v1_s1_q8", num: "08", prompt: "3072 KB = ? MB", unitHint: "Megabayt (MB)", placeholder: "Faqat sonni yozing", expectedAnswer: "3", solution: "3072 / 1024 = 3 MB" },
      { id: "v1_s1_q9", num: "09", prompt: "4096 MB = ? GB", unitHint: "Gigabayt (GB)", placeholder: "Faqat sonni yozing", expectedAnswer: "4", solution: "4096 / 1024 = 4 GB" },
      { id: "v1_s1_q10", num: "10", prompt: "8192 B = ? KB", unitHint: "Kilobayt (KB)", placeholder: "Faqat sonni yozing", expectedAnswer: "8", solution: "8192 / 1024 = 8 KB" }
    ],
    section2: [
      { id: "v1_s2_q1", num: "01", prompt: "101₂ = ?₁₀", unitHint: "10-lik son", placeholder: "Faqat sonni yozing", expectedAnswer: "5", solution: "4 + 1 = 5" },
      { id: "v1_s2_q2", num: "02", prompt: "1110₂ = ?₁₀", unitHint: "10-lik son", placeholder: "Faqat sonni yozing", expectedAnswer: "14", solution: "8 + 4 + 2 = 14" },
      { id: "v1_s2_q3", num: "03", prompt: "10101₂ = ?₁₀", unitHint: "10-lik son", placeholder: "Faqat sonni yozing", expectedAnswer: "21", solution: "16 + 4 + 1 = 21" },
      { id: "v1_s2_q4", num: "04", prompt: "11000₂ = ?₁₀", unitHint: "10-lik son", placeholder: "Faqat sonni yozing", expectedAnswer: "24", solution: "16 + 8 = 24" },
      { id: "v1_s2_q5", num: "05", prompt: "100001₂ = ?₁₀", unitHint: "10-lik son", placeholder: "Faqat sonni yozing", expectedAnswer: "33", solution: "32 + 1 = 33" }
    ],
    section3: [
      { id: "v1_s3_q1", num: "01", prompt: "12₁₀ = ?₂", unitHint: "2-lik kod (0 va 1)", placeholder: "Masalan: 1100", expectedAnswer: "1100", solution: "8 + 4 = 1100₂" },
      { id: "v1_s3_q2", num: "02", prompt: "25₁₀ = ?₂", unitHint: "2-lik kod (0 va 1)", placeholder: "Masalan: 11001", expectedAnswer: "11001", solution: "16 + 8 + 1 = 11001₂" },
      { id: "v1_s3_q3", num: "03", prompt: "50₁₀ = ?₂", unitHint: "2-lik kod (0 va 1)", placeholder: "Masalan: 110010", expectedAnswer: "110010", solution: "32 + 16 + 2 = 110010₂" },
      { id: "v1_s3_q4", num: "04", prompt: "70₁₀ = ?₂", unitHint: "2-lik kod (0 va 1)", placeholder: "Masalan: 1000110", expectedAnswer: "1000110", solution: "64 + 4 + 2 = 1000110₂" },
      { id: "v1_s3_q5", num: "05", prompt: "100₁₀ = ?₂", unitHint: "2-lik kod (0 va 1)", placeholder: "Masalan: 1100100", expectedAnswer: "1100100", solution: "64 + 32 + 4 = 1100100₂" }
    ]
  },

  2: {
    section1: [
      { id: "v2_s1_q1", num: "01", prompt: "5 KB = ? B", unitHint: "Bayt (B)", placeholder: "Faqat sonni yozing", expectedAnswer: "5120", solution: "5 × 1024 = 5120 B" },
      { id: "v2_s1_q2", num: "02", prompt: "3 MB = ? KB", unitHint: "Kilobayt (KB)", placeholder: "Faqat sonni yozing", expectedAnswer: "3072", solution: "3 × 1024 = 3072 KB" },
      { id: "v2_s1_q3", num: "03", prompt: "2 GB = ? MB", unitHint: "Megabayt (MB)", placeholder: "Faqat sonni yozing", expectedAnswer: "2048", solution: "2 × 1024 = 2048 MB" },
      { id: "v2_s1_q4", num: "04", prompt: "3 TB = ? GB", unitHint: "Gigabayt (GB)", placeholder: "Faqat sonni yozing", expectedAnswer: "3072", solution: "3 × 1024 = 3072 GB" },
      { id: "v2_s1_q5", num: "05", prompt: "8 B = ? bit", unitHint: "bit", placeholder: "Faqat sonni yozing", expectedAnswer: "64", solution: "8 × 8 = 64 bit" },
      { id: "v2_s1_q6", num: "06", prompt: "32 bit = ? B", unitHint: "Bayt (B)", placeholder: "Faqat sonni yozing", expectedAnswer: "4", solution: "32 / 8 = 4 B" },
      { id: "v2_s1_q7", num: "07", prompt: "4096 B = ? KB", unitHint: "Kilobayt (KB)", placeholder: "Faqat sonni yozing", expectedAnswer: "4", solution: "4096 / 1024 = 4 KB" },
      { id: "v2_s1_q8", num: "08", prompt: "6144 KB = ? MB", unitHint: "Megabayt (MB)", placeholder: "Faqat sonni yozing", expectedAnswer: "6", solution: "6144 / 1024 = 6 MB" },
      { id: "v2_s1_q9", num: "09", prompt: "2048 MB = ? GB", unitHint: "Gigabayt (GB)", placeholder: "Faqat sonni yozing", expectedAnswer: "2", solution: "2048 / 1024 = 2 GB" },
      { id: "v2_s1_q10", num: "10", prompt: "7168 B = ? KB", unitHint: "Kilobayt (KB)", placeholder: "Faqat sonni yozing", expectedAnswer: "7", solution: "7168 / 1024 = 7 KB" }
    ],
    section2: [
      { id: "v2_s2_q1", num: "01", prompt: "110₂ = ?₁₀", unitHint: "10-lik son", placeholder: "Faqat sonni yozing", expectedAnswer: "6", solution: "4 + 2 = 6" },
      { id: "v2_s2_q2", num: "02", prompt: "1101₂ = ?₁₀", unitHint: "10-lik son", placeholder: "Faqat sonni yozing", expectedAnswer: "13", solution: "8 + 4 + 1 = 13" },
      { id: "v2_s2_q3", num: "03", prompt: "10011₂ = ?₁₀", unitHint: "10-lik son", placeholder: "Faqat sonni yozing", expectedAnswer: "19", solution: "16 + 2 + 1 = 19" },
      { id: "v2_s2_q4", num: "04", prompt: "11010₂ = ?₁₀", unitHint: "10-lik son", placeholder: "Faqat sonni yozing", expectedAnswer: "26", solution: "16 + 8 + 2 = 26" },
      { id: "v2_s2_q5", num: "05", prompt: "100100₂ = ?₁₀", unitHint: "10-lik son", placeholder: "Faqat sonni yozing", expectedAnswer: "36", solution: "32 + 4 = 36" }
    ],
    section3: [
      { id: "v2_s3_q1", num: "01", prompt: "13₁₀ = ?₂", unitHint: "2-lik kod (0 va 1)", placeholder: "Masalan: 1101", expectedAnswer: "1101", solution: "8 + 4 + 1 = 1101₂" },
      { id: "v2_s3_q2", num: "02", prompt: "26₁₀ = ?₂", unitHint: "2-lik kod (0 va 1)", placeholder: "Masalan: 11010", expectedAnswer: "11010", solution: "16 + 8 + 2 = 11010₂" },
      { id: "v2_s3_q3", num: "03", prompt: "45₁₀ = ?₂", unitHint: "2-lik kod (0 va 1)", placeholder: "Masalan: 101101", expectedAnswer: "101101", solution: "32 + 8 + 4 + 1 = 101101₂" },
      { id: "v2_s3_q4", num: "04", prompt: "65₁₀ = ?₂", unitHint: "2-lik kod (0 va 1)", placeholder: "Masalan: 1000001", expectedAnswer: "1000001", solution: "64 + 1 = 1000001₂" },
      { id: "v2_s3_q5", num: "05", prompt: "128₁₀ = ?₂", unitHint: "2-lik kod (0 va 1)", placeholder: "Masalan: 10000000", expectedAnswer: "10000000", solution: "128 = 10000000₂" }
    ]
  },

  3: {
    section1: [
      { id: "v3_s1_q1", num: "01", prompt: "4 KB = ? B", unitHint: "Bayt (B)", placeholder: "Faqat sonni yozing", expectedAnswer: "4096", solution: "4 × 1024 = 4096 B" },
      { id: "v3_s1_q2", num: "02", prompt: "6 MB = ? KB", unitHint: "Kilobayt (KB)", placeholder: "Faqat sonni yozing", expectedAnswer: "6144", solution: "6 × 1024 = 6144 KB" },
      { id: "v3_s1_q3", num: "03", prompt: "3 GB = ? MB", unitHint: "Megabayt (MB)", placeholder: "Faqat sonni yozing", expectedAnswer: "3072", solution: "3 × 1024 = 3072 MB" },
      { id: "v3_s1_q4", num: "04", prompt: "1 TB = ? GB", unitHint: "Gigabayt (GB)", placeholder: "Faqat sonni yozing", expectedAnswer: "1024", solution: "1 × 1024 = 1024 GB" },
      { id: "v3_s1_q5", num: "05", prompt: "5 B = ? bit", unitHint: "bit", placeholder: "Faqat sonni yozing", expectedAnswer: "40", solution: "5 × 8 = 40 bit" },
      { id: "v3_s1_q6", num: "06", prompt: "48 bit = ? B", unitHint: "Bayt (B)", placeholder: "Faqat sonni yozing", expectedAnswer: "6", solution: "48 / 8 = 6 B" },
      { id: "v3_s1_q7", num: "07", prompt: "3072 B = ? KB", unitHint: "Kilobayt (KB)", placeholder: "Faqat sonni yozing", expectedAnswer: "3", solution: "3072 / 1024 = 3 KB" },
      { id: "v3_s1_q8", num: "08", prompt: "2048 KB = ? MB", unitHint: "Megabayt (MB)", placeholder: "Faqat sonni yozing", expectedAnswer: "2", solution: "2048 / 1024 = 2 MB" },
      { id: "v3_s1_q9", num: "09", prompt: "5120 MB = ? GB", unitHint: "Gigabayt (GB)", placeholder: "Faqat sonni yozing", expectedAnswer: "5", solution: "5120 / 1024 = 5 GB" },
      { id: "v3_s1_q10", num: "10", prompt: "1024 B = ? KB", unitHint: "Kilobayt (KB)", placeholder: "Faqat sonni yozing", expectedAnswer: "1", solution: "1024 / 1024 = 1 KB" }
    ],
    section2: [
      { id: "v3_s2_q1", num: "01", prompt: "111₂ = ?₁₀", unitHint: "10-lik son", placeholder: "Faqat sonni yozing", expectedAnswer: "7", solution: "4 + 2 + 1 = 7" },
      { id: "v3_s2_q2", num: "02", prompt: "1011₂ = ?₁₀", unitHint: "10-lik son", placeholder: "Faqat sonni yozing", expectedAnswer: "11", solution: "8 + 2 + 1 = 11" },
      { id: "v3_s2_q3", num: "03", prompt: "10110₂ = ?₁₀", unitHint: "10-lik son", placeholder: "Faqat sonni yozing", expectedAnswer: "22", solution: "16 + 4 + 2 = 22" },
      { id: "v3_s2_q4", num: "04", prompt: "11011₂ = ?₁₀", unitHint: "10-lik son", placeholder: "Faqat sonni yozing", expectedAnswer: "27", solution: "16 + 8 + 2 + 1 = 27" },
      { id: "v3_s2_q5", num: "05", prompt: "101010₂ = ?₁₀", unitHint: "10-lik son", placeholder: "Faqat sonni yozing", expectedAnswer: "42", solution: "32 + 8 + 2 = 42" }
    ],
    section3: [
      { id: "v3_s3_q1", num: "01", prompt: "14₁₀ = ?₂", unitHint: "2-lik kod (0 va 1)", placeholder: "Masalan: 1110", expectedAnswer: "1110", solution: "8 + 4 + 2 = 1110₂" },
      { id: "v3_s3_q2", num: "02", prompt: "28₁₀ = ?₂", unitHint: "2-lik kod (0 va 1)", placeholder: "Masalan: 11100", expectedAnswer: "11100", solution: "16 + 8 + 4 = 11100₂" },
      { id: "v3_s3_q3", num: "03", prompt: "55₁₀ = ?₂", unitHint: "2-lik kod (0 va 1)", placeholder: "Masalan: 110111", expectedAnswer: "110111", solution: "32 + 16 + 4 + 2 + 1 = 110111₂" },
      { id: "v3_s3_q4", num: "04", prompt: "80₁₀ = ?₂", unitHint: "2-lik kod (0 va 1)", placeholder: "Masalan: 1010000", expectedAnswer: "1010000", solution: "64 + 16 = 1010000₂" },
      { id: "v3_s3_q5", num: "05", prompt: "150₁₀ = ?₂", unitHint: "2-lik kod (0 va 1)", placeholder: "Masalan: 10010110", expectedAnswer: "10010110", solution: "128 + 16 + 4 + 2 = 10010110₂" }
    ]
  },

  4: {
    section1: [
      { id: "v4_s1_q1", num: "01", prompt: "2 KB = ? B", unitHint: "Bayt (B)", placeholder: "Faqat sonni yozing", expectedAnswer: "2048", solution: "2 × 1024 = 2048 B" },
      { id: "v4_s1_q2", num: "02", prompt: "5 MB = ? KB", unitHint: "Kilobayt (KB)", placeholder: "Faqat sonni yozing", expectedAnswer: "5120", solution: "5 × 1024 = 5120 KB" },
      { id: "v4_s1_q3", num: "03", prompt: "4 GB = ? MB", unitHint: "Megabayt (MB)", placeholder: "Faqat sonni yozing", expectedAnswer: "4096", solution: "4 × 1024 = 4096 MB" },
      { id: "v4_s1_q4", num: "04", prompt: "5 TB = ? GB", unitHint: "Gigabayt (GB)", placeholder: "Faqat sonni yozing", expectedAnswer: "5120", solution: "5 × 1024 = 5120 GB" },
      { id: "v4_s1_q5", num: "05", prompt: "7 B = ? bit", unitHint: "bit", placeholder: "Faqat sonni yozing", expectedAnswer: "56", solution: "7 × 8 = 56 bit" },
      { id: "v4_s1_q6", num: "06", prompt: "64 bit = ? B", unitHint: "Bayt (B)", placeholder: "Faqat sonni yozing", expectedAnswer: "8", solution: "64 / 8 = 8 B" },
      { id: "v4_s1_q7", num: "07", prompt: "5120 B = ? KB", unitHint: "Kilobayt (KB)", placeholder: "Faqat sonni yozing", expectedAnswer: "5", solution: "5120 / 1024 = 5 KB" },
      { id: "v4_s1_q8", num: "08", prompt: "4096 KB = ? MB", unitHint: "Megabayt (MB)", placeholder: "Faqat sonni yozing", expectedAnswer: "4", solution: "4096 / 1024 = 4 MB" },
      { id: "v4_s1_q9", num: "09", prompt: "3072 MB = ? GB", unitHint: "Gigabayt (GB)", placeholder: "Faqat sonni yozing", expectedAnswer: "3", solution: "3072 / 1024 = 3 GB" },
      { id: "v4_s1_q10", num: "10", prompt: "6144 B = ? KB", unitHint: "Kilobayt (KB)", placeholder: "Faqat sonni yozing", expectedAnswer: "6", solution: "6144 / 1024 = 6 KB" }
    ],
    section2: [
      { id: "v4_s2_q1", num: "01", prompt: "1001₂ = ?₁₀", unitHint: "10-lik son", placeholder: "Faqat sonni yozing", expectedAnswer: "9", solution: "8 + 1 = 9" },
      { id: "v4_s2_q2", num: "02", prompt: "1111₂ = ?₁₀", unitHint: "10-lik son", placeholder: "Faqat sonni yozing", expectedAnswer: "15", solution: "8 + 4 + 2 + 1 = 15" },
      { id: "v4_s2_q3", num: "03", prompt: "10100₂ = ?₁₀", unitHint: "10-lik son", placeholder: "Faqat sonni yozing", expectedAnswer: "20", solution: "16 + 4 = 20" },
      { id: "v4_s2_q4", num: "04", prompt: "11101₂ = ?₁₀", unitHint: "10-lik son", placeholder: "Faqat sonni yozing", expectedAnswer: "29", solution: "16 + 8 + 4 + 1 = 29" },
      { id: "v4_s2_q5", num: "05", prompt: "110010₂ = ?₁₀", unitHint: "10-lik son", placeholder: "Faqat sonni yozing", expectedAnswer: "50", solution: "32 + 16 + 2 = 50" }
    ],
    section3: [
      { id: "v4_s3_q1", num: "01", prompt: "15₁₀ = ?₂", unitHint: "2-lik kod (0 va 1)", placeholder: "Masalan: 1111", expectedAnswer: "1111", solution: "8 + 4 + 2 + 1 = 1111₂" },
      { id: "v4_s3_q2", num: "02", prompt: "22₁₀ = ?₂", unitHint: "2-lik kod (0 va 1)", placeholder: "Masalan: 10110", expectedAnswer: "10110", solution: "16 + 4 + 2 = 10110₂" },
      { id: "v4_s3_q3", num: "03", prompt: "40₁₀ = ?₂", unitHint: "2-lik kod (0 va 1)", placeholder: "Masalan: 101000", expectedAnswer: "101000", solution: "32 + 8 = 101000₂" },
      { id: "v4_s3_q4", num: "04", prompt: "75₁₀ = ?₂", unitHint: "2-lik kod (0 va 1)", placeholder: "Masalan: 1001011", expectedAnswer: "1001011", solution: "64 + 8 + 2 + 1 = 1001011₂" },
      { id: "v4_s3_q5", num: "05", prompt: "200₁₀ = ?₂", unitHint: "2-lik kod (0 va 1)", placeholder: "Masalan: 11001000", expectedAnswer: "11001000", solution: "128 + 64 + 8 = 11001000₂" }
    ]
  },

  5: {
    section1: [
      { id: "v5_s1_q1", num: "01", prompt: "6 KB = ? B", unitHint: "Bayt (B)", placeholder: "Faqat sonni yozing", expectedAnswer: "6144", solution: "6 × 1024 = 6144 B" },
      { id: "v5_s1_q2", num: "02", prompt: "7 MB = ? KB", unitHint: "Kilobayt (KB)", placeholder: "Faqat sonni yozing", expectedAnswer: "7168", solution: "7 × 1024 = 7168 KB" },
      { id: "v5_s1_q3", num: "03", prompt: "1 GB = ? MB", unitHint: "Megabayt (MB)", placeholder: "Faqat sonni yozing", expectedAnswer: "1024", solution: "1 × 1024 = 1024 MB" },
      { id: "v5_s1_q4", num: "04", prompt: "2 TB = ? GB", unitHint: "Gigabayt (GB)", placeholder: "Faqat sonni yozing", expectedAnswer: "2048", solution: "2 × 1024 = 2048 GB" },
      { id: "v5_s1_q5", num: "05", prompt: "4 B = ? bit", unitHint: "bit", placeholder: "Faqat sonni yozing", expectedAnswer: "32", solution: "4 × 8 = 32 bit" },
      { id: "v5_s1_q6", num: "06", prompt: "72 bit = ? B", unitHint: "Bayt (B)", placeholder: "Faqat sonni yozing", expectedAnswer: "9", solution: "72 / 8 = 9 B" },
      { id: "v5_s1_q7", num: "07", prompt: "6144 B = ? KB", unitHint: "Kilobayt (KB)", placeholder: "Faqat sonni yozing", expectedAnswer: "6", solution: "6144 / 1024 = 6 KB" },
      { id: "v5_s1_q8", num: "08", prompt: "5120 KB = ? MB", unitHint: "Megabayt (MB)", placeholder: "Faqat sonni yozing", expectedAnswer: "5", solution: "5120 / 1024 = 5 MB" },
      { id: "v5_s1_q9", num: "09", prompt: "8192 MB = ? GB", unitHint: "Gigabayt (GB)", placeholder: "Faqat sonni yozing", expectedAnswer: "8", solution: "8192 / 1024 = 8 GB" },
      { id: "v5_s1_q10", num: "10", prompt: "4096 B = ? KB", unitHint: "Kilobayt (KB)", placeholder: "Faqat sonni yozing", expectedAnswer: "4", solution: "4096 / 1024 = 4 KB" }
    ],
    section2: [
      { id: "v5_s2_q1", num: "01", prompt: "1010₂ = ?₁₀", unitHint: "10-lik son", placeholder: "Faqat sonni yozing", expectedAnswer: "10", solution: "8 + 2 = 10" },
      { id: "v5_s2_q2", num: "02", prompt: "10001₂ = ?₁₀", unitHint: "10-lik son", placeholder: "Faqat sonni yozing", expectedAnswer: "17", solution: "16 + 1 = 17" },
      { id: "v5_s2_q3", num: "03", prompt: "10111₂ = ?₁₀", unitHint: "10-lik son", placeholder: "Faqat sonni yozing", expectedAnswer: "23", solution: "16 + 4 + 2 + 1 = 23" },
      { id: "v5_s2_q4", num: "04", prompt: "11110₂ = ?₁₀", unitHint: "10-lik son", placeholder: "Faqat sonni yozing", expectedAnswer: "30", solution: "16 + 8 + 4 + 2 = 30" },
      { id: "v5_s2_q5", num: "05", prompt: "100101₂ = ?₁₀", unitHint: "10-lik son", placeholder: "Faqat sonni yozing", expectedAnswer: "37", solution: "32 + 4 + 1 = 37" }
    ],
    section3: [
      { id: "v5_s3_q1", num: "01", prompt: "11₁₀ = ?₂", unitHint: "2-lik kod (0 va 1)", placeholder: "Masalan: 1011", expectedAnswer: "1011", solution: "8 + 2 + 1 = 1011₂" },
      { id: "v5_s3_q2", num: "02", prompt: "30₁₀ = ?₂", unitHint: "2-lik kod (0 va 1)", placeholder: "Masalan: 11110", expectedAnswer: "11110", solution: "16 + 8 + 4 + 2 = 11110₂" },
      { id: "v5_s3_q3", num: "03", prompt: "60₁₀ = ?₂", unitHint: "2-lik kod (0 va 1)", placeholder: "Masalan: 111100", expectedAnswer: "111100", solution: "32 + 16 + 8 + 4 = 111100₂" },
      { id: "v5_s3_q4", num: "04", prompt: "90₁₀ = ?₂", unitHint: "2-lik kod (0 va 1)", placeholder: "Masalan: 1011010", expectedAnswer: "1011010", solution: "64 + 16 + 8 + 2 = 1011010₂" },
      { id: "v5_s3_q5", num: "05", prompt: "255₁₀ = ?₂", unitHint: "2-lik kod (0 va 1)", placeholder: "Masalan: 11111111", expectedAnswer: "11111111", solution: "128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = 11111111₂" }
    ]
  }
};

// Bo'lim metadata ma'lumotlari
const SECTION_METADATA = [
  {
    sectionNumber: 1,
    title: "1-Bo'lim: Axborot O'lchov Birliklari",
    subtitle: "Birliklarni o'zaro aylantiring va to'g'ri sonni yozing",
    icon: `<svg class="icon" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>`,
    ruleText: "<strong>Asosiy qoida:</strong> 1 B = 8 bit; 1 KB = 1024 B; 1 MB = 1024 KB; 1 GB = 1024 MB; 1 TB = 1024 GB. Har bir misol bitta oddiy amal bilan yechiladi. Faqat son qiymatini yozing."
  },
  {
    sectionNumber: 2,
    title: "2-Bo'lim: 2-likdan 10-lik Sanoq Sistemasiga O'tish",
    subtitle: "Ikkilik kodni o'nlik songa aylantiring va javobni yozing",
    icon: `<svg class="icon" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>`,
    ruleText: "<strong>O'tish qoidasi:</strong> O'ngdan chapga 2 ning darajalari: ... 32, 16, 8, 4, 2, 1. Faqat 1 bo'lgan xonalar bir-biriga qo'shiladi."
  },
  {
    sectionNumber: 3,
    title: "3-Bo'lim: 10-likdan 2-lik Sanoq Sistemasiga O'tish",
    subtitle: "O'nlik sonni ikkilik (faqat 0 va 1) ko'rinishida yozing",
    icon: `<svg class="icon" viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>`,
    ruleText: "<strong>O'tish qoidasi:</strong> Sonni 2 ning darajalari yig'indisi ko'rinishida yozing va bor xonalarga 1, yo'qlariga 0 qo'ying."
  }
];

/**
 * Fisher-Yates aralashtirish algoritmi
 */
function shuffleArray(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Berilgan variant raqami (1..5) bo'yicha amaliy bo'limlar ro'yxatini qaytaradi.
 * Agar `shuffleQuestions === true` bo'lsa, har bir bo'lim ichidagi savollar tartibi ham aralashadi.
 */
function getPracticalSections(variantNum, shuffleQuestions = false) {
  const vNum = Number(variantNum) >= 1 && Number(variantNum) <= 5 ? Number(variantNum) : 1;
  const vData = EXERCISE_VARIANTS[vNum] || EXERCISE_VARIANTS[1];

  return SECTION_METADATA.map(meta => {
    let rawQuestions = [];
    if (meta.sectionNumber === 1) rawQuestions = vData.section1;
    else if (meta.sectionNumber === 2) rawQuestions = vData.section2;
    else if (meta.sectionNumber === 3) rawQuestions = vData.section3;

    const questions = shuffleQuestions ? shuffleArray(rawQuestions) : [...rawQuestions];

    return {
      id: `section-${meta.sectionNumber}`,
      sectionNumber: meta.sectionNumber,
      variantNumber: vNum,
      title: `${meta.title} (${vNum}-variant)`,
      subtitle: meta.subtitle,
      icon: meta.icon,
      ruleText: meta.ruleText,
      questions: questions
    };
  });
}

/**
 * Barcha savollar xaritasi (ID -> Question obyekt).
 * Admin panel tekshirishda yoki javoblarni ko'rishda savol matnini topish uchun.
 */
function getAllPracticalQuestionsMap() {
  const map = {};
  Object.keys(EXERCISE_VARIANTS).forEach(vKey => {
    const v = EXERCISE_VARIANTS[vKey];
    [...v.section1, ...v.section2, ...v.section3].forEach(q => {
      map[q.id] = Object.assign({ variant: Number(vKey) }, q);
    });
  });
  return map;
}

/**
 * Javobni tekshirish uchun yordamchi funksiya.
 * Bo'shliqlarni, birlik nomlarini (bit, bayt, b, kb, mb, gb, tb) va ₂/₁₀ indekslarini tozalaydi,
 * shunda "3072", "3072 B", "3072b", "110010₂", "110010b" barchasi to'g'ri deb tan olinadi.
 */
function normalizeAnswer(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")          // "3 072" -> "3072"
    .replace(/₂|₁₀/g, "")         // indeks belgilarini olib tashlash
    .replace(/(bayt|bit|kb|mb|gb|tb|b)$/i, ""); // oxiridagi birlik nomini olib tashlash
}

function checkPracticalAnswer(userAnswer, expectedAnswer) {
  const normUser = normalizeAnswer(userAnswer);
  const normExp = normalizeAnswer(expectedAnswer);
  return normUser !== "" && normUser === normExp;
}

/** Bo'limdagi savollar soni */
function getSectionTotal(sectionNumber) {
  if (sectionNumber === 1) return 10;
  if (sectionNumber === 2) return 5;
  if (sectionNumber === 3) return 5;
  return 0;
}

// Global eksport
window.EXERCISE_VARIANTS = EXERCISE_VARIANTS;
window.getPracticalSections = getPracticalSections;
window.getAllPracticalQuestionsMap = getAllPracticalQuestionsMap;
window.checkPracticalAnswer = checkPracticalAnswer;
window.normalizeAnswer = normalizeAnswer;
window.getSectionTotal = getSectionTotal;
window.PRACTICAL_SECTIONS = getPracticalSections(1, false);
