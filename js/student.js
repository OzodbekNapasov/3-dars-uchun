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
      student: null, // { lastName, firstName, group, startTime }
      activeSection: 1, // 1, 2, 3, 4 (test), 5 (final result)
      sections: {
        1: { completed: false, correctCount: 0, totalCount: sectionTotal(1), answers: {} },
        2: { completed: false, correctCount: 0, totalCount: sectionTotal(2), answers: {} },
        3: { completed: false, correctCount: 0, totalCount: sectionTotal(3), answers: {} },
        4: { completed: false, correctCount: 0, totalCount: sectionTotal(4), answers: {}, scorePercent: 0, grade: 2, gradeLabel: "" }
      },
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
    fresh.activeSection = Number(saved.activeSection) || 1;
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

  // Google Sheets Apps Script ga har qanday ma'lumotni yuborish.
  // Content-Type: text/plain — brauzer CORS preflight so'ramasligi uchun
  // (Apps Script baribir tanani JSON deb o'qiy oladi).
  function postToServer(payload) {
    if (!APP_CONFIG.GOOGLE_SHEET_WEBAPP_URL) return;
    fetch(APP_CONFIG.GOOGLE_SHEET_WEBAPP_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    }).catch(err => {
      console.warn("Serverga yuborishda vaqtincha xatolik (Keshda saqlandi):", err);
    });
  }

  // To'liq natijani serverga yuborish
  function sendToServer() {
    if (!session.student) return;
    postToServer(prepareStudentPayload());
  }

  // "Men shu yerdaman" signali — admin panelda jonli holat ko'rinishi uchun
  function sendHeartbeat() {
    if (!session.student) return;
    broadcastUpdate(); // bitta kompyuterdagi admin oynasi uchun
    postToServer({
      action: "heartbeat",
      group: session.student.group,
      lastName: session.student.lastName,
      firstName: session.student.firstName,
      statusText: buildStatusText()
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

    postToServer({
      action: "logout",
      group: student.group,
      lastName: student.lastName,
      firstName: student.firstName
    });
  }

  // O'qituvchi testni masofadan ochganini serverdan tekshirish.
  // BroadcastChannel faqat bitta kompyuter ichida ishlagani uchun,
  // boshqa kompyuterdagi talabalarga ruxsat aynan shu yo'l bilan yetadi.
  function pollTestStatus() {
    if (!APP_CONFIG.GOOGLE_SHEET_WEBAPP_URL) return;
    if (!session.student || session.testUnlocked || session.sections[4].completed) return;

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

  // Talabaning ayni damdagi holati (admin panelda "Joriy Holat" ustuni)
  function buildStatusText() {
    if (session.isAllFinished) return "Yakunlandi";
    if (session.activeSection === 4) return "Testda";
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
  }

  // 1. Ro'yxatdan o'tish (Login)
  function handleStudentRegister(e) {
    e.preventDefault();
    const lastName = (lastNameInput ? lastNameInput.value : "").trim();
    const firstName = (firstNameInput ? firstNameInput.value : "").trim();
    const group = (studentGroupSelect ? studentGroupSelect.value : "").trim();

    if (!lastName) {
      alert("Iltimos, familiyangizni kiriting!");
      if (lastNameInput) lastNameInput.focus();
      return;
    }
    if (!firstName) {
      alert("Iltimos, ismingizni kiriting!");
      if (firstNameInput) firstNameInput.focus();
      return;
    }
    if (!group) {
      alert("Iltimos, guruhingizni tanlang!");
      if (studentGroupSelect) studentGroupSelect.focus();
      return;
    }

    session.student = {
      lastName: lastName,
      firstName: firstName,
      group: group,
      startTime: new Date().toLocaleTimeString("uz-UZ")
    };

    saveSession();
    showPlatformView();
    pollTestStatus();
  }

  // Tizimdan chiqish — bitta kompyuterda keyingi talaba ishlashi uchun
  function handleLogout() {
    if (!session.student) return;

    const warn = session.isAllFinished
      ? "Tizimdan chiqmoqchimisiz? Natijangiz o'qituvchiga allaqachon saqlangan."
      : "Diqqat! Siz hali barcha bo'limlarni yakunlamadingiz.\nChiqsangiz, bu kompyuterdagi javoblaringiz o'chadi va qaytadan boshlashingizga to'g'ri keladi.\n\nHaqiqatan chiqmoqchimisiz?";
    if (!confirm(warn)) return;

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

    if (studentForm) studentForm.reset();
    if (studentGroupSelect) studentGroupSelect.value = "";
    showRegisterView();
    if (lastNameInput) lastNameInput.focus();
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

    updateStepIndicators();
    renderCurrentSection();
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
        alert(`Avval ${secNum - 1}-bo'limni yakunlashingiz kerak!`);
        return;
      }
    }

    if (secNum === 5 && !session.isAllFinished) {
      alert("Barcha 4 ta bo'limni yakunlaganingizdan so'ng umumiy natija ochiladi.");
      return;
    }

    session.activeSection = secNum;
    saveSession();
    updateStepIndicators();
    renderCurrentSection();
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
  // AMALIY BO'LIMLAR (1, 2, 3) LOGIKASI
  // =========================================================================

  function renderPracticalSection(secNum) {
    const secConfig = window.PRACTICAL_SECTIONS ? window.PRACTICAL_SECTIONS[secNum - 1] : null;
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
          saveSession(false); // faqat xotiraga saqlash
          updateAnsweredCountText(secConfig, secState);
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
    const secConfig = window.PRACTICAL_SECTIONS ? window.PRACTICAL_SECTIONS[secNum - 1] : null;
    const secState = session.sections[secNum];
    if (!secConfig || secState.completed) return;

    const total = secConfig.questions.length;
    const answeredCount = countAnswered(secConfig, secState);
    if (answeredCount < total) {
      const confirmNotAll = confirm(`Siz ${total} ta savoldan ${answeredCount} tasiga javob yozdingiz. Qolganlari xato deb hisoblanadi. Haqiqatan ham bo'limni yakunlamoqchimisiz?`);
      if (!confirmNotAll) return;
    } else {
      const confirmSubmit = confirm("Barcha javoblarni tekshirib bo'ldingizmi? Tasdiqlashdan so'ng ushbu bo'lim qulflanadi va qayta o'zgartirib bo'lmaydi.");
      if (!confirmSubmit) return;
    }

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
  }

  // =========================================================================
  // 4-BO'LIM: TEST SINOVI LOGIKASI (MAXSUS RUXSAT BILAN)
  // =========================================================================

  function renderTestSection() {
    // 1. Agar oldingi 3 ta bo'lim tugallanmagan bo'lsa
    if (!session.sections[1].completed || !session.sections[2].completed || !session.sections[3].completed) {
      alert("Oldin 1, 2 va 3-amaliy bo'limlarni yakunlashingiz shart!");
      switchSection(1);
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
        alert("Test savollari yuklanmadi. Sahifani yangilang yoki o'qituvchiga murojaat qiling.");
        if (testQuestionText) testQuestionText.textContent = "Savollarni yuklab bo'lmadi.";
        return;
      }
      session.testQuestions = buildTestQuestions();
      saveSession(false);
    }

    // Tugash vaqtini birinchi marta belgilaymiz. Absolyut vaqt tamg'asi bo'lgani uchun
    // talaba tabni yopib qo'yса ham taymer to'xtamaydi.
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
        alert("Ajratilgan vaqt tugadi! Test natijalari avtomatik tasdiqlanadi.");
        submitTestSection(true);
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
          renderTestQuestion();
          renderTestPalette();
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

    if (!force) {
      if (answeredCount < qList.length) {
        const c = confirm(`Siz ${qList.length} ta savoldan ${answeredCount} tasiga javob belgiladingiz. Testni yakunlamoqchimisiz?`);
        if (!c) return;
      } else {
        const c = confirm("Testni yakunlashni tasdiqlaysizmi?");
        if (!c) return;
      }
    }

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

    saveSession(true); // O'qituvchiga yuborish

    // Yakuniy baho barcha 4 ta bo'lim bo'yicha hisoblanadi — shu sababli bu yerda
    // faqat test natijasini ko'rsatamiz, baho esa umumiy natijadan olinadi
    // (aks holda talabaga ikki xil baho ko'rinib chalkashlik tug'diradi).
    const overallCorrect = session.sections[1].correctCount + session.sections[2].correctCount +
                           session.sections[3].correctCount + correctCount;
    const overallPossible = maxTotalScore();
    const overallPercent = Math.round((overallCorrect / overallPossible) * 100);
    const overallGrade = APP_CONFIG.calculateGrade(overallPercent);

    alert(
      `Test muvaffaqiyatli yakunlandi!\n` +
      `Test natijasi: ${qList.length} tadan ${correctCount} ta to'g'ri\n\n` +
      `Umumiy natija: ${overallPossible} tadan ${overallCorrect} ta (${overallPercent}%)\n` +
      `Yakuniy baho: ${overallGrade.grade} (${overallGrade.label})`
    );

    updateStepIndicators();
    renderCurrentSection();
  }

  // =========================================================================
  // 5-KO'RINISH: YAKUNIY UMUMIY NATIJA (SUMMARY)
  // =========================================================================

  function renderFinalSummary() {
    if (resStudentName) resStudentName.textContent = `${session.student.lastName} ${session.student.firstName}`;
    if (resStudentGroup) resStudentGroup.textContent = `${session.student.group}-guruh`;

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
  // ANTI-CHEAT VA XAVFSIZLIK
  // =========================================================================

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

    // Boshqa oynaga o'tish (Tab switch) ogohlantirishi
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && session.student && !session.isAllFinished) {
        console.warn("Talaba boshqa oynaga o'tdi!");
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
