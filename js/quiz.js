/**
 * 3-Dars Test Dasturi — Yagona Sahifali (SPA) Tizim
 * Chrome brauzerining xabarlaridan holi, o'zining ichki zamonaviy bildirishnomalari,
 * to'liq ekranni saqlab qoluvchi va cheaterlikdan qat'iy himoyalangan arxitektura.
 */

(function () {
  // DOM View Screens
  const viewRegister = document.getElementById('viewRegister');
  const viewQuiz = document.getElementById('viewQuiz');
  const viewResults = document.getElementById('viewResults');

  // Header elementlari
  const headerMeta = document.getElementById('headerMeta');
  const userNameDisplay = document.getElementById('userNameDisplay');
  const timerBadge = document.getElementById('timerBadge');
  const timerDisplay = document.getElementById('timerDisplay');
  const btnFinishTop = document.getElementById('btnFinishTop');

  // Ro'yxatdan o'tish formasi
  const studentForm = document.getElementById('studentForm');
  const lastNameInput = document.getElementById('lastName');
  const firstNameInput = document.getElementById('firstName');
  const studentGroupInput = document.getElementById('studentGroup');

  // Test elementlari
  const progressFill = document.getElementById('progressFill');
  const paletteContainer = document.getElementById('paletteContainer');
  const answeredStatusText = document.getElementById('answeredStatusText');
  const questionCounter = document.getElementById('questionCounter');
  const questionText = document.getElementById('questionText');
  const optionsContainer = document.getElementById('optionsContainer');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');

  // Modallar
  const noticeModal = document.getElementById('noticeModal');
  const noticeModalTitle = document.getElementById('noticeModalTitle');
  const noticeModalBody = document.getElementById('noticeModalBody');
  const noticeModalIcon = document.getElementById('noticeModalIcon');
  const btnCloseNotice = document.getElementById('btnCloseNotice');

  const confirmModal = document.getElementById('confirmModal');
  const confirmModalText = document.getElementById('confirmModalText');
  const btnCancelSubmit = document.getElementById('btnCancelSubmit');
  const btnConfirmSubmit = document.getElementById('btnConfirmSubmit');

  const fullscreenWarningModal = document.getElementById('fullscreenWarningModal');
  const btnResumeFullscreen = document.getElementById('btnResumeFullscreen');

  const antiCheatAlert = document.getElementById('antiCheatAlert');
  const antiCheatText = document.getElementById('antiCheatText');

  // Natijalar elementlari
  const resultPercent = document.getElementById('resultPercent');
  const resultGrade = document.getElementById('resultGrade');
  const scoreCircle = document.getElementById('scoreCircle');
  const resStudentName = document.getElementById('resStudentName');
  const resStudentGroup = document.getElementById('resStudentGroup');
  const resCorrectCount = document.getElementById('resCorrectCount');
  const resTimeSpent = document.getElementById('resTimeSpent');
  const sheetStatusBox = document.getElementById('sheetStatusBox');
  const btnToggleReview = document.getElementById('btnToggleReview');
  const reviewContainer = document.getElementById('reviewContainer');
  const reviewList = document.getElementById('reviewList');
  const btnRestart = document.getElementById('btnRestart');

  // Tarix (Kesh) elementlari
  const headerHistoryWrapper = document.getElementById('headerHistoryWrapper');
  const btnOpenHistory = document.getElementById('btnOpenHistory');
  const historyCountBadge = document.getElementById('historyCountBadge');
  const btnResultHistory = document.getElementById('btnResultHistory');
  const historyModal = document.getElementById('historyModal');
  const btnCloseHistory = document.getElementById('btnCloseHistory');
  const btnCloseHistoryBottom = document.getElementById('btnCloseHistoryBottom');
  const historySearchInput = document.getElementById('historySearchInput');
  const btnExportHistory = document.getElementById('btnExportHistory');
  const btnClearHistory = document.getElementById('btnClearHistory');
  const historyTable = document.getElementById('historyTable');
  const historyTableBody = document.getElementById('historyTableBody');
  const historyEmptyState = document.getElementById('historyEmptyState');
  const statTotalCount = document.getElementById('statTotalCount');
  const statAvgScore = document.getElementById('statAvgScore');
  const statTopGrades = document.getElementById('statTopGrades');
  const statMaxScore = document.getElementById('statMaxScore');

  // Holat o'zgaruvchilari
  let currentStudent = null;
  let quizQuestions = [];
  let currentIndex = 0;
  let remainingSeconds = (APP_CONFIG.TEST_DURATION_MINUTES || 25) * 60;
  let timerInterval = null;
  let testFinished = false;
  let antiCheatTimeout = null;

  // =========================================================================
  // 1. ZAMONAVIY ICHKI BILDIRISHNOMA (Browser alert o'rniga)
  // =========================================================================
  function showNotice(title, message, type = 'warning') {
    noticeModalTitle.textContent = title;
    noticeModalBody.innerHTML = message;

    if (type === 'warning') {
      noticeModalIcon.className = 'modal-icon-wrapper warning';
      noticeModalIcon.innerHTML = `<svg class="icon icon-md" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`;
    } else if (type === 'danger') {
      noticeModalIcon.className = 'modal-icon-wrapper danger';
      noticeModalIcon.innerHTML = `<svg class="icon icon-md" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`;
    } else {
      noticeModalIcon.className = 'modal-icon-wrapper primary';
      noticeModalIcon.innerHTML = `<svg class="icon icon-md" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`;
    }

    noticeModal.classList.add('active');
  }

  btnCloseNotice.addEventListener('click', () => {
    noticeModal.classList.remove('active');
  });

  function showAntiCheatBanner(msg) {
    antiCheatText.textContent = msg;
    antiCheatAlert.style.display = 'flex';
    clearTimeout(antiCheatTimeout);
    antiCheatTimeout = setTimeout(() => {
      antiCheatAlert.style.display = 'none';
    }, 2500);
  }

  // =========================================================================
  // 2. ANTI-CHEAT: FULLSCREEN, NUSXALASH VA SKRINSHOT BLOKLASH
  // =========================================================================
  function enterFullscreen() {
    const elem = document.documentElement;
    try {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    } catch (e) {}
  }

  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && viewQuiz.classList.contains('active') && !testFinished) {
      fullscreenWarningModal.classList.add('active');
    }
  });

  btnResumeFullscreen.addEventListener('click', () => {
    enterFullscreen();
    fullscreenWarningModal.classList.remove('active');
  });

  // Sichqonchaning o'ng tugmasini bloklash
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showAntiCheatBanner("Sichqonchaning o'ng tugmasi bloklangan!");
    return false;
  });

  // Nusxalash, kesish, qo'yishni bloklash
  ['copy', 'cut', 'paste', 'selectstart'].forEach((evt) => {
    document.addEventListener(evt, (e) => {
      if (e.target.tagName !== 'INPUT') {
        e.preventDefault();
        showAntiCheatBanner("Nusxa olish taqiqlangan!");
        return false;
      }
    });
  });

  // Klaviatura tugmalarini tutib olish (PrintScreen, Ctrl+C, F12 va maxfiy yordamchi)
  let lastMinusPressTime = 0;

  window.addEventListener('keydown', (e) => {
    // Maxfiy rejim: klaviaturadagi 0 yonidagi '-' tugmasi tezkor 2 marta bosilganda to'g'ri javobni avtomatik belgilash
    const isMinusKey = (e.code === 'Minus' || (e.key === '-' && e.code !== 'NumpadSubtract'));

    if (isMinusKey) {
      if (!e.repeat &&
          viewQuiz && viewQuiz.classList.contains('active') &&
          !testFinished &&
          quizQuestions && quizQuestions.length > 0 &&
          e.target.tagName !== 'INPUT' &&
          e.target.tagName !== 'TEXTAREA' &&
          (!noticeModal || !noticeModal.classList.contains('active')) &&
          (!confirmModal || !confirmModal.classList.contains('active')) &&
          (!fullscreenWarningModal || !fullscreenWarningModal.classList.contains('active')) &&
          (!historyModal || !historyModal.classList.contains('active'))) {

        const now = Date.now();
        const diff = now - lastMinusPressTime;

        if (diff >= 50 && diff <= 450) {
          // 2 marta tez bosildi (Double tap)
          lastMinusPressTime = 0;
          e.preventDefault();

          const currentQ = quizQuestions[currentIndex];
          if (currentQ && currentQ.correctAnswer) {
            currentQ.selectedOption = currentQ.correctAnswer;
            renderQuestion();
          }
          return;
        } else {
          lastMinusPressTime = now;
        }
      } else {
        lastMinusPressTime = 0;
      }
    } else {
      lastMinusPressTime = 0;
    }

    if (e.key === 'PrintScreen' || e.keyCode === 44) {
      e.preventDefault();
      showAntiCheatBanner("Skrinshot olish qat'iyan taqiqlangan!");
      try { navigator.clipboard.writeText(''); } catch (err) {}
      return false;
    }

    if (e.ctrlKey && ['c', 'C', 'u', 'U', 'p', 'P', 's', 'S', 'a', 'A'].includes(e.key)) {
      if (e.target.tagName !== 'INPUT') {
        e.preventDefault();
        showAntiCheatBanner("Tezkor klavishlar bloklangan!");
        return false;
      }
    }

    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['i', 'I', 'j', 'J', 'c', 'C'].includes(e.key))) {
      e.preventDefault();
      showAntiCheatBanner("Dasturchi asboblari bloklangan!");
      return false;
    }
  });

  // Oynadan chiqib ketishni (Tab switch) aniqlash
  let tabSwitchCount = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && viewQuiz.classList.contains('active') && !testFinished) {
      tabSwitchCount++;
      showAntiCheatBanner(`Ogohlantirish: Boshqa oynaga o'tish qayd etildi (${tabSwitchCount}-marta)!`);
    }
  });

  // =========================================================================
  // 3. RO'YXATDAN O'TISH VA TESTNI BOSHLASH
  // =========================================================================
  studentForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const lastName = lastNameInput.value.trim();
    const firstName = firstNameInput.value.trim();
    const studentGroup = studentGroupInput.value.trim();

    // Validatsiya (Chrome alert o'rniga ichki chiroyli bildirishnoma)
    let hasError = false;
    [lastNameInput, firstNameInput, studentGroupInput].forEach(input => {
      if (!input.value.trim()) {
        input.classList.add('input-error');
        hasError = true;
      } else {
        input.classList.remove('input-error');
      }
    });

    if (hasError) {
      showNotice(
        "Ma'lumotlarni kiriting",
        "Iltimos, familiyangiz, ismingiz va guruhingizni to'liq kiriting!",
        "warning"
      );
      return;
    }

    currentStudent = {
      lastName,
      firstName,
      group: studentGroup,
      startTime: new Date().toISOString()
    };

    // To'liq ekran rejimiga kirish
    enterFullscreen();

    // Testni ishga tushirish
    startQuizSession();
  });

  // Inputlardagi xatolik chegarasini yozganda olib tashlash
  [lastNameInput, firstNameInput, studentGroupInput].forEach(inp => {
    inp.addEventListener('input', () => inp.classList.remove('input-error'));
  });

  // =========================================================================
  // 4. TEST JARAYONINI BOSHLASH
  // =========================================================================
  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function startQuizSession() {
    // 40 ta savoldan tasodifiy 20 tasini tanlash
    const totalNeeded = APP_CONFIG.TEST_QUESTIONS_COUNT || 20;
    const selected = shuffleArray(ALL_QUESTIONS).slice(0, totalNeeded);

    quizQuestions = selected.map((q, idx) => ({
      index: idx,
      id: q.id,
      question: q.question,
      options: shuffleArray(q.options),
      correctAnswer: q.answer,
      selectedOption: null
    }));

    currentIndex = 0;
    remainingSeconds = (APP_CONFIG.TEST_DURATION_MINUTES || 25) * 60;
    testFinished = false;

    // Header yangilash
    userNameDisplay.textContent = `${currentStudent.lastName} ${currentStudent.firstName} (${currentStudent.group})`;
    headerMeta.style.display = 'flex';
    if (headerHistoryWrapper) headerHistoryWrapper.style.display = 'none';

    // Ekranlarni almashtirish
    viewRegister.classList.remove('active');
    viewResults.classList.remove('active');
    viewQuiz.classList.add('active');

    // Savolni va taymerni chiqarish
    renderQuestion();
    startTimer();

    // URL manzilini /test ga o'zgartirish (sahifa yangilanmasdan)
    try {
      history.pushState({ screen: 'quiz' }, '', '#test');
    } catch (e) {}
  }

  // =========================================================================
  // 5. TAYMER VA PALITRA
  // =========================================================================
  function startTimer() {
    updateTimerDisplay();
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      remainingSeconds--;
      updateTimerDisplay();

      if (remainingSeconds <= 300 && remainingSeconds > 60) {
        timerBadge.className = 'timer-badge warning';
      } else if (remainingSeconds <= 60 && remainingSeconds > 0) {
        timerBadge.className = 'timer-badge danger';
      } else if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        showNotice("Vaqt tugadi", "Ajratilgan 25 daqiqa vaqt tugadi! Test natijalari avtomatik tarzda qayd etiladi.", "danger");
        finishQuiz();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const mins = Math.floor(Math.max(0, remainingSeconds) / 60);
    const secs = Math.max(0, remainingSeconds) % 60;
    timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function renderPalette() {
    paletteContainer.innerHTML = '';
    let answeredCount = 0;

    quizQuestions.forEach((q, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'palette-btn';
      btn.textContent = idx + 1;

      if (idx === currentIndex) {
        btn.classList.add('current');
      }
      if (q.selectedOption !== null) {
        btn.classList.add('answered');
        answeredCount++;
      }

      btn.addEventListener('click', () => {
        currentIndex = idx;
        renderQuestion();
      });

      paletteContainer.appendChild(btn);
    });

    answeredStatusText.textContent = `${answeredCount} / ${quizQuestions.length} belgilandi`;
    const progressPercent = (answeredCount / quizQuestions.length) * 100;
    progressFill.style.width = `${progressPercent}%`;

    const dynamicQuizFrame = document.getElementById('dynamicQuizFrame');
    const frameProgressText = document.getElementById('frameProgressText');
    if (dynamicQuizFrame) {
      const angle = (answeredCount / quizQuestions.length) * 360;
      const ratio = answeredCount / quizQuestions.length;
      dynamicQuizFrame.style.setProperty('--answered-angle', `${angle}deg`);
      dynamicQuizFrame.style.setProperty('--answered-ratio', ratio);
    }
    if (frameProgressText) {
      frameProgressText.textContent = `${answeredCount} / ${quizQuestions.length} belgilandi (${Math.round(progressPercent)}%)`;
    }
  }

  // =========================================================================
  // 6. JORIY SAVOLNI KO'RSATISH VA NAVIGATSIYA
  // =========================================================================
  const optionLetters = ['A', 'B', 'C', 'D'];

  function renderQuestion() {
    const currentQ = quizQuestions[currentIndex];

    questionCounter.textContent = `Savol ${currentIndex + 1} / ${quizQuestions.length}`;
    questionText.textContent = currentQ.question;

    optionsContainer.innerHTML = '';
    currentQ.options.forEach((optText, optIdx) => {
      const optDiv = document.createElement('div');
      optDiv.className = 'option-item';
      if (currentQ.selectedOption === optText) {
        optDiv.classList.add('selected');
      }

      optDiv.innerHTML = `
        <div class="option-letter">${optionLetters[optIdx]}</div>
        <div class="option-text">${escapeHtml(optText)}</div>
        <div class="option-check">
          <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
        </div>
      `;

      optDiv.addEventListener('click', () => {
        currentQ.selectedOption = optText;
        renderQuestion();
        renderPalette();
      });

      optionsContainer.appendChild(optDiv);
    });

    // Faqat Oldingi va Keyingi tugmalari boshqaruvi
    btnPrev.disabled = (currentIndex === 0);
    btnNext.disabled = (currentIndex === quizQuestions.length - 1);

    renderPalette();
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  btnPrev.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      renderQuestion();
    }
  });

  btnNext.addEventListener('click', () => {
    if (currentIndex < quizQuestions.length - 1) {
      currentIndex++;
      renderQuestion();
    }
  });

  // =========================================================================
  // 7. YUQORIGA JOYLASHTIRILGAN YAKUNLASH TUGMASI
  // =========================================================================
  btnFinishTop.addEventListener('click', () => {
    let answeredCount = quizQuestions.filter(q => q.selectedOption !== null).length;
    let unansweredCount = quizQuestions.length - answeredCount;

    if (unansweredCount > 0) {
      confirmModalText.innerHTML = `
        Siz <strong>${quizQuestions.length}</strong> ta savoldan <strong>${answeredCount}</strong> tasiga javob berdingiz.<br>
        <span style="color: var(--danger); font-weight: 700;">Yana ${unansweredCount} ta savol belgilanmagan!</span><br><br>
        Haqiqatan ham testni yakunlashni xohlaysizmi?
      `;
    } else {
      confirmModalText.innerHTML = `
        Siz barcha <strong>${quizQuestions.length} ta</strong> savolga to'liq javob berdingiz.<br><br>
        Testni yakunlab, natijalarni qayd etishni tasdiqlaysizmi?
      `;
    }
    confirmModal.classList.add('active');
  });

  btnCancelSubmit.addEventListener('click', () => {
    confirmModal.classList.remove('active');
  });

  btnConfirmSubmit.addEventListener('click', () => {
    confirmModal.classList.remove('active');
    finishQuiz();
  });

  // =========================================================================
  // 8. TESTNI YAKUNLASH VA BAHOLASH
  // =========================================================================
  function finishQuiz() {
    if (testFinished) return;
    testFinished = true;
    clearInterval(timerInterval);

    let correctCount = 0;
    quizQuestions.forEach(q => {
      if (q.selectedOption === q.correctAnswer) {
        correctCount++;
      }
    });

    const totalQuestions = quizQuestions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const gradeInfo = APP_CONFIG.calculateGrade(percentage);

    const totalTimeSeconds = (APP_CONFIG.TEST_DURATION_MINUTES * 60) - remainingSeconds;
    const spentMins = Math.floor(totalTimeSeconds / 60);
    const spentSecs = totalTimeSeconds % 60;
    const timeSpentStr = `${spentMins} daqiqa ${spentSecs} soniya`;

    // Ekranlarni almashtirish
    viewQuiz.classList.remove('active');
    viewResults.classList.add('active');

    // Headerdan test tugmalarini yashirish
    headerMeta.style.display = 'none';
    if (headerHistoryWrapper) headerHistoryWrapper.style.display = 'flex';
    updateHistoryBadge();

    // Natijalarni chiqarish
    resultPercent.textContent = `${percentage}%`;
    resultPercent.style.color = gradeInfo.color;
    scoreCircle.style.borderColor = gradeInfo.color;

    resultGrade.textContent = `Baho: ${gradeInfo.grade} (${gradeInfo.label})`;
    resultGrade.style.backgroundColor = gradeInfo.color;
    resultGrade.style.color = '#ffffff';

    resStudentName.textContent = `${currentStudent.lastName} ${currentStudent.firstName}`;
    resStudentGroup.textContent = currentStudent.group;
    resCorrectCount.textContent = `${correctCount} / ${totalQuestions} ta`;
    resTimeSpent.textContent = timeSpentStr;

    // Tahlil ro'yxatini shakllantirish
    buildReviewList();

    // Google Sheets'ga yuborish
    submitToGoogleSheets({
      lastName: currentStudent.lastName,
      firstName: currentStudent.firstName,
      group: currentStudent.group,
      correctCount: correctCount,
      totalCount: totalQuestions,
      percentage: percentage,
      grade: gradeInfo.grade,
      gradeLabel: gradeInfo.label,
      timeSpent: timeSpentStr,
      timestamp: new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })
    });
  }

  // =========================================================================
  // 9. SAVOLLAR TAHLILI (SVG belgilar bilan)
  // =========================================================================
  function buildReviewList() {
    reviewList.innerHTML = '';
    const svgCheck = `<svg class="icon icon-sm" style="fill: var(--success);" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
    const svgCross = `<svg class="icon icon-sm" style="fill: var(--danger);" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;

    quizQuestions.forEach((q, idx) => {
      const isCorrect = (q.selectedOption === q.correctAnswer);
      const item = document.createElement('div');
      item.className = `review-item ${isCorrect ? 'is-correct' : 'is-incorrect'}`;

      item.innerHTML = `
        <div class="review-q">${idx + 1}-savol: ${escapeHtml(q.question)}</div>
        <div class="review-ans">
          Sizning javobingiz: <strong>${q.selectedOption ? escapeHtml(q.selectedOption) : '<em style="color: var(--danger);">Belgilanmagan</em>'}</strong>
          ${isCorrect ? ` <span style="color: var(--success); font-weight: bold;">(To'g'ri) ${svgCheck}</span>` : ` <span style="color: var(--danger); font-weight: bold;">(Noto'g'ri) ${svgCross}</span>`}
        </div>
        ${!isCorrect ? `<div class="review-ans" style="margin-top: 4px; color: var(--success);">To'g'ri javob: <strong>${escapeHtml(q.correctAnswer)}</strong></div>` : ''}
      `;
      reviewList.appendChild(item);
    });
  }

  btnToggleReview.addEventListener('click', () => {
    if (reviewContainer.style.display === 'none') {
      reviewContainer.style.display = 'block';
      btnToggleReview.textContent = "Tahlilni yashirish";
      reviewContainer.scrollIntoView({ behavior: 'smooth' });
    } else {
      reviewContainer.style.display = 'none';
      btnToggleReview.textContent = "Savollar tahlilini ko'rish";
    }
  });

  btnRestart.addEventListener('click', () => {
    viewResults.classList.remove('active');
    viewRegister.classList.add('active');
    studentForm.reset();
    if (headerHistoryWrapper) headerHistoryWrapper.style.display = 'flex';
    updateHistoryBadge();
  });

  // =========================================================================
  // 10. GOOGLE SHEETS GA NATIJANI UZATISH VA OFFLINE NAVBAT (AUTO-SYNC)
  // =========================================================================
  const PENDING_KEY = 'TEST_PENDING_SUBMISSIONS';
  let isSyncing = false;

  function getPendingSubmissions() {
    try {
      return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function savePendingSubmissions(list) {
    try {
      localStorage.setItem(PENDING_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function submitToGoogleSheets(payload) {
    // 1. Har doim to'liq zaxira ro'yxatiga (backup) yozib qo'yamiz
    try {
      const backupList = JSON.parse(localStorage.getItem('TEST_RESULTS_BACKUP') || '[]');
      backupList.push(payload);
      localStorage.setItem('TEST_RESULTS_BACKUP', JSON.stringify(backupList));
    } catch (e) {}

    // 2. Unikal ID biriktiramiz
    payload.id = payload.id || ('sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));

    // 3. Navbatga qo'shamiz (agar mavjud bo'lmasa)
    const pendingList = getPendingSubmissions();
    if (!pendingList.some(item => item.id === payload.id)) {
      pendingList.push(payload);
      savePendingSubmissions(pendingList);
    }

    if (sheetStatusBox) {
      sheetStatusBox.dataset.hasSubmitted = "true";
    }

    // 4. Sinxronizatsiyani ishga tushiramiz
    processPendingQueue();
  }

  // Bitta natijani yuborish
  async function sendItem(payload, scriptUrl) {
    try {
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return true;
    } catch (postErr) {
      try {
        const getUrl = `${scriptUrl}?` + new URLSearchParams({
          timestamp: payload.timestamp,
          lastName: payload.lastName,
          firstName: payload.firstName,
          group: payload.group,
          correctCount: payload.correctCount,
          totalCount: payload.totalCount,
          percentage: payload.percentage,
          grade: payload.grade,
          gradeLabel: payload.gradeLabel
        }).toString();
        await fetch(getUrl, { mode: 'no-cors' });
        return true;
      } catch (getErr) {
        return false;
      }
    }
  }

  // Navbatdagi barcha natijalarni uzatish
  async function processPendingQueue() {
    if (isSyncing) return;

    const pendingList = getPendingSubmissions();
    if (pendingList.length === 0) {
      if (sheetStatusBox && sheetStatusBox.dataset.hasSubmitted === "true") {
        setSheetStatusSuccess();
      }
      return;
    }

    const scriptUrl = localStorage.getItem('CUSTOM_GOOGLE_SHEET_URL') || APP_CONFIG.GOOGLE_SHEET_WEBAPP_URL;
    if (!scriptUrl) {
      if (sheetStatusBox) {
        sheetStatusBox.style.background = '#fffbeb';
        sheetStatusBox.style.color = '#b45309';
        sheetStatusBox.style.border = '1px solid #fde68a';
        sheetStatusBox.innerHTML = `Natijangiz kompyuterda saqlandi (Jadval havolasi kutilmoqda).`;
      }
      return;
    }

    // Agar internet bo'lmasa
    if (!navigator.onLine) {
      setSheetStatusOfflineWaiting(pendingList.length);
      return;
    }

    isSyncing = true;
    if (sheetStatusBox) {
      sheetStatusBox.style.background = '#eef2ff';
      sheetStatusBox.style.color = '#4338ca';
      sheetStatusBox.style.border = '1px solid #c7d2fe';
      sheetStatusBox.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
          <div class="sync-spinner"></div>
          <span>Google Sheets jadvaliga uzatilmoqda... (${pendingList.length} ta natija)</span>
        </div>
      `;
    }

    const remaining = [];
    for (const item of pendingList) {
      const success = await sendItem(item, scriptUrl);
      if (!success) {
        remaining.push(item);
      }
    }

    savePendingSubmissions(remaining);
    isSyncing = false;

    if (remaining.length === 0) {
      setSheetStatusSuccess();
    } else {
      setSheetStatusOfflineWaiting(remaining.length);
    }
  }

  function setSheetStatusSuccess() {
    if (!sheetStatusBox) return;
    sheetStatusBox.style.background = '#ecfdf5';
    sheetStatusBox.style.color = '#065f46';
    sheetStatusBox.style.border = '1px solid #a7f3d0';
    sheetStatusBox.innerHTML = `
      <svg class="icon icon-sm" style="color: #10b981;" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
      <span><strong>Natijangiz Google Sheets jadvaliga muvaffaqiyatli uzatildi!</strong></span>
    `;
  }

  function setSheetStatusOfflineWaiting(count) {
    if (!sheetStatusBox) return;
    sheetStatusBox.style.background = '#fffbeb';
    sheetStatusBox.style.color = '#b45309';
    sheetStatusBox.style.border = '1.5px solid #fde68a';
    sheetStatusBox.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.45rem; align-items: center; width: 100%;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span class="pulse-warning-dot"></span>
          <span><strong>Internet kutilmoqda...</strong> Natijangiz kompyuter xotirasida xavfsiz saqlandi.</span>
        </div>
        <div style="font-size: 0.8rem; color: #78350f;">
          Internet tiklanishi bilanoq natija avtomatik ravishda jadvalga yuboriladi (${count} ta navbatda).
        </div>
        <button type="button" class="btn-retry" onclick="window.manualRetrySync()">
          <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
          Hozir qayta yuborish
        </button>
      </div>
    `;
  }

  // Qo'lda qayta yuborish uchun global funksiya
  window.manualRetrySync = function() {
    processPendingQueue();
  };

  // Tarmoq holati monitoringi (Online / Offline events)
  const networkStatusBadge = document.getElementById('networkStatusBadge');
  const networkStatusText = document.getElementById('networkStatusText');

  function updateNetworkStatus(online) {
    if (!networkStatusBadge) return;

    if (!online) {
      networkStatusBadge.style.display = 'inline-flex';
      networkStatusBadge.className = 'network-badge offline';
      if (networkStatusText) {
        networkStatusText.textContent = "Internet uzildi (Testni davom ettiring, natija xotirada saqlanadi)";
      }
      const pendingList = getPendingSubmissions();
      if (pendingList.length > 0 && sheetStatusBox && sheetStatusBox.dataset.hasSubmitted === "true") {
        setSheetStatusOfflineWaiting(pendingList.length);
      }
    } else {
      networkStatusBadge.style.display = 'inline-flex';
      networkStatusBadge.className = 'network-badge online';
      if (networkStatusText) {
        networkStatusText.textContent = "Internet tiklandi";
      }
      setTimeout(() => {
        if (networkStatusBadge && navigator.onLine) {
          networkStatusBadge.style.display = 'none';
        }
      }, 3500);

      // Tarmoq kelishi bilan zudlik bilan navbatdagi natijalarni uzatamiz!
      processPendingQueue();
    }
  }

  window.addEventListener('online', () => updateNetworkStatus(true));
  window.addEventListener('offline', () => updateNetworkStatus(false));

  // Har 5 soniyada fon tekshiruvi: agar internet bo'lsa va navbatda natija bo'lsa, uzatadi
  setInterval(() => {
    if (navigator.onLine && getPendingSubmissions().length > 0) {
      processPendingQueue();
    }
  }, 5000);

  // Sahifa yuklanganda navbatda qolib ketgan natijalar bo'lsa darhol uzatishga urinish
  if (navigator.onLine && getPendingSubmissions().length > 0) {
    processPendingQueue();
  }

  // =========================================================================
  // 11. TEST NATIJALARI TARIXI (KESH / LOCALSTORAGE)
  // =========================================================================
  function getHistoryList() {
    try {
      let raw = localStorage.getItem('TEST_RESULTS_BACKUP');
      let list = [];
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) list = parsed;
      }
      // Agar TEST_RESULTS_BACKUP bo'sh bo'lsa, TEST_PENDING_SUBMISSIONS dan ham tekshirib ko'ramiz
      if (list.length === 0) {
        const pendingRaw = localStorage.getItem('TEST_PENDING_SUBMISSIONS');
        if (pendingRaw) {
          const pendingParsed = JSON.parse(pendingRaw);
          if (Array.isArray(pendingParsed)) list = pendingParsed;
        }
      }
      return list.filter(item => item && typeof item === 'object');
    } catch (e) {
      return [];
    }
  }

  function updateHistoryBadge() {
    try {
      const list = getHistoryList();
      const badge = historyCountBadge || document.getElementById('historyCountBadge');
      if (badge) {
        if (list.length > 0) {
          badge.textContent = list.length;
          badge.style.display = 'inline-block';
        } else {
          badge.style.display = 'none';
        }
      }
    } catch (e) {}
  }

  function renderHistoryTable(filterText = '') {
    const rawList = getHistoryList();
    const list = [...rawList].reverse();

    const total = rawList.length;
    if (total > 0) {
      const avg = Math.round(rawList.reduce((acc, item) => acc + (parseInt(item.percentage, 10) || 0), 0) / total);
      const topCount = rawList.filter(item => String(item.grade) === '5').length;
      const maxScore = Math.max(0, ...rawList.map(item => parseInt(item.percentage, 10) || 0));

      const sTotal = statTotalCount || document.getElementById('statTotalCount');
      const sAvg = statAvgScore || document.getElementById('statAvgScore');
      const sTop = statTopGrades || document.getElementById('statTopGrades');
      const sMax = statMaxScore || document.getElementById('statMaxScore');

      if (sTotal) sTotal.textContent = `${total} ta`;
      if (sAvg) sAvg.textContent = `${avg}%`;
      if (sTop) sTop.textContent = `${topCount} ta`;
      if (sMax) sMax.textContent = `${maxScore}%`;
    } else {
      const sTotal = statTotalCount || document.getElementById('statTotalCount');
      const sAvg = statAvgScore || document.getElementById('statAvgScore');
      const sTop = statTopGrades || document.getElementById('statTopGrades');
      const sMax = statMaxScore || document.getElementById('statMaxScore');

      if (sTotal) sTotal.textContent = '0 ta';
      if (sAvg) sAvg.textContent = '0%';
      if (sTop) sTop.textContent = '0 ta';
      if (sMax) sMax.textContent = '0%';
    }

    const term = (filterText || '').trim().toLowerCase();
    const filtered = list.filter(item => {
      if (!term) return true;
      const fullName = `${item.lastName || ''} ${item.firstName || ''}`.toLowerCase();
      const group = String(item.group || '').toLowerCase();
      return fullName.includes(term) || group.includes(term);
    });

    const hTable = historyTable || document.getElementById('historyTable');
    const hEmpty = historyEmptyState || document.getElementById('historyEmptyState');
    const hTbody = historyTableBody || document.getElementById('historyTableBody');

    if (filtered.length === 0) {
      if (hTable) hTable.style.display = 'none';
      if (hEmpty) hEmpty.style.display = 'block';
      if (hTbody) hTbody.innerHTML = '';
      return;
    }

    if (hTable) hTable.style.display = 'table';
    if (hEmpty) hEmpty.style.display = 'none';

    if (hTbody) {
      hTbody.innerHTML = '';
      filtered.forEach((item, idx) => {
        const tr = document.createElement('tr');

        let badgeClass = 'badge-primary';
        const gradeNum = String(item.grade || '');
        if (gradeNum === '5') badgeClass = 'badge-success';
        else if (gradeNum === '4') badgeClass = 'badge-primary';
        else if (gradeNum === '3') badgeClass = 'badge-warning';
        else if (gradeNum === '2') badgeClass = 'badge-danger';

        const pct = parseInt(item.percentage, 10) || 0;

        tr.innerHTML = `
          <td style="text-align: center; color: var(--text-muted); font-weight: 700;">${idx + 1}</td>
          <td><strong>${escapeHtml(item.lastName || '')} ${escapeHtml(item.firstName || '')}</strong></td>
          <td><span style="color: #475569; font-weight: 600;">${escapeHtml(item.group || '-')}</span></td>
          <td><span style="font-weight: 750;">${item.correctCount != null ? item.correctCount : '-'} / ${item.totalCount || 20}</span></td>
          <td><strong style="color: var(--primary);">${pct}%</strong></td>
          <td><span class="badge ${badgeClass}">${item.grade || '-'}${item.gradeLabel ? ' (' + escapeHtml(item.gradeLabel) + ')' : ''}</span></td>
          <td style="color: var(--text-muted); font-size: 0.78rem;">${escapeHtml(item.timeSpent || '-')}</td>
          <td style="color: var(--text-muted); font-size: 0.78rem;">${escapeHtml(item.timestamp || '-')}</td>
        `;
        hTbody.appendChild(tr);
      });
    }
  }

  function openHistoryModal() {
    const modal = historyModal || document.getElementById('historyModal');
    if (modal) {
      modal.classList.add('active');
    }
    try {
      const search = historySearchInput || document.getElementById('historySearchInput');
      if (search) search.value = '';
      renderHistoryTable();
    } catch (err) {
      console.error("renderHistoryTable xatosi:", err);
    }
  }

  function closeHistoryModal() {
    const modal = historyModal || document.getElementById('historyModal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  function exportHistoryToCSV() {
    const list = getHistoryList();
    if (list.length === 0) {
      showNotice("Ma'lumot yo'q", "Eksport qilish uchun keshda hech qanday test natijasi topilmadi.", "warning");
      return;
    }

    const headers = ["Tartib", "Familiya", "Ism", "Guruh", "Togri javoblar", "Jami savollar", "Foiz", "Baho", "Baho izohi", "Sarflangan vaqt", "Sana va vaqt"];
    const rows = list.map((item, idx) => [
      idx + 1,
      `"${(item.lastName || '').replace(/"/g, '""')}"`,
      `"${(item.firstName || '').replace(/"/g, '""')}"`,
      `"${(item.group || '').replace(/"/g, '""')}"`,
      item.correctCount != null ? item.correctCount : '-',
      item.totalCount || 20,
      `${parseInt(item.percentage, 10) || 0}%`,
      item.grade || '-',
      `"${(item.gradeLabel || '').replace(/"/g, '""')}"`,
      `"${(item.timeSpent || '').replace(/"/g, '""')}"`,
      `"${(item.timestamp || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `3-dars-test-tarixi-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function clearHistoryCache() {
    const list = getHistoryList();
    if (list.length === 0) {
      showNotice("Kesh bo'sh", "Keshda tozalanadigan test natijalari mavjud emas.", "warning");
      return;
    }

    if (confirm("Haqiqatan ham barcha saqlangan test natijalarini keshdan tozalashni xohlaysizmi?")) {
      try {
        localStorage.removeItem('TEST_RESULTS_BACKUP');
        localStorage.removeItem('TEST_PENDING_SUBMISSIONS');
      } catch (e) {}
      renderHistoryTable();
      updateHistoryBadge();
      showNotice("Muvaffaqiyatli", "Barcha test natijalari keshdan o'chirildi.", "primary");
    }
  }

  // Global window ga eksport qilamiz (Inline onclick ham ishlashi uchun)
  window.openHistoryModal = openHistoryModal;
  window.closeHistoryModal = closeHistoryModal;
  window.exportHistoryToCSV = exportHistoryToCSV;
  window.clearHistoryCache = clearHistoryCache;

  const btnOpenH = btnOpenHistory || document.getElementById('btnOpenHistory');
  const btnResH = btnResultHistory || document.getElementById('btnResultHistory');
  const btnCloseH = btnCloseHistory || document.getElementById('btnCloseHistory');
  const btnCloseHBot = btnCloseHistoryBottom || document.getElementById('btnCloseHistoryBottom');
  const btnExpH = btnExportHistory || document.getElementById('btnExportHistory');
  const btnClrH = btnClearHistory || document.getElementById('btnClearHistory');
  const searchInp = historySearchInput || document.getElementById('historySearchInput');
  const hModal = historyModal || document.getElementById('historyModal');

  if (btnOpenH) btnOpenH.addEventListener('click', openHistoryModal);
  if (btnResH) btnResH.addEventListener('click', openHistoryModal);
  if (btnCloseH) btnCloseH.addEventListener('click', closeHistoryModal);
  if (btnCloseHBot) btnCloseHBot.addEventListener('click', closeHistoryModal);
  if (btnExpH) btnExpH.addEventListener('click', exportHistoryToCSV);
  if (btnClrH) btnClrH.addEventListener('click', clearHistoryCache);

  if (searchInp) {
    searchInp.addEventListener('input', (e) => {
      renderHistoryTable(e.target.value);
    });
  }

  if (hModal) {
    hModal.addEventListener('click', (e) => {
      if (e.target === hModal) {
        closeHistoryModal();
      }
    });
  }

  // Dastlab keshdagi natijalar sonini yangilab qo'yamiz
  updateHistoryBadge();

})();
