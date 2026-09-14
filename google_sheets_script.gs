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

// Deploy tekshiruvi uchun. Brauzerda /exec ni ochganda shu raqam ko'rinishi kerak.
// Agar eski raqam chiqsa — qayta deploy qilinmagan.
var SCRIPT_VERSION = "2026-09-14-attempt-rows";

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
  ONLINE: 16,
  SESSION: 17
};
var NUM_COLS = 17;

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
  "Holat",
  "Sessiya ID"
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
    // Butun varaqni MATN formatiga o'tkazamiz.
    // Aks holda Google Sheets "26-01" ni sanaga (26-yanvar), "10/10" ni esa
    // 10-oktabrga aylantirib yuboradi va talabani topib bo'lmay qoladi.
    sheet.getRange(1, 1, sheet.getMaxRows(), NUM_COLS).setNumberFormat("@");
  }

  // Varaqda yetarli ustun bo'lmasa getRange(..., NUM_COLS) xato beradi va
  // admin panel butunlay bo'sh qolardi. 17-ustun ("Sessiya ID") qo'shilgani
  // uchun buni HAR SAFAR, jadvalga tegishdan oldin kafolatlaymiz.
  if (sheet.getMaxColumns() < NUM_COLS) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), NUM_COLS - sheet.getMaxColumns());
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

// =========================================================================
// QATOR INDEKSI KESHI
// =========================================================================
// Ilgari HAR BIR so'rovda butun jadval (78+ qator) o'qilardi va bu script
// lock ichida bajarilardi. 25 ta talaba bir vaqtda yozganda navbat to'lib,
// waitLock(30000) timeout bo'lib, ma'lumot JIMGINA yo'qolardi.
// Endi talabaning qator raqami keshda saqlanadi: mavjud talabani yangilash
// uchun jadvalni umuman skanerlash ham, lock olish ham kerak emas.

var ROW_CACHE_TTL = 21600; // 6 soat (Apps Script keshi uchun maksimal)

// Talabani ISM bo'yicha emas, SESSIYA bo'yicha aniqlaymiz.
//
// Ilgari kalit faqat "guruh|familiya|ism" edi. Oqibati: bir talaba keyingi
// darsda yoki qayta urinishda shu nom bilan kirsa, jadvaldan ESKI qatori
// topilib, oldingi natijasi ustiga yozib yuborilardi. O'qituvchi esa yangi
// qator kutib, "natija kelib tushmadi" deb o'ylardi.
//
// Endi har bir kirish (sessiya) o'z qatorini oladi: eski natija saqlanib
// qoladi, yangisi pastga qo'shiladi. Bo'lim yakunlari va heartbeat esa
// sessiya ID bir xil bo'lgani uchun baribir AYNI qatorni yangilaydi.
function studentKeyOf(group, lastName, firstName, sessionId) {
  return [
    String(group).trim().toLowerCase(),
    String(lastName).trim().toLowerCase(),
    String(firstName).trim().toLowerCase(),
    String(sessionId || "").trim().toLowerCase()
  ].join("|");
}

/** Sessiya ID siz kalit — eski (yangilanmagan) sahifalar bilan moslik uchun. */
function nameKeyOf(group, lastName, firstName) {
  return studentKeyOf(group, lastName, firstName, "");
}

function rowCacheKey(key) {
  // Kesh kaliti 250 belgidan oshmasligi va bo'sh joy bo'lmasligi kerak
  return ("r3_" + key).replace(/\s+/g, "_").substring(0, 240);
}

/**
 * Jadvalni skanerlab qatorni qidiradi (faqat keshda bo'lmaganda).
 * fromRow — qaysi qatordan boshlab qidirish (2 = boshidan).
 * Lock ichida biz faqat "oxirgi skanerdan keyin qo'shilgan" qatorlarni
 * tekshiramiz, shuning uchun lock juda qisqa ushlab turiladi.
 */
