/**
 * 3-Dars: Admin Panel JavaScript (O'qituvchi Boshqaruvi)
 * Jonli monitoring, guruhlar filtri, test ruxsati, batafsil javoblar va Excel eksport
 */

(function () {
  // Holat
  let allSubmissions = [];
  let selectedStudentKeys = new Set();
  let currentGroupFilter = "ALL";
  let currentSearchQuery = "";
  let isTestUnlocked = false;
  let currentTeacherPin = APP_CONFIG.DEFAULT_TEACHER_PIN || "2603";
  let syncChannel = null;
  let refreshTimer = null;
  let serverReachable = null; // null = hali urinilmagan
  let serverTimeOffsetMs = 0; // Server va mijoz kompyuteri soat farqi (millisekundda)
  let hasServerTimeSync = false;
  let isFastRetrying = false;

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
  const btnToggleTheme = document.getElementById("btnToggleTheme");
  const themeIconDark = document.getElementById("themeIconDark");
  const themeIconLight = document.getElementById("themeIconLight");
  const themeToggleText = document.getElementById("themeToggleText");
  const btnDeleteSelected = document.getElementById("btnDeleteSelected");
  const selectAllSubmissions = document.getElementById("selectAllSubmissions");
  const selectedCountBadge = document.getElementById("selectedCountBadge");
  const btnToggleHistory = document.getElementById("btnToggleHistory");
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
        } else if (event.data && (event.data.type === "ADMIN_CLEAR_HISTORY" || event.data.type === "ADMIN_DELETE_SELECTED")) {
          loadLocalSubmissions();
          renderTable();
          updateStats();
          updateDeleteButtonState();
        }
      };
    }
  } catch (e) {
    console.warn("BroadcastChannel qo'llab-quvvatlanmadi:", e);
  }

  // =========================================================================
  // TUNGI / KUNDUZGI REJIM (Theme switcher)
  // =========================================================================
  function initTheme() {
    let savedTheme = "dark"; // Default: Tungi rejim
    try {
      const stored = localStorage.getItem("app_admin_theme");
      if (stored === "light" || stored === "dark") savedTheme = stored;
    } catch (e) {}
    applyTheme(savedTheme);

    if (btnToggleTheme && !btnToggleTheme._bound) {
      btnToggleTheme._bound = true;
      btnToggleTheme.addEventListener("click", () => {
        const isDark = document.body.classList.contains("dark-mode");
        const newTheme = isDark ? "light" : "dark";
        applyTheme(newTheme);
        try {
          localStorage.setItem("app_admin_theme", newTheme);
        } catch (e) {}
      });
    }
  }

  function applyTheme(theme) {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark-mode", isDark);

    if (themeIconDark) themeIconDark.style.display = isDark ? "none" : "inline-block";
    if (themeIconLight) themeIconLight.style.display = isDark ? "inline-block" : "none";
    if (themeToggleText) themeToggleText.textContent = isDark ? "Kunduzgi rejim" : "Tungi rejim";
    if (btnToggleTheme) {
      btnToggleTheme.title = isDark ? "Kunduzgi rejimga o'tish" : "Tungi rejimga o'tish";
    }
  }

  // =========================================================================
  // PAROL DARVOZASI
  // Talaba admin.html manzilini qo'lda yozib kirsa ham panel ochilmaydi.
  // =========================================================================
  function initAuthGate() {
    initTheme();

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

  // ---------------------------------------------------------------------
  // AVTOMATIK YANGILANISH
  // ---------------------------------------------------------------------
  // Sahifa ochilganda o'z faylining ETag belgisi eslab qolinadi. Server yangi
  // versiya tarqatsa ETag o'zgaradi va panel o'zini qayta yuklaydi — qo'lda
  // Ctrl+Shift+R bosish kerak emas. Versiya raqamini yuritish ham shart emas.
  var SELF_URL = (document.currentScript && document.currentScript.src) || "js/admin.js";
  var knownBuildTag = null;

  function checkForUpdate() {
    fetch(SELF_URL, { method: "HEAD", cache: "no-store" })
      .then(res => {
        var tag = res.headers.get("ETag") || res.headers.get("Last-Modified");
        if (!tag) return;
        if (knownBuildTag === null) {
          knownBuildTag = tag;
          return;
        }
        if (tag !== knownBuildTag && canAutoReload()) location.reload();
      })
      .catch(() => {});
  }

  // Qayta yuklanish tsikliga qarshi himoya (1 daqiqada bir martadan ko'p emas)
  function canAutoReload() {
    try {
      var last = Number(sessionStorage.getItem("app_last_auto_reload")) || 0;
      if (Date.now() - last < 60000) return false;
      sessionStorage.setItem("app_last_auto_reload", String(Date.now()));
    } catch (e) {}
    return true;
  }

  // Dastlabki sozlamalarni yuklash
  function initAdmin() {
    initTheme();
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

    // Yangi versiya chiqqanini kuzatish — admin paneli ham eski kod bilan
    // ochiq qolib ketmasligi uchun o'zini qayta yuklaydi.
    checkForUpdate();
    setInterval(checkForUpdate, APP_CONFIG.UPDATE_CHECK_MS || 60000);

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

      submissionsTableBody.addEventListener("change", (e) => {
        if (e.target && e.target.classList.contains("submission-select-chk")) {
          const key = e.target.getAttribute("data-key");
          if (key) {
            if (e.target.checked) {
              selectedStudentKeys.add(key);
            } else {
              selectedStudentKeys.delete(key);
            }
          }
          updateDeleteButtonState();
        }
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

    // Google Sheets jadvaliga to'g'ridan-to'g'ri o'tish tugmalari
    const btnGoogleSheetsNav = document.getElementById("btnGoogleSheetsNav");
    const btnGoogleSheetsControl = document.getElementById("btnGoogleSheetsControl");
    const sheetsUrl = (APP_CONFIG && APP_CONFIG.GOOGLE_SHEETS_URL) || "https://docs.google.com/spreadsheets/d/1T-6iFLM-2fjs4RYOoTIyh9A6f3LnFF_OpVJFx-tqtXg/edit";
    if (btnGoogleSheetsNav) btnGoogleSheetsNav.href = sheetsUrl;
    if (btnGoogleSheetsControl) btnGoogleSheetsControl.href = sheetsUrl;

    if (selectAllSubmissions) {
      selectAllSubmissions.addEventListener("change", (e) => {
        const checked = e.target.checked;
        const visibleCheckboxes = document.querySelectorAll(".submission-select-chk");
        visibleCheckboxes.forEach(chk => {
          chk.checked = checked;
          const key = chk.getAttribute("data-key");
          if (key) {
            if (checked) selectedStudentKeys.add(key);
            else selectedStudentKeys.delete(key);
          }
        });
        updateDeleteButtonState();
      });
    }

    if (btnDeleteSelected) {
      btnDeleteSelected.addEventListener("click", handleDeleteSelected);
    }

    if (btnToggleHistory) {
      btnToggleHistory.addEventListener("click", handleToggleHistory);
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

  // Talabaning variant raqamini aniqlash (variant xususiyatidan, answers._variant dan yoki savol ID sidan)
  function getStudentVariant(s) {
    if (s && s.variant) return Number(s.variant);
    const ans = (s && s.answers) || {};
    if (ans._variant) return Number(ans._variant);
    for (const k of Object.keys(ans)) {
      const m = k.match(/^v(\d)_/);
      if (m) return Number(m[1]);
    }
    return 1;
  }

  // O'chirilgan/yashirilgan talabalar kalitlari ro'yxati (Google Sheets-ga tegilmaydi)
  function getDeletedKeys() {
    try {
      const raw = localStorage.getItem("app_admin_deleted_keys");
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return new Set(arr);
      }
    } catch (e) {}
    return new Set();
  }

  function saveDeletedKeys(keySet) {
    try {
      localStorage.setItem("app_admin_deleted_keys", JSON.stringify(Array.from(keySet)));
    } catch (e) {}
  }

  // O'chirish tugmasi va "Barchasini tanlash" holatini yangilash
  function updateDeleteButtonState() {
    const visibleCheckboxes = document.querySelectorAll(".submission-select-chk");
    const count = selectedStudentKeys.size;

    if (btnDeleteSelected) {
      btnDeleteSelected.disabled = count === 0;
    }
    if (selectedCountBadge) {
      if (count > 0) {
        selectedCountBadge.textContent = count;
        selectedCountBadge.style.display = "inline-block";
      } else {
        selectedCountBadge.style.display = "none";
      }
    }
    if (selectAllSubmissions) {
      const visibleKeys = Array.from(visibleCheckboxes).map(c => c.getAttribute("data-key")).filter(Boolean);
      const allVisibleSelected = visibleKeys.length > 0 && visibleKeys.every(k => selectedStudentKeys.has(k));
      const someVisibleSelected = visibleKeys.some(k => selectedStudentKeys.has(k));

      if (visibleKeys.length === 0) {
        selectAllSubmissions.checked = false;
        selectAllSubmissions.indeterminate = false;
      } else if (allVisibleSelected) {
        selectAllSubmissions.checked = true;
        selectAllSubmissions.indeterminate = false;
      } else if (someVisibleSelected) {
        selectAllSubmissions.checked = false;
        selectAllSubmissions.indeterminate = true;
      } else {
        selectAllSubmissions.checked = false;
        selectAllSubmissions.indeterminate = false;
      }
    }
  }

  // Tanlangan talabalar natijalarini admin paneldan o'chirish (Google Sheets-dan o'chirilmaydi)
  function handleDeleteSelected() {
    const count = selectedStudentKeys.size;
    if (count === 0) return;

    const confirmDelete = confirm(
      `Belgilangan ${count} ta talaba natijasi admin paneldan tozalansinmi?\n\n` +
      "OK — Natijalar faqat admin paneldan yashiriladi/tozalanadi.\n" +
      "(Google Sheets jadvalidan o'chirilmaydi, barcha ma'lumotlar u yerda saqlanib qoladi)\n\n" +
      "Bekor qilish — O'zgarishsiz qoldirish."
    );
    if (!confirmDelete) return;

    const deletedKeys = getDeletedKeys();
    selectedStudentKeys.forEach(k => deletedKeys.add(k));
    saveDeletedKeys(deletedKeys);
    selectedStudentKeys.clear();

    // Mahalliy keshdagi allSubmissions dan ham olib tashlaymiz
    allSubmissions = allSubmissions.filter(s => !deletedKeys.has(studentKey(s)));
    try {
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.ALL_SUBMISSIONS, JSON.stringify(allSubmissions));
    } catch (e) {}

    if (syncChannel) {
      try {
        syncChannel.postMessage({ type: "ADMIN_DELETE_SELECTED" });
      } catch (e) {}
    }

    renderTable();
    updateStats();
    updateDeleteButtonState();
  }

  // Google Sheets-dagi barcha eski/yashirilgan yozuvlarni qayta ko'rsatish
  function handleToggleHistory() {
    try {
      localStorage.removeItem("app_admin_cleared_ts");
      localStorage.removeItem("app_admin_deleted_keys");
    } catch (e) {}
    selectedStudentKeys.clear();
    if (btnToggleHistory) btnToggleHistory.style.display = "none";
    fetchServerData();
    alert("Barcha natijalar qayta ko'rsatildi!");
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
    newItem.variant = getStudentVariant(newItem);

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
          // Server vaqtini sinxronlash (kompyuter soati farqidan kelib chiqadigan uzilishlarning oldini oladi)
          if (data.serverTime) {
            const serverTs = Date.parse(String(data.serverTime).replace(" ", "T"));
            if (!isNaN(serverTs)) {
              serverTimeOffsetMs = serverTs - Date.now();
              hasServerTimeSync = true;
            }
          }

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
        console.warn("Serverdan ma'lumot olishda vaqtincha xatolik (Keshdagi ma'lumotlar saqlab qolindi):", err);
        setConnectionState(false);
        // Mavjud keshdagi ma'lumotlar aslo yo'qolmaydi va ko'rinib turadi
        renderTable();
        updateStats();

        // Tarmoq uzilishlarida 3 soniyadan keyin darhol tezkor qayta ulanishga urinish
        if (!isFastRetrying) {
          isFastRetrying = true;
          setTimeout(() => {
            isFastRetrying = false;
            fetchServerData();
          }, 3000);
        }
        if (callback) callback();
      });
  }

  // Serverga ulanish holatini header'da ko'rsatish.
  function setConnectionState(ok) {
    serverReachable = ok;

    if (connectionIndicator) connectionIndicator.classList.toggle("is-offline", !ok);
    if (connectionText) {
      connectionText.textContent = ok
        ? "Jonli sinxronizatsiya"
        : "Server band (qayta ulanmoqda...) — kesh faol";
    }
    if (connectionIndicator) {
      connectionIndicator.title = ok
        ? "Google Sheets bilan aloqa bor"
        : "Google Apps Script band yoki javob kutmoqda. Keshdagi ma'lumotlar to'liq ko'rsatilmoqda va tizim avtomatik qayta ulanadi.";
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
    if (s.online === false || String(s.online).toLowerCase() === "offline") return false;
    if (!s.lastSeen) return !!s.online;
    const seenTs = Date.parse(String(s.lastSeen).replace(" ", "T"));
    if (isNaN(seenTs)) return !!s.online;

    // Server va admin kompyuteri soat farqini inobatga olgan holda hisoblash
    const currentServerNow = hasServerTimeSync ? (Date.now() + serverTimeOffsetMs) : Date.now();
    const diff = Math.max(0, currentServerNow - seenTs);
    const threshold = APP_CONFIG.ONLINE_THRESHOLD_MS || 180000;
    return diff < threshold;
  }

  // Filtrlangan va saralangan ro'yxat.
  // Saralash bo'lmasa, har 10 soniyalik yangilanishda qatorlar sakrab turadi.
  function getFilteredSubmissions() {
    const deletedKeys = getDeletedKeys();
    const clearedTs = Number(localStorage.getItem("app_admin_cleared_ts")) || 0;
    return allSubmissions
      .filter(s => {
        // Tanlab o'chirilgan talabalarni yashirish
        if (deletedKeys.has(studentKey(s))) {
          return false;
        }
        // Agar o'qituvchi oldin umumiy tozalashni bosgan bo'lsa, tozalash vaqtidan oldingi eski yozuvlar yashiriladi
        if (clearedTs > 0) {
          const seenTs = s.lastSeen ? Date.parse(String(s.lastSeen).replace(" ", "T")) : 0;
          if (seenTs && seenTs < clearedTs) {
            return false;
          }
        }
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
    const clearedTs = Number(localStorage.getItem("app_admin_cleared_ts")) || 0;
    const deletedCount = getDeletedKeys().size;
    const hasHidden = deletedCount > 0 || clearedTs > 0;
    if (tableCountBadge) {
      tableCountBadge.textContent = hasHidden
        ? `${list.length} ta talaba (${deletedCount > 0 ? deletedCount + " ta yashirilgan" : "eskilari yashirilgan"})`
        : `${list.length} ta talaba`;
    }
    if (btnToggleHistory) {
      btnToggleHistory.style.display = hasHidden ? "inline-flex" : "none";
    }
  }

  // Jadvalni chizish
  function renderTable() {
    const list = getFilteredSubmissions();
    if (!submissionsTableBody) return;

    if (list.length === 0) {
      submissionsTableBody.innerHTML = `
        <tr>
          <td colspan="15" class="empty-table">
            <svg class="empty-icon" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
            <div style="font-weight: 800; font-size: 1.05rem; margin-bottom: 0.3rem;">Hozircha ma'lumotlar yo'q</div>
            <div style="font-size: 0.85rem;">Talabalar tizimga kirib topshiriqlarni boshlaganida natijalar bu yerda jonli paydo bo'ladi.</div>
          </td>
        </tr>
      `;
      updateDeleteButtonState();
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
      const varNum = Number(s.variant) || 1;
      const key = studentKey(s);
      const isChecked = selectedStudentKeys.has(key);

      html += `
        <tr>
          <td style="text-align: center;">
            <input type="checkbox" class="submission-select-chk" data-key="${escapeHtml(key)}" ${isChecked ? "checked" : ""} style="cursor: pointer; width: 16px; height: 16px; accent-color: var(--admin-primary);">
          </td>
          <td style="font-weight: 800; color: var(--admin-muted); text-align: center;">${idx + 1}</td>
          <td><span class="badge badge-group">${escapeHtml(s.group || "-")}</span></td>
          <td>
            <div style="font-weight: 850; color: var(--admin-dark);">${escapeHtml(s.lastName)} ${escapeHtml(s.firstName)}</div>
          </td>
          <td style="text-align: center;">
            <span class="badge badge-group" style="background: #fef3c7; color: #92400e; border-color: #fde68a; font-weight: 800;">
              ${escapeHtml(varNum)}-v
            </span>
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
    updateDeleteButtonState();
  }

  // Talabaning batafsil javoblarini ko'rish modali
  function inspectStudentByKey(key) {
    const student = allSubmissions.find(s => studentKey(s) === key);
    if (!student) {
      alert("Talaba ma'lumotlari topilmadi.");
      return;
    }

    const varNum = Number(student.variant) || 1;

    if (modalStudentTitle) {
      modalStudentTitle.textContent = `${student.lastName} ${student.firstName}`;
    }
    if (modalStudentMeta) {
      modalStudentMeta.innerHTML = `
        <strong>Guruh:</strong> ${escapeHtml(student.group)} &nbsp;|&nbsp; 
        <strong>Variant:</strong> ${escapeHtml(varNum)}-variant &nbsp;|&nbsp; 
        <strong>Vaqt:</strong> ${escapeHtml(student.timestamp || "-")} &nbsp;|&nbsp;
        <strong>Umumiy Ball:</strong> ${escapeHtml(student.totalCorrect || "-")} &nbsp;|&nbsp;
        <strong>Baho:</strong> ${escapeHtml(student.grade || "-")} (${escapeHtml(student.gradeLabel || "-")})
      `;
    }

    const answers = student.answers || {};
    let modalHtml = "";

    // 1, 2, 3-bo'lim amaliy savollari (Talabaning varianti bo'yicha)
    const secConfigs = window.getPracticalSections ? window.getPracticalSections(varNum, false) : (window.PRACTICAL_SECTIONS || []);
    secConfigs.forEach(sec => {
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
    "Variant",
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
    const varNum = Number(s.variant) || 1;
    return [
      idx + 1,
      s.timestamp || "",
      s.group || "",
      s.lastName || "",
      s.firstName || "",
      `${varNum}-variant`,
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
   * "Javoblar" varag'i: har bir talabaning o'z varianti va bo'limlar bo'yicha natijalari
   */
  function buildAnswersSheet(list) {
    if (!window.XLSX) return null;

    const header = [
      "Guruh",
      "Familiya",
      "Ism",
      "Variant",
      "1-Bo'lim (O'lchov)",
      "2-Bo'lim (2->10)",
      "3-Bo'lim (10->2)",
      "4-Bo'lim (Test)",
      "Jami Ball",
      "Foiz",
      "Baho"
    ];
    const rows = [header];

    list.forEach(s => {
      const varNum = Number(s.variant) || 1;
      rows.push([
        s.group || "",
        s.lastName || "",
        s.firstName || "",
        `${varNum}-variant`,
        s.sec1Score || "-",
        s.sec2Score || "-",
        s.sec3Score || "-",
        s.testScore || "-",
        s.totalCorrect || "-",
        s.percentage || "-",
        s.grade ? `${s.grade} (${s.gradeLabel || ""})` : "-"
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
      { wch: 10 },
      { wch: 18 },
      { wch: 16 },
      { wch: 12 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 14 },
      { wch: 12 },
      { wch: 10 },
      { wch: 14 }
    ];
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
        { wch: 12 }, // Variant
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
