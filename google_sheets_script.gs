/**
 * =========================================================================
 * GOOGLE SHEETS APPS SCRIPT — 3-DARS PLATFORMASI VA ADMIN PANELI UCHUN
 * =========================================================================
 * BOG'LANGAN JADVAL:
 * https://docs.google.com/spreadsheets/d/1T-6iFLM-2fjs4RYOoTIyh9A6f3LnFF_OpVJFx-tqtXg/edit
 *
 * !!! MUHIM !!!
 * Ushbu faylni o'zgartirgandan keyin ALBATTA qayta deploy qiling:
 *   Deploy -> Manage deployments -> (qalamcha) Edit -> Version: New version -> Deploy
 *   Execute as: Me     |     Who has access: Anyone
 * Aks holda talaba kompyuterlaridan kelgan ma'lumotlar admin panelga tushmaydi.
 *
 * Imkoniyatlar:
 *  - doPost:  talaba natijalarini yozish, heartbeat (jonli holat), logout, test ruxsati.
 *  - doGet:   admin panel uchun barcha natijalar + test ruxsati holati (JSON).
 */

var SPREADSHEET_ID = "1T-6iFLM-2fjs4RYOoTIyh9A6f3LnFF_OpVJFx-tqtXg";

// Bu dars uchun ALOHIDA varaq.
// Jadvaldagi eski "Natijalar" varag'ida oldingi loyihaning ma'lumotlari bor va
// ustunlari boshqacha edi — shu sababli unga tegilmaydi, yangi varaq ochiladi.
var SHEET_NAME = "3-Dars Natijalar";
var TIMEZONE = "Asia/Tashkent";

// Ustunlar tartibi (1-dan boshlab). Bitta joyda turgani uchun o'zgartirish oson.
var COL = {
  TIMESTAMP: 1,
  GROUP: 2,
  LAST_NAME: 3,
  FIRST_NAME: 4,
  STATUS: 5,
  SEC1: 6,
  SEC2: 7,
  SEC3: 8,
  TEST: 9,
  TOTAL: 10,
  PERCENT: 11,
  GRADE: 12,
  GRADE_LABEL: 13,
  ANSWERS: 14,
  LAST_SEEN: 15,
  ONLINE: 16
};
var NUM_COLS = 16;

var HEADERS = [
  "Vaqt (Toshkent)",
  "Guruh",
  "Familiya",
  "Ism",
  "Joriy Holat",
  "1-Bo'lim (O'lchov)",
  "2-Bo'lim (2->10)",
  "3-Bo'lim (10->2)",
  "4-Bo'lim (Test)",
  "Jami Ball",
  "Foiz",
  "Baho",
  "Baho Nomi",
  "Batafsil Javoblar",
  "Oxirgi faollik",
  "Holat"
];

function getTargetSheet() {
  var ss;
  try {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }

  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    // MUHIM: mavjud varaqni "o'zlashtirib" nomini o'zgartirmaymiz.
    // Avvalgi versiya shunday qilgani uchun eski loyihaning ma'lumotlari
    // ustiga yozilib, ustunlar aralashib ketgan edi.
    sheet = ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}

/**
 * Sarlavhalarni yaratadi. Agar jadval eski (14 ustunli) formatda bo'lsa,
 * yetishmayotgan ustunlarni ustiga qo'shib beradi — mavjud ma'lumot yo'qolmaydi.
 */
function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#2563eb");
    headerRange.setFontColor("#ffffff");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
    return;
  }

  // Eski jadvalni yangi ustunlar bilan to'ldirish
  var existingCols = sheet.getLastColumn();
  if (existingCols < NUM_COLS) {
    var missing = HEADERS.slice(existingCols);
    var range = sheet.getRange(1, existingCols + 1, 1, missing.length);
    range.setValues([missing]);
    range.setFontWeight("bold");
    range.setBackground("#2563eb");
    range.setFontColor("#ffffff");
    range.setHorizontalAlignment("center");
  }
}