function scanStudentRow(sheet, group, lastName, firstName, sessionId, fromRow) {
  fromRow = fromRow || 2;
  var lastRow = sheet.getLastRow();
  if (lastRow < fromRow) return -1;

  var count = lastRow - fromRow + 1;

  // Ikkita alohida o'qish: kerakli ustunlar (2-4 va 17) qo'shni emas.
  // 2..17 oralig'ini butunlay o'qish 4 o'rniga 16 ustunni tortardi — jadval
  // o'sgan sari bu behuda yuk bo'lardi.
  var names = sheet.getRange(fromRow, COL.GROUP, count, 3).getValues();   // Guruh, Familiya, Ism
  var sessions = sheet.getRange(fromRow, COL.SESSION, count, 1).getValues();

  var wanted = String(sessionId || "").trim().toLowerCase();
  var nameKey = nameKeyOf(group, lastName, firstName);
  var found = -1;

  for (var i = 0; i < names.length; i++) {
    if (nameKeyOf(names[i][0], names[i][1], names[i][2]) !== nameKey) continue;

    if (wanted) {
      // Aynan shu sessiya qatorimi?
      if (String(sessions[i][0] || "").trim().toLowerCase() === wanted) return i + fromRow;
    } else {
      // Sessiya ID kelmadi (eski sahifa) — shu talabaning ENG OXIRGI qatorini
      // olamiz, shunda eski sahifa ham o'zining joriy qatorini yangilaydi.
      found = i + fromRow;
    }
  }
  return found;
}

/**
 * Talaba qatorini topadi. Avval keshdan oladi va 3 katakni o'qib tasdiqlaydi
 * (bu to'liq skanerlashdan ~20 barobar arzon). Tasdiqlanmasa qayta skanerlaydi.
 */
function findStudentRow(sheet, lastName, firstName, group, sessionId) {
  var key = studentKeyOf(group, lastName, firstName, sessionId);
  var cache = CacheService.getScriptCache();
  var ck = rowCacheKey(key);

  var cached = null;
  try {
    cached = cache.get(ck);
  } catch (e) {}

  if (cached) {
    var row = Number(cached);
    if (row > 1 && row <= sheet.getLastRow()) {
      var probe = sheet.getRange(row, COL.GROUP, 1, 3).getValues()[0];
      // Sessiya ID kelmagan bo'lsa (eski sahifa) faqat ism bo'yicha tasdiqlaymiz,
      // aks holda kesh doim "noto'g'ri" deb topilib, har so'rovda butun jadval
      // skanerlanardi.
      var okByName = nameKeyOf(probe[0], probe[1], probe[2]) === nameKeyOf(group, lastName, firstName);
      var okBySession = !sessionId ||
        studentKeyOf(probe[0], probe[1], probe[2], sheet.getRange(row, COL.SESSION).getValue()) === key;
      if (okByName && okBySession) {
        return row; // Kesh to'g'ri — jadval skanerlanmadi
      }
    }
  }

  // Skanerlash paytidagi oxirgi qatorni eslab qolamiz: lock ichida faqat
  // shundan keyin qo'shilganlarini qayta tekshirish yetarli bo'ladi.
  lastScannedRow = sheet.getLastRow();

  var found = scanStudentRow(sheet, group, lastName, firstName, sessionId, 2);
  if (found > 1) {
    try {
      cache.put(ck, String(found), ROW_CACHE_TTL);
    } catch (e) {}
  }
  return found;
}

// findStudentRow() eng oxirgi marta jadvalni qayergacha skanerlaganini eslab
// qoladi (bitta so'rov = bitta bajarilish, shu sababli global xavfsiz).
var lastScannedRow = 1;

