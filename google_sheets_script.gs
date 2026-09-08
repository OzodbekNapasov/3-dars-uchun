/**
 * =========================================================================
 * GOOGLE SHEETS APPS SCRIPT — 3-DARS TEST NATIJALARINI QABUL QILUVCHI KOD
 * =========================================================================
 * BOG'LANGAN JADVAL: 
 * https://docs.google.com/spreadsheets/d/1T-6iFLM-2fjs4RYOoTIyh9A6f3LnFF_OpVJFx-tqtXg/edit
 * 
 * SIZ QILISHINGIZ KERAK BO'LGAN ISH (1 DAQIQA):
 * 1. Yuqoridagi Google jadvalingizni oching: https://docs.google.com/spreadsheets/d/1T-6iFLM-2fjs4RYOoTIyh9A6f3LnFF_OpVJFx-tqtXg/edit
 * 2. Menyudan: Kengaytmalar (Extensions) -> Apps Script bo'limini bosing.
 * 3. U yerdagi mavjud kodni o'chirib, ushbu fayldagi barcha kodni qo'ying (Paste qiling).
 * 4. "Saqlash" (Ctrl + S) tugmasini bosing.
 * 5. O'ng yuqoridagi ko'k "Deploy" (Joylashtirish) tugmasini bosib, "New deployment" ni tanlang.
 * 6. Chapdagi tishli g'ildirak (Select type) belgisidan "Web app" ni tanlang:
 *      - Description: Test Natijalari
 *      - Execute as: Me (Mening nomimdan)
 *      - Who has access: Anyone (Har kim / Barcha)  <-- JUDA MUHIM!
 * 7. "Deploy" tugmasini bosing va ruxsat berish (Authorize access -> Advanced -> Go to ... (unsafe) -> Allow) tugmalarini bosing.
 * 8. Berilgan "Web app URL" (https://script.google.com/macros/s/.../exec) ni nusxalab oling.
 * 9. Olingan havolani loyihangizdagi `js/config.js` fayliga qo'ying yoki saytning bosh sahifasidagi "⚙️ O'qituvchi sozlamalari" tugmasi orqali kiriting.
 */

var SPREADSHEET_ID = "1T-6iFLM-2fjs4RYOoTIyh9A6f3LnFF_OpVJFx-tqtXg";

function getTargetSheet() {
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  } catch (e) {
    return SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  }
}

function doPost(e) {
  try {
    var sheet = getTargetSheet();
    
    // Agar jadval bo'sh bo'lsa, chiroyli ko'k sarlavhalar satrini yaratamiz
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Vaqt (Toshkent)",
        "Familiya",
        "Ism",
        "Guruh",
        "To'g'ri javoblar",
        "Jami savollar",
        "Foiz",
        "Baho (5 ballik)",
        "Daraja"
      ]);
      
      var headerRange = sheet.getRange(1, 1, 1, 9);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#2563eb");
      headerRange.setFontColor("#ffffff");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
    
    var data;
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    } else {
      data = {};
    }
    
    var now = Utilities.formatDate(new Date(), "Asia/Tashkent", "yyyy-MM-dd HH:mm:ss");
    
    var row = [
      data.timestamp || now,
      data.lastName || "",
      data.firstName || "",
      data.group || "",
      data.correctCount !== undefined ? data.correctCount : 0,
      data.totalCount || 20,
      (data.percentage !== undefined ? data.percentage : 0) + "%",
      data.grade !== undefined ? data.grade : 2,
      data.gradeLabel || ""
    ];
    
    sheet.appendRow(row);
    
    // Markazga tekislash
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 5, 1, 4).setHorizontalAlignment("center");
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Natija muvaffaqiyatli saqlandi!" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Agar parametrlar bilan kelsa, natijani saqlaymiz (GET orqali ham ishlashi uchun)
  if (e && e.parameter && (e.parameter.lastName || e.parameter.firstName)) {
    return doPost(e);
  }
  
  return ContentService
    .createTextOutput("Google Sheets Webhook tayyor. Jadval ID: " + SPREADSHEET_ID)
    .setMimeType(ContentService.MimeType.TEXT);
}
