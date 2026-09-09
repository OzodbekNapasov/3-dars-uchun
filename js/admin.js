/**
 * 3-Dars: Admin Panel JavaScript (O'qituvchi Boshqaruvi)
 * Jonli monitoring, guruhlar filtri, test ruxsati, batafsil javoblar va Excel eksport
 */

(function () {
  // Holat
  let allSubmissions = [];
  let currentGroupFilter = "ALL";
  let currentSearchQuery = "";
  let isTestUnlocked = false;
  let currentTeacherPin = APP_CONFIG.DEFAULT_TEACHER_PIN || "2603";
  let syncChannel = null;
  let refreshTimer = null;
  let serverReachable = null; // null = hali urinilmagan

  // Parol darvozasi elementlari
  const authGate = document.getElementById("authGate");
  const authForm = document.getElementById("authForm");
  const adminPasswordInput = document.getElementById("adminPasswordInput");
  const authError = document.getElementById("authError");

  // Ulanish holati ko'rsatkichi
  const connectionIndicator = document.getElementById("connectionIndicator");
  const connectionText = document.getElementById("connectionText");

  // DOM Elementlari
  const statTotalStudents = document.getElementById("statTotalStudents");
  const statActiveStudents = document.getElementById("statActiveStudents");
  const statAvgScore = document.getElementById("statAvgScore");
  const statTopGrades = document.getElementById("statTopGrades");
  
  const groupFilterSelect = document.getElementById("groupFilterSelect");
  const searchInput = document.getElementById("searchInput");
  const testUnlockSwitch = document.getElementById("testUnlockSwitch");
  const teacherPinDisplay = document.getElementById("teacherPinDisplay");
  const btnChangePin = document.getElementById("btnChangePin");
  
  const btnRefresh = document.getElementById("btnRefresh");
  const btnExportExcel = document.getElementById("btnExportExcel");
  const btnExportCsv = document.getElementById("btnExportCsv");
  const btnPrintVedomost = document.getElementById("btnPrintVedomost");
  
  const submissionsTableBody = document.getElementById("submissionsTableBody");
  const emptyStateRow = document.getElementById("emptyStateRow");
  const tableCountBadge = document.getElementById("tableCountBadge");
  const lastUpdatedTime = document.getElementById("lastUpdatedTime");

  // Modal elementlari
  const studentDetailsModal = document.getElementById("studentDetailsModal");
  const modalStudentTitle = document.getElementById("modalStudentTitle");
  const modalStudentMeta = document.getElementById("modalStudentMeta");
  const modalAnswersContainer = document.getElementById("modalAnswersContainer");
  const btnCloseModal = document.getElementById("btnCloseModal");
  const btnCloseModalBottom = document.getElementById("btnCloseModalBottom");

  // Broadcast Channel yaratish (bir kompyuterda yoki brauzerda bir lahzada sinxron bo'lishi uchun)
  try {
    if (typeof BroadcastChannel !== "undefined") {
      syncChannel = new BroadcastChannel("lesson3_sync_channel");
      syncChannel.onmessage = function (event) {
        if (event.data && event.data.type === "STUDENT_UPDATE") {
          upsertLocalSubmission(event.data.payload);
          renderTable();
          updateStats();
        }
      };
    }
  } catch (e) {
    console.warn("BroadcastChannel qo'llab-quvvatlanmadi:", e);
  }

  // =========================================================================
  // PAROL DARVOZASI
  // Talaba admin.html manzilini qo'lda yozib kirsa ham panel ochilmaydi.
  // =========================================================================
  function initAuthGate() {
    let alreadyIn = false;
    try {
      alreadyIn = sessionStorage.getItem(APP_CONFIG.STORAGE_KEYS.ADMIN_AUTH) === "1";
    } catch (e) {}

    if (alreadyIn) {
      unlockPanel();
      return;
    }

    if (authForm) {
      authForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const entered = (adminPasswordInput ? adminPasswordInput.value : "").trim();
        if (entered === APP_CONFIG.ADMIN_PASSWORD) {
          try {
            sessionStorage.setItem(APP_CONFIG.STORAGE_KEYS.ADMIN_AUTH, "1");
          } catch (e) {}
          unlockPanel();
        } else {
          if (authError) authError.textContent = "Noto'g'ri parol!";
          if (adminPasswordInput) {
            adminPasswordInput.value = "";
            adminPasswordInput.focus();
          }
        }
      });
    }
  }

  function unlockPanel() {
    if (authGate) authGate.classList.add("hidden");
    initAdmin();
  }

  // Dastlabki sozlamalarni yuklash
  function initAdmin() {
    loadLocalAdminConfig();
    loadLocalSubmissions();
    renderTable();
    updateStats();
    
    // Serverdan ma'lumotlarni tortib olish
    fetchServerData();
    
    // Avtomatik yangilanish (Apps Script kvotasini tejash uchun 10 soniya)
    if (!refreshTimer) {
      refreshTimer = setInterval(fetchServerData, APP_CONFIG.ADMIN_REFRESH_MS || 10000);
    }

    // Jadvaldagi "Javoblar" tugmalari uchun bitta umumiy hodisa (event delegation).
    // Ilgari har qatorga inline onclick yozilardi va apostrofli ismlarda
    // (Ma'ruf, G'ayrat...) JS xatosi berardi.
    if (submissionsTableBody) {
      submissionsTableBody.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-action='inspect']");
        if (!btn) return;
        const key = btn.getAttribute("data-key");
        inspectStudentByKey(key);
      });
    }

    // Guruh dropdownini to'ldirish
    if (groupFilterSelect) {
      groupFilterSelect.innerHTML = `<option value="ALL">Barcha guruhlar (26-01 ... 26-07)</option>`;
      (APP_CONFIG.ALLOWED_GROUPS || []).forEach(g => {
        const opt = document.createElement("option");
        opt.value = g;
        opt.textContent = `${g}-guruh`;
        groupFilterSelect.appendChild(opt);
      });
      groupFilterSelect.addEventListener("change", (e) => {
        currentGroupFilter = e.target.value;
        renderTable();
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        currentSearchQuery = e.target.value.trim().toLowerCase();
        renderTable();
      });
    }

    if (testUnlockSwitch) {
      testUnlockSwitch.checked = isTestUnlocked;
      testUnlockSwitch.addEventListener("change", handleTestSwitchChange);
    }

    if (btnChangePin) {
      btnChangePin.addEventListener("click", promptChangePin);
    }

    if (btnRefresh) {
      btnRefresh.addEventListener("click", () => {
        btnRefresh.classList.add("loading");
        fetchServerData(() => btnRefresh.classList.remove("loading"));
      });
    }

    if (btnExportExcel) {
      btnExportExcel.addEventListener("click", exportToExcel);
    }

    if (btnExportCsv) {
      btnExportCsv.addEventListener("click", exportToCsv);
    }

    if (btnPrintVedomost) {
      btnPrintVedomost.addEventListener("click", () => window.print());
    }

    if (btnCloseModal) btnCloseModal.addEventListener("click", closeModal);
    if (btnCloseModalBottom) btnCloseModalBottom.addEventListener("click", closeModal);
    if (studentDetailsModal) {
      studentDetailsModal.addEventListener("click", (e) => {
        if (e.target === studentDetailsModal) closeModal();
      });
    }
  }

  // Local Admin Config (PIN va Test holati)
  function loadLocalAdminConfig() {
    try {
      const raw = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.ADMIN_CONFIG);
      if (raw) {
        const conf = JSON.parse(raw);
        isTestUnlocked = !!conf.isTestUnlocked;
        currentTeacherPin = conf.teacherPin || APP_CONFIG.DEFAULT_TEACHER_PIN || "2603";
      }
    } catch (e) {}
    if (teacherPinDisplay) teacherPinDisplay.textContent = currentTeacherPin;
    if (testUnlockSwitch) testUnlockSwitch.checked = isTestUnlocked;
  }

  function saveLocalAdminConfig() {
    const conf = {
      isTestUnlocked: isTestUnlocked,
      teacherPin: currentTeacherPin,
      updatedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.ADMIN_CONFIG, JSON.stringify(conf));
      // Broadcast orqali talabalar sahifalariga darhol yetkazish
      if (syncChannel) {
        syncChannel.postMessage({
          type: "TEST_CONFIG_CHANGE",
          payload: conf
        });
      }
    } catch (e) {}
  }

  function handleTestSwitchChange(e) {
    isTestUnlocked = e.target.checked;
    saveLocalAdminConfig();
    
    // Google Sheets Apps Script ga ham yuborish
    if (APP_CONFIG.GOOGLE_SHEET_WEBAPP_URL) {
      fetch(APP_CONFIG.GOOGLE_SHEET_WEBAPP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_test_status",
          unlocked: isTestUnlocked,
          pin: currentTeacherPin
        })
      }).catch(() => {});
    }

    alert(isTestUnlocked 
      ? "Test barcha talabalar uchun OCHILDI! Endi talabalar testga ruxsatsiz keta oladilar." 
      : "Test QULFLANDI. Endi kirish uchun PIN-kod yoki ruxsat talab qilinadi.");
  }

  function promptChangePin() {
    const newPin = prompt("Yangi 4 xonali PIN-kodni kiriting:", currentTeacherPin);
    if (newPin && newPin.trim().length >= 4) {
      currentTeacherPin = newPin.trim();
      if (teacherPinDisplay) teacherPinDisplay.textContent = currentTeacherPin;
      saveLocalAdminConfig();
      
      if (APP_CONFIG.GOOGLE_SHEET_WEBAPP_URL) {
        fetch(APP_CONFIG.GOOGLE_SHEET_WEBAPP_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "set_test_status",
            unlocked: isTestUnlocked,
            pin: currentTeacherPin
          })
        }).catch(() => {});
      }
      alert("PIN-kod muvaffaqiyatli o'zgartirildi: " + currentTeacherPin);
    }
  }

  // Local Submissions
  function loadLocalSubmissions() {
    try {
      const raw = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.ALL_SUBMISSIONS);
      if (raw) {
        allSubmissions = JSON.parse(raw) || [];
      }
    } catch (e) {
      allSubmissions = [];
    }
  }

  function upsertLocalSubmission(newItem) {
    if (!newItem || !newItem.lastName || !newItem.firstName) return;
    const idx = allSubmissions.findIndex(s => 
      s.group === newItem.group &&
      s.lastName.toLowerCase() === newItem.lastName.toLowerCase() &&
      s.firstName.toLowerCase() === newItem.firstName.toLowerCase()
    );
    if (idx >= 0) {
      allSubmissions[idx] = Object.assign({}, allSubmissions[idx], newItem);
    } else {
      allSubmissions.unshift(newItem);
    }
    try {
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.ALL_SUBMISSIONS, JSON.stringify(allSubmissions));
    } catch (e) {}
  }

  // Serverdan (Google Sheets Web App) ma'lumotlarni tortib olish
  function fetchServerData(callback) {
    if (!APP_CONFIG.GOOGLE_SHEET_WEBAPP_URL) {
      if (callback) callback();
      return;
    }

    const url = APP_CONFIG.GOOGLE_SHEET_WEBAPP_URL + "?action=get_submissions&t=" + Date.now();
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!data || data.status !== "success") {
          // Skript javob berdi, lekin kutilgan formatda emas —
          // odatda Apps Script eski versiyada deploy qilinganini bildiradi.
          throw new Error("Serverdan noto'g'ri javob (skript qayta deploy qilinganmi?)");
        }
        setConnectionState(true);
        {
          if (Array.isArray(data.submissions) && data.submissions.length > 0) {
            data.submissions.forEach(sub => upsertLocalSubmission(sub));
          }
          if (data.isTestUnlocked !== undefined && data.isTestUnlocked !== isTestUnlocked) {
            isTestUnlocked = data.isTestUnlocked;
            if (testUnlockSwitch) testUnlockSwitch.checked = isTestUnlocked;
          }
          if (data.teacherPin && data.teacherPin !== currentTeacherPin) {
            currentTeacherPin = data.teacherPin;
            if (teacherPinDisplay) teacherPinDisplay.textContent = currentTeacherPin;
          }
          renderTable();
          updateStats();
        }
        if (lastUpdatedTime) {
          const now = new Date();
          lastUpdatedTime.textContent = now.toLocaleTimeString("uz-UZ");
        }
        if (callback) callback();
      })
      .catch(err => {
        console.warn("Serverdan ma'lumot olishda xatolik (Keshdagi ma'lumotlar ko'rsatilmoqda):", err);
        setConnectionState(false);
        if (callback) callback();
      });
  }

  // Serverga ulanish holatini header'da ko'rsatish.
  // Aks holda o'qituvchi keshdagi eski ma'lumotni jonli deb o'ylab qoladi.
  function setConnectionState(ok) {
    if (serverReachable === ok) return;
    serverReachable = ok;

    if (connectionIndicator) connectionIndicator.classList.toggle("is-offline", !ok);
    if (connectionText) {
      connectionText.textContent = ok
        ? "Jonli sinxronizatsiya"
        : "Server bilan aloqa yo'q — keshdagi ma'lumot";
    }
    if (connectionIndicator) {
      connectionIndicator.title = ok
        ? "Google Sheets bilan aloqa bor"
        : "Google Apps Script javob bermayapti. Skript qayta deploy qilinganini tekshiring (Deploy > Manage deployments > New version).";
    }
  }

  // Talabani bir xilda aniqlaydigan kalit (guruh + familiya + ism)
  function studentKey(s) {
    return [
      String(s.group || "").trim().toLowerCase(),
      String(s.lastName || "").trim().toLowerCase(),
      String(s.firstName || "").trim().toLowerCase()
    ].join("|");
  }

  // Talaba hozir tizimdami? Serverdagi bayroq VA oxirgi faollik vaqti bo'yicha.
  function isStudentOnline(s) {
    if (!s.online) return false;
    if (!s.lastSeen) return false;
    const seenTs = Date.parse(String(s.lastSeen).replace(" ", "T"));
    if (isNaN(seenTs)) return !!s.online;
    return (Date.now() - seenTs) < (APP_CONFIG.ONLINE_THRESHOLD_MS || 150000);
  }

  // Filtrlangan va saralangan ro'yxat.
  // Saralash bo'lmasa, har 10 soniyalik yangilanishda qatorlar sakrab turadi.
  function getFilteredSubmissions() {
    return allSubmissions
      .filter(s => {
        // Guruh filtri
        if (currentGroupFilter !== "ALL" && s.group !== currentGroupFilter) {
          return false;
        }
        // Ism/Familiya qidiruvi
        if (currentSearchQuery) {
          const full = `${s.lastName} ${s.firstName} ${s.group}`.toLowerCase();
          if (!full.includes(currentSearchQuery)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const byGroup = String(a.group || "").localeCompare(String(b.group || ""), "uz");
        if (byGroup !== 0) return byGroup;
        const byLast = String(a.lastName || "").localeCompare(String(b.lastName || ""), "uz");
        if (byLast !== 0) return byLast;
        return String(a.firstName || "").localeCompare(String(b.firstName || ""), "uz");
      });
  }

  // Statistikani hisoblash
  function updateStats() {
    const list = getFilteredSubmissions();
    if (statTotalStudents) statTotalStudents.textContent = list.length;
    
    let topCount = 0;
    let sumPercent = 0;
    let gradedCount = 0;
    let activeCount = 0;

    list.forEach(s => {
      // Baho 5 bo'lganlar
      if (Number(s.grade) === 5) topCount++;
      
      // Foiz
      const pct = parseFloat(String(s.percentage).replace("%", ""));
      if (!isNaN(pct)) {
        sumPercent += pct;
        gradedCount++;
      }

      // Faollik: talaba ayni damda tizimda turibdimi (heartbeat asosida)
      if (isStudentOnline(s)) {
        activeCount++;
      }
    });

    if (statTopGrades) statTopGrades.textContent = topCount;
    if (statActiveStudents) statActiveStudents.textContent = activeCount;
    if (statAvgScore) {
      statAvgScore.textContent = gradedCount > 0 ? Math.round(sumPercent / gradedCount) + "%" : "0%";
    }
    if (tableCountBadge) {
      tableCountBadge.textContent = `${list.length} ta talaba`;
    }
  }

  // Jadvalni chizish
  function renderTable() {
    const list = getFilteredSubmissions();
    if (!submissionsTableBody) return;

    if (list.length === 0) {
      submissionsTableBody.innerHTML = `
        <tr>
          <td colspan="12" class="empty-table">
            <svg class="empty-icon" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
            <div style="font-weight: 800; font-size: 1.05rem; margin-bottom: 0.3rem;">Hozircha ma'lumotlar yo'q</div>
            <div style="font-size: 0.85rem;">Talabalar tizimga kirib topshiriqlarni boshlaganida natijalar bu yerda jonli paydo bo'ladi.</div>
          </td>
        </tr>
      `;
      return;
    }

    let html = "";
    list.forEach((s, idx) => {
      // Talaba testni yakunlamaguncha baho qo'yilmaydi ("-" bo'lib turadi)
      const gradeNum = Number(s.grade);
      const hasGrade = !isNaN(gradeNum) && gradeNum >= 2;
      let gradeBadgeClass = "badge-danger";
      if (!hasGrade) gradeBadgeClass = "badge-group";
      else if (gradeNum === 5) gradeBadgeClass = "badge-success";
      else if (gradeNum === 4) gradeBadgeClass = "badge-primary";
      else if (gradeNum === 3) gradeBadgeClass = "badge-warning";

      const isFinished = s.statusText === "Yakunlandi" || s.statusText === "Bajarildi";
      const statusClass = isFinished ? "status-tag finished" : "status-tag active";

      const online = isStudentOnline(s);
      const seenLabel = s.lastSeen ? String(s.lastSeen).split(" ")[1] || String(s.lastSeen) : "-";

      html += `
        <tr>
          <td style="font-weight: 800; color: var(--admin-muted); text-align: center;">${idx + 1}</td>
          <td><span class="badge badge-group">${escapeHtml(s.group || "-")}</span></td>
          <td>
            <div style="font-weight: 850; color: var(--admin-dark);">${escapeHtml(s.lastName)} ${escapeHtml(s.firstName)}</div>
          </td>
          <td style="text-align: center;">
            <span class="presence ${online ? "is-online" : "is-offline"}">
              <span class="dot"></span>${online ? "Tizimda" : "Chiqqan"}
            </span>
            <span class="presence-time">${escapeHtml(seenLabel)}</span>
          </td>
          <td>
            <span class="${statusClass}">
              ${isFinished ? "✓ " : "● "} ${escapeHtml(s.statusText || "Jarayonda")}
            </span>
          </td>
          <td style="text-align: center;"><span class="badge badge-score">${escapeHtml(s.sec1Score || "-")}</span></td>
          <td style="text-align: center;"><span class="badge badge-score">${escapeHtml(s.sec2Score || "-")}</span></td>
          <td style="text-align: center;"><span class="badge badge-score">${escapeHtml(s.sec3Score || "-")}</span></td>
          <td style="text-align: center;"><span class="badge badge-score">${escapeHtml(s.testScore || "-")}</span></td>
          <td style="text-align: center; font-weight: 800; color: var(--admin-dark);">${escapeHtml(s.totalCorrect || "-")}</td>
          <td style="text-align: center; font-weight: 850; color: #2563eb;">${escapeHtml(s.percentage || "-")}</td>
          <td style="text-align: center;">
            <span class="badge ${gradeBadgeClass}">
              ${hasGrade ? `${gradeNum} — ${escapeHtml(s.gradeLabel || "")}` : "Hali yo'q"}
            </span>
          </td>
          <td style="text-align: center;">
            <button type="button" class="btn btn-outline" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;" data-action="inspect" data-key="${escapeHtml(studentKey(s))}">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
              Javoblar
            </button>
          </td>
        </tr>
      `;
    });

    submissionsTableBody.innerHTML = html;
  }

  // Talabaning batafsil javoblarini ko'rish modali
  function inspectStudentByKey(key) {
    const student = allSubmissions.find(s => studentKey(s) === key);
    if (!student) {
      alert("Talaba ma'lumotlari topilmadi.");
      return;
    }

    if (modalStudentTitle) {
      modalStudentTitle.textContent = `${student.lastName} ${student.firstName}`;
    }
    if (modalStudentMeta) {
      modalStudentMeta.innerHTML = `
        <strong>Guruh:</strong> ${student.group} &nbsp;|&nbsp; 
        <strong>Vaqt:</strong> ${student.timestamp || "-"} &nbsp;|&nbsp;
        <strong>Umumiy Ball:</strong> ${student.totalCorrect || "-"} &nbsp;|&nbsp;
        <strong>Baho:</strong> ${student.grade || "-"} (${student.gradeLabel || "-"})
      `;
    }

    const answers = student.answers || {};
    let modalHtml = "";

    // 1, 2, 3-bo'lim amaliy savollari
    if (window.PRACTICAL_SECTIONS) {
      window.PRACTICAL_SECTIONS.forEach(sec => {
        modalHtml += `<div class="answers-section-title">${sec.title}</div>`;
        modalHtml += `<div class="answers-grid">`;
        sec.questions.forEach(q => {
          const userVal = answers[q.id] !== undefined ? String(answers[q.id]) : "";
          const isCorrect = window.checkPracticalAnswer ? window.checkPracticalAnswer(userVal, q.expectedAnswer) : false;
          const rowClass = userVal === "" ? "ans-row" : (isCorrect ? "ans-row is-correct" : "ans-row is-wrong");
          
          modalHtml += `
            <div class="${rowClass}">
              <div class="ans-prompt">${q.num}. ${q.prompt}</div>
              <div class="ans-vals">
                <span>Talaba yozgan: <strong class="user-val">${userVal !== "" ? escapeHtml(userVal) : "(Javob berilmagan)"}</strong></span>
                <span class="exp-val">| To'g'ri: ${escapeHtml(q.expectedAnswer)}</span>
              </div>
            </div>
          `;
        });
        modalHtml += `</div>`;
      });
    }

    // 4-bo'lim: Yakuniy test — har bir savol bo'yicha batafsil
    modalHtml += `<div class="answers-section-title">4-Bo'lim: Yakuniy Test Sinovi</div>`;
    modalHtml += `
      <div style="background: #f8fafc; padding: 0.85rem 1rem; border-radius: 8px; border: 1px solid var(--admin-border); margin-bottom: 0.75rem;">
        <div><strong>Test natijasi:</strong> ${escapeHtml(student.testScore || "-")} to'g'ri javob</div>
        <div><strong>Umumiy o'zlashtirish:</strong> ${escapeHtml(student.percentage || "-")}</div>
      </div>
    `;
    modalHtml += renderTestAnswers(answers);

    if (modalAnswersContainer) {
      modalAnswersContainer.innerHTML = modalHtml;
    }

    if (studentDetailsModal) {
      studentDetailsModal.classList.add("active");
    }
  }

  /**
   * Test javoblari `answers` obyektida savol ID si bo'yicha saqlanadi
   * (har bir talabaga 40 tadan tasodifiy 20 tasi tushadi), shuning uchun
   * savol matnini window.ALL_QUESTIONS dan ID orqali topamiz.
   */
  function renderTestAnswers(answers) {
    if (!window.ALL_QUESTIONS || !Array.isArray(window.ALL_QUESTIONS)) {
      return `<div style="font-size: 0.84rem; color: var(--admin-muted);">Test savollari ro'yxati yuklanmadi.</div>`;
    }

    const rows = window.ALL_QUESTIONS
      .filter(q => answers[q.id] !== undefined)
      .map(q => {
        const userVal = String(answers[q.id]);
        const isCorrect = userVal === q.answer;
        return `
          <div class="test-answer-row ${isCorrect ? "is-correct" : "is-wrong"}">
            <div class="tq-text">${escapeHtml(q.question)}</div>
            <div class="tq-vals">
              <span>Talaba tanladi: <strong>${escapeHtml(userVal)}</strong></span>
              <span>To'g'ri javob: <strong>${escapeHtml(q.answer)}</strong></span>
            </div>
          </div>
        `;
      });

    if (rows.length === 0) {
      return `<div style="font-size: 0.84rem; color: var(--admin-muted);">Talaba hali testni ishlamagan.</div>`;
    }
    return rows.join("");
  }

  function closeModal() {
    if (studentDetailsModal) {
      studentDetailsModal.classList.remove("active");
    }
  }

  // =========================================================================
  // EXCEL VA CSV GA EKSPORT QILISH
  // =========================================================================

  // Eksport ustunlari bitta joyda — Excel va CSV bir xil bo'lishi uchun
  const EXPORT_HEADERS = [
    "№",
    "Vaqt (Toshkent)",
    "Guruh",
    "Familiya",
    "Ism",
    "Tizimda",
    "Oxirgi faollik",
    "Holati",
    "1-Bo'lim (O'lchov)",
    "2-Bo'lim (2->10)",
    "3-Bo'lim (10->2)",
    "4-Bo'lim (Test)",
    "Jami Ball",
    "Foiz",
    "Baho",
    "Daraja"
  ];

  function buildExportRow(s, idx) {
    return [
      idx + 1,
      s.timestamp || "",
      s.group || "",
      s.lastName || "",
      s.firstName || "",
      isStudentOnline(s) ? "Tizimda" : "Chiqqan",
      s.lastSeen || "-",
      s.statusText || "",
      s.sec1Score || "-",
      s.sec2Score || "-",
      s.sec3Score || "-",
      s.testScore || "-",
      s.totalCorrect || "-",
      s.percentage || "-",
      s.grade || "-",
      s.gradeLabel || ""
    ];
  }

  /**
   * "Javoblar" varag'i: har bir talaba — bitta qator, har bir amaliy savol —
   * alohida ustun, oxirida test natijasi. O'qituvchi kim qayerda xato
   * qilganini bir qarashda ko'radi.
   */
  function buildAnswersSheet(list) {
    if (!window.XLSX || !window.PRACTICAL_SECTIONS) return null;

    const questions = [];
    window.PRACTICAL_SECTIONS.forEach(sec => {
      sec.questions.forEach(q => {
        questions.push({ id: q.id, label: `${sec.sectionNumber}.${q.num} ${q.prompt}`, expected: q.expectedAnswer });
      });
    });

    const header = ["Guruh", "Familiya", "Ism"].concat(questions.map(q => q.label), ["Test natijasi"]);
    const rows = [header];

    // Ikkinchi qator — to'g'ri javoblar namunasi (o'qituvchi solishtirishi uchun)
    rows.push(["", "TO'G'RI JAVOB", ""].concat(questions.map(q => q.expected), [""]));

    list.forEach(s => {
      const ans = s.answers || {};
      rows.push(
        [s.group || "", s.lastName || "", s.firstName || ""]
          .concat(questions.map(q => (ans[q.id] !== undefined ? String(ans[q.id]) : "")), [s.testScore || "-"])
      );
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 9 }, { wch: 18 }, { wch: 16 }]
      .concat(questions.map(() => ({ wch: 16 })), [{ wch: 14 }]);
    return ws;
  }

  function exportToExcel() {
    const list = getFilteredSubmissions();
    if (list.length === 0) {
      alert("Eksport qilish uchun talabalar ro'yxati bo'sh.");
      return;
    }

    const groupLabel = currentGroupFilter === "ALL" ? "Barcha_Guruhlar" : currentGroupFilter;
    const fileName = `3-Dars_Natijalar_${groupLabel}_${new Date().toISOString().slice(0, 10)}.xlsx`;

    // Agar SheetJS (XLSX) kutubxonasi mavjud bo'lsa, to'liq XLSX fayl yasaymiz
    if (window.XLSX) {
      const dataRows = [EXPORT_HEADERS.slice()];
      list.forEach((s, idx) => dataRows.push(buildExportRow(s, idx)));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(dataRows);

      // Ustun kengliklarini avtomatik chiroyli qilib sozlaymiz
      ws['!cols'] = [
        { wch: 5 },  // №
        { wch: 20 }, // Vaqt
        { wch: 10 }, // Guruh
        { wch: 18 }, // Familiya
        { wch: 16 }, // Ism
        { wch: 12 }, // Tizimda
        { wch: 18 }, // Oxirgi faollik
        { wch: 14 }, // Holati
        { wch: 18 }, // 1-Bo'lim
        { wch: 18 }, // 2-Bo'lim
        { wch: 18 }, // 3-Bo'lim
        { wch: 16 }, // 4-Bo'lim
        { wch: 12 }, // Jami Ball
        { wch: 10 }, // Foiz
        { wch: 8 },  // Baho
        { wch: 14 }  // Daraja
      ];

      XLSX.utils.book_append_sheet(wb, ws, "Natijalar");

      // Ikkinchi varaq: har bir talabaning har bir savolga yozgan javobi
      const answersSheet = buildAnswersSheet(list);
      if (answersSheet) {
        XLSX.utils.book_append_sheet(wb, answersSheet, "Javoblar");
      }

      XLSX.writeFile(wb, fileName);
    } else {
      // Agar SheetJS yuklanmagan bo'lsa, XML-asosli toza Excel jadvalini hosil qilamiz
      exportXmlExcel(list, fileName);
    }
  }

  // XML asosidagi toza Excel fayli (SheetJS siz ham 100% ochiladigan chiroyli format)
  function exportXmlExcel(list, fileName) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11"/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#2563EB" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="CenterCell">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>
  <Style ss:ID="Grade5">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Interior ss:Color="#DCFCE7" ss:Pattern="Solid"/>
   <Font ss:Color="#166534" ss:Bold="1"/>
  </Style>
  <Style ss:ID="Grade4">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Interior ss:Color="#DBEAFE" ss:Pattern="Solid"/>
   <Font ss:Color="#1E40AF" ss:Bold="1"/>
  </Style>
  <Style ss:ID="Grade3">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/>
   <Font ss:Color="#92400E" ss:Bold="1"/>
  </Style>
  <Style ss:ID="Grade2">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
   <Font ss:Color="#991B1B" ss:Bold="1"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Natijalar">
  <Table>
${[35, 130, 65, 110, 110, 75, 130, 95, 110, 110, 110, 100, 75, 65, 55, 90]
      .map(w => `   <Column ss:Width="${w}"/>`).join("\n")}
   <Row ss:Height="26">
${EXPORT_HEADERS.map(h =>
      `    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`).join("\n")}
   </Row>`;

    list.forEach((s, idx) => {
      const g = Number(s.grade);
      const hasGrade = !isNaN(g) && g >= 2;
      let gradeStyle = "CenterCell";
      if (g === 5) gradeStyle = "Grade5";
      else if (g === 4) gradeStyle = "Grade4";
      else if (g === 3) gradeStyle = "Grade3";
      else if (hasGrade) gradeStyle = "Grade2";

      const row = buildExportRow(s, idx);
      const gradeColIdx = EXPORT_HEADERS.indexOf("Baho");

      xml += `
   <Row ss:Height="20">`;
      row.forEach((val, colIdx) => {
        if (colIdx === 0) {
          xml += `
    <Cell ss:StyleID="CenterCell"><Data ss:Type="Number">${idx + 1}</Data></Cell>`;
        } else if (colIdx === gradeColIdx) {
          xml += hasGrade
            ? `
    <Cell ss:StyleID="${gradeStyle}"><Data ss:Type="Number">${g}</Data></Cell>`
            : `
    <Cell ss:StyleID="CenterCell"><Data ss:Type="String">-</Data></Cell>`;
        } else {
          xml += `
    <Cell ss:StyleID="CenterCell"><Data ss:Type="String">${escapeXml(String(val))}</Data></Cell>`;
        }
      });
      xml += `
   </Row>`;
    });

    xml += `
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
    downloadBlob(blob, fileName.replace(/\.xlsx$/, ".xls"));
  }

  function exportToCsv() {
    const list = getFilteredSubmissions();
    if (list.length === 0) {
      alert("Eksport qilish uchun talabalar ro'yxati bo'sh.");
      return;
    }

    const groupLabel = currentGroupFilter === "ALL" ? "Barcha_Guruhlar" : currentGroupFilter;
    const fileName = `3-Dars_Natijalar_${groupLabel}_${new Date().toISOString().slice(0, 10)}.csv`;

    // Qo'shtirnoqli maydon ichidagi qo'shtirnoqni ikkilantirish shart,
    // aks holda Excel'da ustunlar surilib ketadi.
    const csvCell = (v) => `"${String(v === undefined || v === null ? "" : v).replace(/"/g, '""')}"`;

    let csvContent = "\uFEFF"; // UTF-8 BOM Excel uchun
    csvContent += EXPORT_HEADERS.map(csvCell).join(",") + "\r\n";

    list.forEach((s, idx) => {
      csvContent += buildExportRow(s, idx).map(csvCell).join(",") + "\r\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    downloadBlob(blob, fileName);
  }

  function downloadBlob(blob, fileName) {
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  function escapeXml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  // Sahifa yuklanganda avval parol so'raladi, keyin panel ishga tushadi
  document.addEventListener("DOMContentLoaded", initAuthGate);
})();
