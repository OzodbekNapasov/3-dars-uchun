/**
 * =========================================================================
 * GOOGLE SHEETS APPS SCRIPT — 3-DARS PLATFORMASI VA ADMIN PANELI UCHUN
 * =========================================================================
 * BOG'LANGAN JADVAL: 
 * https://docs.google.com/spreadsheets/d/1T-6iFLM-2fjs4RYOoTIyh9A6f3LnFF_OpVJFx-tqtXg/edit
 *
 * Imkoniyatlar:
 * 1. doPost: Talabalarning har bir bo'lim (1, 2, 3 va Test) natijalarini qabul qilish.
 *    - Bir talabaning ma'lumotlari bitta qatorda yangilanadi (takrorlanmaydi).
 * 2. doGet: Admin panel uchun barcha talabalar natijalarini JSON shaklida qaytarish
 *    va Testni masofadan ochish/qulflash buyruqlarini bajarish.
 */

var SPREADSHEET_ID = "1T-6iFLM-2fjs4RYOoTIyh9A6f3LnFF_OpVJFx-tqtXg";

function getTargetSheet() {
  var ss;
  try {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  
  var sheet = ss.getSheetByName("Natijalar");
  if (!sheet) {
    sheet = ss.getSheets()[0];
    sheet.setName("Natijalar");
  }
  return sheet;
}

// Jadval sarlavhalarini tekshirish va yaratish
function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    var headers = [
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
      "Batafsil Javoblar"
    ];
    sheet.appendRow(headers);
    
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#2563eb");
    headerRange.setFontColor("#ffffff");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
  }
}

// Talaba qatorini qidirish (Familiya, Ism va Guruh bo'yicha)
function findStudentRow(sheet, lastName, firstName, group) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return -1;
  
  var data = sheet.getRange(2, 2, lastRow - 1, 3).getValues(); // Guruh, Familiya, Ism
  for (var i = 0; i < data.length; i++) {
    var rowGroup = String(data[i][0]).trim().toLowerCase();
    var rowLast = String(data[i][1]).trim().toLowerCase();
    var rowFirst = String(data[i][2]).trim().toLowerCase();
    
    if (rowGroup === String(group).trim().toLowerCase() &&
        rowLast === String(lastName).trim().toLowerCase() &&
        rowFirst === String(firstName).trim().toLowerCase()) {
      return i + 2; // Haqiqiy qator indeksi (1-based, sarlavhadan keyin)
    }
  }
  return -1;
}

function doPost(e) {
  try {
    var sheet = getTargetSheet();
    ensureHeaders(sheet);
    
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    
    // Maxsus buyruq: Testni ochish / yopish (Admin uchun)
    if (data.action === "set_test_status") {
      var props = PropertiesService.getScriptProperties();
      props.setProperty("TEST_UNLOCKED", data.unlocked ? "true" : "false");
      if (data.pin) props.setProperty("TEACHER_PIN", String(data.pin));
      return ContentService.createTextOutput(JSON.stringify({ status: "success", unlocked: data.unlocked }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var now = Utilities.formatDate(new Date(), "Asia/Tashkent", "yyyy-MM-dd HH:mm:ss");
    var lastName = data.lastName || "";
    var firstName = data.firstName || "";
    var group = data.group || "";
    
    if (!lastName || !firstName) {
      return ContentService.createTextOutput(JSON.stringify({ status: "ignored", message: "Ism yoki familiya bo'sh" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var rowValues = [
      data.timestamp || now,
      group,
      lastName,
      firstName,
      data.statusText || data.currentSection || "Faol",
      data.sec1Score !== undefined ? String(data.sec1Score) : "-",
      data.sec2Score !== undefined ? String(data.sec2Score) : "-",
      data.sec3Score !== undefined ? String(data.sec3Score) : "-",
      data.testScore !== undefined ? String(data.testScore) : "-",
      data.totalCorrect !== undefined ? String(data.totalCorrect) + " / " + (data.totalPossible || "50") : "-",
      data.percentage !== undefined ? String(data.percentage) + "%" : "-",
      data.grade !== undefined ? String(data.grade) : "-",
      data.gradeLabel || "-",
      typeof data.answers === "object" ? JSON.stringify(data.answers) : (data.answers || "")
    ];
    
    var existingRow = findStudentRow(sheet, lastName, firstName, group);
    if (existingRow > 1) {
      // Mavjud qatorni yangilaymiz
      sheet.getRange(existingRow, 1, 1, rowValues.length).setValues([rowValues]);
      sheet.getRange(existingRow, 5, 1, 8).setHorizontalAlignment("center");
    } else {
      // Yangi qator qo'shamiz
      sheet.appendRow(rowValues);
      var lastRow = sheet.getLastRow();
      sheet.getRange(lastRow, 5, 1, 8).setHorizontalAlignment("center");
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Natija saqlandi!" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var sheet = getTargetSheet();
    ensureHeaders(sheet);
    
    var action = (e && e.parameter && e.parameter.action) || "";
    
    // 1. Admin panel uchun barcha natijalarni olish
    if (action === "get_submissions") {
      var lastRow = sheet.getLastRow();
      var submissions = [];
      
      if (lastRow > 1) {
        var numCols = 14;
        var data = sheet.getRange(2, 1, lastRow - 1, numCols).getValues();
        for (var i = 0; i < data.length; i++) {
          var row = data[i];
          var ans = {};
          try {
            if (row[13]) ans = JSON.parse(row[13]);
          } catch (pErr) {}
          
          submissions.push({
            timestamp: row[0],
            group: row[1],
            lastName: row[2],
            firstName: row[3],
            statusText: row[4],
            sec1Score: row[5],
            sec2Score: row[6],
            sec3Score: row[7],
            testScore: row[8],
            totalCorrect: row[9],
            percentage: row[10],
            grade: row[11],
            gradeLabel: row[12],
            answers: ans
          });
        }
      }
      
      var props = PropertiesService.getScriptProperties();
      var isTestUnlocked = props.getProperty("TEST_UNLOCKED") === "true";
      var teacherPin = props.getProperty("TEACHER_PIN") || "2603";
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        isTestUnlocked: isTestUnlocked,
        teacherPin: teacherPin,
        submissions: submissions
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. Talaba kompyuteridan test ruxsatini tekshirish
    if (action === "get_test_status") {
      var props = PropertiesService.getScriptProperties();
      var isTestUnlocked = props.getProperty("TEST_UNLOCKED") === "true";
      var teacherPin = props.getProperty("TEACHER_PIN") || "2603";
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        isTestUnlocked: isTestUnlocked,
        teacherPin: teacherPin
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 3. Agar parametrlar bilan kelsa, natijani yozish (GET orqali ham)
    if (e && e.parameter && (e.parameter.lastName || e.parameter.firstName)) {
      return doPost(e);
    }
    
    return ContentService
      .createTextOutput("Google Sheets Webhook 3-Dars tayyor. Jadval ID: " + SPREADSHEET_ID)
      .setMimeType(ContentService.MimeType.TEXT);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
