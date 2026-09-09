/**
 * Platforma Sozlamalari (Configuration)
 * Axborot Texnologiyalari — 3-Dars
 */
const APP_CONFIG = {
  // Google Apps Script Web App havolasi (Ma'lumotlarni yozish va olish uchun)
  GOOGLE_SHEET_WEBAPP_URL: "https://script.google.com/macros/s/AKfycbyGufJOXt7KO1ZZSMUbinL1Vnir9YYzGw5yDuhUrw3bUNj614hgByzxEw7spj6s3VP-cQ/exec",

  // Ruxsat etilgan guruhlar
  ALLOWED_GROUPS: [
    "26-01",
    "26-02",
    "26-03",
    "26-04",
    "26-05",
    "26-06",
    "26-07"
  ],

  // Test tarkibi: har bir kategoriyadan nechta savol tushishi.
  // Jami = 12 + 4 + 4 = 20 ta savol. Savollar bankidan (js/questions.js)
  // har bir kategoriya ichidan tasodifiy tanlanadi, ya'ni har bir talabaga
  // boshqacha variant tushadi, lekin tuzilishi bir xil bo'ladi.
  TEST_COMPOSITION: {
    nazariy: 12, // mavzu bo'yicha nazariy savollar
    olchov: 4,   // axborot o'lchov birliklari
    sanoq: 4     // sanoq sistemalari (2-lik / 10-lik)
  },
  TEST_DURATION_MINUTES: 25, // 25 daqiqa
  
  // O'qituvchi boshlang'ich PIN-kodi (Testni ochish uchun)
  DEFAULT_TEACHER_PIN: "2603",

  // Admin panelga kirish paroli (faqat o'qituvchi biladi)
  ADMIN_PASSWORD: "1207",

  // Real vaqt sozlamalari (millisekundlarda)
  HEARTBEAT_INTERVAL_MS: 60000,      // Talaba "men shu yerdaman" signali
  TEST_STATUS_POLL_MS: 20000,        // Talaba test ruxsatini serverdan so'rashi
  ADMIN_REFRESH_MS: 10000,           // Admin jadvalini yangilash
  ONLINE_THRESHOLD_MS: 150000,       // Shu vaqtdan keyin talaba "Offline" deb belgilanadi

  // LocalStorage kalitlari
  STORAGE_KEYS: {
    STUDENT_SESSION: "app_student_session_v3",
    ADMIN_CONFIG: "app_admin_config_v3",
    ALL_SUBMISSIONS: "app_all_submissions_v3",
    ADMIN_AUTH: "app_admin_auth_v3"
  },

  // Baholash mezonlari (5 ballik tizim)
  GRADING: {
    GRADE_5_MIN_PERCENT: 86, // 86% - 100% -> 5 (A'lo)
    GRADE_4_MIN_PERCENT: 71, // 71% - 85%  -> 4 (Yaxshi)
    GRADE_3_MIN_PERCENT: 56, // 56% - 70%  -> 3 (Qoniqarli)
    // 56% dan past -> 2 (Qoniqarsiz)
  },

  // Testdagi jami savollar soni (TEST_COMPOSITION dan hisoblanadi)
  getTestQuestionsCount: function () {
    return Object.keys(this.TEST_COMPOSITION)
      .reduce((sum, key) => sum + this.TEST_COMPOSITION[key], 0);
  },

  // Baho hisoblash funksiyasi
  calculateGrade: function(percentage) {
    if (percentage >= this.GRADING.GRADE_5_MIN_PERCENT) {
      return { grade: 5, label: "A'lo", color: "#10b981", badgeClass: "badge-success" };
    } else if (percentage >= this.GRADING.GRADE_4_MIN_PERCENT) {
      return { grade: 4, label: "Yaxshi", color: "#3b82f6", badgeClass: "badge-primary" };
    } else if (percentage >= this.GRADING.GRADE_3_MIN_PERCENT) {
      return { grade: 3, label: "Qoniqarli", color: "#f59e0b", badgeClass: "badge-warning" };
    } else {
      return { grade: 2, label: "Qoniqarsiz", color: "#ef4444", badgeClass: "badge-danger" };
    }
  }
};

window.APP_CONFIG = APP_CONFIG;
