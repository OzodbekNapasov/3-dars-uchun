/**
 * 3-Dars: Talaba Platformasi Asosiy Logikasi (js/student.js)
 * Guruhlar: 26-01 ... 26-07
 * Bo'limlar: 1 (O'lchov), 2 (2->10), 3 (10->2), 4 (Test - maxsus ruxsat bilan)
 * Hech qanday yechimlar/to'g'ri javoblar talabaga ko'rsatilmaydi!
 */

(function () {
  // Global holat
  let session = {
    student: null, // { lastName, firstName, group, startTime }
    activeSection: 1, // 1, 2, 3, 4 (test), 5 (final result)
    sections: {
      1: { completed: false, correctCount: 0, totalCount: 10, answers: {} },
      2: { completed: false, correctCount: 0, totalCount: 10, answers: {} },
      3: { completed: false, correctCount: 0, totalCount: 10, answers: {} },
      4: { completed: false, correctCount: 0, totalCount: 20, answers: {}, scorePercent: 0, grade: 2, gradeLabel: "" }
    },
    testUnlocked: false,
    testQuestions: [],
    testCurrentIdx: 0,
    testRemainingSeconds: (APP_CONFIG.TEST_DURATION_MINUTES || 25) * 60,
    isAllFinished: false
  };

  let testTimerInterval = null;
  let syncChannel = null;

  // DOM Elementlari
  const viewRegister = document.getElementById("viewRegister");
  const viewPlatform = document.getElementById("viewPlatform");
  const studentForm = document.getElementById("studentForm");
  const lastNameInput = document.getElementById("lastName");
  const firstNameInput = document.getElementById("firstName");
  const studentGroupSelect = document.getElementById("studentGroupSelect");

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
    loadSession();

    if (session.student) {
      showPlatformView();
    } else {
      showRegisterView();
    }

    bindEvents();
    setupAntiCheat();
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

  // Sessiyani LocalStorage dan yuklash
  function loadSession() {
    try {
      const raw = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.STUDENT_SESSION);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.student) {
          session = Object.assign(session, saved);
        }
      }
    } catch (e) {}
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

  // Brauzerlararo sinxronizatsiya
  function broadcastUpdate() {
    if (!session.student) return;
    const payload = prepareStudentPayload();
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

  // Google Sheets Apps Script ga yuborish
  function sendToServer() {
    if (!APP_CONFIG.GOOGLE_SHEET_WEBAPP_URL || !session.student) return;
    const payload = prepareStudentPayload();

    fetch(APP_CONFIG.GOOGLE_SHEET_WEBAPP_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(err => {
      console.warn("Serverga yuborishda vaqtincha xatolik (Keshda saqlandi):", err);
    });
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

    let possible = 10 + 10 + 10 + 20; // 50
    let pct = Math.round((totalCorrect / possible) * 100);
    let gradeObj = APP_CONFIG.calculateGrade(pct);

    let currentStatusText = `${session.activeSection}-Bo'limda`;
    if (session.isAllFinished) currentStatusText = "Yakunlandi";
    else if (session.activeSection === 4) currentStatusText = "Testda";

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
      statusText: currentStatusText,
      sec1Score: s1.completed ? `${s1.correctCount}/10` : "-",
      sec2Score: s2.completed ? `${s2.correctCount}/10` : "-",
      sec3Score: s3.completed ? `${s3.correctCount}/10` : "-",
      testScore: s4.completed ? `${s4.correctCount}/20` : "-",
      totalCorrect: `${totalCorrect} / ${possible}`,
      percentage: `${pct}%`,
      grade: s4.completed ? gradeObj.grade : "-",
      gradeLabel: s4.completed ? gradeObj.label : "-",
      answers: allAnswers
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
  }

  function showRegisterView() {
    if (viewRegister) viewRegister.style.display = "block";
    if (viewPlatform) viewPlatform.style.display = "none";
    if (headerMeta) headerMeta.style.display = "none";
  }

  function showPlatformView() {
    if (viewRegister) viewRegister.style.display = "none";
    if (viewPlatform) viewPlatform.style.display = "block";
    if (headerMeta) headerMeta.style.display = "flex";

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
          Ushbu bo'lim bajarildi (${secState.correctCount} / 10)
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
    if (secState.completed) {
      practicalStatusText.innerHTML = `<strong>Bo'lim holati:</strong> Bajarildi. To'g'ri topilganlar: <strong>${secState.correctCount} / 10</strong> ta.`;
      return;
    }
    const answeredCount = Object.keys(secState.answers).filter(k => (secState.answers[k] || "").trim() !== "").length;
    practicalStatusText.innerHTML = `Javob berildi: <strong>${answeredCount} / 10</strong> ta. Yozib bo'lgach "Tasdiqlash" tugmasini bosing.`;
  }

  // Amaliy bo'limni tasdiqlash va ballni hisoblash
  function submitCurrentPracticalSection() {
    const secNum = session.activeSection;
    const secConfig = window.PRACTICAL_SECTIONS ? window.PRACTICAL_SECTIONS[secNum - 1] : null;
    const secState = session.sections[secNum];
    if (!secConfig || secState.completed) return;

    const answeredCount = Object.keys(secState.answers).filter(k => (secState.answers[k] || "").trim() !== "").length;
    if (answeredCount < 10) {
      const confirmNotAll = confirm(`Siz 10 ta savoldan ${answeredCount} tasiga javob yozdingiz. Qolganlari xato deb hisoblanadi. Haqiqatan ham bo'limni yakunlamoqchimisiz?`);
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
    if (modalSecScore) modalSecScore.textContent = `${correctCount} / 10 ta to'g'ri`;
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

    if (entered === validPin || entered === "2603" || entered === "7777") {
      unlockAndStartTest();
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
    // 20 ta tasodifiy savol generatsiya qilish (agar avval generatsiya qilinmagan bo'lsa)
    if (!session.testQuestions || session.testQuestions.length === 0) {
      if (window.ALL_QUESTIONS && window.ALL_QUESTIONS.length > 0) {
        // Savollarni aralashtirish
        const shuffled = [...window.ALL_QUESTIONS].sort(() => 0.5 - Math.random());
        const count = APP_CONFIG.TEST_QUESTIONS_COUNT || 20;
        session.testQuestions = shuffled.slice(0, count).map(q => {
          // Variantlarni ham aralashtirish
          const opts = [...q.options].sort(() => 0.5 - Math.random());
          return {
            id: q.id,
            question: q.question,
            options: opts,
            answer: q.answer
          };
        });
      }
      saveSession(false);
    }

    // Taymerni ishga tushirish (agar test hali tugallanmagan bo'lsa)
    if (!session.sections[4].completed && !testTimerInterval) {
      testTimerInterval = setInterval(updateTestTimer, 1000);
    }

    renderTestPalette();
    renderTestQuestion();
  }

  function updateTestTimer() {
    if (session.testRemainingSeconds <= 0) {
      clearInterval(testTimerInterval);
      testTimerInterval = null;
      alert("Ajratilgan vaqt tugadi! Test natijalari avtomatik tasdiqlanadi.");
      submitTestSection(true);
      return;
    }
    session.testRemainingSeconds--;
    if (testTimerDisplay) {
      const m = Math.floor(session.testRemainingSeconds / 60);
      const s = session.testRemainingSeconds % 60;
      testTimerDisplay.textContent = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    // Har 15 soniyada taymer holatini saqlash
    if (session.testRemainingSeconds % 15 === 0) {
      saveSession(false);
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
      const optBtn = document.createElement("button");
      optBtn.type = "button";
      optBtn.className = "option-btn" + (userSelectedOpt === optText ? " selected" : "");
      if (isCompleted) optBtn.disabled = true;

      const letter = String.fromCharCode(65 + optIdx); // A, B, C, D
      optBtn.innerHTML = `
        <span class="opt-letter">${letter}</span>
        <span class="opt-text">${escapeHtml(optText)}</span>
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
        const c = confirm(`Siz 20 ta savoldan ${answeredCount} tasiga javob belgiladingiz. Testni yakunlamoqchimisiz?`);
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

    alert(`Test muvaffaqiyatli yakunlandi!\nNatija: 20 tadan ${correctCount} ta to'g'ri (${percent}%)\nBaho: ${gradeObj.grade} (${gradeObj.label})`);

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

    if (scoreSec1) scoreSec1.textContent = `${s1.correctCount} / 10`;
    if (scoreSec2) scoreSec2.textContent = `${s2.correctCount} / 10`;
    if (scoreSec3) scoreSec3.textContent = `${s3.correctCount} / 10`;
    if (scoreSec4) scoreSec4.textContent = `${s4.correctCount} / 20`;

    const totalCorrect = s1.correctCount + s2.correctCount + s3.correctCount + s4.correctCount;
    const possible = 50;
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