/** Yangi talaba uchun qator ochadi. Faqat SHU yerda lock kerak. */
function createStudentRow(sheet, lastName, firstName, group, sessionId, rowValues) {
  var lock = LockService.getScriptLock();
  try {
    // Dars boshida 25-30 talaba bir vaqtda kiradi. Lock ichidagi ish ataylab
    // juda qisqa (bir necha qator o'qish + 2 ta yozuv), shuning uchun bu
    // navbat tez bo'shaydi. Timeout bo'lsa ham talaba yo'qolmaydi:
    // sahifa qayta urinadi va 30 soniyalik heartbeat qatorni baribir ochadi.
    lock.waitLock(25000);
  } catch (lockErr) {
    return -1;
  }

  try {
    var key = studentKeyOf(group, lastName, firstName, sessionId);

    // Lock kutayotganda boshqa so'rov shu talabaga qator ochib qo'ygan
    // bo'lishi mumkin. Butun jadvalni emas, faqat YANGI qatorlarni tekshiramiz.
    var existing = scanStudentRow(sheet, group, lastName, firstName, sessionId,
                                  Math.max(2, lastScannedRow + 1));
    if (existing > 1) {
      try {
        CacheService.getScriptCache().put(rowCacheKey(key), String(existing), ROW_CACHE_TTL);
      } catch (e) {}
      return existing;
    }

    ensureHeaders(sheet);

    // MUHIM: bu yerda `getLastRow() + 1` ni ISHLATIB BO'LMAYDI.
    // Apps Script jadval ma'lumotlarini bajarilish ichida keshlaydi: sheet
    // obyekti lock olinishidan OLDIN ochilgani uchun getLastRow() eskirgan
    // qiymatni qaytarishi mumkin. Ikki talaba bir vaqtda kirganda ikkalasi
    // ham bitta qatorni hisoblab, biri ikkinchisining ustiga yozib yuborardi.
    // appendRow() esa atomar — doim haqiqiy oxirgi qatordan keyin qo'shadi.
    sheet.appendRow(rowValues);
    var targetRow = sheet.getLastRow();

    // appendRow matn formatini kafolatlamaydi, shuning uchun qatorni "@" ga
    // o'tkazib qiymatlarni qayta yozamiz. Aks holda Sheets "26-01" ni sanaga,
    // "10/10" ni 10-oktabrga aylantiradi va keyingi safar talabani topa olmay,
    // har bo'lim uchun yangi qator ochib yuboradi.
    var rowRange = sheet.getRange(targetRow, 1, 1, NUM_COLS);
    rowRange.setNumberFormat("@");
    rowRange.setValues([rowValues]);
    sheet.getRange(targetRow, COL.STATUS, 1, 8).setHorizontalAlignment("center");

    // Lock ichida yozganimizni darhol tasdiqlaymiz.
    SpreadsheetApp.flush();

    try {
      CacheService.getScriptCache().put(rowCacheKey(key), String(targetRow), ROW_CACHE_TTL);
    } catch (e) {}

    return targetRow;
  } finally {
    lock.releaseLock();
  }
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

/** To'liq natija qatorini tayyorlaydi (16 ta ustun). */
function buildRowValues(data, group, lastName, firstName, now, sessionId) {
  return [
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
    "Online",
    String(sessionId || "")
  ];
}

// =========================================================================
// YOZISH (doPost)
// =========================================================================

function doPost(e) {
  try {
    var data = parseRequest(e);
    var props = PropertiesService.getScriptProperties();

    // --- Admin buyrug'i: testni ochish / yopish (jadvalga tegmaydi) ---
    if (data.action === "set_test_status") {
      props.setProperty("TEST_UNLOCKED", data.unlocked ? "true" : "false");
      if (data.pin) props.setProperty("TEACHER_PIN", String(data.pin));
      return jsonOut({ status: "success", unlocked: !!data.unlocked });
    }

    var lastName = String(data.lastName || "").trim();
    var firstName = String(data.firstName || "").trim();
    var group = String(data.group || "").trim();
    // Har bir kirish (urinish) uchun talaba sahifasi yaratadigan ID.
    // Bo'sh bo'lishi mumkin — sahifa hali yangilanmagan bo'lsa.
    var sessionId = String(data.sessionId || "").trim();

    if (!lastName || !firstName) {
      return jsonOut({ status: "ignored", message: "Ism yoki familiya bo'sh" });
    }

    var sheet = getTargetSheet();
    var now = nowString();
    var existingRow = findStudentRow(sheet, lastName, firstName, group, sessionId);

    // --- Yengil buyruqlar: heartbeat va logout ---
    if (data.action === "heartbeat" || data.action === "logout") {
      if (existingRow < 2) {
        // MUHIM: ilgari bu yerda "ignored" qaytarilardi. Natijada login paytidagi
        // yagona to'liq yozuv yo'qolsa, talaba butun dars davomida admin panelda
        // KO'RINMAY qolardi. Endi heartbeat qatorni o'zi ochadi — tizim o'zini tuzatadi.
        if (data.action === "logout") {
          return jsonOut({ status: "ignored", message: "Talaba topilmadi" });
        }
        existingRow = createStudentRow(
          sheet, lastName, firstName, group, sessionId,
          buildRowValues(data, group, lastName, firstName, now, sessionId)
        );
        if (existingRow < 2) {
          return jsonOut({ status: "error", error: "Server band, qator ochilmadi" });
        }
        return jsonOut({ status: "success", action: data.action, created: true, row: existingRow });
      }

      // Mavjud qatorni yangilash — lock KERAK EMAS, chunki har bir talaba
      // faqat o'z qatoriga yozadi va qatorlar bir-biriga tegmaydi.
      // Aynan shu narsa navbatni bo'shatib, ma'lumot yo'qolishini to'xtatadi.
      var isOnline = data.action === "heartbeat";

      // Bu yerda ham matn formati shart: "2026-09-09 22:59:57" ni Sheets
      // sana-vaqt obyektiga aylantirib yuboradi.
      var seenRange = sheet.getRange(existingRow, COL.LAST_SEEN, 1, 2);
      seenRange.setNumberFormat("@");
      seenRange.setValues([[now, isOnline ? "Online" : "Offline"]]);

      if (isOnline && data.statusText) {
        sheet.getRange(existingRow, COL.STATUS).setValue(data.statusText);
      }
      return jsonOut({ status: "success", action: data.action, row: existingRow });
    }

    // --- To'liq natija yozuvi (login, bo'lim yakuni, test yakuni) ---
    var rowValues = buildRowValues(data, group, lastName, firstName, now, sessionId);

    if (existingRow < 2) {
      var newRow = createStudentRow(sheet, lastName, firstName, group, sessionId, rowValues);
      if (newRow < 2) {
        return jsonOut({ status: "error", error: "Server band, qator ochilmadi" });
      }
      return jsonOut({ status: "success", message: "Natija saqlandi!", created: true, row: newRow });
    }

    // Mavjud qator — lock kerak emas.
    // Eski sahifa sessiya ID yubormaydi; qatordagi mavjud ID ni o'chirib
    // yubormaslik uchun uni saqlab qolamiz (aks holda qator "egasiz" bo'lib,
    // keyingi so'rovda yangi qator ochilib ketardi).
    if (!sessionId) {
      rowValues[COL.SESSION - 1] = String(sheet.getRange(existingRow, COL.SESSION).getValue() || "");
    }

    var rowRange = sheet.getRange(existingRow, 1, 1, NUM_COLS);
    rowRange.setNumberFormat("@");
    rowRange.setValues([rowValues]);

    return jsonOut({ status: "success", message: "Natija saqlandi!", row: existingRow });

  } catch (error) {
    return jsonOut({ status: "error", error: error.toString() });
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

    // 2. Talaba kompyuteri: heartbeat / logout / to'liq natijani GET orqali yuborish.
    // GET javobini brauzer CORS tufayli O'QIY OLADI (POST + no-cors da o'qib bo'lmaydi).
    // Shu sababli talaba sahifasi xatoni ko'radi va qayta urina oladi.
    if (action === "heartbeat" || action === "logout" || action === "save_result") {
      var res = doPost(e);
      return res;
    }

    // 3. Admin panel: barcha natijalar
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
            online: String(row[COL.ONLINE - 1] || "") === "Online",
            sessionId: String(row[COL.SESSION - 1] || "")
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

    // 4. GET orqali ham yozish (sendBeacon / zaxira yo'li)
    if (e && e.parameter && (e.parameter.lastName || e.parameter.firstName)) {
      return doPost(e);
    }

    return jsonOut({
      status: "success",
      message: "3-Dars Webhook tayyor",
      version: SCRIPT_VERSION,
      spreadsheetId: SPREADSHEET_ID
    });

  } catch (error) {
    return jsonOut({ status: "error", error: error.toString() });
  }
}