/** Talaba qatorini Guruh + Familiya + Ism bo'yicha qidiradi. Topilmasa -1. */
function findStudentRow(sheet, lastName, firstName, group) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return -1;

  var data = sheet.getRange(2, COL.GROUP, lastRow - 1, 3).getValues(); // Guruh, Familiya, Ism
  var g = String(group).trim().toLowerCase();
  var l = String(lastName).trim().toLowerCase();
  var f = String(firstName).trim().toLowerCase();

  for (var i = 0; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === g &&
        String(data[i][1]).trim().toLowerCase() === l &&
        String(data[i][2]).trim().toLowerCase() === f) {
      return i + 2; // 1-based, sarlavhadan keyin
    }
  }
  return -1;
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function nowString() {
  return Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd HH:mm:ss");
}

/** So'rov tanasini (JSON yoki form-parametr) o'qiydi. */
function parseRequest(e) {
  if (e && e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (err) {
      return e.parameter || {};
    }
  }
  return (e && e.parameter) || {};
}

// =========================================================================
// YOZISH (doPost)
// =========================================================================

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Bir vaqtda 20+ talaba yozganda qatorlar aralashib ketmasligi uchun
    lock.waitLock(30000);
  } catch (lockErr) {
    return jsonOut({ status: "error", error: "Server band, birozdan keyin urinib ko'ring" });
  }

  try {
    var data = parseRequest(e);
    var props = PropertiesService.getScriptProperties();

    // --- Admin buyrug'i: testni ochish / yopish ---
    if (data.action === "set_test_status") {
      props.setProperty("TEST_UNLOCKED", data.unlocked ? "true" : "false");
      if (data.pin) props.setProperty("TEACHER_PIN", String(data.pin));
      return jsonOut({ status: "success", unlocked: !!data.unlocked });
    }

    var sheet = getTargetSheet();
    ensureHeaders(sheet);

    var lastName = String(data.lastName || "").trim();
    var firstName = String(data.firstName || "").trim();
    var group = String(data.group || "").trim();

    if (!lastName || !firstName) {
      return jsonOut({ status: "ignored", message: "Ism yoki familiya bo'sh" });
    }

    var existingRow = findStudentRow(sheet, lastName, firstName, group);
    var now = nowString();

    // --- Yengil buyruqlar: heartbeat va logout (butun qatorni qayta yozmaydi) ---
    if (data.action === "heartbeat" || data.action === "logout") {
      if (existingRow < 2) {
        return jsonOut({ status: "ignored", message: "Talaba topilmadi" });
      }
      var isOnline = data.action === "heartbeat";
      sheet.getRange(existingRow, COL.LAST_SEEN).setValue(now);
      sheet.getRange(existingRow, COL.ONLINE).setValue(isOnline ? "Online" : "Offline");
      if (isOnline && data.statusText) {
        sheet.getRange(existingRow, COL.STATUS).setValue(data.statusText);
      }
      return jsonOut({ status: "success", action: data.action });
    }

    // --- To'liq natija yozuvi ---
    var rowValues = [
      data.timestamp || now,
      group,
      lastName,
      firstName,
      data.statusText || "Faol",
      data.sec1Score !== undefined ? String(data.sec1Score) : "-",
      data.sec2Score !== undefined ? String(data.sec2Score) : "-",
      data.sec3Score !== undefined ? String(data.sec3Score) : "-",
      data.testScore !== undefined ? String(data.testScore) : "-",
      data.totalCorrect !== undefined ? String(data.totalCorrect) : "-",
      data.percentage !== undefined ? String(data.percentage) : "-",
      data.grade !== undefined ? String(data.grade) : "-",
      data.gradeLabel || "-",
      typeof data.answers === "object" ? JSON.stringify(data.answers) : (data.answers || ""),
      now,
      "Online"
    ];

    if (existingRow > 1) {
      sheet.getRange(existingRow, 1, 1, NUM_COLS).setValues([rowValues]);
      sheet.getRange(existingRow, COL.STATUS, 1, 8).setHorizontalAlignment("center");
    } else {
      sheet.appendRow(rowValues);
      sheet.getRange(sheet.getLastRow(), COL.STATUS, 1, 8).setHorizontalAlignment("center");
    }

    return jsonOut({ status: "success", message: "Natija saqlandi!" });

  } catch (error) {
    return jsonOut({ status: "error", error: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

// =========================================================================
// O'QISH (doGet)
// =========================================================================

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || "";
    var props = PropertiesService.getScriptProperties();
    var isTestUnlocked = props.getProperty("TEST_UNLOCKED") === "true";
    var teacherPin = props.getProperty("TEACHER_PIN") || "2603";

    // 1. Talaba kompyuteri: test ruxsati ochilganmi?
    // (Eng ko'p chaqiriladigan so'rov — jadvalni umuman ochmaymiz, tez ishlaydi)
    if (action === "get_test_status") {
      return jsonOut({
        status: "success",
        isTestUnlocked: isTestUnlocked,
        teacherPin: teacherPin
      });
    }

    // 2. Admin panel: barcha natijalar
    if (action === "get_submissions") {
      var sheet = getTargetSheet();
      ensureHeaders(sheet);

      var lastRow = sheet.getLastRow();
      var submissions = [];

      if (lastRow > 1) {
        var data = sheet.getRange(2, 1, lastRow - 1, NUM_COLS).getValues();
        for (var i = 0; i < data.length; i++) {
          var row = data[i];
          if (!row[COL.LAST_NAME - 1] && !row[COL.FIRST_NAME - 1]) continue;

          var ans = {};
          try {
            if (row[COL.ANSWERS - 1]) ans = JSON.parse(row[COL.ANSWERS - 1]);
          } catch (pErr) {}

          var lastSeen = row[COL.LAST_SEEN - 1];
          if (lastSeen instanceof Date) {
            lastSeen = Utilities.formatDate(lastSeen, TIMEZONE, "yyyy-MM-dd HH:mm:ss");
          }

          submissions.push({
            timestamp: String(row[COL.TIMESTAMP - 1] || ""),
            group: String(row[COL.GROUP - 1] || ""),
            lastName: String(row[COL.LAST_NAME - 1] || ""),
            firstName: String(row[COL.FIRST_NAME - 1] || ""),
            statusText: String(row[COL.STATUS - 1] || ""),
            sec1Score: String(row[COL.SEC1 - 1] || "-"),
            sec2Score: String(row[COL.SEC2 - 1] || "-"),
            sec3Score: String(row[COL.SEC3 - 1] || "-"),
            testScore: String(row[COL.TEST - 1] || "-"),
            totalCorrect: String(row[COL.TOTAL - 1] || "-"),
            percentage: String(row[COL.PERCENT - 1] || "-"),
            grade: String(row[COL.GRADE - 1] || "-"),
            gradeLabel: String(row[COL.GRADE_LABEL - 1] || ""),
            answers: ans,
            lastSeen: String(lastSeen || ""),
            online: String(row[COL.ONLINE - 1] || "") === "Online"
          });
        }
      }

      return jsonOut({
        status: "success",
        isTestUnlocked: isTestUnlocked,
        teacherPin: teacherPin,
        serverTime: nowString(),
        submissions: submissions
      });
    }

    // 3. GET orqali ham yozish (sendBeacon / zaxira yo'li)
    if (e && e.parameter && (e.parameter.lastName || e.parameter.firstName)) {
      return doPost(e);
    }

    return jsonOut({
      status: "success",
      message: "3-Dars Webhook tayyor",
      version: "2026-09-09",
      spreadsheetId: SPREADSHEET_ID
    });

  } catch (error) {
    return jsonOut({ status: "error", error: error.toString() });
  }
}
