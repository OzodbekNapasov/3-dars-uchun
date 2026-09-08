/**
 * Test Tizimi Sozlamalari (Configuration)
 */
const APP_CONFIG = {
  // Google Apps Script Web App havolasi (Faollashtirilgan)
  GOOGLE_SHEET_WEBAPP_URL: "https://script.google.com/macros/s/AKfycbyGufJOXt7KO1ZZSMUbinL1Vnir9YYzGw5yDuhUrw3bUNj614hgByzxEw7spj6s3VP-cQ/exec",

  // Test parametrlari
  TEST_QUESTIONS_COUNT: 20, // 40 tadan 20 ta tasodifiy savol
  TEST_DURATION_MINUTES: 25, // 25 daqiqa
  
  // Baholash mezonlari (5 ballik tizim)
  GRADING: {
    GRADE_5_MIN_PERCENT: 86, // 86% va undan yuqori -> 5 (A'lo)
    GRADE_4_MIN_PERCENT: 71, // 71% - 85% -> 4 (Yaxshi)
    GRADE_3_MIN_PERCENT: 56, // 56% - 70% -> 3 (Qoniqarli)
    // 56% dan past -> 2 (Qoniqarsiz)
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
