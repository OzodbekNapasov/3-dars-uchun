/**
 * 3-Dars: Talaba Platformasi Asosiy Logikasi (js/student.js)
 * Guruhlar: 26-01 ... 26-07
 * Bo'limlar: 1 (O'lchov), 2 (2->10), 3 (10->2), 4 (Test - maxsus ruxsat bilan)
 * Hech qanday yechimlar/to'g'ri javoblar talabaga ko'rsatilmaydi!
 */

(function () {
  // Bo'lim savollari soni yagona manbadan olinadi (js/exercises.js va js/config.js).
  // Shu sababli savollar sonini o'zgartirganda bu faylda hech narsa tuzatish kerak emas.
  function sectionTotal(secNum) {
    if (secNum === 4) return APP_CONFIG.getTestQuestionsCount();
    return window.getSectionTotal ? window.getSectionTotal(secNum) : 0;
  }

  function maxTotalScore() {
    return sectionTotal(1) + sectionTotal(2) + sectionTotal(3) + sectionTotal(4);
  }

  // Bo'sh (boshlang'ich) sessiya namunasi
  function createEmptySession() {
    return {
      student: null, // { lastName, firstName, group, variant, startTime }
      activeSection: 1, // 1, 2, 3, 4 (test), 5 (final result)
      sections: {
        1: { completed: false, correctCount: 0, totalCount: sectionTotal(1), answers: {} },
        2: { completed: false, correctCount: 0, totalCount: sectionTotal(2), answers: {} },
        3: { completed: false, correctCount: 0, totalCount: sectionTotal(3), answers: {} },
        4: { completed: false, correctCount: 0, totalCount: sectionTotal(4), answers: {}, scorePercent: 0, grade: 2, gradeLabel: "" }
      },
      practicalSections: null, // Talaba uchun 1 marta yaratilgan aralash amaliy bo'limlar
      testUnlocked: false,
      testQuestions: [],
      testCurrentIdx: 0,
      testDeadlineTs: 0, // Testning absolyut tugash vaqti (Date.now() asosida)
      isAllFinished: false
    };
  }

  // Global holat
  let session = createEmptySession();

  let testTimerInterval = null;
  let heartbeatInterval = null;
  let testStatusPollInterval = null;
  let syncChannel = null;

  // DOM Elementlari
  const viewRegister = document.getElementById("viewRegister");
  const viewPlatform = document.getElementById("viewPlatform");
  const studentForm = document.getElementById("studentForm");
  const lastNameInput = document.getElementById("lastName");
  const firstNameInput = document.getElementById("firstName");
  const studentGroupSelect = document.getElementById("studentGroupSelect");
  const btnLogout = document.getElementById("btnLogout");

  const headerMeta = document.getElementById("headerMeta");
  const userNameDisplay = document.getElementById("userNameDisplay");
  const userGroupDisplay = document.getElementById("userGroupDisplay");
  const currentSectionBadge = document.getElementById("currentSectionBadge");

  // Step Nav elementlari
  const stepItems = document.querySelectorAll(".step-item");

  // Amaliy bo'lim kontenti
  const practicalSectionView = document.getElementById("practicalSectionView");
  const practicalSecTitle = document.getElementById("practicalSecTitle");
  const practicalSecSub = document.getElementById("practicalSecSub");
  const practicalSecIcon = document.getElementById("practicalSecIcon");
  const practicalSecRule = document.getElementById("practicalSecRule");
  const practicalQuestionsGrid = document.getElementById("practicalQuestionsGrid");
  const btnSubmitPractical = document.getElementById("btnSubmitPractical");
  const practicalStatusText = document.getElementById("practicalStatusText");

  // Test bo'limi kontenti
  const testSectionView = document.getElementById("testSectionView");
  const testLockCard = document.getElementById("testLockCard");
  const testPinInput = document.getElementById("testPinInput");
  const btnVerifyPin = document.getElementById("btnVerifyPin");
  const pinErrorMessage = document.getElementById("pinErrorMessage");

  const testActiveCard = document.getElementById("testActiveCard");
  const testTimerDisplay = document.getElementById("testTimerDisplay");
  const testQuestionCounter = document.getElementById("testQuestionCounter");
  const testProgressFill = document.getElementById("testProgressFill");
  const testQuestionText = document.getElementById("testQuestionText");
  const testOptionsContainer = document.getElementById("testOptionsContainer");
  const btnTestPrev = document.getElementById("btnTestPrev");
  const btnTestNext = document.getElementById("btnTestNext");
  const btnFinishTest = document.getElementById("btnFinishTest");
  const testPalette = document.getElementById("testPalette");

  // Yakuniy Natijalar ko'rinishi
  const finalSummaryView = document.getElementById("finalSummaryView");
  const resStudentName = document.getElementById("resStudentName");
  const resStudentGroup = document.getElementById("resStudentGroup");
  const resTotalCorrect = document.getElementById("resTotalCorrect");
  const resPercent = document.getElementById("resPercent");
  const resGradeBadge = document.getElementById("resGradeBadge");
  const scoreSec1 = document.getElementById("scoreSec1");
  const scoreSec2 = document.getElementById("scoreSec2");
  const scoreSec3 = document.getElementById("scoreSec3");
  const scoreSec4 = document.getElementById("scoreSec4");

  // Bo'lim yakunlanganida chiquvchi modal
  const sectionCompleteModal = document.getElementById("sectionCompleteModal");
  const modalSecTitle = document.getElementById("modalSecTitle");
  const modalSecScore = document.getElementById("modalSecScore");
  const btnModalNextSec = document.getElementById("btnModalNextSec");

  // To'liq ekran (Fullscreen) ogohlantirish modali
  const fullscreenWarningModal = document.getElementById("fullscreenWarningModal");
  const btnResumeFullscreen = document.getElementById("btnResumeFullscreen");

  // Chiroyli Cyber Bildirishnoma va Tasdiqlash Modali (In-DOM, Fullscreendan chiqarmaydi)
  const cyberDialogModal = document.getElementById("cyberDialogModal");
  const cyberDialogIconWrap = document.getElementById("cyberDialogIconWrap");
  const cyberDialogIcon = document.getElementById("cyberDialogIcon");
  const cyberDialogBadge = document.getElementById("cyberDialogBadge");
  const cyberDialogTitle = document.getElementById("cyberDialogTitle");
  const cyberDialogMessage = document.getElementById("cyberDialogMessage");
  const btnCyberDialogOk = document.getElementById("btnCyberDialogOk");
  const btnCyberDialogCancel = document.getElementById("btnCyberDialogCancel");

  let currentDialogOkCb = null;
  let currentDialogCancelCb = null;

  function showCyberAlert(message, title = "Diqqat!", type = "warning", onOk = null) {
    if (!cyberDialogModal) {
      if (onOk) onOk();
      return;
    }
    currentDialogOkCb = onOk;
    currentDialogCancelCb = null;

    if (cyberDialogTitle) cyberDialogTitle.textContent = title;
    if (cyberDialogMessage) cyberDialogMessage.textContent = message;
    if (cyberDialogBadge) {
      cyberDialogBadge.textContent = type === "info" ? "MA'LUMOT" : type === "success" ? "MUVAFFAQIYATLI" : type === "danger" ? "XATOLIK" : "BILDIRISHNOMA";
    }

    if (cyberDialogIconWrap) {
      cyberDialogIconWrap.className = "cyber-dialog-icon-wrap " + (type === "info" ? "is-info" : type === "success" ? "is-success" : type === "danger" ? "is-danger" : "");
    }
    if (cyberDialogIcon) {
      const paths = {
        warning: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>',
        info: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>',
        success: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>',
        danger: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>'
      };
      cyberDialogIcon.innerHTML = paths[type] || paths.warning;
    }

    if (btnCyberDialogCancel) btnCyberDialogCancel.style.display = "none";
    if (btnCyberDialogOk) {
      btnCyberDialogOk.textContent = "Tushundim";
      setTimeout(() => btnCyberDialogOk.focus(), 50);
    }

    cyberDialogModal.style.display = "flex";
  }

  function showCyberConfirm(message, title = "Tasdiqlash", onConfirm = null, onCancel = null, okText = "Tasdiqlash", cancelText = "Bekor qilish") {
    if (!cyberDialogModal) {
      if (onConfirm) onConfirm();
      return;
    }
    currentDialogOkCb = onConfirm;
    currentDialogCancelCb = onCancel;

    if (cyberDialogTitle) cyberDialogTitle.textContent = title;
    if (cyberDialogMessage) cyberDialogMessage.textContent = message;
    if (cyberDialogBadge) cyberDialogBadge.textContent = "TASDIQLASH";

    if (cyberDialogIconWrap) {
      cyberDialogIconWrap.className = "cyber-dialog-icon-wrap is-info";
    }
    if (cyberDialogIcon) {
      cyberDialogIcon.innerHTML = '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>';
    }

    if (btnCyberDialogCancel) {
      btnCyberDialogCancel.textContent = cancelText;
      btnCyberDialogCancel.style.display = "inline-flex";
    }
    if (btnCyberDialogOk) {
      btnCyberDialogOk.textContent = okText;
      setTimeout(() => btnCyberDialogOk.focus(), 50);
    }

    cyberDialogModal.style.display = "flex";
  }

  function closeCyberDialog() {
    if (cyberDialogModal) {
      cyberDialogModal.style.display = "none";
    }
  }

  // Brauzerning standart alert() ini almashtiramiz — shunda u hech qachon fullscreendan chiqarmaydi
  window.alert = function (msg) {
    showCyberAlert(String(msg || ""), "Bildirishnoma", "warning");
  };

  // BroadcastChannel sozlash (Admin va Talaba o'rtasida bir kompyuterda jonli aloqa)
  try {
    if (typeof BroadcastChannel !== "undefined") {
      syncChannel = new BroadcastChannel("lesson3_sync_channel");
      syncChannel.onmessage = function (event) {
        if (event.data && event.data.type === "TEST_CONFIG_CHANGE") {
          const conf = event.data.payload;
          if (conf && conf.isTestUnlocked) {
            session.testUnlocked = true;
            saveSession();
            if (session.activeSection === 4 && testLockCard && testLockCard.style.display !== "none") {
              unlockAndStartTest();
            }
          }
        }
      };
    }
  } catch (e) {}

  // Dastlabki ishga tushirish
  function initStudentApp() {
    initGroupSelect();
    initStepCounts();
    loadSession();

    if (session.student) {
      showPlatformView();
    } else {
      showRegisterView();
    }

    bindEvents();
    setupAntiCheat();
    startBackgroundTasks();
  }

  // Fon jarayonlari: jonli holat signali va test ruxsatini kuzatish
  // Eslatma: oyna yopilganda "logout" yubormaymiz — sahifa yangilanganda ham
  // ishga tushib, talabani noto'g'ri "Offline" qilib qo'yardi. Buning o'rniga
  // admin panel oxirgi faollik vaqtiga qarab o'zi Offline deb belgilaydi.
  function startBackgroundTasks() {
    sendHeartbeat();
    pollTestStatus();
    if (!heartbeatInterval) {
      heartbeatInterval = setInterval(sendHeartbeat, APP_CONFIG.HEARTBEAT_INTERVAL_MS || 60000);
    }
    if (!testStatusPollInterval) {
      testStatusPollInterval = setInterval(pollTestStatus, APP_CONFIG.TEST_STATUS_POLL_MS || 20000);
    }
  }

  // Bo'limlar zanjiridagi "N ta misol / N ta savol" yozuvlari savollar sonidan
  // avtomatik to'ldiriladi, shunda HTML ni qo'lda tuzatish kerak bo'lmaydi.
  function initStepCounts() {
    document.querySelectorAll("[data-step-count]").forEach(el => {
      const secNum = Number(el.getAttribute("data-step-count"));
      const total = sectionTotal(secNum);
      el.textContent = secNum === 4 ? `${total} ta savol` : `${total} ta misol`;
    });
  }

  // Guruh tanlov dropdownini yaratish (26-01 ... 26-07)
  function initGroupSelect() {
    if (!studentGroupSelect) return;
    studentGroupSelect.innerHTML = `<option value="">Guruhni tanlang...</option>`;
    (APP_CONFIG.ALLOWED_GROUPS || []).forEach(g => {
      const opt = document.createElement("option");
      opt.value = g;
      opt.textContent = `${g}-guruh`;
      studentGroupSelect.appendChild(opt);
    });
  }

  // Sessiyani LocalStorage dan yuklash.
  // Har bir maydon standart qiymat ustiga qo'yiladi — eski yoki yarim buzilgan
  // sessiya ilovani ishdan chiqarmasligi uchun.
  function loadSession() {
    let saved = null;
    try {
      const raw = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.STUDENT_SESSION);
      if (raw) saved = JSON.parse(raw);
    } catch (e) {}

    if (!saved || !saved.student || !saved.student.lastName || !saved.student.group) return;

    const fresh = createEmptySession();
    fresh.student = saved.student;
    if (!fresh.student.variant) fresh.student.variant = 1;
    fresh.activeSection = Number(saved.activeSection) || 1;
    fresh.practicalSections = Array.isArray(saved.practicalSections) && saved.practicalSections.length > 0
      ? saved.practicalSections
      : (window.getPracticalSections ? window.getPracticalSections(fresh.student.variant, true) : null);
    fresh.testUnlocked = !!saved.testUnlocked;
    fresh.testQuestions = Array.isArray(saved.testQuestions) ? saved.testQuestions : [];
    fresh.testCurrentIdx = Number(saved.testCurrentIdx) || 0;
    fresh.testDeadlineTs = Number(saved.testDeadlineTs) || 0;
    fresh.isAllFinished = !!saved.isAllFinished;

    [1, 2, 3, 4].forEach(n => {
      const src = (saved.sections && saved.sections[n]) || {};
      const dst = fresh.sections[n];
      dst.completed = !!src.completed;
      dst.correctCount = Number(src.correctCount) || 0;
      dst.answers = (src.answers && typeof src.answers === "object") ? src.answers : {};
      if (n === 4) {
        dst.scorePercent = Number(src.scorePercent) || 0;
        dst.grade = Number(src.grade) || 2;
        dst.gradeLabel = src.gradeLabel || "";
      }
    });

    // Sessiya buzilgan bo'lsa (savollar yo'q, lekin test tugagan deb turibdi) tuzatib qo'yamiz
    if (fresh.activeSection < 1 || fresh.activeSection > 5) fresh.activeSection = 1;

    session = fresh;
  }

  // Sessiyani saqlash va Admin/Serverga xabar uzatish
  function saveSession(notifyServer = true) {
    try {
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.STUDENT_SESSION, JSON.stringify(session));
    } catch (e) {}

    if (notifyServer && session.student) {
      broadcastUpdate();
      sendToServer();
    }
  }

  // Brauzerlararo sinxronizatsiya (bitta kompyuterdagi admin oynasi uchun)
  function broadcastUpdate(customPayload) {
    if (!session.student) return;
    const payload = customPayload || prepareStudentPayload();
    if (syncChannel) {
      try {
        syncChannel.postMessage({ type: "STUDENT_UPDATE", payload: payload });
      } catch (e) {}
    }
    // Shuningdek LocalStorage dagi barcha natijalar ro'yxatiga ham qo'shib qo'yamiz
    try {
      let all = JSON.parse(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.ALL_SUBMISSIONS) || "[]");
      const idx = all.findIndex(s => 
        s.group === payload.group &&
        s.lastName.toLowerCase() === payload.lastName.toLowerCase() &&
        s.firstName.toLowerCase() === payload.firstName.toLowerCase()
      );
      if (idx >= 0) all[idx] = payload;
      else all.unshift(payload);
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.ALL_SUBMISSIONS, JSON.stringify(all));
    } catch (e) {}
  }

  // ---------------------------------------------------------------------
  // SERVER BILAN ALOQA
  // ---------------------------------------------------------------------
  // Ilgari bu yerda `mode: "no-cors"` bilan POST ishlatilardi. U ishlaganday
  // ko'rinadi, lekin brauzer javobni O'QIY OLMAYDI — ya'ni server so'rovni
  // rad etgan bo'lsa ham sahifa buni bilmaydi va qayta urinmaydi.
  // Apps Script navbati to'lganda (25+ talaba bir vaqtda yozganda) so'rovlar
  // jimgina yo'qolib, talaba admin panelda umuman ko'rinmay qolardi.
  //
  // Endi ma'lumot GET orqali yuboriladi: Apps Script GET javobiga CORS ruxsati
  // qo'shadi, shu sababli javobni o'qib, muvaffaqiyatsizlikda qayta urina olamiz.

  var MAX_GET_URL_LEN = 7000;

  function buildQuery(params) {
    return Object.keys(params)
      .filter(k => params[k] !== undefined && params[k] !== null)
      .map(k => {
        var v = params[k];
        if (typeof v === "object") v = JSON.stringify(v);
        return encodeURIComponent(k) + "=" + encodeURIComponent(String(v));
      })
      .join("&");
  }

  // Bitta urinish. Javob o'qilsa Promise<obyekt>, aks holda reject.
  function sendOnce(params) {
    var base = APP_CONFIG.GOOGLE_SHEET_WEBAPP_URL;
    var url = base + "?" + buildQuery(params) + "&t=" + Date.now();

    if (url.length <= MAX_GET_URL_LEN) {
      return fetch(url)
        .then(res => res.json())
        .then(data => {
          if (!data || data.status !== "success") {
            throw new Error((data && (data.error || data.message)) || "Server rad etdi");
          }
          return data;
        });
    }

    // Juda uzun javoblar uchun zaxira yo'l (GET havolasiga sig'maydi).
    // Content-Type: text/plain — brauzer CORS preflight so'ramasligi uchun.
    return fetch(base, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(params)
    }).then(() => ({ status: "success", blind: true }));
  }

  // Qayta urinishlar bilan yuborish. Kechikishlar tasodifiy ("jitter") —
  // aks holda 25 ta talaba bir vaqtda qayta urinib, navbatni yana to'ldiradi.
  var RETRY_DELAYS_MS = [2000, 6000, 15000];

  function sendWithRetry(params, attempt) {
    attempt = attempt || 0;
    if (!APP_CONFIG.GOOGLE_SHEET_WEBAPP_URL) return Promise.reject(new Error("URL yo'q"));

    return sendOnce(params).catch(err => {
      if (attempt >= RETRY_DELAYS_MS.length) throw err;
      var wait = RETRY_DELAYS_MS[attempt] + Math.floor(Math.random() * 2000);
      return new Promise(resolve => setTimeout(resolve, wait))
        .then(() => sendWithRetry(params, attempt + 1));
    });
  }

  // --- Yuborilmay qolgan yakuniy natijalar navbati ("outbox") ---
  // Baho — eng muhim ma'lumot. Agar u yuborilmasa localStorage ga tushadi va
  // keyingi har bir signalda qayta yuborishga urinib ko'riladi. Talaba sahifani
  // yangilasa yoki internet uzilib-ulansa ham baho oxir-oqibat yetib boradi.
  var OUTBOX_KEY = "app_student_outbox_v3";

  function outboxRead() {
    try {
      var raw = localStorage.getItem(OUTBOX_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function outboxWrite(arr) {
    try {
      localStorage.setItem(OUTBOX_KEY, JSON.stringify(arr.slice(-5)));
    } catch (e) {}
  }

  function outboxAdd(params) {
    var arr = outboxRead();
    // Bitta talabaning eski yuborilmagan natijasini yangisi bilan almashtiramiz
    arr = arr.filter(p => !(p.group === params.group &&
                            p.lastName === params.lastName &&
                            p.firstName === params.firstName));
    arr.push(params);
    outboxWrite(arr);
  }

  // Diqqat: outboxRead() localStorage dan HAR SAFAR yangi obyektlar qaytaradi,
  // shuning uchun obyektni `===` bilan emas, maydonlari bo'yicha qidiramiz.
  function outboxRemove(params) {
    outboxWrite(outboxRead().filter(p =>
      !(p.group === params.group &&
        p.lastName === params.lastName &&
        p.firstName === params.firstName &&
        p.statusText === params.statusText)));
  }

  var outboxFlushing = false;
  function outboxFlush() {
    if (outboxFlushing) return;
    var pending = outboxRead();
    if (pending.length === 0) return;

    outboxFlushing = true;
    var item = pending[0];
    sendOnce(item)
      .then(() => {
        outboxRemove(item);
        console.info("Kechiktirilgan natija serverga yetkazildi.");
      })
      .catch(() => {})
      .then(() => { outboxFlushing = false; });
  }

  // To'liq natijani serverga yuborish (login, bo'lim yakuni, test yakuni)
  function sendToServer() {
    if (!session.student) return;
    var payload = prepareStudentPayload();

    sendWithRetry(payload).catch(err => {
      console.warn("Natijani yuborib bo'lmadi, navbatga qo'yildi:", err);
      outboxAdd(payload);
    });
  }

  // "Men shu yerdaman" signali — admin panelda jonli holat ko'rinishi uchun.
  // Server tomonda bu signal endi talaba qatorini o'zi ocha oladi, ya'ni
  // login yozuvi yo'qolgan bo'lsa ham talaba admin panelda paydo bo'ladi.
  function sendHeartbeat() {
    if (!session.student) return;
    broadcastUpdate(); // bitta kompyuterdagi admin oynasi uchun

    // Avval yuborilmay qolgan natijalar bo'lsa — o'shalar birinchi navbatda
    outboxFlush();

    sendWithRetry({
      action: "heartbeat",
      group: session.student.group,
      lastName: session.student.lastName,
      firstName: session.student.firstName,
      statusText: buildStatusText()
    }).catch(err => {
      console.warn("Jonli signal yuborilmadi:", err);
    });
  }

  // Talaba "Chiqish" tugmasini bosganda
  function sendLogout(student) {
    if (!student) return;

    // Mahalliy ro'yxatda ham "chiqqan" deb belgilaymiz (bitta kompyuterdagi admin oynasi uchun)
    broadcastUpdate(Object.assign(prepareStudentPayload(), {
      online: false,
      lastSeen: formatLocalTimestamp(new Date())
    }));

    sendWithRetry({
      action: "logout",
      group: student.group,
      lastName: student.lastName,
      firstName: student.firstName
    }).catch(() => {});
  }

  // O'qituvchi testni masofadan ochganini serverdan tekshirish.
  // BroadcastChannel faqat bitta kompyuter ichida ishlagani uchun,
  // boshqa kompyuterdagi talabalarga ruxsat aynan shu yo'l bilan yetadi.
  function pollTestStatus() {
    if (!APP_CONFIG.GOOGLE_SHEET_WEBAPP_URL) return;
    // Faqat talaba 4-bo'limda bo'lsa va test hali ochilmagan bo'lsa so'rov yuboriladi (ortiqcha yuklamani oldini olish uchun)
    if (!session.student || session.activeSection !== 4 || session.testUnlocked || session.sections[4].completed) return;

    fetch(APP_CONFIG.GOOGLE_SHEET_WEBAPP_URL + "?action=get_test_status&t=" + Date.now())
      .then(res => res.json())
      .then(data => {
        if (!data || data.status !== "success") return;

        if (data.teacherPin) {
          try {
            const raw = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.ADMIN_CONFIG);
            const conf = raw ? JSON.parse(raw) : {};
            conf.teacherPin = data.teacherPin;
            localStorage.setItem(APP_CONFIG.STORAGE_KEYS.ADMIN_CONFIG, JSON.stringify(conf));
          } catch (e) {}
        }

        if (data.isTestUnlocked && !session.testUnlocked) {
          session.testUnlocked = true;
          saveSession(false);
          // Agar talaba ayni damda qulf ekranida turgan bo'lsa — darhol ochamiz
          if (session.activeSection === 4 && testLockCard && testLockCard.style.display !== "none") {
            unlockAndStartTest();
          }
        }
      })
      .catch(() => {});
  }

  // Serverdagi "Oxirgi faollik" ustuni bilan bir xil format: "YYYY-MM-DD HH:MM:SS"
  function formatLocalTimestamp(d) {
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ` +
           `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  }

  let liveHeartbeatTimer = null;
  function scheduleLiveHeartbeat(delayMs = 12000) {
    if (liveHeartbeatTimer) clearTimeout(liveHeartbeatTimer);
    liveHeartbeatTimer = setTimeout(() => {
      sendHeartbeat();
    }, delayMs);
  }

  // Talabaning ayni damdagi holati (admin panelda "Joriy Holat" ustuni)
  // O'qituvchiga har bir talabaning nechanchi savolda turgani va nechta javob yozgani jonli ko'rinadi
  function buildStatusText() {
    if (session.isAllFinished) return "Yakunlandi";
    if (session.activeSection === 4) {
      const qList = session.testQuestions || [];
      const ansCount = Object.keys((session.sections[4] && session.sections[4].answers) || {}).length;
      return qList.length > 0 ? `Testda (${ansCount}/${qList.length})` : "Testda";
    }
    const secNum = session.activeSection;
    const secConfig = getPracticalSectionConfig(secNum);
    if (secConfig) {
      const ansCount = countAnswered(secConfig, session.sections[secNum]);
      return `${secNum}-Bo'lim (${ansCount}/${secConfig.questions.length})`;
    }
    return `${session.activeSection}-Bo'limda`;
  }

  // Server va Admin uchun tayyorlangan to'liq ma'lumot
  function prepareStudentPayload() {
    const s1 = session.sections[1];
    const s2 = session.sections[2];
    const s3 = session.sections[3];
    const s4 = session.sections[4];

    let totalCorrect = 0;
    if (s1.completed) totalCorrect += s1.correctCount;
    if (s2.completed) totalCorrect += s2.correctCount;
    if (s3.completed) totalCorrect += s3.correctCount;
    if (s4.completed) totalCorrect += s4.correctCount;

    let possible = maxTotalScore();
    let pct = possible > 0 ? Math.round((totalCorrect / possible) * 100) : 0;
    let gradeObj = APP_CONFIG.calculateGrade(pct);

    // Barcha javoblarni bitta obyektga jamlash
    const allAnswers = {};
    if (s1.answers) Object.assign(allAnswers, s1.answers);
    if (s2.answers) Object.assign(allAnswers, s2.answers);
    if (s3.answers) Object.assign(allAnswers, s3.answers);
    if (s4.answers) Object.assign(allAnswers, s4.answers);
    allAnswers["_variant"] = (session.student && session.student.variant) ? session.student.variant : 1;

    return {
      timestamp: session.student.startTime || new Date().toLocaleString("uz-UZ"),
      group: session.student.group,
      lastName: session.student.lastName,
      firstName: session.student.firstName,
      statusText: buildStatusText(),
      sec1Score: s1.completed ? `${s1.correctCount}/${sectionTotal(1)}` : "-",
      sec2Score: s2.completed ? `${s2.correctCount}/${sectionTotal(2)}` : "-",
      sec3Score: s3.completed ? `${s3.correctCount}/${sectionTotal(3)}` : "-",
      testScore: s4.completed ? `${s4.correctCount}/${sectionTotal(4)}` : "-",
      totalCorrect: `${totalCorrect} / ${possible}`,
      percentage: `${pct}%`,
      grade: s4.completed ? gradeObj.grade : "-",
      gradeLabel: s4.completed ? gradeObj.label : "-",
      variant: (session.student && session.student.variant) ? session.student.variant : 1,
      answers: allAnswers,
      // Jonli holat: server orqali ham, bitta kompyuterdagi BroadcastChannel
      // orqali ham admin panel bir xil ma'lumot olishi uchun
      lastSeen: formatLocalTimestamp(new Date()),
      online: true
    };
  }

  // Tugmalar va formalar hodisalari
  function bindEvents() {
    if (studentForm) {
      studentForm.addEventListener("submit", handleStudentRegister);
    }

    stepItems.forEach(item => {
      item.addEventListener("click", () => {
        const secNum = Number(item.getAttribute("data-step"));
        switchSection(secNum);
      });
    });

    if (btnSubmitPractical) {
      btnSubmitPractical.addEventListener("click", submitCurrentPracticalSection);
    }

    if (btnVerifyPin) {
      btnVerifyPin.addEventListener("click", handleVerifyPin);
    }

    if (testPinInput) {
      testPinInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleVerifyPin();
      });
    }

    if (btnTestPrev) {
      btnTestPrev.addEventListener("click", () => navigateTestQuestion(-1));
    }

    if (btnTestNext) {
      btnTestNext.addEventListener("click", () => navigateTestQuestion(1));
    }

    if (btnFinishTest) {
      btnFinishTest.addEventListener("click", submitTestSection);
    }

    if (btnLogout) {
      btnLogout.addEventListener("click", handleLogout);
    }

    if (btnModalNextSec) {
      btnModalNextSec.addEventListener("click", () => {
        if (sectionCompleteModal) sectionCompleteModal.classList.remove("active");
        const nextSec = session.activeSection + 1;
        switchSection(nextSec);
      });
    }

    if (btnResumeFullscreen) {
      btnResumeFullscreen.addEventListener("click", () => {
        enterFullscreen().then(() => {
          setTimeout(checkFullscreenEnforcement, 300);
        });
      });
    }

    if (btnCyberDialogOk) {
      btnCyberDialogOk.addEventListener("click", () => {
        closeCyberDialog();
        if (typeof currentDialogOkCb === "function") {
          const fn = currentDialogOkCb;
          currentDialogOkCb = null;
          fn();
        }
      });
    }

    if (btnCyberDialogCancel) {
      btnCyberDialogCancel.addEventListener("click", () => {
        closeCyberDialog();
        if (typeof currentDialogCancelCb === "function") {
          const fn = currentDialogCancelCb;
          currentDialogCancelCb = null;
          fn();
        }
      });
    }
  }

  // 1. Ro'yxatdan o'tish (Login) — Doim tasodifiy variant va To'liq ekran rejimi
  function handleStudentRegister(e) {
    e.preventDefault();
    const lastName = (lastNameInput ? lastNameInput.value : "").trim();
    const firstName = (firstNameInput ? firstNameInput.value : "").trim();
    const group = (studentGroupSelect ? studentGroupSelect.value : "").trim();

    if (!lastName) {
      showCyberAlert("Iltimos, familiyangizni kiriting!", "Ma'lumot to'liq emas", "warning", () => {
        if (lastNameInput) lastNameInput.focus();
      });
      return;
    }
    if (!firstName) {
      showCyberAlert("Iltimos, ismingizni kiriting!", "Ma'lumot to'liq emas", "warning", () => {
        if (firstNameInput) firstNameInput.focus();
      });
      return;
    }
    if (!group) {
      showCyberAlert("Iltimos, guruhingizni tanlang!", "Guruh tanlanmagan", "warning", () => {
        if (studentGroupSelect) studentGroupSelect.focus();
      });
      return;
    }

    // Har doim tasodifiy variant (1..5) biriktiriladi (talaba tanlamaydi)
    const variantNum = Math.floor(Math.random() * (APP_CONFIG.VARIANTS_COUNT || 5)) + 1;

    session.student = {
      lastName: lastName,
      firstName: firstName,
      group: group,
      variant: variantNum,
      // Sana ham yoziladi: ilgari faqat "10:44:51" ko'rinishida edi va jadvalda
      // qaysi kunning natijasi ekanini ajratib bo'lmasdi.
      startTime: formatLocalTimestamp(new Date())
    };
    if (window.getPracticalSections) {
      session.practicalSections = window.getPracticalSections(variantNum, true);
    }

    saveSession();
    showPlatformView();
    pollTestStatus();

    // To'liq ekran rejimiga kirish va tekshirish
    enterFullscreen().catch(() => {});
    setTimeout(checkFullscreenEnforcement, 600);
  }

  // Tizimdan chiqish — bitta kompyuterda keyingi talaba ishlashi uchun
  function handleLogout() {
    if (!session.student) return;

    const warn = session.isAllFinished
      ? "Tizimdan chiqmoqchimisiz? Natijangiz o'qituvchiga allaqachon saqlangan."
      : "Diqqat! Siz hali barcha bo'limlarni yakunlamadingiz.\nChiqsangiz, bu kompyuterdagi javoblaringiz o'chadi va qaytadan boshlashingizga to'g'ri keladi.\n\nHaqiqatan chiqmoqchimisiz?";

    showCyberConfirm(warn, "Tizimdan chiqish", () => {
      const leaving = session.student;

      // Oxirgi holatni va chiqish signalini serverga yuboramiz
      sendToServer();
      sendLogout(leaving);

      if (testTimerInterval) {
        clearInterval(testTimerInterval);
        testTimerInterval = null;
      }

      session = createEmptySession();
      try {
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.STUDENT_SESSION);
      } catch (e) {}

      hideFullscreenWarning();

      if (studentForm) studentForm.reset();
      if (studentGroupSelect) studentGroupSelect.value = "";
      showRegisterView();
      if (lastNameInput) lastNameInput.focus();
    }, null, "Ha, chiqish", "Qolish");
  }

  function showRegisterView() {
    if (viewRegister) viewRegister.style.display = "block";
    if (viewPlatform) viewPlatform.style.display = "none";
    if (headerMeta) headerMeta.style.display = "none";
    if (btnLogout) btnLogout.style.display = "none";
  }

  function showPlatformView() {
    if (viewRegister) viewRegister.style.display = "none";
    if (viewPlatform) viewPlatform.style.display = "block";
    if (headerMeta) headerMeta.style.display = "flex";
    if (btnLogout) btnLogout.style.display = "inline-flex";

    if (userNameDisplay) userNameDisplay.textContent = `${session.student.lastName} ${session.student.firstName}`;
    if (userGroupDisplay) userGroupDisplay.textContent = `${session.student.group}-guruh`;
    const userVariantDisplay = document.getElementById("userVariantDisplay");
    if (userVariantDisplay && session.student) {
      userVariantDisplay.textContent = `${session.student.variant || 1}-variant`;
    }

    updateStepIndicators();
    renderCurrentSection();

    // To'liq ekran rejimini tekshirish
    if (!session.isAllFinished) {
      setTimeout(checkFullscreenEnforcement, 500);
    }
  }

  // Step indikatorlarini yangilash
  function updateStepIndicators() {
    stepItems.forEach(item => {
      const secNum = Number(item.getAttribute("data-step"));
      item.classList.remove("active", "completed", "locked");

      if (secNum === 5) {
        // Yakuniy natija
        if (session.isAllFinished) {
          if (session.activeSection === 5) item.classList.add("active");
          item.classList.add("completed");
        } else {
          item.classList.add("locked");
        }
        return;
      }

      const secData = session.sections[secNum];
      if (secData && secData.completed) {
        item.classList.add("completed");
      }

      if (session.activeSection === secNum) {
        item.classList.add("active");
      } else if (secNum > 1 && !session.sections[secNum - 1].completed) {
        item.classList.add("locked");
      }
    });

    if (currentSectionBadge) {
      if (session.activeSection === 5) currentSectionBadge.textContent = "Yakunlandi";
      else if (session.activeSection === 4) currentSectionBadge.textContent = "4-Bo'lim: Test";
      else currentSectionBadge.textContent = `${session.activeSection}-Bo'lim`;
    }
  }

  // Bo'limni almashtirish
  function switchSection(secNum) {
    if (secNum < 1 || secNum > 5) return;

    // Agar oldingi bo'limlar bajarilmagan bo'lsa, o'tkazmaymiz
    if (secNum > 1 && secNum <= 4) {
      if (!session.sections[secNum - 1].completed) {
        showCyberAlert(`Avval ${secNum - 1}-bo'limni yakunlashingiz kerak!`, "Bo'lim qulflangan", "warning");
        return;
      }
    }

    if (secNum === 5 && !session.isAllFinished) {
      showCyberAlert("Barcha 4 ta bo'limni yakunlaganingizdan so'ng umumiy natija ochiladi.", "Natijalar kutilmoqda", "info");
      return;
    }

    session.activeSection = secNum;
    saveSession();
    updateStepIndicators();
    renderCurrentSection();

    // 4-bo'limga o'tganda test ruxsatini darhol tekshiramiz
    if (secNum === 4) {
      pollTestStatus();
    }
  }

  // Joriy bo'limni ekranga chizish
  function renderCurrentSection() {
    if (session.activeSection >= 1 && session.activeSection <= 3) {
      // 1, 2, 3-amaliy bo'limlar
      if (practicalSectionView) practicalSectionView.style.display = "block";
      if (testSectionView) testSectionView.style.display = "none";
      if (finalSummaryView) finalSummaryView.style.display = "none";
      renderPracticalSection(session.activeSection);
    } else if (session.activeSection === 4) {
      // 4-bo'lim Test
      if (practicalSectionView) practicalSectionView.style.display = "none";
      if (testSectionView) testSectionView.style.display = "block";
      if (finalSummaryView) finalSummaryView.style.display = "none";
      renderTestSection();
    } else if (session.activeSection === 5) {
      // 5-ko'rinish: Yakuniy umumiy natijalar
      if (practicalSectionView) practicalSectionView.style.display = "none";
      if (testSectionView) testSectionView.style.display = "none";
      if (finalSummaryView) finalSummaryView.style.display = "block";
      renderFinalSummary();
    }
  }

  // =========================================================================
  // =========================================================================
  // AMALIY BO'LIMLAR (1, 2, 3) LOGIKASI
  // =========================================================================

  function getPracticalSectionConfig(secNum) {
    if (session.practicalSections && session.practicalSections[secNum - 1]) {
      return session.practicalSections[secNum - 1];
    }
    const v = (session.student && session.student.variant) || 1;
    if (window.getPracticalSections) {
      return window.getPracticalSections(v, false)[secNum - 1];
    }
    return window.PRACTICAL_SECTIONS ? window.PRACTICAL_SECTIONS[secNum - 1] : null;
  }

  function renderPracticalSection(secNum) {
    const secConfig = getPracticalSectionConfig(secNum);
    if (!secConfig) return;

    const secState = session.sections[secNum];
    const isCompleted = secState.completed;

    if (practicalSecTitle) practicalSecTitle.textContent = secConfig.title;
    if (practicalSecSub) practicalSecSub.textContent = secConfig.subtitle;
    if (practicalSecIcon) practicalSecIcon.innerHTML = secConfig.icon;
    if (practicalSecRule) practicalSecRule.innerHTML = secConfig.ruleText;

    if (!practicalQuestionsGrid) return;
    practicalQuestionsGrid.innerHTML = "";

    secConfig.questions.forEach((q, idx) => {
      const savedVal = secState.answers[q.id] || "";
      const itemEl = document.createElement("div");
      itemEl.className = "question-card-item" + (savedVal ? " is-answered" : "") + (isCompleted ? " is-locked" : "");
      
      itemEl.innerHTML = `
        <div class="q-top-row">
          <span class="q-badge-num">Savol ${q.num}</span>
          ${isCompleted ? '<span class="status-tag finished">✓ Bajarildi</span>' : ''}
        </div>
        <div class="q-prompt-text">${q.prompt}</div>
        <div class="q-input-container">
          <input 
            type="text" 
            class="practical-answer-input" 
            data-qid="${q.id}" 
            placeholder="${isCompleted ? 'Topshirildi' : q.placeholder}" 
            value="${escapeHtml(savedVal)}"
            ${isCompleted ? "disabled" : ""}
            autocomplete="off"
            spellcheck="false"
          />
          <span class="unit-tag">${q.unitHint}</span>
        </div>
      `;

      // Inputga yozilganda holatni xotiraga saqlab borish (To'g'ri/xatoligi aslo ko'rsatilmaydi!)
      const inputEl = itemEl.querySelector(".practical-answer-input");
      if (inputEl && !isCompleted) {
        inputEl.addEventListener("input", (e) => {
          secState.answers[q.id] = e.target.value.trim();
          if (e.target.value.trim()) itemEl.classList.add("is-answered");
          else itemEl.classList.remove("is-answered");
          saveSession(false); // xotiraga saqlash
          broadcastUpdate(); // mahalliy adminga darhol uzatish (0ms)
          updateAnsweredCountText(secConfig, secState);
          // Serverga jonli holatni uzatish. DIQQAT: bu qiymatni kichraytirmang!
          // Ilgari 3.5 s edi — 25 ta talaba javob yozayotganda sekundiga ~7 ta
          // so'rov hosil bo'lib, Apps Script navbatini to'ldirib yuborardi va
          // natijalar jimgina yo'qolardi. Mahalliy admin oynasi baribir
          // yuqoridagi broadcastUpdate() orqali 0 ms da yangilanadi.
          scheduleLiveHeartbeat(12000);
        });
      }

      practicalQuestionsGrid.appendChild(itemEl);
    });

    updateAnsweredCountText(secConfig, secState);

    // Agar bo'lim topshirib bo'lingan bo'lsa, tugmani qulflash
    if (btnSubmitPractical) {
      if (isCompleted) {
        btnSubmitPractical.disabled = true;
        btnSubmitPractical.style.opacity = "0.6";
        btnSubmitPractical.innerHTML = `
          <svg class="icon" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          Ushbu bo'lim bajarildi (${secState.correctCount} / ${secConfig.questions.length})
        `;
      } else {
        btnSubmitPractical.disabled = false;
        btnSubmitPractical.style.opacity = "1";
        btnSubmitPractical.innerHTML = `
          <svg class="icon" viewBox="0 0 24 24"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>
          Bo'limni tasdiqlash va yakunlash
        `;
      }
    }
  }

  function updateAnsweredCountText(secConfig, secState) {
    if (!practicalStatusText) return;
    const total = secConfig.questions.length;
    if (secState.completed) {
      practicalStatusText.innerHTML = `<strong>Bo'lim holati:</strong> Bajarildi. To'g'ri topilganlar: <strong>${secState.correctCount} / ${total}</strong> ta.`;
      return;
    }
    const answeredCount = countAnswered(secConfig, secState);
    practicalStatusText.innerHTML = `Javob berildi: <strong>${answeredCount} / ${total}</strong> ta. Yozib bo'lgach "Tasdiqlash" tugmasini bosing.`;
  }

  // Faqat shu bo'limga tegishli savollarni sanaymiz
  function countAnswered(secConfig, secState) {
    return secConfig.questions.filter(q => (secState.answers[q.id] || "").trim() !== "").length;
  }

  // Amaliy bo'limni tasdiqlash va ballni hisoblash
  function submitCurrentPracticalSection() {
    const secNum = session.activeSection;
    const secConfig = getPracticalSectionConfig(secNum);
    const secState = session.sections[secNum];
    if (!secConfig || secState.completed) return;

    const total = secConfig.questions.length;
    const answeredCount = countAnswered(secConfig, secState);

    const onConfirmFinalize = () => {
      // Ballarni hisoblash
      let correctCount = 0;
      secConfig.questions.forEach(q => {
        const userVal = secState.answers[q.id] || "";
        if (window.checkPracticalAnswer && window.checkPracticalAnswer(userVal, q.expectedAnswer)) {
          correctCount++;
        }
      });

      secState.completed = true;
      secState.correctCount = correctCount;
      saveSession(true); // Server va adminga uzatish

      // O'quvchiga faqat to'g'ri topilganlar sonini ko'rsatuvchi modal
      if (modalSecTitle) modalSecTitle.textContent = `${secConfig.title} Yakunlandi!`;
      if (modalSecScore) modalSecScore.textContent = `${correctCount} / ${total} ta to'g'ri`;
      if (sectionCompleteModal) sectionCompleteModal.classList.add("active");

      updateStepIndicators();
      renderPracticalSection(secNum);
    };

    if (answeredCount < total) {
      showCyberConfirm(
        `Siz ${total} ta misoldan ${answeredCount} tasiga javob yozdingiz. Qolganlari noto'g'ri deb hisoblanadi.\n\nHaqiqatan ham bo'limni yakunlamoqchimisiz?`,
        "Bo'limni yakunlash",
        onConfirmFinalize,
        null,
        "Ha, yakunlash",
        "Davom etish"
      );
    } else {
      showCyberConfirm(
        "Barcha javoblarni tekshirib bo'ldingizmi?\n\nTasdiqlashdan so'ng ushbu bo'lim qulflanadi va qayta o'zgartirib bo'lmaydi.",
        "Bo'limni tasdiqlash",
        onConfirmFinalize,
        null,
        "Tasdiqlash",
        "Bekor qilish"
      );
    }
  }

  // =========================================================================
  // 4-BO'LIM: TEST SINOVI LOGIKASI (MAXSUS RUXSAT BILAN)
  // =========================================================================

  function renderTestSection() {
    // 1. Agar oldingi 3 ta bo'lim tugallanmagan bo'lsa
    if (!session.sections[1].completed || !session.sections[2].completed || !session.sections[3].completed) {
      showCyberAlert("Oldin 1, 2 va 3-amaliy bo'limlarni yakunlashingiz shart!", "Ketma-ketlik majburiy", "warning", () => {
        switchSection(1);
      });
      return;
    }

    // 2. Test ruxsati tekshiruvi:
    // a) Talabada testUnlocked bormi?
    // b) Admin panelda ochilganmi? (LocalAdminConfig orqali tekshirish)
    checkRemoteTestUnlock();

    if (!session.testUnlocked && !session.sections[4].completed) {
      // Test QULFLANGAN
      if (testLockCard) testLockCard.style.display = "block";
      if (testActiveCard) testActiveCard.style.display = "none";
      if (pinErrorMessage) pinErrorMessage.textContent = "";
      if (testPinInput) {
        testPinInput.value = "";
        testPinInput.focus();
      }
    } else {
      // Test OCHILGAN
      if (testLockCard) testLockCard.style.display = "none";
      if (testActiveCard) testActiveCard.style.display = "block";
      startOrResumeTest();
    }
  }

  function checkRemoteTestUnlock() {
    try {
      const raw = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.ADMIN_CONFIG);
      if (raw) {
        const conf = JSON.parse(raw);
        if (conf && conf.isTestUnlocked) {
          session.testUnlocked = true;
        }
      }
    } catch (e) {}
  }

  function handleVerifyPin() {
    const entered = (testPinInput ? testPinInput.value : "").trim();
    if (!entered) {
      if (pinErrorMessage) pinErrorMessage.textContent = "PIN-kodni kiriting!";
      return;
    }

    // Amaldagi o'qituvchi PIN-kodini aniqlash
    let validPin = APP_CONFIG.DEFAULT_TEACHER_PIN || "2603";
    try {
      const raw = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.ADMIN_CONFIG);
      if (raw) {
        const conf = JSON.parse(raw);
        if (conf && conf.teacherPin) validPin = conf.teacherPin;
      }
    } catch (e) {}

    if (entered === validPin) {
      unlockAndStartTest();
      if (pinErrorMessage) pinErrorMessage.textContent = "";
    } else {
      if (pinErrorMessage) pinErrorMessage.textContent = "Noto'g'ri PIN-kod! O'qituvchidan so'rang.";
      if (testPinInput) testPinInput.focus();
    }
  }

  function unlockAndStartTest() {
    session.testUnlocked = true;
    saveSession(true);
    if (testLockCard) testLockCard.style.display = "none";
    if (testActiveCard) testActiveCard.style.display = "block";
    startOrResumeTest();
  }

  function startOrResumeTest() {
    // Test variantini tuzish (agar avval tuzilmagan bo'lsa)
    if (!session.testQuestions || session.testQuestions.length === 0) {
      if (!window.ALL_QUESTIONS || window.ALL_QUESTIONS.length === 0) {
        // Savollar fayli yuklanmagan — taymerni boshlab, bo'sh test ko'rsatmaymiz
        showCyberAlert("Test savollari yuklanmadi. Sahifani yangilang yoki o'qituvchiga murojaat qiling.", "Xatolik", "danger");
        if (testQuestionText) testQuestionText.textContent = "Savollarni yuklab bo'lmadi.";
        return;
      }
      session.testQuestions = buildTestQuestions();
      saveSession(false);
    }

    // Tugash vaqtini birinchi marta belgilaymiz. Absolyut vaqt tamg'asi bo'lgani uchun
    // talaba tabni yopib qo'ysa ham taymer to'xtamaydi.
    if (!session.testDeadlineTs) {
      const minutes = APP_CONFIG.TEST_DURATION_MINUTES || 25;
      session.testDeadlineTs = Date.now() + minutes * 60 * 1000;
      saveSession(false);
    }

    // Taymerni ishga tushirish (agar test hali tugallanmagan bo'lsa)
    if (!session.sections[4].completed && !testTimerInterval) {
      updateTestTimer();
      testTimerInterval = setInterval(updateTestTimer, 1000);
    }

    renderTestPalette();
    renderTestQuestion();
  }

  /**
   * Test variantini tuzish.
   * Har bir kategoriyadan (nazariy / o'lchov / sanoq) config'da belgilangan
   * miqdorda savol tasodifiy tanlanadi. Shu sababli har bir talabaga boshqacha
   * variant tushadi, lekin testning tuzilishi hammada bir xil bo'ladi.
   */
  function buildTestQuestions() {
    const composition = APP_CONFIG.TEST_COMPOSITION || {};
    const bank = window.ALL_QUESTIONS || [];
    const picked = [];

    Object.keys(composition).forEach(category => {
      const need = composition[category];
      const pool = bank.filter(q => q.category === category);

      if (pool.length < need) {
        console.warn(`"${category}" kategoriyasida ${need} ta savol kerak, bankda esa ${pool.length} ta bor.`);
      }
      picked.push(...shuffle(pool).slice(0, need));
    });

    // Kategoriyalar aralashib ketishi uchun umumiy tartibni ham aralashtiramiz
    return shuffle(picked).map(q => ({
      id: q.id,
      question: q.question,
      options: shuffle(q.options), // variantlar tartibi ham har talabada boshqacha
      answer: q.answer
    }));
  }

  function getRemainingSeconds() {
    if (!session.testDeadlineTs) return (APP_CONFIG.TEST_DURATION_MINUTES || 25) * 60;
    return Math.max(0, Math.round((session.testDeadlineTs - Date.now()) / 1000));
  }

  function updateTestTimer() {
    const remaining = getRemainingSeconds();

    if (testTimerDisplay) {
      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      testTimerDisplay.textContent = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }

    if (remaining <= 0) {
      clearInterval(testTimerInterval);
      testTimerInterval = null;
      if (!session.sections[4].completed) {
        showCyberAlert("Ajratilgan vaqt tugadi! Test natijalari avtomatik tasdiqlanadi.", "Vaqt tugadi", "warning", () => {
          submitTestSection(true);
        });
      }
    }
  }

  function renderTestPalette() {
    if (!testPalette) return;
    testPalette.innerHTML = "";
    const isCompleted = session.sections[4].completed;

    (session.testQuestions || []).forEach((q, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "palette-btn";
      btn.textContent = idx + 1;

      const isAns = session.sections[4].answers[q.id] !== undefined;
      if (isAns) btn.classList.add("answered");
      if (session.testCurrentIdx === idx) btn.classList.add("active");

      btn.addEventListener("click", () => {
        session.testCurrentIdx = idx;
        renderTestQuestion();
        renderTestPalette();
      });

      testPalette.appendChild(btn);
    });
  }

  function renderTestQuestion() {
    const qList = session.testQuestions || [];
    if (qList.length === 0) return;

    const idx = session.testCurrentIdx;
    const q = qList[idx];
    const isCompleted = session.sections[4].completed;

    if (testQuestionCounter) {
      testQuestionCounter.textContent = `${idx + 1} / ${qList.length}`;
    }
    if (testProgressFill) {
      const pct = Math.round(((idx + 1) / qList.length) * 100);
      testProgressFill.style.width = `${pct}%`;
    }
    if (testQuestionText) {
      testQuestionText.textContent = `${idx + 1}. ${q.question}`;
    }

    if (!testOptionsContainer) return;
    testOptionsContainer.innerHTML = "";

    const userSelectedOpt = session.sections[4].answers[q.id];

    q.options.forEach((optText, optIdx) => {
      // Klass nomlari css/style.css dagi mavjud uslublar bilan bir xil bo'lishi shart
      const optBtn = document.createElement("button");
      optBtn.type = "button";
      optBtn.className = "option-item" + (userSelectedOpt === optText ? " selected" : "");
      if (isCompleted) optBtn.disabled = true;

      const letter = String.fromCharCode(65 + optIdx); // A, B, C, D
      optBtn.innerHTML = `
        <span class="option-letter">${letter}</span>
        <span class="option-text">${escapeHtml(optText)}</span>
      `;

      if (!isCompleted) {
        optBtn.addEventListener("click", () => {
          session.sections[4].answers[q.id] = optText;
          saveSession(false);
          broadcastUpdate(); // mahalliy adminga darhol uzatish (0ms)
          renderTestQuestion();
          renderTestPalette();
          scheduleLiveHeartbeat(2500); // serverga jonli holatni uzatish
        });
      }

      testOptionsContainer.appendChild(optBtn);
    });

    // Navigatsiya tugmalari
    if (btnTestPrev) btnTestPrev.disabled = idx === 0;
    if (btnTestNext) btnTestNext.disabled = idx === qList.length - 1;

    // Yakunlash tugmasi
    if (btnFinishTest) {
      if (isCompleted) {
        btnFinishTest.style.display = "none";
      } else {
        btnFinishTest.style.display = "inline-flex";
      }
    }
  }

  function navigateTestQuestion(delta) {
    const nextIdx = session.testCurrentIdx + delta;
    if (nextIdx >= 0 && nextIdx < (session.testQuestions || []).length) {
      session.testCurrentIdx = nextIdx;
      renderTestQuestion();
      renderTestPalette();
    }
  }

  function submitTestSection(force = false) {
    const qList = session.testQuestions || [];
    const ansMap = session.sections[4].answers;
    const answeredCount = Object.keys(ansMap).length;

    const executeFinishTest = () => {
      if (testTimerInterval) {
        clearInterval(testTimerInterval);
        testTimerInterval = null;
      }

      // To'g'ri javoblar sonini hisoblash
      let correctCount = 0;
      qList.forEach(q => {
        if (ansMap[q.id] === q.answer) {
          correctCount++;
        }
      });

      const percent = Math.round((correctCount / qList.length) * 100);
      const gradeObj = APP_CONFIG.calculateGrade(percent);

      session.sections[4].completed = true;
      session.sections[4].correctCount = correctCount;
      session.sections[4].scorePercent = percent;
      session.sections[4].grade = gradeObj.grade;
      session.sections[4].gradeLabel = gradeObj.label;
      session.isAllFinished = true;
      session.activeSection = 5; // Yakuniy sahifa

      hideFullscreenWarning();
      saveSession(true); // O'qituvchiga yuborish

      // Yakuniy baho barcha 4 ta bo'lim bo'yicha hisoblanadi
      const overallCorrect = session.sections[1].correctCount + session.sections[2].correctCount +
                             session.sections[3].correctCount + correctCount;
      const overallPossible = maxTotalScore();
      const overallPercent = Math.round((overallCorrect / overallPossible) * 100);
      const overallGrade = APP_CONFIG.calculateGrade(overallPercent);

      showCyberAlert(
        `Test natijasi: ${qList.length} tadan ${correctCount} ta to'g'ri\n` +
        `Umumiy natija: ${overallPossible} tadan ${overallCorrect} ta (${overallPercent}%)\n` +
        `Yakuniy baho: ${overallGrade.grade} (${overallGrade.label})`,
        "Test muvaffaqiyatli yakunlandi!",
        "success",
        () => {
          updateStepIndicators();
          renderCurrentSection();
        }
      );

      updateStepIndicators();
      renderCurrentSection();
    };

    if (!force) {
      if (answeredCount < qList.length) {
        showCyberConfirm(
          `Siz ${qList.length} ta savoldan ${answeredCount} tasiga javob belgiladingiz. Qolganlari belgilanmagan deb hisoblanadi.\n\nTestni yakunlashni tasdiqlaysizmi?`,
          "Testni yakunlash",
          executeFinishTest,
          null,
          "Ha, yakunlash",
          "Davom etish"
        );
        return;
      } else {
        showCyberConfirm(
          "Barcha 20 ta test savollariga javob belgilab bo'ldingizmi?\n\nTestni yakunlashni tasdiqlaysizmi?",
          "Testni yakunlash",
          executeFinishTest,
          null,
          "Ha, yakunlash",
          "Qayta ko'rish"
        );
        return;
      }
    }

    executeFinishTest();
  }

  // =========================================================================
  // 5-KO'RINISH: YAKUNIY UMUMIY NATIJA (SUMMARY)
  // =========================================================================

  function renderFinalSummary() {
    if (resStudentName) resStudentName.textContent = `${session.student.lastName} ${session.student.firstName}`;
    if (resStudentGroup) resStudentGroup.textContent = `${session.student.group}-guruh`;
    const resStudentVariant = document.getElementById("resStudentVariant");
    if (resStudentVariant && session.student) {
      resStudentVariant.textContent = `${session.student.variant || 1}-variant`;
    }

    const s1 = session.sections[1];
    const s2 = session.sections[2];
    const s3 = session.sections[3];
    const s4 = session.sections[4];

    if (scoreSec1) scoreSec1.textContent = `${s1.correctCount} / ${sectionTotal(1)}`;
    if (scoreSec2) scoreSec2.textContent = `${s2.correctCount} / ${sectionTotal(2)}`;
    if (scoreSec3) scoreSec3.textContent = `${s3.correctCount} / ${sectionTotal(3)}`;
    if (scoreSec4) scoreSec4.textContent = `${s4.correctCount} / ${sectionTotal(4)}`;

    const totalCorrect = s1.correctCount + s2.correctCount + s3.correctCount + s4.correctCount;
    const possible = maxTotalScore();
    const percent = Math.round((totalCorrect / possible) * 100);
    const gradeObj = APP_CONFIG.calculateGrade(percent);

    if (resTotalCorrect) resTotalCorrect.textContent = `${totalCorrect} / ${possible}`;
    if (resPercent) resPercent.textContent = `${percent}%`;
    if (resGradeBadge) {
      resGradeBadge.textContent = `${gradeObj.grade} — ${gradeObj.label}`;
      resGradeBadge.className = `badge ${gradeObj.badgeClass}`;
    }
  }

  // =========================================================================
  // ANTI-CHEAT VA TO'LIQ EKRAN (FULLSCREEN) NAZORATI
  // =========================================================================

  function isFullscreenActive() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
  }

  function enterFullscreen() {
    const docEl = document.documentElement;
    const rfs = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
    if (rfs) {
      try {
        const res = rfs.call(docEl);
        if (res && typeof res.catch === "function") {
          return res.catch(err => {
            console.warn("To'liq ekranga o'tish rad etildi:", err);
          });
        }
      } catch (e) {
        console.warn("Fullscreen error:", e);
      }
    }
    return Promise.resolve();
  }

  function showFullscreenWarning() {
    if (fullscreenWarningModal && session.student && !session.isAllFinished) {
      fullscreenWarningModal.style.display = "flex";
    }
  }

  function hideFullscreenWarning() {
    if (fullscreenWarningModal) {
      fullscreenWarningModal.style.display = "none";
    }
  }

  function checkFullscreenEnforcement() {
    // Agar talaba hali kirmagan yoki barcha topshiriqlarni yakunlagan bo'lsa — to'sqich kerak emas
    if (!session.student || session.isAllFinished) {
      hideFullscreenWarning();
      return;
    }

    if (!isFullscreenActive()) {
      showFullscreenWarning();
    } else {
      hideFullscreenWarning();
    }
  }

  function setupAntiCheat() {
    // Sichqonchaning o'ng tugmasini bloklash
    document.addEventListener("contextmenu", (e) => e.preventDefault());

    // Nusxa olish, qirqish, joylashni bloklash
    document.addEventListener("copy", (e) => e.preventDefault());
    document.addEventListener("cut", (e) => e.preventDefault());

    // F12, Ctrl+U, Ctrl+S, Ctrl+P ni bloklash
    document.addEventListener("keydown", (e) => {
      if (e.key === "F12" || 
          (e.ctrlKey && (e.key === "u" || e.key === "U" || e.key === "s" || e.key === "S" || e.key === "p" || e.key === "P"))) {
        e.preventDefault();
        return false;
      }
    });

    // To'liq ekran o'zgarishini ushlab olish (Esc, F11 va boshqalar bosilganda)
    ["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "MSFullscreenChange"].forEach(evt => {
      document.addEventListener(evt, checkFullscreenEnforcement);
    });

    // Boshqa dastur yoki oynaga o'tganda (Tab/Window switch)
    window.addEventListener("blur", () => {
      if (session.student && !session.isAllFinished) {
        checkFullscreenEnforcement();
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (session.student && !session.isAllFinished) {
        if (document.hidden) {
          console.warn("Talaba boshqa oynaga o'tdi!");
        }
        checkFullscreenEnforcement();
      }
    });

    // Topshiriq paytida sahifani yopish yoki yangilashdan himoyalash
    window.addEventListener("beforeunload", (e) => {
      if (session.student && !session.isAllFinished) {
        e.preventDefault();
        e.returnValue = "Topshiriqlar hali yakunlanmagan. Chiqib ketsangiz, natijalaringiz saqlanmasligi mumkin!";
        return e.returnValue;
      }
    });
  }

  // Fisher-Yates aralashtirish.
  // `sort(() => 0.5 - Math.random())` teng ehtimollik bermaydi — ba'zi savollar
  // boshqalariga qaraganda ancha ko'p tushib qolardi.
  function shuffle(arr) {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // DOM yuklanganda ishga tushirish
  document.addEventListener("DOMContentLoaded", initStudentApp);
})();
